import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, ChefHat } from 'lucide-react';

function AddMealModal({ day, mealType, onClose, onConfirm }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState('new');
  const [userRecipes, setUserRecipes] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [dishName, setDishName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [saveToMyRecipe, setSaveToMyRecipe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, ingsRes] = await Promise.all([
          fetch('http://localhost:5000/api/mealplan/user-recipes'),
          fetch('http://localhost:5000/api/mealplan/ingredients')
        ]);
        const recipesData = await recipesRes.json();
        const ingsData = await ingsRes.json();

        if (recipesData.success) setUserRecipes(recipesData.data);
        if (ingsData.success) setAllIngredients(ingsData.data);
      } catch (err) {
        console.error('Error fetching modal data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRecipeChange = (e) => {
    const id = e.target.value;
    setSelectedRecipeId(id);
    if (id === 'new') {
      setDishName('');
      setSelectedIngredients([]);
    } else {
      const recipe = userRecipes.find(r => r.id === parseInt(id));
      if (recipe) {
        setDishName(recipe.name);
        setSelectedIngredients(recipe.ingredients.map(ing => ({
          ...ing,
          weight_g: parseFloat(ing.weight_g) || 100
        })));
      }
    }
  };


  const removeIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateWeight = (index, weight) => {
    setSelectedIngredients(selectedIngredients.map((item, i) => 
      i === index ? { ...item, weight_g: parseFloat(weight) || 0 } : item
    ));
  };

  const calculateTotals = () => {
    return selectedIngredients.reduce((totals, ing) => {
      const factor = (ing.weight_g || 0) / 100;
      return {
        calories: totals.calories + (ing.calories_per_100g * factor),
        protein: totals.protein + (ing.protein_per_100g * factor),
        carbs: totals.carbs + (ing.carbs_per_100g * factor),
        fat: totals.fat + (ing.fat_per_100g * factor)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();

  const handleConfirm = async () => {
    if (!dishName.trim()) {
      alert('Vui lòng nhập tên món ăn');
      return;
    }
    if (selectedIngredients.length === 0) {
      alert('Vui lòng chọn ít nhất một nguyên liệu');
      return;
    }

    const recipeData = {
      id: selectedRecipeId === 'new' ? null : parseInt(selectedRecipeId),
      name: dishName,
      ingredients: selectedIngredients
    };

    try {
      const res = await fetch('http://localhost:5000/api/mealplan/add-with-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          mealType,
          recipeData,
          saveToMyRecipe
        })
      });
      const data = await res.json();
      if (data.success) {
        onConfirm();
        onClose();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu món ăn');
    }
  };

  if (isLoading) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gradient-to-br from-green-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <ChefHat size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Thêm Món Ăn</h2>
              <p className="text-gray-500 font-medium">{day} • {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="space-y-8">
            {/* Recipe Selection */}
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                CHỌN MÓN ĂN
              </label>
              <select 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-bold focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer"
                value={selectedRecipeId}
                onChange={handleRecipeChange}
              >
                <option value="new">+ Tạo món mới</option>
                {userRecipes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Dish Name */}
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-gray-900">TÊN MÓN ĂN</label>
              <input 
                type="text"
                placeholder="Ví dụ: Salad Ức Gà, Bún Chả..."
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-bold focus:ring-2 focus:ring-green-500/20 transition-all"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                disabled={selectedRecipeId !== 'new'}
              />
            </div>

            {/* Ingredients Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold text-gray-900 uppercase">Nguyên liệu & Dinh dưỡng</label>
                <button 
                  onClick={() => setSelectedIngredients([...selectedIngredients, { name: '', weight_g: 100, calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 }])}
                  className="bg-green-600 text-white text-xs font-black py-2.5 px-5 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                >
                  <Plus size={16} />
                  THÊM NGUYÊN LIỆU
                </button>
              </div>

              <div className="space-y-3">
                {selectedIngredients.map((ing, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-gray-100 border border-transparent hover:border-gray-200">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          list="ingredients-list"
                          placeholder="Chọn hoặc nhập nguyên liệu..."
                          value={ing.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const matched = allIngredients.find(i => i.name.toLowerCase() === newName.toLowerCase());
                            setSelectedIngredients(selectedIngredients.map((item, i) => 
                              i === idx ? { 
                                ...item, 
                                name: newName,
                                ...(matched ? matched : { calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 })
                              } : item
                            ));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-gray-900 font-bold focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all appearance-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Plus size={14} className="rotate-45" /> {/* Use a small icon to indicate dropdown/more */}
                        </div>
                        <datalist id="ingredients-list">
                          {allIngredients.map(i => <option key={i.id} value={i.name} />)}
                        </datalist>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                        <input 
                          type="number" 
                          value={ing.weight_g === 0 ? '' : ing.weight_g}
                          onChange={(e) => updateWeight(idx, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-16 text-center font-black text-gray-900 border-none p-0 focus:ring-0"
                        />
                        <span className="text-xs font-bold text-gray-400">g</span>
                      </div>
                      
                      {/* Ingredient Macros Mini-Display */}
                      <div className="hidden lg:flex items-center gap-3 text-[10px] font-black">
                        <div className="flex flex-col items-center min-w-[30px]">
                          <span className="text-green-600">{(ing.protein_per_100g * ing.weight_g / 100).toFixed(1)}</span>
                          <span className="text-gray-400">P</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[30px]">
                          <span className="text-blue-600">{(ing.carbs_per_100g * ing.weight_g / 100).toFixed(1)}</span>
                          <span className="text-gray-400">C</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[30px]">
                          <span className="text-orange-600">{(ing.fat_per_100g * ing.weight_g / 100).toFixed(1)}</span>
                          <span className="text-gray-400">F</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeIngredient(idx)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedIngredients.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-[2rem] text-gray-400 font-bold">
                    Chưa có nguyên liệu nào được chọn
                  </div>
                )}
              </div>
            </div>

            {/* Save to Recipes Checkbox */}
            {selectedRecipeId === 'new' && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveToMyRecipe ? 'bg-green-600 border-green-600' : 'border-gray-200 group-hover:border-green-500'}`}>
                  {saveToMyRecipe && <Check size={16} className="text-white" />}
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={saveToMyRecipe}
                    onChange={() => setSaveToMyRecipe(!saveToMyRecipe)}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700">Lưu vào thực đơn của tôi (My Recipe)</span>
              </label>
            )}
          </div>
        </div>

        {/* Footer / Summary */}
        <div className="p-8 bg-gray-900 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="grid grid-cols-4 gap-6 text-center w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-white text-xl font-black">{Math.round(totals.calories)}</span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Calories</span>
              </div>
              <div className="flex flex-col border-l border-gray-800 pl-6">
                <span className="text-green-500 text-xl font-black">{totals.protein.toFixed(1)}g</span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Protein</span>
              </div>
              <div className="flex flex-col border-l border-gray-800 pl-6">
                <span className="text-blue-500 text-xl font-black">{totals.carbs.toFixed(1)}g</span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Carbs</span>
              </div>
              <div className="flex flex-col border-l border-gray-800 pl-6">
                <span className="text-orange-500 text-xl font-black">{totals.fat.toFixed(1)}g</span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Fat</span>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={onClose}
                className="flex-1 sm:flex-none px-8 py-4 text-white font-black rounded-2xl hover:bg-white/5 transition-all"
              >
                HỦY
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 sm:flex-none px-8 py-4 bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-400 transition-all flex items-center justify-center gap-2"
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMealModal;
