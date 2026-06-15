import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarDays, ChefHat, Flame, Trash2, Plus, Sparkles, Lightbulb, ShoppingCart, Check, Pencil } from 'lucide-react';
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [daysWithMeals, setDaysWithMeals] = useState([]);

  const [addMealConfig, setAddMealConfig] = useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [isClearDayModalOpen, setIsClearDayModalOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Resizable panel logic
  const [leftWidth, setLeftWidth] = useState(40); // Percentage
  const isDragging = useRef(false);

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
      if(data.success) {
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
      if(data.success) {
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

  const handleClearDayClick = () => {
    setIsClearDayModalOpen(true);
  };

  const confirmClearDay = async () => {
    try {
      const d = new Date(selectedDate);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const mealDateStr = d.toISOString().split('T')[0];

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
        setIsClearDayModalOpen(false);
      } else {
        alert("Xóa thất bại!");
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi xóa.");
    }
  };



  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;
    try {
      await fetch('http://localhost:5002/api/mealplan/update', {
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
      fetchSelectedPlanData();
      fetchMonthlyMeals();
      setMealToDelete(null);
      setSelectedRecipeDetail(null);
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

  const calculateTotalCalories = () => {
    if (!selectedPlanData || !selectedPlanData.meals) return 0;
    let total = 0;
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(type => {
      if (selectedPlanData.meals[type]) {
        selectedPlanData.meals[type].forEach(r => total += (r.calories || 0));
      }
    });
    return total;
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
        <div style={{ width: `calc(${leftWidth}%)` }} className="hidden lg:flex shrink-0 h-full overflow-hidden">
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
              onClick={handleClearDayClick}
              className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
              title="Xóa tất cả món ăn trong ngày"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="overflow-auto flex-1 custom-scrollbar pr-2 space-y-4">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
              const recipes = selectedPlanData?.meals ? selectedPlanData.meals[mealType] : [];
              return (
                <div key={mealType} className="bg-[#fcfdfa] border border-[#f0f5e6] rounded-[24px] p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-[#3d6600] uppercase text-xs tracking-wider flex items-center gap-2">
                      {mealTypeLabels[mealType]}
                    </h4>
                    <button 
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                        setAddMealConfig({ day: selectedPlanData?.day, mealType, mealDate: d.toISOString().split('T')[0] });
                      }}
                      className="p-1.5 hover:bg-[#B5E361]/20 text-[#8CB33D] hover:text-[#5c8a14] rounded-lg transition-colors"
                      title="Thêm món"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  {recipes && recipes.length > 0 ? (
                    <div className="space-y-3">
                      {recipes.map((recipe, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => handleRecipeClick(recipe, selectedPlanData?.day, mealType, selectedDate)}
                          className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-2xl hover:border-[#B5E361]/50 hover:shadow-md transition-all cursor-pointer group"
                        >
                          {recipe.image_url ? (
                            <img src={recipe.image_url} alt={recipe.title} className="w-14 h-14 rounded-xl object-cover" />
                          ) : (
                            <div className="w-14 h-14 bg-[#EAF7D5] rounded-xl flex items-center justify-center">
                              <ChefHat size={20} className="text-[#8CB33D]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-[#1f3b00] truncate group-hover:text-[#3d6600] transition-colors">{recipe.title}</h5>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mt-1">
                              <Flame size={12} className="text-[#B5E361]" />
                              {recipe.calories || 0} kcal
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRecipeClick(recipe, selectedPlanData?.day, mealType, selectedDate);
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
                                        mealType: mealType,
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
                  ) : (
                    <p className="text-sm text-gray-400 italic">Chưa có món ăn nào.</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="shrink-0 pt-4 mt-4 border-t border-gray-100">
            <div className="bg-[#EAF7D5] rounded-[24px] p-5 flex items-center justify-between">
              <div>
                <span className="text-[#3d6600] text-xs font-bold uppercase tracking-wider block mb-1">Tổng Calo</span>
                <span className="text-2xl font-black text-[#1f3b00]">{calculateTotalCalories()} <span className="text-base font-bold text-gray-600">kcal</span></span>
              </div>
              <div className="w-12 h-12 bg-[#B5E361] rounded-2xl flex items-center justify-center shadow-sm">
                <Flame size={24} className="text-[#1f3b00]" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {addMealConfig && (
        <AddMealModal 
          day={addMealConfig.day}
          mealType={addMealConfig.mealType}
          mealDate={addMealConfig.mealDate}
          onClose={() => setAddMealConfig(null)}
          onConfirm={(addedMealInfo) => {
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
              }, 3000);
            }
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[150] bg-white border border-[#B5E361]/50 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="w-8 h-8 bg-[#EAF7D5] rounded-full flex items-center justify-center shrink-0">
            <Check size={16} className="text-[#3d6600]" strokeWidth={3} />
          </div>
          <p className="text-sm font-semibold text-gray-600 pr-2">
            <span className="text-[#1f3b00] font-black uppercase tracking-wide">{toastMessage.name}</span> đã thêm vào{' '}
            <span className="text-[#1f3b00] font-black uppercase bg-[#B5E361]/30 px-2 py-0.5 rounded-md border border-[#B5E361]/40">{toastMessage.mealTypeLabel}</span>{' '}
            ngày <span className="text-[#1f3b00] font-black bg-[#EAF7D5] px-2 py-0.5 rounded-md border border-[#B5E361]/30">{toastMessage.dateString}</span>
          </p>
        </div>
      )}

      {selectedRecipeDetail && (
        <MealDetailModal 
          meal={selectedRecipeDetail} 
          onClose={() => setSelectedRecipeDetail(null)} 
          onDelete={() => {
            setMealToDelete(selectedRecipeDetail);
            // Do NOT close the detail modal yet so user can go back to it
          }}
          onSaveSuccess={() => {
            fetchSelectedPlanData();
            fetchMonthlyMeals();
            setSelectedRecipeDetail(null);
          }}
        />
      )}

      {/* Clear Day Confirmation Modal */}
      {isClearDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f3b00]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#B5E361]/30 p-8 w-[90%] max-w-md text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-[#EAF7D5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 className="text-[#3d6600]" size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-[#1f3b00] mb-3 uppercase tracking-wide">Xóa tất cả?</h3>
            <p className="text-gray-600 mb-8 font-medium">
              Toàn bộ món ăn đã xếp trong ngày này sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục không?
              <span className="font-extrabold text-[#1f3b00] text-lg mt-3 block bg-[#B5E361]/20 px-4 py-2 rounded-xl mx-auto w-fit">
                {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setIsClearDayModalOpen(false)}
                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                Trở lại
              </button>
              <button 
                onClick={confirmClearDay}
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
                onClick={() => setMealToDelete(null)}
                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                Trở lại
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
