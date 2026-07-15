import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Flame, Check, Sunrise, Sun, Moon, Coffee } from 'lucide-react';

function AddToMealPlanModal({ post, onClose, onAddSuccess }) {
  // Start with current date, aligned to Monday
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  });

  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [targetCalories, setTargetCalories] = useState(0);
  const [goalText, setGoalText] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/profile/health', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const row = data.data;
          const weight = parseFloat(row.weight_kg);
          const height = parseFloat(row.height_cm);
          const dateOfBirth = row.date_of_birth;
          const gender = row.gender;
          const activityLevel = row.activity_level;
          const goal = row.goal;

          if (weight && height && dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            age = Math.max(0, age);

            let bmr = 0;
            if (gender === 'Male') {
                bmr = 10 * weight + 6.25 * height - 5 * age + 5;
            } else if (gender === 'Female') {
                bmr = 10 * weight + 6.25 * height - 5 * age - 161;
            }

            const activityMultipliers = {
                'Sedentary': 1.2,
                'Light': 1.375,
                'Moderate': 1.55,
                'Active': 1.725,
                'Very Active': 1.9
            };
            const tdee = (bmr && activityLevel) ? Math.round(bmr * (activityMultipliers[activityLevel] || 1.2)) : 0;

            let targetCals = tdee;
            if (tdee > 0 && goal) {
                if (goal === 'Lose weight') targetCals -= 500;
                else if (goal === 'Gain weight') targetCals += 500;
            } else {
                targetCals = 0;
            }
            setTargetCalories(targetCals);

            let gText = "duy trì cân nặng";
            if (goal === 'Lose weight') gText = "giảm cân";
            else if (goal === 'Gain weight') gText = "tăng cân";
            setGoalText(gText);
          }
        }
      } catch (e) { console.error(e); }
    };
    fetchProfile();
  }, []);

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
    const dayName = dayNames[i];
    
    // Calculate total calories for the day
    let totalCals = 0;
    const planForDay = weeklyPlan.find(plan => plan.day === dayName);
    if (planForDay && planForDay.meals) {
      Object.values(planForDay.meals).forEach(mealArray => {
        mealArray.forEach(meal => {
          totalCals += parseInt(meal.calories) || 0;
        });
      });
    }

    days.push({
      dateObj: d,
      name: dayName,
      formatted: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      totalCals
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

    const isEmpty = existingRecipes.length === 0;

    return (
      <div 
        key={`${dayName}-${mealType}`}
        className={`p-1.5 rounded-[14px] cursor-pointer transition-all duration-300 flex flex-col items-center text-center min-h-[80px] relative overflow-hidden group ${
          isEmpty 
            ? 'border-2 border-dashed border-[#e2e8f0] hover:border-[#B5E361] hover:bg-[#F8FDF0] justify-center'
            : 'border border-[#B5E361]/50 bg-[#F4FBE7] hover:border-[#8CB33D] hover:shadow-sm justify-start pt-2'
        }`}
        onClick={() => handleSlotClick(dayName, mealType, dateStr)}
      >
        {!isEmpty ? (
          <div className="w-full flex flex-col gap-1.5 z-10">
            {existingRecipes.map((r, idx) => (
              <div key={idx} className="bg-white rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#2d3748] shadow-sm border border-[#f0ebe1] truncate w-full flex items-center justify-center">
                {r.title || r.name}
              </div>
            ))}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-[10px] text-[#659A1D] font-black flex items-center justify-center gap-1 uppercase tracking-wider">
              <Plus size={12} strokeWidth={3} /> Thêm
            </div>
          </div>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#659A1D] group-hover:shadow-sm transition-all mb-1.5">
              <Plus size={16} strokeWidth={2.5} />
            </div>
            <span className="text-gray-400 font-bold text-[11px] group-hover:text-[#659A1D] transition-colors">Thêm món</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1200px] overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#B5E361]/30 flex justify-between items-center bg-gradient-to-r from-[#F4FBE7] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B5E361]/30 flex items-center justify-center text-[#659A1D]">
              <Check size={20} strokeWidth={3} />
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#2d5200] tracking-tight">
              Thêm <span className="text-[#659A1D]">{post.foodName}</span> vào Lịch ăn uống
            </h2>
          </div>
          <button className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" onClick={onClose}>✕</button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-1 w-full max-w-[260px] shadow-sm">
              <button onClick={prevWeek} className="p-1.5 hover:bg-gray-100 rounded-lg font-bold text-gray-500 transition-colors px-3">&lt;</button>
              <div className="font-extrabold text-gray-800 text-[13px] tracking-wide">
                {days[0].formatted} - {days[6].formatted}
              </div>
              <button onClick={nextWeek} className="p-1.5 hover:bg-gray-100 rounded-lg font-bold text-gray-500 transition-colors px-3">&gt;</button>
            </div>
            
            {targetCalories > 0 && (
              <div className="bg-[#F8FDF0] px-3.5 py-1.5 rounded-xl border border-[#B5E361]/50 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#B5E361]/30 flex items-center justify-center text-[#659A1D]">
                  <Flame size={14} fill="currentColor" />
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <p className="text-[#3d6600] text-[12px] font-semibold m-0">
                    Để {goalText}:
                  </p>
                  <p className="text-[#2d5200] text-[14px] font-black m-0 tracking-tight">
                    {targetCalories} <span className="text-[9px] font-bold opacity-70 uppercase tracking-wider">kcal/ngày</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="col-span-1"></div>
                {days.map(d => {
                  let calsColor = 'text-gray-400 bg-gray-50 border-gray-100';
                  if (d.totalCals > 0) {
                     calsColor = targetCalories > 0 && d.totalCals > targetCalories 
                       ? 'text-red-600 bg-red-50 border-red-200' 
                       : 'text-[#3d6600] bg-[#EAF7D5] border-[#B5E361]/50';
                  }

                  return (
                    <div key={d.name} className="col-span-1 text-center pb-2">
                      <div className="font-black text-gray-800 text-[13px] uppercase tracking-wider">{getDayLabel(d.name)}</div>
                      <div className="text-[11px] font-semibold text-gray-400 mb-2">{d.formatted.substring(0, 5)}</div>
                      <div className={`inline-flex items-center justify-center min-w-[50px] px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide border ${calsColor} transition-colors`}>
                        {d.totalCals} <span className="ml-0.5 opacity-60 text-[8px]">KCAL</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Meal Rows */}
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const mealIcons = {
                  breakfast: <Sunrise size={16} className="text-orange-400" />,
                  lunch: <Sun size={16} className="text-yellow-500" />,
                  dinner: <Moon size={16} className="text-indigo-400" />,
                  snack: <Coffee size={16} className="text-amber-600" />
                };
                
                return (
                  <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
                    <div className="col-span-1 flex items-center justify-start md:pl-2">
                      <div className="flex items-center gap-2 font-bold text-gray-700 text-[13px] whitespace-nowrap">
                        {mealIcons[mealType]}
                        <span>{getMealLabel(mealType)}</span>
                      </div>
                    </div>
                    {days.map(d => (
                      <div key={`${d.name}-${mealType}`} className="col-span-1">
                        {renderSlot(d, mealType)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddToMealPlanModal;
