import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, Clock, Flame, Wheat, Fish, Droplet, ChefHat, Check, Bookmark, ArrowRight,
  Coffee, Soup, Moon, Cookie, Apple, ChevronDown, Calendar
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AddToMealPlanModal from '../components/AddToMealPlanModal';

function AIChef() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMealOpen, setIsMealOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipesList, setRecipesList] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [maxCalories, setMaxCalories] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [toastMealPlanMsg, setToastMealPlanMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [allDbIngredients, setAllDbIngredients] = useState([]);
  const [filteredDbIngredients, setFilteredDbIngredients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mealRef = useRef(null);
  const catRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const fetchDbIngredients = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/mealplan/ingredients');
        const data = await response.json();
        if (data.success && data.data) {
          setAllDbIngredients(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch ingredients:', err);
      }
    };
    fetchDbIngredients();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (mealRef.current && !mealRef.current.contains(event.target)) {
        setIsMealOpen(false);
      }
      if (catRef.current && !catRef.current.contains(event.target)) {
        setIsCatOpen(false);
      }
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const quickSuggestions = [
    'Trứng gà', 'Cà chua', 'Ức gà', 'Thịt lợn nạc', 'Thịt bò thăn', 
    'Đậu phụ', 'Cá hồi tươi', 'Khoai lang', 'Yến mạch', 'Bí đỏ', 'Nấm đùi gà'
  ];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (!val.trim()) {
      const matches = allDbIngredients.filter(ing => !ingredients.includes(ing.name));
      setFilteredDbIngredients(matches);
      setShowSuggestions(true);
      return;
    }
    const matches = allDbIngredients.filter(ing => 
      ing.name.toLowerCase().includes(val.toLowerCase()) &&
      !ingredients.includes(ing.name)
    );
    setFilteredDbIngredients(matches);
    setShowSuggestions(true);
  };

  const handleAddIngredient = (name) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (ingredients.some(i => i.toLowerCase() === cleanName.toLowerCase())) return;
    setIngredients([...ingredients, cleanName]);
    setInputVal('');
    setFilteredDbIngredients([]);
    setShowSuggestions(false);
    setErrorMsg('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (filteredDbIngredients.length > 0) {
        handleAddIngredient(filteredDbIngredients[0].name);
      }
    }
  };

  const handleRemoveIngredient = (idx) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setErrorMsg('Vui lòng cung cấp ít nhất một nguyên liệu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setRecipesList([]);
    setSaveSuccess(false);

    try {
      const response = await fetch('http://localhost:5002/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          ingredients,
          mealType: selectedMealType,
          category: selectedCategory,
          maxCalories: maxCalories ? Number(maxCalories) : null
        })
      });

      const data = await response.json();
      if (data.success) {
        setRecipesList(data.data.recipes || []);
        setActiveIdx(0);
      } else {
        setErrorMsg(data.message || 'Không thể tạo công thức lúc này. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Đã xảy ra lỗi kết nối. Hãy đảm bảo backend đang chạy.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMealTypeLabel = (type) => {
    switch (type) {
      case 'breakfast': return 'Bữa sáng';
      case 'lunch': return 'Bữa trưa';
      case 'dinner': return 'Bữa tối';
      case 'snack': return 'Bữa phụ';
      default: return 'Bữa ăn';
    }
  };

  const getMealIcon = (type) => {
    switch (type) {
      case 'breakfast': return <Coffee className="w-3.5 h-3.5 text-blue-500" />;
      case 'lunch': return <Soup className="w-3.5 h-3.5 text-orange-500" />;
      case 'dinner': return <Moon className="w-3.5 h-3.5 text-[#8CB33D]" />;
      case 'snack': return <Cookie className="w-3.5 h-3.5 text-amber-500" />;
      default: return <ChefHat className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'food': return 'Món ăn';
      case 'drink': return 'Đồ uống';
      case 'snack': return 'Ăn vặt';
      case 'fruit': return 'Trái cây';
      case 'other': return 'Khác';
      default: return 'Ẩm thực';
    }
  };

  const handleSaveRecipe = async () => {
    const recipe = recipesList[activeIdx];
    if (!recipe) return;
    try {
      const response = await fetch('http://localhost:5002/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          foodName: recipe.title,
          description: recipe.description,
          prepTime: `${recipe.cookingTime} phút`,
          calories: recipe.calories,
          carbs: recipe.carbs,
          protein: recipe.protein,
          fat: recipe.fat,
          ingredients: recipe.ingredients.map(i => ({ name: i.name || i, amount: `${i.weight || 100}g`, calories: 0 })),
          instructions: recipe.steps,
          isRecipe: true,
          category: recipe.category || 'food',
          mealType: recipe.mealType || 'breakfast'
        })
      });

      const data = await response.json();
      if (data.success) {
        setSaveSuccess(true);
        setSavedRecipeId(data.data.id);
        setTimeout(() => {
          navigate('/my-recipes');
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Không thể lưu công thức nấu ăn. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi kết nối khi lưu công thức.');
    }
  };

  const handleAddToMealPlan = async () => {
    const recipe = recipesList[activeIdx];
    if (!recipe) return;

    if (savedRecipeId) {
      setActiveModalPost({
        id: savedRecipeId,
        foodName: recipe.title
      });
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5002/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          foodName: recipe.title,
          description: recipe.description,
          prepTime: `${recipe.cookingTime} phút`,
          calories: recipe.calories,
          carbs: recipe.carbs,
          protein: recipe.protein,
          fat: recipe.fat,
          ingredients: recipe.ingredients.map(i => ({ name: i.name || i, amount: `${i.weight || 100}g`, calories: 0 })),
          instructions: recipe.steps,
          isRecipe: true,
          category: recipe.category || 'food',
          mealType: recipe.mealType || 'breakfast'
        })
      });

      const data = await response.json();
      if (data.success) {
        setSavedRecipeId(data.data.id);
        setActiveModalPost({
          id: data.data.id,
          foodName: recipe.title
        });
      } else {
        setErrorMsg(data.message || 'Không thể chuẩn bị công thức để lên lịch. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi kết nối khi chuẩn bị lên lịch.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chef-page main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
      <PageHeader
        icon={Sparkles}
        title="AI Đầu Bếp"
        subtitle="Nhập các nguyên liệu bạn đang có, Trí tuệ Nhân tạo sẽ sáng tạo ra công thức nấu ăn độc đáo dành riêng cho bạn!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
        {/* Left Column: Ingredients Input Panel */}
        <div className="col-span-1 bg-[#fffdf0] rounded-[2rem] border border-amber-100/60 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="text-[#8CB33D] w-5 h-5" />
            <h3 className="text-lg font-black text-[#112308]">Nguyên liệu hiện có</h3>
          </div>

          {/* Autocomplete Input Container */}
          <div ref={autocompleteRef} className="relative mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm nguyên liệu từ thư viện..."
                value={inputVal}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => {
                  const matches = allDbIngredients.filter(ing => !ingredients.includes(ing.name));
                  setFilteredDbIngredients(matches);
                  setShowSuggestions(true);
                }}
                className="w-full px-4 py-2.5 rounded-2xl border border-amber-100 bg-white text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8CB33D]/40"
              />
            </div>

            {showSuggestions && filteredDbIngredients.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 z-50 bg-white rounded-2xl border border-amber-100/60 shadow-lg py-1.5 max-h-[220px] overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-150">
                {filteredDbIngredients.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => {
                      handleAddIngredient(ing.name);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-[#8CB33D]/10 hover:text-[#2d5200] transition-colors"
                  >
                    {ing.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-xs font-bold text-red-500 mb-4 px-2">{errorMsg}</p>
          )}

          {/* Added tags list */}
          <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
            {ingredients.length === 0 ? (
              <span className="text-xs text-gray-400 font-semibold italic p-1">Chưa có nguyên liệu nào được thêm.</span>
            ) : (
              ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-xs font-black text-[#2d5200] shadow-sm animate-in zoom-in-95 duration-150"
                >
                  {ing}
                  <button onClick={() => handleRemoveIngredient(idx)} className="text-amber-700 hover:text-red-600 transition-colors">
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="border-t border-amber-100/50 pt-4">
            <p className="text-xs font-black text-gray-400 mb-3 tracking-wide uppercase">Gợi ý nhanh</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleAddIngredient(suggestion)}
                  disabled={ingredients.includes(suggestion)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    ingredients.includes(suggestion)
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:border-[#8CB33D] text-gray-600 hover:text-[#2d5200] hover:scale-105 shadow-sm'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Target Preference Filters */}
          <div className="border-t border-amber-100/50 pt-4 mt-5 flex flex-col gap-4">
            <div ref={mealRef} className="relative">
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Bữa ăn gợi ý</label>
              <button
                type="button"
                onClick={() => {
                  setIsMealOpen(!isMealOpen);
                  setIsCatOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-amber-100 bg-white text-xs font-bold text-gray-700 hover:border-[#8CB33D]/60 transition-colors shadow-sm text-left"
              >
                <span>{selectedMealType === 'All' ? 'Tất cả bữa ăn (AI tự gợi ý)' : getMealTypeLabel(selectedMealType)}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMealOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMealOpen && (
                <div className="absolute left-0 right-0 mt-1 z-50 bg-white rounded-2xl border border-amber-100/60 shadow-lg py-1.5 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
                  {[
                    { val: 'All', label: 'Tất cả bữa ăn (AI tự gợi ý)' },
                    { val: 'breakfast', label: 'Bữa sáng' },
                    { val: 'lunch', label: 'Bữa trưa' },
                    { val: 'dinner', label: 'Bữa tối' },
                    { val: 'snack', label: 'Bữa phụ' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedMealType(opt.val);
                        setIsMealOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                        selectedMealType === opt.val
                          ? 'bg-[#8CB33D]/10 text-[#2d5200]'
                          : 'text-gray-600 hover:bg-amber-50/50 hover:text-gray-900'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedMealType === opt.val && <Check size={12} className="text-[#8CB33D]" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={catRef} className="relative">
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Phân loại món ăn</label>
              <button
                type="button"
                onClick={() => {
                  setIsCatOpen(!isCatOpen);
                  setIsMealOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-amber-100 bg-white text-xs font-bold text-gray-700 hover:border-[#8CB33D]/60 transition-colors shadow-sm text-left"
              >
                <span>{selectedCategory === 'All' ? 'Tất cả thể loại (AI tự gợi ý)' : getCategoryLabel(selectedCategory)}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatOpen && (
                <div className="absolute left-0 right-0 mt-1 z-50 bg-white rounded-2xl border border-amber-100/60 shadow-lg py-1.5 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
                  {[
                    { val: 'All', label: 'Tất cả thể loại (AI tự gợi ý)' },
                    { val: 'food', label: 'Món ăn' },
                    { val: 'drink', label: 'Đồ uống' },
                    { val: 'snack', label: 'Đồ ăn vặt (Snack)' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(opt.val);
                        setIsCatOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                        selectedCategory === opt.val
                          ? 'bg-[#8CB33D]/10 text-[#2d5200]'
                          : 'text-gray-600 hover:bg-amber-50/50 hover:text-gray-900'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedCategory === opt.val && <Check size={12} className="text-[#8CB33D]" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Giới hạn Calo tối đa (kcal)</label>
              <input
                type="number"
                min="0"
                placeholder="Ví dụ: 500 (Để trống nếu không giới hạn)"
                value={maxCalories}
                onChange={(e) => setMaxCalories(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-amber-100 bg-white text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB33D]/40 shadow-sm"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || ingredients.length === 0}
            className={`w-full mt-6 py-3 px-4 bg-[#B5E361] hover:bg-[#8CB33D] text-[#112308] font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all ${
              isLoading || ingredients.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            <Sparkles size={16} strokeWidth={2.5} className="animate-pulse text-[#112308]/60" />
            <span>{isLoading ? 'Đang sáng tạo...' : 'Sáng tạo công thức'}</span>
          </button>
        </div>

        {/* Right Column: AI Recipe Result Screen */}
        <div className="col-span-1 lg:col-span-2 h-full">
          {isLoading && (
            <div className="bg-[#fffdf0] rounded-[2rem] border border-amber-100/60 shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-amber-100 border-t-[#8CB33D] animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-lg font-black text-[#112308] mb-2">Đang kết nối với AI Đầu Bếp...</h4>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 max-w-sm">
                Chúng tôi đang phân tích các nguyên liệu của bạn để tạo ra một công thức cân bằng dinh dưỡng và ngon miệng nhất.
              </p>
            </div>
          )}

          {!isLoading && recipesList.length === 0 && (
            <div className="bg-[#fffdf0] rounded-[2rem] border border-amber-100/60 shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
              <ChefHat size={48} className="text-amber-200/80 mb-4 animate-bounce" />
              <h4 className="text-lg font-black text-[#112308] mb-1">Căn bếp AI đã sẵn sàng!</h4>
              <p className="text-xs sm:text-sm font-semibold text-gray-400 max-w-sm">
                Chọn nguyên liệu ở cột bên trái và bấm nút "Sáng tạo công thức" để trải nghiệm ẩm thực được cá nhân hóa bằng AI.
              </p>
            </div>
          )}

          {!isLoading && recipesList.length > 0 && (() => {
            const recipe = recipesList[activeIdx];
            if (!recipe) return null;
            return (
              <div className="bg-[#fffdf0] rounded-[2rem] border border-amber-100/60 shadow-sm p-6 animate-in fade-in duration-300">
                {/* 3 Choices tab header row */}
                <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 border-b border-amber-100/20">
                  {recipesList.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveIdx(idx);
                        setSaveSuccess(false);
                      }}
                      className={`px-3 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                        activeIdx === idx
                          ? 'bg-[#B5E361] border-transparent text-[#112308] scale-105 shadow-sm'
                          : 'bg-white border-amber-100/40 text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      <Sparkles size={12} className={activeIdx === idx ? 'text-[#112308]' : 'text-gray-300'} />
                      <span>{r.title}</span>
                    </button>
                  ))}
                </div>

                {/* Recipe title and save */}
                <div className="flex justify-between items-start gap-4 mb-4 flex-wrap">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#112308] tracking-tight mb-1">{recipe.title}</h3>
                    <p className="text-xs sm:text-sm font-bold text-gray-500 italic">"{recipe.description}"</p>
                  </div>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={handleAddToMealPlan}
                      className="px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 border bg-white border-amber-200 text-gray-700 hover:border-[#8CB33D] hover:text-[#2d5200]"
                    >
                      <Calendar size={14} strokeWidth={2.5} className="text-amber-500" />
                      Lên lịch ăn uống
                    </button>
                    <button
                      onClick={handleSaveRecipe}
                      disabled={saveSuccess}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 border ${
                        saveSuccess
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-[#B5E361] hover:bg-[#8CB33D] text-[#112308] border-transparent'
                      }`}
                    >
                      {saveSuccess ? (
                        <>
                          <Check size={14} strokeWidth={2.5} />
                          Đã lưu!
                        </>
                      ) : (
                        <>
                          <Bookmark size={14} strokeWidth={2.5} />
                          Lưu vào Công thức của tôi
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Prep time, mealType and category info row */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 font-extrabold bg-amber-50/60 border border-amber-100/50 px-3 py-1.5 rounded-xl shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#8CB33D]" />
                    <span>Thời gian: {recipe.cookingTime} phút</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-800 font-extrabold bg-blue-50/60 border border-blue-100/50 px-3 py-1.5 rounded-xl shadow-sm">
                    {getMealIcon(recipe.mealType)}
                    <span>Bữa ăn: {getMealTypeLabel(recipe.mealType)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold bg-emerald-50/60 border border-emerald-100/50 px-3 py-1.5 rounded-xl shadow-sm">
                    <Apple className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Phân loại: {getCategoryLabel(recipe.category)}</span>
                  </div>
                </div>

                {/* Sync Nutrients capsule strip */}
                <div className="grid grid-cols-4 bg-white rounded-2xl py-3 px-2 border border-gray-100 shadow-sm text-center mb-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5">
                      <Flame size={12} strokeWidth={2.5} className="text-[#8CB33D]" /> kcal
                    </div>
                    <span className="text-xs sm:text-sm font-black text-gray-700">
                      {recipe.calories || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-l border-gray-100">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5">
                      <Wheat size={12} strokeWidth={2.5} className="text-orange-500" /> Carb
                    </div>
                    <span className="text-xs sm:text-sm font-black text-gray-700">
                      {recipe.carbs || 0}g
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-l border-gray-100">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5">
                      <Fish size={12} strokeWidth={2.5} className="text-blue-500" /> Protein
                    </div>
                    <span className="text-xs sm:text-sm font-black text-gray-700">
                      {recipe.protein || 0}g
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-l border-gray-100">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5">
                      <Droplet size={12} strokeWidth={2.5} className="text-red-500" /> Fat
                    </div>
                    <span className="text-xs sm:text-sm font-black text-gray-700">
                      {recipe.fat || 0}g
                    </span>
                  </div>
                </div>

                {/* Split columns for Ingredients and Steps */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-t border-gray-100 pt-6">
                  {/* Ingredients checklist */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-black text-[#112308] mb-3 uppercase tracking-wide">Nguyên liệu cần có</h4>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-semibold text-gray-600">
                          <div className="w-4 h-4 rounded-md border border-amber-200 bg-amber-50/50 flex items-center justify-center text-[#8CB33D] shrink-0 mt-0.5">
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span>
                            {ing.name || ing}
                            {(ing.weight || ing.weight_g) && (
                              <span className="text-gray-400 font-bold ml-1">({ing.weight || ing.weight_g}g)</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps process */}
                  <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                    <h4 className="text-sm font-black text-[#112308] mb-3 uppercase tracking-wide">Các bước thực hiện</h4>
                    <ol className="space-y-3.5">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#8CB33D]/10 border border-[#8CB33D]/30 flex items-center justify-center text-[10px] font-black text-[#2d5200] shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Save Success notice */}
                {saveSuccess && (
                  <div className="mt-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
                    <span className="flex items-center gap-1.5">
                      <Check className="text-emerald-600" size={14} strokeWidth={2.5} />
                      Món ăn đã được thêm vào Sách công thức của bạn!
                    </span>
                    <button onClick={() => navigate('/my-recipes')} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors uppercase text-[10px] font-black tracking-wide">
                      Xem ngay <ArrowRight size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {activeModalPost && (
        <AddToMealPlanModal
          post={activeModalPost}
          onClose={() => setActiveModalPost(null)}
          onAddSuccess={(info) => {
            setToastMealPlanMsg(info);
            setTimeout(() => setToastMealPlanMsg(null), 4000);
          }}
        />
      )}

      {toastMealPlanMsg && (
        <div className="fixed top-6 right-6 z-[150] bg-white border border-[#B5E361]/50 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="w-8 h-8 bg-[#EAF7D5] rounded-full flex items-center justify-center shrink-0">
            <Check size={16} className="text-[#3d6600]" strokeWidth={3} />
          </div>
          <p className="text-sm font-semibold text-gray-600 pr-2">
            <span className="text-[#1f3b00] font-black">{toastMealPlanMsg.name}</span> đã được lên lịch ăn vào{' '}
            <span className="text-[#1f3b00] font-black bg-[#B5E361]/30 px-2 py-0.5 rounded-md border border-[#B5E361]/40">
              {toastMealPlanMsg.mealType === 'breakfast' ? 'Bữa sáng' : toastMealPlanMsg.mealType === 'lunch' ? 'Bữa trưa' : toastMealPlanMsg.mealType === 'dinner' ? 'Bữa tối' : 'Bữa phụ'}
            </span>{' '}
            ngày <span className="text-[#1f3b00] font-black bg-[#EAF7D5] px-2 py-0.5 rounded-md border border-[#B5E361]/30">
              {new Date(toastMealPlanMsg.mealDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </span> thành công!
          </p>
        </div>
      )}
    </div>
  );
}

export default AIChef;
