import React, { useState, useEffect } from 'react';
import { ChefHat, X, Flame, Search, Plus, Check, Trash2, Wheat, Fish, Droplet } from 'lucide-react';

function AddMealModal({ day, mealType, onClose, onConfirm, mealDate, initialRecipe }) {
  const [activeTab, setActiveTab] = useState('choose'); // 'choose' or 'create'
  const [userRecipes, setUserRecipes] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for creating a new recipe
  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(1);
  const [category] = useState(mealType || 'breakfast');
  const [dishCategory, setDishCategory] = useState('food');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [instructions, setInstructions] = useState(['']);
  const [saveToMyRecipe, setSaveToMyRecipe] = useState(true);

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

        if (recipesData.success && ingsData.success) {
          const dbRecipes = recipesData.data;
          const dbIngredients = ingsData.data;

          const brandItems = dbIngredients.filter(ing => ing.type === 'brand' || ing.brand_name);
          const brandRecipes = brandItems.map(brand => ({
            id: 'brand_' + brand.id,
            name: brand.name,
            description: `Thương hiệu: ${brand.brand_name || 'Khác'} - Khẩu phần: ${brand.serving_unit || '100g'}`,
            calories: brand.calories_per_100g,
            prep_time: 'Liền tay',
            image_url: brand.image_url || '',
            source: 'brand',
            isBrand: true,
            brandData: brand
          }));

          setUserRecipes([...dbRecipes, ...brandRecipes]);
          setAllIngredients(dbIngredients);
        }
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
    if (recipe.isBrand) {
      setDishName(recipe.name);
      setDescription(recipe.description);
      setCookTime(5); // Liền tay = 5 phút
      setImageUrl(recipe.image_url);
      setSelectedIngredients([{
        name: recipe.name,
        weight_g: 100, // Or whatever equivalent representing 1 serving
        calories_per_100g: parseFloat(recipe.brandData.calories_per_100g || 0),
        protein_per_100g: parseFloat(recipe.brandData.protein_per_100g || 0),
        carbs_per_100g: parseFloat(recipe.brandData.carbs_per_100g || 0),
        fat_per_100g: parseFloat(recipe.brandData.fat_per_100g || 0),
        showDropdown: false
      }]);
      setEditingRecipeId(null);
      setUpdateExistingRecipe(false);
      setActiveTab('create');
      return;
    }

    // Fill the states with recipe data
    setDishName(recipe.name || recipe.title || recipe.foodName || recipe.food_name || '');
    setDescription(recipe.description || '');
    setCookTime(parseInt(recipe.prep_time || recipe.prepTime) || 30);
    setImageUrl(recipe.image_url || recipe.image || '');

    if (recipe.ingredients) {
      setSelectedIngredients(recipe.ingredients.map(ing => {
        if (typeof ing === 'string') {
          return {
            name: ing,
            weight_g: 0,
            calories_per_100g: 0,
            protein_per_100g: 0,
            carbs_per_100g: 0,
            fat_per_100g: 0,
            showDropdown: false
          };
        }
        return {
          name: ing.name,
          weight_g: parseFloat(ing.weight_g || ing.weight || ing.amount) || 0,
          calories_per_100g: parseFloat(ing.calories_per_100g) || 0,
          protein_per_100g: parseFloat(ing.protein_per_100g) || 0,
          carbs_per_100g: parseFloat(ing.carbs_per_100g) || 0,
          fat_per_100g: parseFloat(ing.fat_per_100g) || 0,
          showDropdown: false
        };
      }));
    } else {
      setSelectedIngredients([]);
    }

    if (recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
      setInstructions(recipe.instructions);
    } else {
      setInstructions(['']);
    }

    setEditingRecipeId(recipe.id || recipe.recipeId);
    setUpdateExistingRecipe(false); // Default to not updating original
    setActiveTab('create');
  };

  useEffect(() => {
    if (initialRecipe && !isLoading) {
      const fetchFullRecipe = async () => {
        try {
          const res = await fetch(`http://localhost:5002/api/posts/${initialRecipe.id || initialRecipe.recipeId}`, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
          });
          const data = await res.json();
          if (data.success) {
            handleSelectRecipe(data.data);
          } else {
            handleSelectRecipe(initialRecipe);
          }
        } catch (e) {
          console.error("Failed to fetch full recipe", e);
          handleSelectRecipe(initialRecipe);
        }
        // Ensure this happens after handleSelectRecipe so it doesn't get overwritten
        setUpdateExistingRecipe(true);
        setActiveTab('create');
      };
      fetchFullRecipe();
    }
  }, [initialRecipe, isLoading]);

  const removeIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateWeight = (index, weight) => {
    setSelectedIngredients(selectedIngredients.map((item, i) =>
      i === index ? { ...item, weight_g: parseFloat(weight) || 0 } : item
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
    const baseList = allIngredients.filter(ing => (!ing.type || ing.type === 'ingredient') && !ing.brand_name);
    if (!query) return baseList.slice(0, 10);
    return baseList
      .filter(ing => ing.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  };

  const addInstructionRow = () => setInstructions([...instructions, '']);
  const removeInstructionRow = (index) => setInstructions(instructions.filter((_, i) => i !== index));
  const handleInstructionChange = (index, value) => {
    const newInsts = [...instructions];
    newInsts[index] = value;
    setInstructions(newInsts);
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
      ingredients: selectedIngredients,
      instructions: instructions.filter(i => i.trim()),
      category: dishCategory
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
          recipeData: recipeData,
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
      <div className="bg-white rounded-[2rem] shadow-2xl w-[95vw] max-w-[1400px] overflow-hidden flex flex-col h-[95vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 sm:p-5 sm:px-6 border-b border-[#B5E361]/30 flex justify-between items-start sm:items-center gap-4 bg-[#EAF6E3]/60 backdrop-blur-2xl rounded-t-[2rem] relative overflow-hidden">
          {/* Eye-catching glowing orbs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#B5E361]/70 to-[#8CB33D]/30 rounded-full blur-[64px] pointer-events-none translate-x-1/3 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#98d15a]/40 to-transparent rounded-full blur-[48px] pointer-events-none -translate-x-1/4 translate-y-1/2"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-[#B5E361] to-[#98d15a] rounded-xl flex items-center justify-center text-[#1f3b00] shadow-[0_8px_24px_-6px_rgba(181,227,97,0.6)] border border-[#B5E361]/50 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ChefHat size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
                Thêm <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7ba130] to-[#5a7820]">{getMealTypeTranslation(mealType)}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#B5E361]/20 text-[#5a7820] border border-[#B5E361]/30">
                  {getDayTranslation(day)}{mealDate ? `, ${mealDate}` : ''}
                </span>
                <span className="text-xs text-gray-500 font-bold">Lên kế hoạch ăn uống và tính calo</span>
              </div>
            </div>
          </div>

          <button
            className="p-3 bg-white/80 hover:bg-white border border-[#B5E361]/20 shadow-sm hover:shadow-md rounded-2xl transition-all text-gray-400 hover:text-[#5a7820] self-start sm:self-auto hover:-translate-y-0.5 active:scale-95 relative z-10"
            onClick={onClose}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-[160px] sm:w-[220px] bg-gray-50/50 border-r border-[#B5E361]/20 p-4 sm:p-5 flex flex-col gap-2.5 shrink-0">
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
                setSaveToMyRecipe(true);
                setUpdateExistingRecipe(false);
              }}
              className={`w-full py-3 px-4 text-left rounded-xl text-xs sm:text-[13px] font-black transition-all duration-300 ${activeTab === 'choose' ? 'bg-[#EAF6E3] text-[#1f3b00] shadow-sm ring-1 ring-[#B5E361]/30' : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900'}`}
            >
              Chọn món ăn
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setSaveToMyRecipe(true);
                if (editingRecipeId) {
                  setEditingRecipeId(null);
                  setDishName('');
                  setDescription('');
                  setCookTime(30);
                  setImageUrl('');
                  setSelectedIngredients([]);
                  setUpdateExistingRecipe(false);
                }
              }}
              className={`w-full py-3 px-4 text-left rounded-xl text-xs sm:text-[13px] font-black transition-all duration-300 ${activeTab === 'create' ? 'bg-[#EAF6E3] text-[#1f3b00] shadow-sm ring-1 ring-[#B5E361]/30' : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900'}`}
            >
              Tạo công thức mới
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
            {activeTab === 'choose' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5 pr-1">
                {userRecipes.length > 0 ? (
                  userRecipes.map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="relative bg-[#faf7f2] rounded-[24px] p-3.5 sm:p-4 flex flex-col gap-3 border border-[#f0ebe1] hover:shadow-[0_10px_30px_rgb(0,0,0,0.05)] hover:border-[#e2dccf] transition-all duration-300 cursor-pointer group h-full"
                    >
                      <div className="flex gap-3 items-start relative z-10">
                        {/* Image Container */}
                        <div className="w-[85px] h-[85px] shrink-0 rounded-[18px] overflow-hidden bg-gradient-to-br from-[#F4FBE7] to-[#EAF7D5] shadow-sm">
                          {recipe.image_url ? (
                            <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <ChefHat size={24} className="text-[#8CB33D]" />
                              <span className="text-[8px] font-black tracking-widest text-[#8CB33D] uppercase">Nutrigo</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Tags */}
                        <div className="flex-1 flex flex-col py-0.5 h-[85px]">
                          <h3 className="text-[15px] sm:text-base font-extrabold text-[#2d3748] leading-tight line-clamp-2 mb-2">
                            {recipe.name}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            <span className="bg-[#c5e87a] text-[#3d6600] px-2.5 py-1 rounded-xl text-[10px] font-extrabold capitalize shadow-sm inline-block">
                              {{ 'food': 'Món ăn', 'drink': 'Đồ uống', 'snack': 'Ăn vặt', 'breakfast': 'Bữa sáng', 'lunch': 'Bữa trưa', 'dinner': 'Bữa tối' }[recipe.meal_type] || { 'food': 'Món ăn', 'drink': 'Đồ uống', 'snack': 'Ăn vặt', 'breakfast': 'Bữa sáng', 'lunch': 'Bữa trưa', 'dinner': 'Bữa tối' }[recipe.category] || recipe.meal_type || recipe.category || 'Món ăn'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Select Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRecipe(recipe);
                        }}
                        className="w-full bg-white group-hover:bg-[#c5e87a] border border-[#e4e1d6] group-hover:border-[#c5e87a] text-[#6d795a] group-hover:text-[#3d6600] font-bold text-sm py-2 rounded-xl transition-all shadow-sm relative z-20"
                      >
                        Chọn món này
                      </button>

                      {/* Bottom Section: Macros */}
                      <div className="bg-white rounded-[16px] py-2 px-1 sm:px-2 grid grid-cols-4 gap-1 shadow-sm mt-auto relative z-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
                            <Flame size={12} strokeWidth={2.5} className="text-[#8CB33D]" /> kcal
                          </div>
                          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.calories || 0}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center border-l border-gray-100">
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
                            <Wheat size={12} strokeWidth={2.5} className="text-orange-500" /> Carb
                          </div>
                          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.carbs || 0}g</span>
                        </div>
                        <div className="flex flex-col items-center justify-center border-l border-gray-100">
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
                            <Fish size={12} strokeWidth={2.5} className="text-blue-500" /> Pro
                          </div>
                          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.protein || 0}g</span>
                        </div>
                        <div className="flex flex-col items-center justify-center border-l border-gray-100">
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
                            <Droplet size={12} strokeWidth={2.5} className="text-red-500" /> Béo
                          </div>
                          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.fat || 0}g</span>
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
              <div className="flex flex-col h-full">
                <div className="flex flex-col md:flex-row gap-8 pr-1">
                  {/* Left Column: Image & Basic Info */}
                  <div className="flex-1 space-y-5 shrink-0 w-full md:w-[45%]">
                    {/* Image Upload Banner */}
                    <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#B5E361]/50 transition-colors group">
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[160px] text-gray-400 hover:text-[#3d6600]">
                        {imageUrl ? (
                          <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
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
                      <label className="text-sm font-bold text-gray-700 pl-1">Tên công thức *</label>
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
                      <label className="text-sm font-bold text-gray-700 pl-1">Mô tả công thức</label>
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
                        <label className="text-sm font-bold text-gray-700 pl-1">Thời gian nấu (phút)</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all"
                          value={cookTime === 0 ? '' : cookTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCookTime(val === '' ? '' : parseInt(val) || 0);
                          }}
                        />
                      </div>

                      {/* Servings */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 pl-1">Số phần ăn (khẩu phần)</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all"
                          value={servings === 0 ? '' : servings}
                          onChange={(e) => {
                            const val = e.target.value;
                            setServings(val === '' ? '' : parseInt(val) || 1);
                          }}
                        />
                      </div>
                    </div>



                  </div>

                  {/* Right Column: Ingredients & Options */}
                  <div className="flex-1 flex flex-col space-y-6">
                    {/* Dish Category Dropdown (Moved to Right Column) */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 pl-1">Loại món</label>
                      <select
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all cursor-pointer"
                        value={dishCategory}
                        onChange={(e) => setDishCategory(e.target.value)}
                      >
                        <option value="food">Món ăn</option>
                        <option value="drink">Đồ uống</option>
                        <option value="snack">Ăn vặt</option>
                      </select>
                    </div>

                    {/* Ingredients Builder */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-800 pl-1">Nguyên liệu & dinh dưỡng từng phần</label>
                        <button
                          type="button"
                          onClick={() => setSelectedIngredients([...selectedIngredients, { name: '', weight_g: 0, calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0, showDropdown: false }])}
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
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-9 py-2 text-xs text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/25 focus:border-[#B5E361] transition-all"
                              />
                              {ing.name && (
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    const newIngredients = [...selectedIngredients];
                                    newIngredients[idx] = {
                                      ...newIngredients[idx],
                                      name: '',
                                      weight_g: 0,
                                      calories_per_100g: 0,
                                      protein_per_100g: 0,
                                      carbs_per_100g: 0,
                                      fat_per_100g: 0,
                                      showDropdown: false
                                    };
                                    setSelectedIngredients(newIngredients);
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-all"
                                  title="Xóa nguyên liệu"
                                >
                                  <X size={12} strokeWidth={3} />
                                </button>
                              )}
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
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100" title="Lượng Calories trên 100g (Được tự động điền khi chọn nguyên liệu)">
                                  <span className="text-[10px] font-bold text-gray-400">Mật độ:</span>
                                  <input
                                    type="number"
                                    value={ing.calories_per_100g === 0 ? '' : ing.calories_per_100g}
                                    placeholder="0"
                                    disabled
                                    className="w-12 text-center font-black text-xs text-gray-500 bg-transparent border-none p-0 focus:ring-0 cursor-not-allowed"
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

                      {/* Recipe Instructions (Các bước chế biến) */}
                      <div className="mt-8 space-y-4 pt-2 border-t border-gray-100 pr-1">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-gray-800 pl-1">Các bước chế biến</label>
                          <button
                            type="button"
                            onClick={addInstructionRow}
                            className="bg-[#B5E361] hover:bg-[#98d15a] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Plus size={14} />
                            THÊM BƯỚC
                          </button>
                        </div>

                        <div className="space-y-3">
                          {instructions.map((step, idx) => (
                            <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#B5E361]/20 transition-all duration-300">
                              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white text-gray-400 flex items-center justify-center font-black text-sm border border-gray-100 shadow-sm">
                                {idx + 1}
                              </div>
                              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                <textarea
                                  value={step}
                                  onChange={(e) => handleInstructionChange(idx, e.target.value)}
                                  placeholder={`Mô tả chi tiết bước ${idx + 1}...`}
                                  rows="2"
                                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-gray-900 focus:ring-0 placeholder:text-gray-300 resize-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeInstructionRow(idx)}
                                  className="self-end sm:self-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}

                          {instructions.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 font-bold text-xs">
                              Chưa có bước chế biến nào được thêm
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Save checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer group pt-2 select-none">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(editingRecipeId ? updateExistingRecipe : saveToMyRecipe) ? 'bg-[#8CB33D] border-[#8CB33D]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                        {(editingRecipeId ? updateExistingRecipe : saveToMyRecipe) && <Check size={14} className="text-white font-black stroke-[3]" />}
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
                      <span className="text-xs font-medium text-gray-600">
                        {editingRecipeId ? (
                          "Cập nhật thay đổi vào công thức gốc"
                        ) : (
                          <>Lưu vào <strong className="font-black text-gray-900">Công thức của tôi</strong></>
                        )}
                      </span>
                    </label>
                  </div>

                  {/* Summary and Actions (Moved from Footer to Body) */}
                  <div className="mt-8 p-5 sm:p-6 bg-gradient-to-br from-[#F4FBE7] to-[#EAF7D5] border border-[#B5E361]/30 rounded-2xl relative overflow-hidden shrink-0">
                    {/* Eye-catching glowing orbs */}
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#B5E361]/40 to-transparent rounded-full blur-[64px] pointer-events-none -translate-x-1/3 translate-y-1/2"></div>
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-[#98d15a]/30 to-transparent rounded-full blur-[48px] pointer-events-none translate-x-1/4 -translate-y-1/4"></div>

                    <div className="flex flex-col xl:flex-row justify-between items-center gap-6 relative z-10">

                      {/* Macros Summary */}
                      <div className="flex items-center gap-2.5 sm:gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                        <div className="bg-white/80 border border-white rounded-[20px] px-4 sm:px-5 py-2.5 flex flex-col items-center justify-center min-w-[80px] sm:min-w-[90px] shadow-sm">
                          <span className="text-[#8CB33D] text-[9px] font-black uppercase tracking-widest mb-1">Calories</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl sm:text-2xl font-black text-[#2a4500]">{Math.round(totals.calories)}</span>
                          </div>
                        </div>

                        <div className="bg-blue-50/80 border border-blue-100/80 rounded-[20px] px-4 sm:px-5 py-2.5 flex flex-col items-center justify-center min-w-[80px] sm:min-w-[90px] shadow-sm">
                          <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-1">Protein</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-xl font-black text-blue-700">{totals.protein.toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-blue-400">g</span>
                          </div>
                        </div>

                        <div className="bg-orange-50/80 border border-orange-100/80 rounded-[20px] px-4 sm:px-5 py-2.5 flex flex-col items-center justify-center min-w-[80px] sm:min-w-[90px] shadow-sm">
                          <span className="text-orange-500 text-[9px] font-black uppercase tracking-widest mb-1">Carbs</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-xl font-black text-orange-600">{totals.carbs.toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-orange-400">g</span>
                          </div>
                        </div>

                        <div className="bg-red-50/80 border border-red-100/80 rounded-[20px] px-4 sm:px-5 py-2.5 flex flex-col items-center justify-center min-w-[80px] sm:min-w-[90px] shadow-sm">
                          <span className="text-red-500 text-[9px] font-black uppercase tracking-widest mb-1">Fat</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-xl font-black text-red-600">{totals.fat.toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-red-400">g</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 justify-end">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-6 sm:px-8 py-3 text-red-700 bg-red-50 hover:bg-red-100 font-bold text-[13px] rounded-xl transition-all active:scale-95 border border-red-100"
                        >
                          HỦY
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirm}
                          className="px-8 sm:px-10 py-3 bg-green-700 hover:bg-green-800 text-white font-bold text-[13px] rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                          XÁC NHẬN
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMealModal;
