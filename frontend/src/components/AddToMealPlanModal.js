import React, { useState, useEffect, useCallback } from 'react';

function AddToMealPlanModal({ post, onClose, onAddSuccess }) {
  // Start with current date, aligned to Monday
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  });

  const [weeklyPlan, setWeeklyPlan] = useState([]);

  const fetchWeeklyPlan = useCallback(async () => {
    try {
      const weekStartStr = currentWeekStart.toISOString().split('T')[0];
      const res = await fetch(`http://localhost:5002/api/mealplan?weekStart=${weekStartStr}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if(data.success) {
        setWeeklyPlan(data.data);
      }
    } catch (e) { console.error(e); }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchWeeklyPlan();
  }, [fetchWeeklyPlan]);

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  // Generate 7 days for the selected week
  const days = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    days.push({
      dateObj: d,
      name: dayNames[i],
      formatted: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    });
  }

  const handleSlotClick = async (dayName, mealType, mealDate) => {
    try {
      const res = await fetch('http://localhost:5002/api/mealplan/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ day: dayName, mealType, recipeId: post.id, mealDate })
      });
      const data = await res.json();
      if (data.success) {
        if (onAddSuccess) {
          onAddSuccess({
            name: post.foodName || post.title || post.name,
            mealType,
            mealDate
          });
        }
        onClose();
      }
    } catch (error) {
      console.error("Error adding to meal plan:", error);
    }
  };

  const getDayLabel = (dayName) => {
    switch (dayName) {
      case 'Monday': return 'Thứ Hai';
      case 'Tuesday': return 'Thứ Ba';
      case 'Wednesday': return 'Thứ Tư';
      case 'Thursday': return 'Thứ Năm';
      case 'Friday': return 'Thứ Sáu';
      case 'Saturday': return 'Thứ Bảy';
      case 'Sunday': return 'Chủ Nhật';
      default: return dayName;
    }
  };

  const getMealLabel = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'Bữa sáng';
      case 'lunch': return 'Bữa trưa';
      case 'dinner': return 'Bữa tối';
      case 'snack': return 'Bữa phụ';
      default: return mealType;
    }
  };

  const renderSlot = (dayInfo, mealType) => {
    const dayName = dayInfo.name;
    const planForDay = weeklyPlan.find(d => d.day === dayName);
    const existingRecipes = planForDay?.meals?.[mealType] || [];
    const dateStr = dayInfo.dateObj.toISOString().split('T')[0];

    return (
      <div 
        key={`${dayName}-${mealType}`}
        className="p-3 border rounded-xl cursor-pointer transition-colors hover:border-green-500 hover:bg-green-50 flex flex-col justify-center items-center text-center min-h-[80px]"
        onClick={() => handleSlotClick(dayName, mealType, dateStr)}
      >
        {existingRecipes.length > 0 ? (
          <div className="text-xs text-gray-500 w-full">
            <span className="block text-green-700 mb-1 text-[10px] uppercase font-bold">+ Thêm tiếp vào đây</span>
            <span className="font-medium text-gray-700 block truncate max-w-full">
              {existingRecipes.map(r => r.name).join(', ')}
            </span>
          </div>
        ) : (
          <span className="text-green-600 font-bold text-sm">+ Thêm vào đây</span>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Thêm vào lịch ăn uống</h2>
            <p className="text-sm text-gray-500 mt-1">Chọn vị trí để thêm: <strong className="text-green-700">{post.foodName}</strong></p>
          </div>
          <button className="text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>✕</button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6 bg-white border border-gray-200 rounded-xl p-2 max-w-md mx-auto">
            <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg font-bold text-gray-600 px-4">&lt; Trước</button>
            <div className="font-bold text-gray-800 text-sm">
              {days[0].formatted} - {days[6].formatted}
            </div>
            <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg font-bold text-gray-600 px-4">Sau &gt;</button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="col-span-1"></div>
                {days.map(d => (
                  <div key={d.name} className="col-span-1 text-center">
                    <div className="font-bold text-gray-800 text-sm">{getDayLabel(d.name)}</div>
                    <div className="text-xs text-gray-500">{d.formatted.substring(0, 5)}</div>
                  </div>
                ))}
              </div>

              {/* Meal Rows */}
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="col-span-1 flex items-center justify-end pr-4">
                    <span className="font-bold text-gray-600 text-xs uppercase tracking-wider">
                      {getMealLabel(mealType)}
                    </span>
                  </div>
                  {days.map(d => (
                    <div key={`${d.name}-${mealType}`} className="col-span-1">
                      {renderSlot(d, mealType)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddToMealPlanModal;
