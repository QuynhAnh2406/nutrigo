import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import AddMealModal from '../components/AddMealModal';
import { CalendarDays, Sparkles, ShoppingCart, Lightbulb, ArrowLeft, ArrowRight, Plus, Trash2, ChefHat, Flame, Copy, Check, Download } from 'lucide-react';

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
  const { user } = useOutletContext();
  const [activeSection, setActiveSection] = useState('calendar'); // 'calendar' or 'suggestions'
  const [activeTab, setActiveTab] = useState('weekly-planner'); // 'weekly-planner' or 'shopping-list'
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  
  // Suggestion State
  const [userIngredients, setUserIngredients] = useState(['Trứng', 'Thịt bò']);
  const [ingredientInput, setIngredientInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Modal control state
  const [addMealConfig, setAddMealConfig] = useState(null); // { day, mealType, mealDate }

  // Calendar Date State
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    return getWeekStart(new Date());
  });

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
      const res = await fetch(`http://localhost:5000/api/mealplan/autofill?weekStart=${weekStartStr}`, { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        setWeeklyPlan(data.data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchWeeklyPlan = useCallback(async () => {
    try {
      const weekStartStr = currentWeekStart.toISOString().split('T')[0];
      const res = await fetch(`http://localhost:5000/api/mealplan?weekStart=${weekStartStr}`);
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
      const res = await fetch('http://localhost:5000/api/mealplan/suggest', {
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
      const res = await fetch('http://localhost:5000/api/mealplan/update', {
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
    await fetch('http://localhost:5000/api/mealplan/update', {
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

  const handleExportTXT = () => {
    const startStr = days[0]?.formatted ? days[0].formatted.replace(/\//g, '-') : 'tuan-nay';
    const endStr = days[6]?.formatted ? days[6].formatted.replace(/\//g, '-') : '';
    let txtContent = `=========================================\n`;
    txtContent += `         NUTRIGO SHOPPING LIST\n`;
    txtContent += `   Tuần: ${days[0]?.formatted || ''} - ${days[6]?.formatted || ''}\n`;
    txtContent += `=========================================\n\n`;
    
    if (ingredientsList.length === 0) {
      txtContent += `Chưa có nguyên liệu nào được lên lịch.\n`;
    } else {
      ingredientsList.forEach((ing, idx) => {
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
    <div className="mealplan-page main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
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
          {/* Horizontal PageHeader Card with high contrast green gradient */}
          <div className="relative overflow-hidden rounded-[24px] border border-white/50 bg-gradient-to-br from-[#EAF5DA] via-[#DDF7B0] to-[#B5E361] p-5 shadow-[0_12px_30px_rgba(167,233,101,0.15)]">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 w-full">
              {/* Left Side: Icon + Title & Description */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/55 shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <ChefHat className="h-6 w-6 text-[#1f3b00]" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-extrabold tracking-tight text-[#183000]">Lịch ăn uống</h1>
                  <p className="mt-0.5 text-xs font-semibold text-[#2d5200]/80">
                    Lên kế hoạch các bữa ăn trong tuần và tự động tạo danh sách đi chợ.
                  </p>
                </div>
              </div>

              {/* Right Side: Week Selector & Smart Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Week selector */}
                <div className="inline-flex items-center rounded-2xl bg-white/65 backdrop-blur ring-1 ring-white/60 p-1 shadow-sm h-[34px]">
                  <button
                    onClick={prevWeek}
                    disabled={isPrevDisabled()}
                    className={`p-1.5 rounded-xl transition-all ${
                      isPrevDisabled()
                        ? 'text-gray-300 cursor-not-allowed opacity-50'
                        : 'text-gray-700 hover:bg-white hover:text-black'
                    }`}
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <div className="px-2.5 text-[11px] font-black text-gray-900 whitespace-nowrap">
                    {days[0].formatted} - {days[6].formatted}
                  </div>
                  <button
                    onClick={nextWeek}
                    className="p-1.5 rounded-xl text-gray-700 hover:bg-white hover:text-black transition-all"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Autofill & Smart suggestion actions */}
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-white/70 ring-1 ring-white/60 px-3 py-1.5 text-xs font-black text-gray-800 shadow-sm transition-all hover:bg-white h-[34px]"
                    onClick={() => setActiveSection('suggestions')}
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    Gợi ý
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1f3b00] px-3 py-1.5 text-xs font-black text-white shadow-sm transition-all hover:bg-black h-[34px]"
                    onClick={handleAutoFill}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#B5E361]" />
                    Tự động điền
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switcher Toggle as Tabs connected to the content below */}
      {activeSection === 'calendar' && (
        <div className="w-full px-2 sm:px-6 no-print -mb-[1px]">
          <div className="flex gap-1">
            {/* Tab: Lịch tuần */}
            <button 
              type="button"
              onClick={() => setActiveTab('weekly-planner')}
              className={`px-6 py-2.5 rounded-t-2xl font-black text-xs transition-all duration-300 border-t border-l border-r ${
                activeTab === 'weekly-planner' 
                  ? 'bg-white text-[#1f3b00] border-gray-100/80 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10 relative' 
                  : 'bg-gray-50/70 text-gray-400 border-transparent hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              Lịch tuần
            </button>
            {/* Tab: Nguyên liệu */}
            <button 
              type="button"
              onClick={() => setActiveTab('shopping-list')}
              className={`px-6 py-2.5 rounded-t-2xl font-black text-xs transition-all duration-300 border-t border-l border-r ${
                activeTab === 'shopping-list' 
                  ? 'bg-white text-[#1f3b00] border-gray-100/80 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10 relative' 
                  : 'bg-gray-50/70 text-gray-400 border-transparent hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              Nguyên liệu
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full px-2 sm:px-6">
        {activeSection === 'calendar' && (
          <div className="bg-white rounded-b-3xl rounded-tr-3xl border border-gray-100/80 shadow-sm p-6 min-h-[500px]">
            {activeTab === 'weekly-planner' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full animate-in fade-in-50 duration-500">
                {weeklyPlan.map(planDay => {
                  const dateObj = days.find(dayInfo => dayInfo.name === planDay.day);
                  const dateStr = dateObj ? dateObj.dateObj.toISOString().split('T')[0] : '';
                  const dailyTotal = calculateDailyTotal(planDay.meals);
                  return (
                    <div key={planDay.day} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4 min-w-[140px] hover:border-[#B5E361] hover:shadow-lg transition-all duration-300">
                      {/* Day Header */}
                      <div className="text-center pb-3 border-b border-gray-50 flex flex-col gap-1 shrink-0">
                        <span className="font-extrabold text-gray-800 text-sm">{getDayTranslation(planDay.day)}</span>
                        {dateObj && <span className="text-[10px] text-gray-400 font-bold">{dateObj.formatted}</span>}
                        {/* Calorie summary */}
                        <div className="mt-1 text-[9px] text-[#1f3b00] font-black bg-[#F4FBE7] px-2.5 py-0.5 rounded-full inline-block self-center border border-[#B5E361]/25">
                          {dailyTotal} kcal
                        </div>
                      </div>

                      {/* Meal Slots Stack */}
                      <div className="flex flex-col gap-3.5">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                          const recipeList = planDay.meals[mealType] || [];
                          const hasMeals = recipeList.length > 0;
                          return (
                            <div key={mealType} className="flex flex-col gap-1.5">
                              {/* Small label for slot */}
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider pl-1">{getMealTypeLabel(mealType)}</span>
                              
                              {/* List of planned dishes inside this slot */}
                              {hasMeals && (
                                <div className="flex flex-col gap-1.5">
                                  {recipeList.map(recipe => (
                                    <div key={recipe.mealPlanId} className="group bg-gradient-to-br from-[#F4FBE7] to-[#EAF7D5] border border-[#B5E361]/35 hover:border-[#B5E361]/60 rounded-2xl p-3 flex flex-col justify-between min-h-[75px] relative hover:shadow-sm transition-all duration-300 animate-in zoom-in-95 duration-200">
                                      <div>
                                        <div className="font-extrabold text-[#1f3b00] text-xs leading-snug pr-4 truncate" title={recipe.name}>
                                          {recipe.name}
                                        </div>
                                        <div className="text-[9px] font-black text-green-700 mt-1 flex items-center gap-0.5">
                                          <Flame size={10} />
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
                                  className="border border-dashed border-[#B5E361]/30 hover:border-[#B5E361] hover:bg-[#F4FBE7]/15 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-gray-400 hover:text-green-700 transition-all duration-300"
                                >
                                  <span className="text-xs font-black">+</span>
                                  <span className="text-[9px] font-black uppercase tracking-wider">Thêm món</span>
                                </button>
                              ) : (
                                // Normal empty slot (Mockup 1 style)
                                <button
                                  onClick={() => setAddMealConfig({ day: planDay.day, mealType, mealDate: dateStr })}
                                  className="border-2 border-dashed border-gray-200 hover:border-[#B5E361] hover:bg-[#F4FBE7]/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[90px] text-gray-400 hover:text-green-700 transition-all duration-300 group"
                                >
                                  <span className="text-sm font-black group-hover:scale-125 transition-transform">+</span>
                                  <span className="text-[9px] font-black mt-1 uppercase tracking-wider">{getMealTypeLabel(mealType)}</span>
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
            )}

            {activeTab === 'shopping-list' && (
              <div className="max-w-xl mx-auto w-full animate-in fade-in-50 duration-500">
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
                            const text = ingredientsList.map(ing => `- ${ing.name} ${ing.count > 1 ? `(x${ing.count})` : ''}`).join('\n');
                            navigator.clipboard.writeText(text);
                            alert("Đã sao chép danh sách nguyên liệu vào bộ nhớ tạm! 📋");
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
                    
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                      {ingredientsList.map((ing, index) => (
                        <label key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl cursor-pointer border border-transparent hover:border-gray-100 transition-all duration-300">
                          <input type="checkbox" className="w-5 h-5 text-green-600 rounded border-gray-350 focus:ring-[#B5E361]" />
                          <span className="flex-1 text-gray-800 font-bold text-base">{ing.name}</span>
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
          <div className="w-full">
            {/* suggestions centered header card */}
            <div className="no-print mb-8">
              <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-gradient-to-br from-[#EAF5DA] via-[#DDF7B0] to-[#B5E361] p-6 shadow-[0_18px_45px_rgba(167,233,101,0.25)] flex flex-col items-center text-center">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
                <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />

                <div className="relative flex flex-col items-center gap-4 z-10 w-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/55 shadow-sm ring-1 ring-white/60 backdrop-blur">
                    <Lightbulb className="h-6 w-6 text-[#1f3b00] animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#183000] sm:text-3xl">Gợi ý thông minh</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2d5200]/80">
                      Cho biết trong tủ lạnh của bạn có gì — chúng tôi sẽ tìm các món ăn phù hợp.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1f3b00] px-4 py-2 mt-2 text-xs font-black text-white shadow-sm transition-colors hover:bg-black"
                    onClick={() => setActiveSection('calendar')}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Quay lại Lịch ăn
                  </button>
                </div>
              </div>
            </div>

            <div className="suggestions-section animate-in fade-in-50 duration-500">
              <div className="ingredients-panel">
                <h3>Tủ lạnh của bạn</h3>
                <form onSubmit={handleAddIngredient} className="ingredient-form">
                  <input 
                    type="text" 
                    value={ingredientInput} 
                    onChange={(e) => setIngredientInput(e.target.value)} 
                    placeholder="Thêm nguyên liệu (VD: Cá hồi)"
                  />
                  <button type="submit" className="btn-primary">+</button>
                </form>
                <ul className="user-ingredients-list">
                  {userIngredients.map((ing, idx) => (
                    <li key={idx}>
                      {ing} <button onClick={() => removeIngredient(ing)}>✕</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="suggestions-panel">
                <h3>Món ăn gợi ý ({suggestions.length})</h3>
                <div className="suggestions-list">
                  {suggestions.map(s => (
                    <div key={s.id} className="suggestion-card">
                      <div className="sugg-header">
                        <h4>{s.name}</h4>
                        <span className={`match-badge ${s.missingCount === 0 ? 'perfect' : 'partial'}`}>
                          {s.matchPercentage}% ({getMatchStatusLabel(s.matchStatus)})
                        </span>
                      </div>
                      <div className="sugg-details">
                        <span>🔥 {s.calories} kcal</span>
                        <span>⏱ {s.prepTime}</span>
                      </div>
                      <div className="sugg-ingredients">
                        <strong>Nguyên liệu: </strong>
                        {s.ingredients.map(ing => {
                          const hasIt = userIngredients.some(ui => ui.toLowerCase() === ing.toLowerCase());
                          return <span key={ing} className={hasIt ? 'has-ing' : 'miss-ing'}>{ing}</span>;
                        })}
                      </div>
                      <div className="sugg-actions">
                        <select id={`day-${s.id}`} className="sugg-select">
                          {weeklyPlan.map(d => <option key={d.day} value={d.date}>{getDayTranslation(d.day)} ({d.date.substring(5,10)})</option>)}
                        </select>
                        <select id={`meal-${s.id}`} className="sugg-select">
                          <option value="breakfast">Bữa sáng</option>
                          <option value="lunch">Bữa trưa</option>
                          <option value="dinner">Bữa tối</option>
                          <option value="snack">Bữa phụ</option>
                        </select>
                        <button 
                          className="btn-primary btn-small"
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
    </div>
  );
}

export default MealPlan;
