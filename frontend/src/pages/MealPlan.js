import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import AddMealModal from '../components/AddMealModal';
import MealDetailModal from '../components/MealDetailModal';
import PageHeader from '../components/PageHeader';
import { CalendarDays, Sparkles, ShoppingCart, Lightbulb, ArrowLeft, ArrowRight, Plus, ChefHat, Flame, Copy, Download } from 'lucide-react';

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getDayTranslation = (dayName) => {
  const map = {
    'Monday': 'Thứ 2',
    'Tuesday': 'Thứ 3',
    'Wednesday': 'Thứ 4',
    'Thursday': 'Thứ 5',
    'Friday': 'Thứ 6',
    'Saturday': 'Thứ 7',
    'Sunday': 'Chủ Nhật'
  };
  return map[dayName] || dayName;
};

const getMealTypeLabel = (type) => {
  const map = {
    'breakfast': 'Bữa sáng',
    'lunch': 'Bữa trưa',
    'dinner': 'Bữa tối',
    'snack': 'Bữa phụ'
  };
  return map[type] || type;
};

const getMatchStatusLabel = (status) => {
  if (!status) return '';
  if (status === 'Cook now') return 'Nấu ngay';
  const match = status.match(/Missing (\d+)/i);
  if (match) {
    return `Thiếu ${match[1]} nguyên liệu`;
  }
  return status;
};

