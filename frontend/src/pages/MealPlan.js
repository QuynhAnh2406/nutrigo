import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, ChefHat, Flame, Trash2, Plus, Sparkles, Check, Pencil, ArrowLeft, Coffee, Utensils, Cookie, UtensilsCrossed } from 'lucide-react';
import MonthlyCalendar from '../components/MonthlyCalendar';
import AddMealModal from '../components/AddMealModal';
import MealDetailModal from '../components/MealDetailModal';
import PageHeader from '../components/PageHeader';

// Helper to get week start date (Monday)
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

function MealPlan() {
  const navigate = useNavigate();
  const { healthData } = useOutletContext();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.prefilledRecipe) {
      const recipe = location.state.prefilledRecipe;
      // Clear navigation state so it doesn't open the modal again on refresh
      window.history.replaceState({}, document.title);
      
      // Determine the default mealDate and day
      const today = new Date();
      const dayNamesArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNamesArr[today.getDay()];
      
      const localDate = new Date();
      localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
      const mealDateStr = localDate.toISOString().split('T')[0];
      
      const mealType = recipe.mealType || 'breakfast';

      const initialRecipeData = {
        name: recipe.title,
        description: recipe.description,
        prep_time: recipe.cookingTime,
        image_url: recipe.image_url || '',
        ingredients: recipe.ingredients.map(ing => ({
          name: ing.name || ing,
          weight_g: ing.weight || ing.weight_g || 100,
          calories_per_100g: 0,
          protein_per_100g: 0,
          carbs_per_100g: 0,
          fat_per_100g: 0
        })),
        instructions: recipe.steps || []
      };

      setAddMealConfig({
        day: dayName,
        mealType: mealType,
        mealDate: mealDateStr,
        editRecipe: initialRecipeData
      });
    }
  }, [location.state]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [daysWithMeals, setDaysWithMeals] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [addMealConfig, setAddMealConfig] = useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [clearMode, setClearMode] = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Resizable panel logic
  const [leftWidth, setLeftWidth] = useState(40); // Percentage
  const isDragging = useRef(false);

  const handleRecipeClick = async (recipe, day, mealType, mealDate) => {
    try {
      const res = await fetch(`http://localhost:5002/api/recipes/${recipe.recipeId || recipe.id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRecipeDetail({
          ...data.data,
          mealPlanId: recipe.mealPlanId,
          day,
          mealType,
          mealDate
        });
      } else {
        alert("Không thể tải chi tiết món ăn (Server Error): " + (data.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Failed to fetch recipe detail", e);
      alert("Lỗi kết nối hoặc lỗi bất ngờ: " + e.message);
    }
  };

  const fetchSelectedPlanData = useCallback(async () => {
    try {
      const weekStart = getWeekStart(selectedDate);
      const year = weekStart.getFullYear();
      const month = String(weekStart.getMonth() + 1).padStart(2, '0');
      const date = String(weekStart.getDate()).padStart(2, '0');
      const weekStartStr = `${year}-${month}-${date}`;
      const res = await fetch(`http://localhost:5002/api/mealplan?weekStart=${weekStartStr}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (data.success) {
        const dayNamesArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDayName = dayNamesArr[selectedDate.getDay()];
        const dayData = data.data.find(d => d.day === selectedDayName);
        setSelectedPlanData(dayData || null);
      }
    } catch (e) {
      console.error("Failed to fetch selected plan", e);
    }
  }, [selectedDate]);

  const fetchMonthlyMeals = useCallback(async () => {
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const startYear = startOfMonth.getFullYear();
      const startM = String(startOfMonth.getMonth() + 1).padStart(2, '0');
      const startD = String(startOfMonth.getDate()).padStart(2, '0');

      const endYear = endOfMonth.getFullYear();
      const endM = String(endOfMonth.getMonth() + 1).padStart(2, '0');
      const endD = String(endOfMonth.getDate()).padStart(2, '0');

      const res = await fetch(`http://localhost:5002/api/mealplan/monthly?start=${startYear}-${startM}-${startD}&end=${endYear}-${endM}-${endD}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (data.success) {
        setDaysWithMeals(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch monthly meals", e);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchSelectedPlanData();
  }, [fetchSelectedPlanData]);

  useEffect(() => {
    fetchMonthlyMeals();
  }, [fetchMonthlyMeals]);

  useEffect(() => {
    setActiveSession(null);
  }, [selectedDate]);

  const handleClearClick = () => {
    if (activeSession) {
      setClearMode({ type: 'session', session: activeSession });
    } else {
      setClearMode({ type: 'day' });
    }
  };

  const confirmClear = async () => {
    if (!clearMode) return;
    try {
      const d = new Date(selectedDate);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const mealDateStr = d.toISOString().split('T')[0];

      if (clearMode.type === 'day') {
        const res = await fetch('http://localhost:5002/api/mealplan/clear-day', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({ mealDate: mealDateStr })
        });
        const data = await res.json();
        if (data.success) {
          fetchSelectedPlanData();
          fetchMonthlyMeals();
          
          const dateString = selectedDate.toLocaleDateString('vi-VN');
          setToastMessage({
            type: 'delete',
            target: `Toàn bộ món ăn ngày ${dateString}`
          });
          setTimeout(() => setToastMessage(null), 5000);
          
          setClearMode(null);
        } else {
          alert("Xóa thất bại!");
        }
      } else if (clearMode.type === 'session') {
        const res = await fetch('http://localhost:5002/api/mealplan/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({
            mealDate: mealDateStr,
            mealType: clearMode.session,
            action: 'delete_session'
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchSelectedPlanData();
          fetchMonthlyMeals();
          
          const dateString = selectedDate.toLocaleDateString('vi-VN');
          setToastMessage({
            type: 'delete',
            target: `Các món ${mealTypeLabels[clearMode.session]} ngày ${dateString}`
          });
          setTimeout(() => setToastMessage(null), 5000);
          
          setClearMode(null);
        } else {
          alert("Xóa thất bại!");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi xóa.");
    }
  };



  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;
    try {
      const res = await fetch('http://localhost:5002/api/mealplan/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          day: mealToDelete.day,
          mealType: mealToDelete.mealType,
          mealPlanId: mealToDelete.mealPlanId,
          action: 'delete'
        })
      });
      if (res.ok) {
        fetchSelectedPlanData();
        fetchMonthlyMeals();
        
        setToastMessage({
          type: 'delete',
          target: `Món ${mealToDelete.name || ''}`
        });
        setTimeout(() => setToastMessage(null), 5000);
        
        setMealToDelete(null);
        setSelectedRecipeDetail(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resizable Logic
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const container = document.getElementById('meal-plan-container');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Clamp between 25% and 55%
    if (newLeftWidth >= 25 && newLeftWidth <= 55) {
      setLeftWidth(newLeftWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const mealTypeLabels = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ'
  };

  const calculateTotalMacros = () => {
    if (!selectedPlanData || !selectedPlanData.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(type => {
      if (selectedPlanData.meals[type]) {
        selectedPlanData.meals[type].forEach(r => {
          totals.calories += (Number(r.calories) || 0);
          totals.protein += (Number(r.protein) || 0);
          totals.carbs += (Number(r.carbs) || 0);
          totals.fat += (Number(r.fat) || 0);
        });
      }
    });
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat)
    };
  };

  return (
    <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-full flex flex-col overflow-y-auto">

      {/* Header */}
      <PageHeader
        title="Lịch ăn uống"
        subtitle="Lên kế hoạch các bữa ăn trong tuần và tự động tạo danh sách đi chợ."
        icon={CalendarDays}
      />

      {/* Main Content with Resizable Splitter */}
      <div id="meal-plan-container" className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative rounded-[28px] bg-white border border-gray-100/80 shadow-sm">

        {/* Left Side: Calendar */}
        <div style={{ width: `calc(${leftWidth}%)` }} className="hidden lg:flex shrink-0 h-full relative z-20">
          <MonthlyCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            daysWithMeals={daysWithMeals}
          />
        </div>

        {/* Resizable Divider */}
        <div
          className="hidden lg:flex w-2 bg-gray-50 hover:bg-[#B5E361]/50 cursor-col-resize flex-col items-center justify-center group transition-colors relative z-10 border-x border-gray-100/50"
          onMouseDown={handleMouseDown}
        >
          <div className="w-1 h-8 bg-gray-300 group-hover:bg-[#8CB33D] rounded-full transition-colors"></div>
        </div>

        {/* Right Side: Detail */}
        <div style={{ width: `calc(${100 - leftWidth}%)` }} className="flex-1 h-full p-4 sm:p-6 flex flex-col min-h-0">
          <div className="border-b border-gray-100 pb-4 mb-4 shrink-0 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-extrabold text-[#1f3b00] flex items-center gap-3">
                {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <span className="text-xs font-black bg-[#B5E361] text-[#1f3b00] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    Hôm nay
                  </span>
                )}
              </h3>
              <p className="text-sm font-semibold text-green-700 mt-1">Chi tiết lịch ăn uống</p>
            </div>
            <button
              onClick={handleClearClick}
              className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
              title={activeSession ? "Xóa tất cả món ăn trong bữa này" : "Xóa tất cả món ăn trong ngày"}
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="overflow-auto flex-1 custom-scrollbar pr-2 space-y-3">
            {activeSession === null ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['breakfast', 'lunch', 'snack', 'dinner'].map(mealType => {
                    const recipes = selectedPlanData?.meals ? selectedPlanData.meals[mealType] : [];
                    const sessionCalories = recipes.reduce((sum, r) => sum + (r.calories || 0), 0);

                    const getMealIcon = (type) => {
                      switch (type) {
                        case 'breakfast': return <Coffee size={24} style={{ color: '#111827' }} />;
                        case 'lunch': return <Utensils size={24} style={{ color: '#111827' }} />;
                        case 'snack': return <Cookie size={24} style={{ color: '#111827' }} />;
                        case 'dinner': return <UtensilsCrossed size={24} style={{ color: '#111827' }} />;
                        default: return <ChefHat size={24} style={{ color: '#111827' }} />;
                      }
                    };

                    return (
                      <div
                        key={mealType}
                        onClick={() => setActiveSession(mealType)}
                        className="bg-gradient-to-b from-white to-[#fcfefa] border border-[#e8f3d6] rounded-[24px] p-5 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#B5E361]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group gap-3 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#B5E361]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="w-12 h-12 bg-[#B5E361] shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300 z-10" style={{ borderRadius: '9999px', borderTopLeftRadius: '2px' }}>
                          {getMealIcon(mealType)}
                        </div>
                        <div className="z-10 mt-1">
                          <h4 className="font-extrabold text-[#2a4500] uppercase text-[13px] tracking-widest mb-3 group-hover:text-[#4a7a00] transition-colors">
                            {mealTypeLabels[mealType]}
                          </h4>
                          <div className="flex flex-col gap-2 items-center">
                            <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] px-3 py-1 rounded-full">
                              {recipes.length} món
                            </span>
                            <span className="text-xs font-black text-[#1f3b00] bg-gradient-to-r from-[#EAF7D5] to-[#d8efaa] border border-[#B5E361]/30 shadow-sm px-3 py-1 rounded-full">
                              {sessionCalories} kcal
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const macros = calculateTotalMacros();
                  return (
                    <div className="mt-8 bg-gradient-to-br from-[#fcfefa] to-[#f4fce8] border border-[#e8f3d6] rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#B5E361]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-[#8CB33D]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

                      <h4 className="font-black text-[#2a4500] uppercase text-[15px] tracking-widest mb-6 flex items-center gap-2.5 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B5E361] to-[#8CB33D] flex items-center justify-center shadow-md">
                          <Sparkles size={16} className="text-white" />
                        </div>
                        Tổng Dinh Dưỡng Trong Ngày
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 relative z-10">
                        <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[24px] p-5 flex flex-col items-center justify-center text-center hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                          <span className="text-[#8CB33D] text-[10px] font-black uppercase tracking-widest mb-1.5">Calories</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#2a4500]">{macros.calories}</span>
                            <span className="text-sm font-bold text-gray-400">kcal</span>
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[24px] p-5 flex flex-col items-center justify-center text-center hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                          <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1.5">Protein</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-blue-700">{macros.protein}</span>
                            <span className="text-sm font-bold text-gray-400">g</span>
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[24px] p-5 flex flex-col items-center justify-center text-center hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                          <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-1.5">Carbs</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-orange-600">{macros.carbs}</span>
                            <span className="text-sm font-bold text-gray-400">g</span>
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[24px] p-5 flex flex-col items-center justify-center text-center hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                          <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1.5">Fat</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-red-600">{macros.fat}</span>
                            <span className="text-sm font-bold text-gray-400">g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="bg-[#fcfdfa] border border-[#f0f5e6] rounded-[20px] p-3 sm:p-4 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSession(null)}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
                      title="Quay lại"
                    >
                      <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <h4 className="font-extrabold text-[#3d6600] uppercase text-sm tracking-wider">
                      {mealTypeLabels[activeSession]}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      if (!healthData.weight || !healthData.height || !healthData.dateOfBirth) {
                        alert("Vui lòng hoàn thiện hồ sơ cá nhân (ngày sinh, chiều cao, cân nặng,...) trước khi lập lịch ăn uống!");
                        navigate('/profile?tab=Edit');
                        return;
                      }
                      const d = new Date(selectedDate);
                      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                      setAddMealConfig({ day: selectedPlanData?.day, mealType: activeSession, mealDate: d.toISOString().split('T')[0] });
                    }}
                    className="px-3 py-1.5 bg-[#B5E361]/20 hover:bg-[#B5E361]/40 text-[#5c8a14] rounded-xl transition-colors font-bold text-xs flex items-center gap-1.5"
                  >
                    <Plus size={16} strokeWidth={2.5} /> Thêm món
                  </button>
                </div>

                {(() => {
                  const recipes = selectedPlanData?.meals ? selectedPlanData.meals[activeSession] : [];
                  if (recipes && recipes.length > 0) {
                    return (
                      <div className="flex flex-col gap-3 mt-2">
                        {recipes.map((recipe, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleRecipeClick(recipe, selectedPlanData?.day, activeSession, selectedDate)}
                            className="flex flex-row bg-gradient-to-r from-white to-[#f8fdf2] border border-[#d5ecaf] p-3 rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-[#a3d14f] hover:shadow-[0_8px_30px_rgb(181,227,97,0.2)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                          >
                            <div className="relative w-32 h-24 sm:w-40 sm:h-28 rounded-[16px] overflow-hidden shadow-sm shrink-0 mr-4">
                              {recipe.image_url ? (
                                <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#EAF7D5] to-[#e4f6cb] flex items-center justify-center">
                                  <ChefHat size={32} className="text-[#8CB33D] group-hover:scale-110 transition-transform duration-300" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-w-0 pr-1 py-0.5">
                              <h5 className="font-extrabold text-lg text-gray-900 line-clamp-2 group-hover:text-[#659A1D] transition-colors tracking-tight leading-snug pr-12">
                                {recipe.title}
                              </h5>

                              <div className="flex items-end justify-between mt-3">
                                {/* Left Side: Macros */}
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Protein</span>
                                    <span className="text-xs sm:text-sm font-extrabold text-gray-700">{recipe.protein || 0}g</span>
                                  </div>
                                  <div className="w-px h-6 bg-gray-200"></div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Carbs</span>
                                    <span className="text-xs sm:text-sm font-extrabold text-gray-700">{recipe.carbs || 0}g</span>
                                  </div>
                                  <div className="w-px h-6 bg-gray-200"></div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Fat</span>
                                    <span className="text-xs sm:text-sm font-extrabold text-gray-700">{recipe.fat || 0}g</span>
                                  </div>
                                </div>

                                {/* Right Side: Calories */}
                                <div className="shrink-0 pl-2 sm:pl-3">
                                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#f8fdf2] to-[#EAF7D5] border border-[#B5E361]/30 rounded-xl px-3 py-2 shadow-sm group-hover:shadow group-hover:border-[#B5E361]/60 hover:scale-105 transition-all">
                                    <Flame size={14} className="text-[#8CB33D]" />
                                    <div className="flex items-baseline gap-1">
                                      <span className="font-black text-lg sm:text-xl text-[#3d6600] leading-none tracking-tight">{recipe.calories || 0}</span>
                                      <span className="text-[10px] sm:text-[11px] font-extrabold text-[#659A1D] uppercase tracking-wider opacity-90">Kcal</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const d = new Date(selectedDate);
                                  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                                  setAddMealConfig({
                                    day: selectedPlanData?.day || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
                                    mealType: activeSession,
                                    mealDate: d.toISOString().split('T')[0],
                                    editRecipe: recipe,
                                    replaceMealId: recipe.id || recipe.recipeId
                                  });
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                title="Sửa"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMealToDelete({
                                    ...recipe,
                                    mealType: activeSession,
                                    mealDate: selectedDate,
                                    foodName: recipe.title
                                  });
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return <p className="text-sm text-gray-400 italic mb-1">Chưa có món ăn nào.</p>;
                  }
                })()}
              </div>
            )}
          </div>

        </div>

      </div>

      {addMealConfig && (
        <AddMealModal
          day={addMealConfig.day}
          mealType={addMealConfig.mealType}
          mealDate={addMealConfig.mealDate}
          initialRecipe={addMealConfig.editRecipe}
          onClose={() => setAddMealConfig(null)}
          onConfirm={async (addedMealInfo) => {
            if (addMealConfig.replaceMealId) {
              try {
                await fetch('http://localhost:5002/api/mealplan/clear-meal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
                  body: JSON.stringify({
                    action: 'delete_meal',
                    recipeId: addMealConfig.replaceMealId,
                    mealDate: addMealConfig.mealDate,
                    dayName: addMealConfig.day
                  })
                });
              } catch (e) { console.error(e); }
            }
            fetchSelectedPlanData();
            fetchMonthlyMeals();
            setAddMealConfig(null);

            if (addedMealInfo) {
              const d = new Date(addedMealInfo.mealDate);
              const dateString = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
              const mealTypeLabel = mealTypeLabels[addedMealInfo.mealType] || addedMealInfo.mealType;

              setToastMessage({
                name: addedMealInfo.name,
                mealTypeLabel,
                dateString
              });

              setTimeout(() => {
                setToastMessage(null);
              }, 5000);
            }
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[150] bg-white border border-[#B5E361]/50 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
          {toastMessage.type === 'delete' ? (
            <>
              <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <Trash2 size={16} className="text-red-500" strokeWidth={2.5} />
              </div>
              <p className="text-sm font-semibold text-gray-600 pr-2">
                Đã xóa <span className="text-[#1f3b00] font-black">{toastMessage.target}</span> thành công!
              </p>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-[#EAF7D5] rounded-full flex items-center justify-center shrink-0">
                <Check size={16} className="text-[#3d6600]" strokeWidth={3} />
              </div>
              <p className="text-sm font-semibold text-gray-600 pr-2">
                <span className="text-[#1f3b00] font-black">{toastMessage.name}</span> đã thêm vào{' '}
                <span className="text-[#1f3b00] font-black bg-[#B5E361]/30 px-2 py-0.5 rounded-md border border-[#B5E361]/40">{toastMessage.mealTypeLabel}</span>{' '}
                ngày <span className="text-[#1f3b00] font-black bg-[#EAF7D5] px-2 py-0.5 rounded-md border border-[#B5E361]/30">{toastMessage.dateString}</span>
              </p>
            </>
          )}
        </div>
      )}

      {selectedRecipeDetail && (
        <MealDetailModal
          meal={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          onDelete={() => {
            setMealToDelete(selectedRecipeDetail);
            setSelectedRecipeDetail(null); // Close the detail modal
          }}
          onSaveSuccess={() => {
            fetchSelectedPlanData();
            fetchMonthlyMeals();
            setSelectedRecipeDetail(null);
          }}
        />
      )}

      {/* Clear Confirmation Modal */}
      {clearMode && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#1f3b00]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#B5E361]/30 p-8 w-[90%] max-w-md text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-[#EAF7D5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 className="text-[#3d6600]" size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-[#1f3b00] mb-3 uppercase tracking-wide">Xóa tất cả?</h3>
            <p className="text-gray-600 mb-8 font-medium">
              {clearMode.type === 'day' ? 'Toàn bộ món ăn đã xếp trong ngày này sẽ bị xóa.' : `Toàn bộ món ăn trong ${mealTypeLabels[clearMode.session]} sẽ bị xóa.`} Bạn có chắc chắn muốn tiếp tục không?
              <span className="font-extrabold text-[#1f3b00] text-lg mt-3 block bg-[#B5E361]/20 px-4 py-2 rounded-xl mx-auto w-fit">
                {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setClearMode(null)}
                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                Trở lại
              </button>
              <button
                onClick={confirmClear}
                className="flex-1 px-6 py-3.5 rounded-2xl font-black text-[#1f3b00] bg-[#B5E361] hover:bg-[#a3d14f] shadow-lg shadow-[#B5E361]/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Xóa sạch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Meal Confirmation Modal */}
      {mealToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1f3b00]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#B5E361]/30 p-8 w-[90%] max-w-md text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-[#EAF7D5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 className="text-[#3d6600]" size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-[#1f3b00] mb-3 uppercase tracking-wide">Xóa món ăn?</h3>
            <p className="text-gray-600 mb-8 font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa món ăn <span className="font-extrabold text-[#3d6600]">{mealToDelete.foodName || mealToDelete.title}</span> cho bữa <span className="font-extrabold text-[#3d6600]">{mealTypeLabels[mealToDelete.mealType] || mealToDelete.mealType}</span> vào ngày <span className="font-extrabold text-[#3d6600]">{new Date(mealToDelete.mealDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span> khỏi lịch không?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setMealToDelete(null);
                }}
                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteMeal}
                className="flex-1 px-6 py-3.5 rounded-2xl font-black text-[#1f3b00] bg-[#B5E361] hover:bg-[#a3d14f] shadow-lg shadow-[#B5E361]/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Xóa món
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealPlan;
