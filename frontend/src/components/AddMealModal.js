import React, { useState, useEffect } from 'react';
import { ChefHat, X, Flame, Search, Clock, Users, Plus, Check, Trash2 } from 'lucide-react';

function AddMealModal({ day, mealType, onClose, onConfirm, mealDate }) {
  const [activeTab, setActiveTab] = useState('choose'); // 'choose' or 'create'
  const [userRecipes, setUserRecipes] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for creating a new recipe
  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(1);
  const [category, setCategory] = useState(mealType);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [saveToMyRecipe, setSaveToMyRecipe] = useState(false);
  
  // New states for editing flow
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [updateExistingRecipe, setUpdateExistingRecipe] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, ingsRes] = await Promise.all([
          fetch('http://localhost:5002/api/mealplan/user-recipes', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }),
          fetch('http://localhost:5002/api/mealplan/ingredients', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
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

  const getMealTypeTranslation = (type) => {
    const map = {
      'breakfast': 'bữa sáng',
      'lunch': 'bữa trưa',
      'dinner': 'bữa tối',
      'snack': 'bữa phụ'
    };
    return map[type] || type;
  };

  const getDayTranslation = (dayName) => {
    const map = {
      'Monday': 'Thứ Hai',
      'Tuesday': 'Thứ Ba',
      'Wednesday': 'Thứ Tư',
      'Thursday': 'Thứ Năm',
      'Friday': 'Thứ Sáu',
      'Saturday': 'Thứ Bảy',
      'Sunday': 'Chủ Nhật'
    };
    return map[dayName] || dayName;
  };

  const handleSelectRecipe = (recipe) => {
    // Fill the states with recipe data
    setDishName(recipe.name);
    setDescription(recipe.description || '');
    setCookTime(parseInt(recipe.prep_time) || 30);
    setImageUrl(recipe.image_url || '');
    
    if (recipe.ingredients) {
      setSelectedIngredients(recipe.ingredients.map(ing => ({
        name: ing.name,
        weight_g: parseFloat(ing.weight_g) || 0,
        calories_per_100g: parseFloat(ing.calories_per_100g) || 0,
        protein_per_100g: parseFloat(ing.protein_per_100g) || 0,
        carbs_per_100g: parseFloat(ing.carbs_per_100g) || 0,
        fat_per_100g: parseFloat(ing.fat_per_100g) || 0,
        showDropdown: false
      })));
    } else {
      setSelectedIngredients([]);
    }

    setEditingRecipeId(recipe.id);
    setUpdateExistingRecipe(false); // Default to not updating original
    setActiveTab('create');
  };

  const removeIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateWeight = (index, weight) => {
    setSelectedIngredients(selectedIngredients.map((item, i) => 
      i === index ? { ...item, weight_g: parseFloat(weight) || 0 } : item
    ));
  };

  const updateCalDensity = (index, cals) => {
    setSelectedIngredients(selectedIngredients.map((item, i) => 
      i === index ? { ...item, calories_per_100g: parseFloat(cals) || 0 } : item
    ));
  };

  const handleIngredientNameChange = (index, value) => {
    setSelectedIngredients(selectedIngredients.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          name: value,
          showDropdown: true
        };
      }
      return item;
    }));
  };

  const handleSelectIngredient = (index, ing) => {
    setSelectedIngredients(selectedIngredients.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          name: ing.name,
          calories_per_100g: parseFloat(ing.calories_per_100g || 0),
          protein_per_100g: parseFloat(ing.protein_per_100g || 0),
          carbs_per_100g: parseFloat(ing.carbs_per_100g || 0),
          fat_per_100g: parseFloat(ing.fat_per_100g || 0),
          showDropdown: false
        };
      }
      return item;
    }));
  };

  const handleIngredientBlur = (index) => {
    setTimeout(() => {
      setSelectedIngredients(prev => prev.map((item, i) => 
        i === index ? { ...item, showDropdown: false } : item
      ));
    }, 200);
  };

  const filterIngredients = (query) => {
    if (!query) return allIngredients.slice(0, 10);
    return allIngredients
      .filter(ing => ing.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  };

  const calculateTotals = () => {
    return selectedIngredients.reduce((totals, ing) => {
      const factor = (ing.weight_g || 0) / 100;
      return {
        calories: totals.calories + (Number(ing.calories_per_100g || 0) * factor),
        protein: totals.protein + (Number(ing.protein_per_100g || 0) * factor),
        carbs: totals.carbs + (Number(ing.carbs_per_100g || 0) * factor),
        fat: totals.fat + (Number(ing.fat_per_100g || 0) * factor)
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
      id: editingRecipeId,
      name: dishName,
      description: description || 'Món ăn tự tạo từ kế hoạch tuần',
      prepTime: `${cookTime} phút`,
      imageUrl: imageUrl,
      ingredients: selectedIngredients
    };

    try {
      const res = await fetch('http://localhost:5002/api/mealplan/add-with-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          day,
          mealType: category, // Save to the chosen category
          recipeData,
          saveToMyRecipe: editingRecipeId ? false : saveToMyRecipe,
          updateExistingRecipe,
          mealDate
        })
      });
      const data = await res.json();
      if (data.success) {
        onConfirm({ name: dishName, mealType: category, mealDate });
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
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F4FBE7] border border-[#B5E361]/30 rounded-xl flex items-center justify-center text-green-700">
              <ChefHat size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                Thêm {getMealTypeTranslation(mealType)} cho {getDayTranslation(day)}
              </h2>
              <p className="text-xs text-gray-400 font-bold mt-0.5">Lên kế hoạch ăn uống và quản lý lượng calo.</p>
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle Swticher */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex bg-gray-100/80 border border-gray-200/20 p-1.5 rounded-2xl w-full">
            <button 
              type="button"
              onClick={() => {
                setActiveTab('choose');
                setEditingRecipeId(null);
                setDishName('');
                setDescription('');
                setCookTime(30);
                setImageUrl('');
                setSelectedIngredients([]);
                setSaveToMyRecipe(false);
                setUpdateExistingRecipe(false);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === 'choose' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Chọn công thức
            </button>
            <button 
              type="button"
              onClick={() => {
                setActiveTab('create');
                if (editingRecipeId) {
                  setEditingRecipeId(null);
                  setDishName('');
                  setDescription('');
                  setCookTime(30);
                  setImageUrl('');
                  setSelectedIngredients([]);
                  setSaveToMyRecipe(false);
                  setUpdateExistingRecipe(false);
                }
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Tạo công thức mới
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'choose' ? (
            <div className="space-y-4 max-h-[50vh] pr-1">
              {userRecipes.length > 0 ? (
                userRecipes.map(recipe => (
                  <div 
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-[#B5E361] hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col"
                  >
                    {/* Recipe Image or Fallback */}
                    <div className="h-36 w-full bg-gradient-to-br from-[#F4FBE7] to-[#EAF7D5] flex items-center justify-center text-gray-400 relative">
                      {recipe.image_url ? (
                        <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <ChefHat size={28} className="text-[#B5E361]" />
                          <span className="text-[9px] font-black tracking-widest text-[#8CB33D] uppercase">NUTRIGO RECIPE</span>
                        </div>
                      )}
                      {/* Source Badge */}
                      <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${recipe.source === 'my_recipe' ? 'bg-gray-900 text-white' : 'bg-[#B5E361] text-[#1f3b00]'}`}>
                        {recipe.source === 'my_recipe' ? 'Thực đơn của tôi' : 'Yêu thích'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-gray-800 text-sm group-hover:text-green-700 transition-colors">{recipe.name}</h4>
                          <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 shrink-0 capitalize">
                            {recipe.prep_time || 'Chưa rõ'}
                          </span>
                        </div>
                        {recipe.description && (
                          <p className="text-xs text-gray-400 font-medium line-clamp-2 mt-1">{recipe.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-black text-gray-400 mt-3 pt-3 border-t border-gray-50">
                        <span className="flex items-center gap-1 text-orange-600">
                          <Flame size={12} />
                          {recipe.calories} kcal
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {recipe.prep_time || '15 phút'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          1 phần ăn
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-100 rounded-3xl">
                  <ChefHat size={36} className="text-gray-300" />
                  <div className="max-w-xs">
                    <p className="text-sm font-bold text-gray-800">Chưa có công thức nào</p>
                    <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                      Hãy tự tạo công thức của riêng bạn ở tab bên cạnh để dễ dàng chọn ở đây.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5 pr-1">
              {/* Image Upload Banner */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#B5E361]/50 transition-colors group">
                <label className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[160px] text-gray-400 hover:text-[#3d6600]">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <span className="text-sm font-bold">Tải ảnh lên từ máy</span>
                      <span className="text-xs text-gray-400 font-medium">Nhấn vào đây để chọn ảnh</span>
                    </div>
                  )}
                  {imageUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Thay đổi ảnh</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageUrl(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Recipe Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Tên công thức *</label>
                <input 
                  type="text"
                  placeholder="Ví dụ: Salad Ức Gà, Bún Chả..."
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all placeholder:text-gray-300"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Mô tả công thức</label>
                <textarea 
                  placeholder="Nhập mô tả ngắn gọn về món ăn này..."
                  rows={2}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-[#B5E361]/30 transition-all placeholder:text-gray-300 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cook Time */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Thời gian nấu (phút)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all"
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Servings */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Số phần ăn (khẩu phần)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Bữa ăn (Phân loại)</label>
                  <select 
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="breakfast">Bữa sáng</option>
                    <option value="lunch">Bữa trưa</option>
                    <option value="dinner">Bữa tối</option>
                    <option value="snack">Bữa phụ</option>
                  </select>
                </div>
              </div>

              {/* Ingredients Builder */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-gray-800 uppercase tracking-wider pl-1">Nguyên liệu & Dinh dưỡng từng phần</label>
                  <button 
                    type="button"
                    onClick={() => setSelectedIngredients([...selectedIngredients, { name: '', weight_g: 100, calories_per_100g: 100, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0, showDropdown: false }])}
                    className="bg-[#B5E361] hover:bg-[#98d15a] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus size={14} />
                    THÊM NGUYÊN LIỆU
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedIngredients.map((ing, idx) => (
                    <div key={idx} className="flex flex-col gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#B5E361]/20 transition-all duration-300">
                      {/* Name input with custom Dropdown */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          placeholder="Nhập tên nguyên liệu (ví dụ: Ức gà)..."
                          value={ing.name}
                          onChange={(e) => handleIngredientNameChange(idx, e.target.value)}
                          onFocus={() => {
                            setSelectedIngredients(selectedIngredients.map((item, i) => 
                              i === idx ? { ...item, showDropdown: true } : item
                            ));
                          }}
                          onBlur={() => handleIngredientBlur(idx)}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/25 focus:border-[#B5E361] transition-all"
                        />
                        {ing.showDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto bg-white border border-gray-150 rounded-xl shadow-lg">
                            {filterIngredients(ing.name).map((dbIng) => (
                              <button
                                key={dbIng.id}
                                type="button"
                                onMouseDown={() => handleSelectIngredient(idx, dbIng)}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#F4FBE7] hover:text-[#1f3b00] transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center"
                              >
                                <span>{dbIng.name}</span>
                                <span className="text-[10px] text-gray-400">
                                  {dbIng.calories_per_100g} kcal / {dbIng.serving_unit || '100g'}
                                </span>
                              </button>
                            ))}
                            {filterIngredients(ing.name).length === 0 && (
                              <div className="px-3.5 py-2 text-xs text-gray-400 italic">
                                Không tìm thấy nguyên liệu
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Weight and Custom Calories */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {/* Weight */}
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200">
                            <span className="text-[10px] font-bold text-gray-400">Nặng:</span>
                            <input 
                              type="number" 
                              value={ing.weight_g === 0 ? '' : ing.weight_g}
                              onChange={(e) => updateWeight(idx, e.target.value)}
                              placeholder="0"
                              className="w-12 text-center font-black text-xs text-gray-900 border-none p-0 focus:ring-0"
                            />
                            <span className="text-[10px] font-bold text-gray-400">g</span>
                          </div>

                          {/* Calories per 100g */}
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200" title="Lượng Calories trên 100g">
                            <span className="text-[10px] font-bold text-gray-400">Mật độ:</span>
                            <input 
                              type="number" 
                              value={ing.calories_per_100g === 0 ? '' : ing.calories_per_100g}
                              onChange={(e) => updateCalDensity(idx, e.target.value)}
                              placeholder="100"
                              className="w-12 text-center font-black text-xs text-gray-900 border-none p-0 focus:ring-0"
                            />
                            <span className="text-[9px] font-bold text-gray-400" title="kcal trên 100g">kcal/100g</span>
                          </div>
                        </div>

                        {/* Calculated calories and delete */}
                        <div className="flex items-center gap-3">
                          <div className="text-[11px] font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                            {Math.round(ing.calories_per_100g * ing.weight_g / 100)} kcal
                          </div>

                          <button 
                            type="button"
                            onClick={() => removeIngredient(idx)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedIngredients.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 font-bold text-xs">
                      Chưa có nguyên liệu nào được thêm
                    </div>
                  )}
                </div>
              </div>

              {/* Save checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer group pt-2 select-none">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(editingRecipeId ? updateExistingRecipe : saveToMyRecipe) ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {(editingRecipeId ? updateExistingRecipe : saveToMyRecipe) && <Check size={14} className="text-white font-black" />}
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={editingRecipeId ? updateExistingRecipe : saveToMyRecipe}
                    onChange={() => {
                      if (editingRecipeId) {
                        setUpdateExistingRecipe(!updateExistingRecipe);
                      } else {
                        setSaveToMyRecipe(!saveToMyRecipe);
                      }
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-600">
                  {editingRecipeId ? "Cập nhật thay đổi vào công thức gốc" : "Lưu vào thực đơn của tôi (My Recipe)"}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer / Summary (only show details for Create tab) */}
        {activeTab === 'create' ? (
          <div className="p-6 bg-gray-950 border-t border-gray-900">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="grid grid-cols-4 gap-4 text-center w-full sm:w-auto">
                <div className="flex flex-col">
                  <span className="text-white text-base font-black">{Math.round(totals.calories)}</span>
                  <span className="text-gray-500 text-[8px] font-black uppercase tracking-wider">Calo</span>
                </div>
                <div className="flex flex-col border-l border-gray-900 pl-4">
                  <span className="text-[#B5E361] text-base font-black">{totals.protein.toFixed(1)}g</span>
                  <span className="text-gray-500 text-[8px] font-black uppercase tracking-wider">Đạm</span>
                </div>
                <div className="flex flex-col border-l border-gray-900 pl-4">
                  <span className="text-blue-400 text-base font-black">{totals.carbs.toFixed(1)}g</span>
                  <span className="text-gray-500 text-[8px] font-black uppercase tracking-wider">Carbs</span>
                </div>
                <div className="flex flex-col border-l border-gray-900 pl-4">
                  <span className="text-orange-400 text-base font-black">{totals.fat.toFixed(1)}g</span>
                  <span className="text-gray-500 text-[8px] font-black uppercase tracking-wider">Béo</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-white text-xs font-black rounded-xl hover:bg-white/5 transition-all"
                >
                  HỦY
                </button>
                <button 
                  type="button"
                  onClick={handleConfirm}
                  className="px-6 py-3 bg-[#B5E361] text-[#1f3b00] text-xs font-black rounded-xl hover:bg-[#a7e965] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#B5E361]/10 active:scale-95"
                >
                  XÁC NHẬN
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AddMealModal;