function MealPlan() {
  const navigate = useNavigate();
  const { user, metrics } = useOutletContext();
  const targetCalories = metrics?.targetCalories || 2000;
  const [activeSection, setActiveSection] = useState('calendar'); // 'calendar' or 'suggestions'
  const [activeTab, setActiveTab] = useState('weekly-planner'); // 'weekly-planner' or 'shopping-list'
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  
  // Suggestion State
  const [userIngredients, setUserIngredients] = useState(['Trứng', 'Thịt bò']);
  const [ingredientInput, setIngredientInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Modal control state
  const [addMealConfig, setAddMealConfig] = useState(null); // { day, mealType, mealDate }
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  const handleRecipeClick = async (recipe, day, mealType, mealDate) => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${recipe.recipeId || recipe.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedRecipeDetail({ 
          ...data.data, 
          mealPlanId: recipe.mealPlanId,
          day,
          mealType,
          mealDate
        });
      }
    } catch (e) {
      console.error("Failed to fetch recipe detail", e);
    }
  };

  // Calendar Date State
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    return getWeekStart(new Date());
  });

  // Reset checked ingredients when changing weeks
  useEffect(() => {
    setCheckedIngredients([]);
  }, [currentWeekStart]);

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const isPrevDisabled = () => {
    if (!user || !user.createdAt) return false;
    const createdWeekStart = getWeekStart(new Date(user.createdAt));
    return currentWeekStart.getTime() <= createdWeekStart.getTime();
  };

  const prevWeek = () => {
    if (isPrevDisabled()) return;
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const days = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    days.push({
      dateObj: d,
      name: dayNames[i],
      formatted: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    });
  }

  const handleAutoFill = async () => {
    try {
      const weekStartStr = currentWeekStart.toISOString().split('T')[0];
      const res = await fetch(`http://localhost:5002/api/mealplan/autofill?weekStart=${weekStartStr}`, { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        setWeeklyPlan(data.data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchWeeklyPlan = useCallback(async () => {
    try {
      const weekStartStr = currentWeekStart.toISOString().split('T')[0];
      const res = await fetch(`http://localhost:5002/api/mealplan?weekStart=${weekStartStr}`);
      const data = await res.json();
      if(data.success) {
        setWeeklyPlan(data.data);
      }
    } catch (e) { console.error(e); }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchWeeklyPlan();
  }, [fetchWeeklyPlan]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5002/api/mealplan/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIngredients })
      });
      const data = await res.json();
      if(data.success) {
        setSuggestions(data.data);
      }
    } catch (e) { console.error(e); }
  }, [userIngredients]);

  useEffect(() => {
    if (activeSection === 'suggestions') {
      fetchSuggestions();
    }
  }, [activeSection, fetchSuggestions]);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (ingredientInput.trim() && !userIngredients.includes(ingredientInput.trim())) {
      setUserIngredients([...userIngredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ing) => {
    setUserIngredients(userIngredients.filter(i => i !== ing));
  };

  const handleClearMealAt = async (day, mealType, mealPlanId, mealDate) => {
    try {
      const res = await fetch('http://localhost:5002/api/mealplan/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, mealType, recipeId: null, mealPlanId, mealDate })
      });
      const data = await res.json();
      if (data.success) {
        setWeeklyPlan(data.data);
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi xóa món ăn.');
    }
  };

  const addToPlan = async (recipe, mealDate, mealType) => {
    await fetch('http://localhost:5002/api/mealplan/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealDate, mealType, recipeId: recipe.id })
    });
    alert(`Đã thêm ${recipe.name} thành công!`);
    fetchWeeklyPlan();
  };

  const calculateDailyTotal = (meals) => {
    let total = 0;
    Object.values(meals).forEach(mealArray => {
      if (Array.isArray(mealArray)) {
        mealArray.forEach(m => {
          if (m && m.calories) total += Number(m.calories);
        });
      }
    });
    return total;
  };

  const calculateWeeklyTotalCalories = () => {
    let total = 0;
    weeklyPlan.forEach(planDay => {
      total += calculateDailyTotal(planDay.meals);
    });
    return total;
  };

  // Extract and deduplicate ingredients
  const extractIngredients = () => {
    const ingredientCounts = {};

    weeklyPlan.forEach(day => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
        const recipeList = day.meals[mealType];
        if (recipeList && Array.isArray(recipeList)) {
          recipeList.forEach(recipe => {
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach(ing => {
                const lowerIng = ing.toLowerCase().trim();
                if (ingredientCounts[lowerIng]) {
                  ingredientCounts[lowerIng].count += 1;
                } else {
                  ingredientCounts[lowerIng] = { name: ing, count: 1 };
                }
              });
            }
          });
        }
      });
    });

    return Object.values(ingredientCounts).sort((a, b) => a.name.localeCompare(b.name));
  };

  const ingredientsList = extractIngredients();

  const toggleIngredientChecked = (ingName) => {
    if (checkedIngredients.includes(ingName)) {
      setCheckedIngredients(checkedIngredients.filter(name => name !== ingName));
    } else {
      setCheckedIngredients([...checkedIngredients, ingName]);
    }
  };

  const handleExportTXT = () => {
    const startStr = days[0]?.formatted ? days[0].formatted.replace(/\//g, '-') : 'tuan-nay';
    const endStr = days[6]?.formatted ? days[6].formatted.replace(/\//g, '-') : '';
    let txtContent = `=========================================\n`;
    txtContent += `         NUTRIGO SHOPPING LIST\n`;
    txtContent += `   Tuần: ${days[0]?.formatted || ''} - ${days[6]?.formatted || ''}\n`;
    txtContent += `=========================================\n\n`;
    
    const remaining = ingredientsList.filter(ing => !checkedIngredients.includes(ing.name));
    
    if (remaining.length === 0) {
      txtContent += `Tất cả nguyên liệu đã được mua hoặc chưa lên lịch.\n`;
    } else {
      remaining.forEach((ing, idx) => {
        txtContent += `${idx + 1}. [ ] ${ing.name.padEnd(25)} (x${ing.count})\n`;
      });
    }
    
    txtContent += `\n=========================================\n`;
    txtContent += `Được tạo bởi Nutrigo 🥗\n`;

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nutrigo_Nguyen_Lieu_${startStr}_to_${endStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mealplan-page main-content h-full flex flex-col" style={{ overflow: 'hidden', paddingBottom: '20px' }}>
      {/* Breadcrumb - Only visible in suggestions mode */}
      {activeSection === 'suggestions' && (
        <nav className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => setActiveSection('calendar')} 
            className="section-title mb-0 text-gray-400 hover:text-green-600 transition-colors"
          >
            Lịch ăn uống
          </button>
          <span className="section-title mb-0 text-gray-400">/</span>
          <h3 className="section-title mb-0 text-gray-800">Gợi ý thông minh</h3>
        </nav>
      )}

      {activeSection === 'calendar' && (
        <div className="no-print mb-8">
          <PageHeader
            title="Lịch ăn uống"
            subtitle="Lên kế hoạch các bữa ăn trong tuần và tự động tạo danh sách đi chợ."
            icon={ChefHat}
          >
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              {/* Week selector */}
              <div className="inline-flex items-center rounded-2xl bg-white/65 backdrop-blur ring-1 ring-white/60 p-1 shadow-sm h-[38px] w-fit">
                <button
                  onClick={prevWeek}
                  disabled={isPrevDisabled()}
                  className={`p-2 rounded-xl transition-all ${
                    isPrevDisabled()
                      ? 'text-gray-300 cursor-not-allowed opacity-50'
                      : 'text-gray-700 hover:bg-white hover:text-black'
                  }`}
                >
                  <ArrowLeft size={14} />
                </button>
                <div className="px-3 text-sm font-black text-gray-900 whitespace-nowrap">
                  Tuần: {days[0].formatted} - {days[6].formatted}
                </div>
                <button
                  onClick={nextWeek}
                  className="p-2 rounded-xl text-gray-700 hover:bg-white hover:text-black transition-all"
                >
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Autofill & Smart suggestion actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/70 ring-1 ring-white/60 px-4 py-2 text-xs sm:text-sm font-extrabold text-gray-800 shadow-sm transition-all hover:bg-white h-[38px]"
                  onClick={() => setActiveSection('suggestions')}
                >
                  <Lightbulb className="h-4 w-4 text-amber-500 animate-pulse" />
                  Gợi ý thông minh
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#1f3b00] px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all hover:bg-black h-[38px]"
                  onClick={handleAutoFill}
                >
                  <Sparkles className="h-4 w-4 text-[#B5E361]" />
                  Tự động điền
                </button>
              </div>
            </div>
          </PageHeader>
        </div>
      )}

      {/* Switcher Toggle as Tabs */}
      {activeSection === 'calendar' && (
        <div className="w-full px-2 sm:px-6 no-print">
          <div className="community-tabs">
            {/* Tab: Lịch tuần */}
            <button 
              type="button"
              onClick={() => setActiveTab('weekly-planner')}
              className={`tab-btn ${activeTab === 'weekly-planner' ? 'active' : ''}`}
            >
              <CalendarDays className="h-4 w-4" />
              Lịch tuần
            </button>
            {/* Tab: Nguyên liệu */}
            <button 
              type="button"
              onClick={() => setActiveTab('shopping-list')}
              className={`tab-btn ${activeTab === 'shopping-list' ? 'active' : ''}`}
            >
              <ShoppingCart className="h-4 w-4" />
              Nguyên liệu
              {ingredientsList.length > 0 && (
                <span className="tab-btn-badge">
                  {ingredientsList.filter(ing => !checkedIngredients.includes(ing.name)).length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full px-2 sm:px-6 flex-1 min-h-0">
        {activeSection === 'calendar' && (
          <div className="bg-white rounded-[28px] border border-gray-100/80 shadow-sm p-4 sm:p-6 h-full flex flex-col min-h-0">
            {activeTab === 'weekly-planner' && (
              <div className="overflow-auto flex-1 custom-scrollbar w-full rounded-2xl">
                <div className="flex gap-4 min-w-max p-2 min-h-full">
                {weeklyPlan.map(planDay => {
                  const dateObj = days.find(dayInfo => dayInfo.name === planDay.day);
                  const dateStr = dateObj ? dateObj.dateObj.toISOString().split('T')[0] : '';
                  const dailyTotal = calculateDailyTotal(planDay.meals);
                  
                  const isOverCalories = dailyTotal > targetCalories;
                  const calorieBgClasses = isOverCalories
                    ? "from-red-400 to-red-600 text-white shadow-red-500/30"
                    : "from-[#B5E361] to-[#8CB33D] text-[#1f3b00] shadow-sm";

                  return (
                    <div key={planDay.day} className="bg-[#FCFEF8] rounded-3xl border-2 border-[#B5E361]/30 shadow-sm flex flex-col w-[220px] shrink-0 hover:border-[#B5E361] hover:shadow-md transition-all duration-300 relative">
                      {/* Sticky Day Header Wrapper */}
                      <div className="sticky top-0 z-20 bg-[#FCFEF8] pt-3.5 px-3.5 pb-2 rounded-t-[22px]">
                        <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-gradient-to-b from-[#1f3b00] to-[#162a00] rounded-[14px] py-2 px-2 shadow-inner">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-white text-sm uppercase tracking-wide">{getDayTranslation(planDay.day)}</span>
                            {dateObj && <span className="text-[13px] text-[#B5E361] font-extrabold">{dateObj.formatted}</span>}
                          </div>
                          {/* Calorie summary */}
                          <div className={`text-[10px] font-black bg-gradient-to-r px-2.5 py-0.5 rounded-full ${calorieBgClasses}`}>
                            {dailyTotal} kcal
                          </div>
                        </div>
                      </div>

                      {/* Meal Slots Stack */}
                      <div className="flex flex-col gap-3.5 px-3.5 pb-3.5">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                          const recipeList = planDay.meals[mealType] || [];
                          const hasMeals = recipeList.length > 0;
                          return (
                            <div key={mealType} className="flex flex-col gap-2">
                              {/* Small label for slot */}
                              <span className="text-[11px] text-gray-400 font-black uppercase tracking-wider pl-1">{getMealTypeLabel(mealType)}</span>
                              
                              {/* List of planned dishes inside this slot */}
                              {hasMeals && (
                                <div className="flex flex-col gap-2">
                                  {recipeList.map(recipe => (
                                    <div 
                                      key={recipe.mealPlanId} 
                                      className="group bg-gradient-to-br from-[#F4FBE7] to-[#EAF7D5] border border-[#B5E361]/35 hover:border-[#B5E361]/60 rounded-2xl p-4 flex flex-col justify-between min-h-[85px] relative hover:shadow-sm transition-all duration-300 animate-in zoom-in-95 duration-200 cursor-pointer"
                                      onClick={() => handleRecipeClick(recipe, planDay.day, mealType, dateStr)}
                                    >
                                      <div>
                                        <div className="font-extrabold text-[#1f3b00] text-sm leading-snug pr-5" title={recipe.name}>
                                          {recipe.name}
                                        </div>
                                        <div className="text-[11px] font-black text-green-700 mt-2 flex items-center gap-1">
                                          <Flame size={12} />
                                          {recipe.calories} kcal
                                        </div>
                                      </div>
                                      
                                      {/* Trash button to clear meal */}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleClearMealAt(planDay.day, mealType, recipe.mealPlanId, dateStr);
                                        }}
                                        className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-white/40 p-0.5 transition-all text-xs"
                                        title="Xóa món ăn"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add button for the slot */}
                              {hasMeals ? (
                                // Smaller compact add button since there are already dishes
                                <button
                                  onClick={() => setAddMealConfig({ day: planDay.day, mealType, mealDate: dateStr })}
                                  className="border border-dashed border-[#B5E361]/50 hover:border-[#B5E361] hover:bg-[#F4FBE7]/40 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-gray-400 hover:text-green-700 transition-all duration-300"
                                >
                                  <span className="text-sm font-black">+</span>
                                  <span className="text-[11px] font-black uppercase tracking-wider">Thêm món</span>
                                </button>
                              ) : (
                                // Normal empty slot (Mockup 1 style)
                                <button
                                  onClick={() => setAddMealConfig({ day: planDay.day, mealType, mealDate: dateStr })}
                                  className="border-2 border-dashed border-gray-200 hover:border-[#B5E361] hover:bg-[#F4FBE7]/40 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[100px] text-gray-400 hover:text-green-700 transition-all duration-300 group"
                                >
                                  <span className="text-base font-black group-hover:scale-125 transition-transform">+</span>
                                  <span className="text-[11px] font-black mt-1.5 uppercase tracking-wider">{getMealTypeLabel(mealType)}</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {activeTab === 'shopping-list' && (
              <div className="max-w-xl mx-auto w-full animate-in fade-in-50 duration-500 overflow-y-auto h-full pr-2 custom-scrollbar pb-10">
                {ingredientsList.length > 0 ? (
                  <div>
                    {/* Print-only Header */}
                    <div className="hidden print:block mb-6 border-b-2 border-gray-900 pb-4">
                      <h1 className="text-2xl font-black text-gray-900">NUTRIGO</h1>
                      <h2 className="text-base font-bold text-gray-800 mt-1">Danh Sách Nguyên Liệu Mua Sắm Hàng Tuần</h2>
                      <p className="text-xs text-gray-500 font-bold mt-1">
                        Tuần: {days[0].formatted} - {days[6].formatted}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6 print:hidden">
                      <div>
                        <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                          🛒 Nguyên liệu tuần này
                        </h4>
                        <p className="text-xs text-gray-400 font-bold mt-0.5">Tự động tổng hợp từ kế hoạch ăn uống.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const remaining = ingredientsList.filter(ing => !checkedIngredients.includes(ing.name));
                            if (remaining.length === 0) {
                              alert("Tất cả nguyên liệu đã được chọn mua!");
                              return;
                            }
                            const text = remaining.map(ing => `- ${ing.name} ${ing.count > 1 ? `(x${ing.count})` : ''}`).join('\n');
                            navigator.clipboard.writeText(text);
                            alert("Đã sao chép danh sách nguyên liệu chưa mua vào bộ nhớ tạm! 📋");
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-[#1f3b00] font-extrabold rounded-2xl text-[10px] hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Copy size={12} />
                          Sao chép
                        </button>
                        <button 
                          onClick={handleExportTXT}
                          className="px-4 py-2 bg-gray-900 text-white font-extrabold rounded-2xl text-[10px] hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Download size={12} />
                          Export
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {ingredientsList.map((ing, index) => (
                        <label key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl cursor-pointer border border-transparent hover:border-gray-100 transition-all duration-300">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 text-green-600 rounded border-gray-350 focus:ring-[#B5E361]" 
                            checked={checkedIngredients.includes(ing.name)}
                            onChange={() => toggleIngredientChecked(ing.name)}
                          />
                          <span className={`flex-1 text-gray-800 font-bold text-base transition-all ${
                            checkedIngredients.includes(ing.name) 
                              ? 'line-through text-gray-400 opacity-60' 
                              : ''
                          }`}>
                            {ing.name}
                          </span>
                          <span className="text-xs font-extrabold bg-green-50 text-green-700 px-3.5 py-1.5 rounded-full border border-green-100">
                            {ing.count > 1 ? `x${ing.count}` : 'x1'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Spacious Wide Empty Card matching Mockup 2
                  <div className="flex flex-col items-center justify-center text-center w-full min-h-[320px] py-12">
                    {/* Large Clean Shopping Cart Icon (in Green theme) */}
                    <div className="w-16 h-16 rounded-full bg-[#F4FBE7] flex items-center justify-center text-green-750 mb-5 border border-[#B5E361]/30">
                      <ShoppingCart size={28} className="text-green-700" />
                    </div>
                    
                    <h4 className="font-extrabold text-gray-800 text-base mb-1">Chưa có bữa ăn nào được lên lịch</h4>
                    <p className="text-xs text-gray-400 font-semibold max-w-sm leading-relaxed mb-6">
                      Thêm món ăn vào lịch tuần của bạn để tự động tạo danh sách đi chợ.
                    </p>
                    
                    <button 
                      onClick={() => setActiveTab('weekly-planner')}
                      className="px-6 py-3 bg-[#1f3b00] hover:bg-black text-white rounded-2xl font-black text-xs active:scale-95 transition-all shadow-sm"
                    >
                      Lập lịch ngay
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === 'suggestions' && (
          <div className="w-full h-full flex flex-col min-h-0">
            <div className="no-print mb-8 shrink-0">
              <PageHeader
                title="Gợi ý thông minh"
                subtitle="Cho biết trong tủ lạnh của bạn có gì — chúng tôi sẽ tìm các món ăn phù hợp."
                icon={Lightbulb}
                actions={
                  <button
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1f3b00] px-4 py-2 text-xs font-black text-white shadow-sm transition-colors hover:bg-black"
                    onClick={() => setActiveSection('calendar')}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Quay lại Lịch ăn
                  </button>
                }
              />
            </div>

            <div className="suggestions-section animate-in fade-in-50 duration-500 overflow-y-auto flex-1 custom-scrollbar pb-10 pr-2">
              <div className="ingredients-panel bg-white rounded-[24px] border border-gray-100/85 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 h-fit mb-6 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-800 text-base m-0 flex items-center gap-2">
                    <span className="text-xl relative -top-[1.5px] select-none">❄️</span>
                    <span>Tủ lạnh của bạn</span>
                  </h3>
                </div>
                
                <form onSubmit={handleAddIngredient} className="flex gap-2 mb-5">
                  <input 
                    type="text" 
                    value={ingredientInput} 
                    onChange={(e) => setIngredientInput(e.target.value)} 
                    placeholder="Thêm nguyên liệu (VD: Cá hồi)"
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none text-sm font-semibold placeholder:text-gray-400 focus:bg-white focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15 transition-all"
                  />
                  <button 
                    type="submit" 
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B5E361] to-[#8CB33D] text-[#1f3b00] shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 font-bold" />
                  </button>
                </form>

                {userIngredients.length > 0 ? (
                  <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                    {userIngredients.map((ing, idx) => (
                      <li 
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#F4FBE7] border border-[#B5E361]/40 px-3.5 py-1.5 rounded-2xl text-xs font-black text-[#1f3b00] hover:border-[#B5E361] hover:bg-[#EAF7D5] transition-all duration-200 animate-in zoom-in-95 duration-200"
                      >
                        {ing} 
                        <button 
                          onClick={() => removeIngredient(ing)}
                          className="h-4 w-4 rounded-full flex items-center justify-center text-[#ef4444] hover:bg-red-50 hover:text-red-700 transition-colors ml-1 text-[10px]"
                          title="Xóa nguyên liệu"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs font-semibold">
                    Tủ lạnh đang trống. Hãy thêm nguyên liệu!
                  </div>
                )}
              </div>

              <div className="suggestions-panel bg-white rounded-[24px] border border-gray-100/85 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                <div className="mb-6">
                  <h3 className="font-extrabold text-gray-800 text-base m-0 flex items-center gap-2">
                    <span className="text-xl relative -top-[2px] select-none">💡</span>
                    <span>Món ăn gợi ý ({suggestions.length})</span>
                  </h3>
                </div>

                {suggestions.length > 0 ? (
                  <div className="suggestions-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map(s => (
                      <div key={s.id} className="suggestion-card bg-[#FBFDF8] border border-[#B5E361]/35 hover:border-[#B5E361] rounded-[22px] p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between hover:scale-[1.01]">
                        {/* Card Content */}
                        <div>
                          <div className="flex justify-between items-start gap-3 mb-2.5">
                            <h4 className="font-extrabold text-[#183000] text-base leading-snug truncate" title={s.name}>
                              {s.name}
                            </h4>
                            <span className={`shrink-0 rounded-xl px-2.5 py-1 text-[10px] font-black tracking-wide ${
                              s.missingCount === 0 
                                ? 'bg-[#EAF7D5] border border-[#B5E361]/50 text-[#2d5200]' 
                                : 'bg-[#FFF9E6] border border-[#F59E0B]/30 text-[#B45309]'
                            }`}>
                              {s.matchPercentage}% {s.missingCount === 0 ? 'Khớp 100%' : `Thiếu ${s.missingCount}`}
                            </span>
                          </div>

                          {/* Calories and prep time */}
                          <div className="flex gap-2.5 mb-4">
                            <span className="inline-flex items-center gap-1 font-extrabold text-[10px] text-orange-600 bg-orange-50/50 px-2.5 py-1 rounded-lg border border-orange-100/20">
                              🔥 {s.calories} kcal
                            </span>
                            <span className="inline-flex items-center gap-1 font-extrabold text-[10px] text-[#3d6600] bg-[#F4FBE7] px-2.5 py-1 rounded-lg border border-[#B5E361]/20">
                              ⏱ {s.prepTime}
                            </span>
                          </div>

                          {/* Ingredients tags list */}
                          <div className="mb-5">
                            <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2">Nguyên liệu</span>
                            <div className="flex flex-wrap gap-1.5">
                              {s.ingredients.map(ing => {
                                const hasIt = userIngredients.some(ui => ui.toLowerCase() === ing.toLowerCase());
                                return (
                                  <span 
                                    key={ing} 
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                      hasIt 
                                        ? 'bg-[#F4FBE7] border-[#B5E361]/40 text-[#1f3b00]' 
                                        : 'bg-red-50/50 border-red-100/70 text-red-700'
                                    }`}
                                  >
                                    {ing}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Actions wrapper */}
                        <div className="pt-4 border-t border-dashed border-[#B5E361]/25 flex flex-col gap-3">
                          <div className="flex gap-2 w-full">
                            <select id={`day-${s.id}`} className="flex-1 bg-white border border-gray-200/80 rounded-xl px-2.5 py-2 text-[11px] font-black text-[#1f3b00] cursor-pointer hover:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15 outline-none transition-all">
                              {weeklyPlan.map(d => <option key={d.day} value={d.date}>{getDayTranslation(d.day)} ({d.date.substring(5,10)})</option>)}
                            </select>
                            <select id={`meal-${s.id}`} className="flex-1 bg-white border border-gray-200/80 rounded-xl px-2.5 py-2 text-[11px] font-black text-[#1f3b00] cursor-pointer hover:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15 outline-none transition-all">
                              <option value="breakfast">Bữa sáng</option>
                              <option value="lunch">Bữa trưa</option>
                              <option value="dinner">Bữa tối</option>
                              <option value="snack">Bữa phụ</option>
                            </select>
                          </div>
                          
                          <button 
                            className="w-full bg-[#1f3b00] hover:bg-black text-white hover:scale-[1.01] active:scale-[0.99] font-black text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                            onClick={() => {
                              const date = document.getElementById(`day-${s.id}`).value;
                              const meal = document.getElementById(`meal-${s.id}`).value;
                              addToPlan(s, date, meal);
                            }}
                          >
                            + Thêm vào Lịch ăn
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <span className="text-3xl mb-3">🍳</span>
                    <h4 className="font-extrabold text-gray-800 text-sm mb-1">Chưa có món ăn gợi ý</h4>
                    <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed">
                      Hãy thêm các nguyên liệu trong tủ lạnh của bạn để chúng tôi gợi ý các món ăn phù hợp!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {addMealConfig && (
        <AddMealModal
          day={addMealConfig.day}
          mealType={addMealConfig.mealType}
          mealDate={addMealConfig.mealDate}
          onClose={() => setAddMealConfig(null)}
          onConfirm={() => {
            fetchWeeklyPlan();
            setAddMealConfig(null);
          }}
        />
      )}

      {selectedRecipeDetail && (
        <MealDetailModal 
          meal={selectedRecipeDetail} 
          onClose={() => setSelectedRecipeDetail(null)} 
          onDelete={() => {
            handleClearMealAt(
              selectedRecipeDetail.day, 
              selectedRecipeDetail.mealType, 
              selectedRecipeDetail.mealPlanId, 
              selectedRecipeDetail.mealDate
            );
            setSelectedRecipeDetail(null);
          }}
          onSaveSuccess={() => {
            fetchWeeklyPlan();
            setSelectedRecipeDetail(null);
          }}
        />
      )}
    </div>
  );
}

export default MealPlan;
