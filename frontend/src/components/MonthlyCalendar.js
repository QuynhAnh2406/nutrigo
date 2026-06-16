import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

export default function MonthlyCalendar({
  currentMonth, // Date object (e.g. new Date(2026, 5)) -> June 2026
  onMonthChange, // Function(Date)
  selectedDate, // Date object
  onDateSelect, // Function(Date)
  daysWithMeals = [] // Array of 'YYYY-MM-DD' strings
}) {
  const [inputYear, setInputYear] = useState(currentMonth.getFullYear().toString());
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  useEffect(() => {
    setInputYear(currentMonth.getFullYear().toString());
  }, [currentMonth]);

  const handleYearChange = (e) => {
    const val = e.target.value;
    setInputYear(val);
    const y = parseInt(val, 10);
    if (y >= 1900 && y <= 2100) {
      onMonthChange(new Date(y, currentMonth.getMonth(), 1));
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // JS: 0=Sun, 1=Mon, ..., 6=Sat
    // We want CN, T2, T3... so Sunday is index 0.
    return day;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const prevMonthDays = getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const days = [];
  
  // Prev month trailing days
  for (let i = 0; i < firstDay; i++) {
    days.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthDays - firstDay + i + 1),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      isCurrentMonth: true
    });
  }

  // Next month leading days
  const remainingCells = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i),
      isCurrentMonth: false
    });
  }

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const prevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(today);
  };

  // Date format helper to string 'YYYY-MM-DD' taking local time into account
  const toDateStr = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const todayStr = toDateStr(new Date());
  const selectedStr = selectedDate ? toDateStr(selectedDate) : null;

  return (
    <div className="bg-white rounded-[28px] border border-gray-100/80 shadow-sm p-6 w-full h-full flex flex-col items-center">
      
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm mb-6">
        <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-[#1f3b00] hover:bg-[#F4FBE7] rounded-xl transition-all">
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <div className="relative" ref={pickerRef}>
          <button 
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100/80 transition-colors group"
          >
            <span className="text-xl font-extrabold text-[#1f3b00] group-hover:text-[#659A1D] transition-colors">
              Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
            </span>
            <ChevronDown size={18} className={`text-gray-400 group-hover:text-[#659A1D] transition-all duration-300 ${showPicker ? 'rotate-180' : ''}`} />
          </button>
          
          {showPicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-gradient-to-br from-[#8CB33D] to-[#6a8c24] rounded-[20px] shadow-[0_15px_35px_rgba(140,179,61,0.4)] p-3 z-50 animate-in fade-in zoom-in-95 duration-200 border border-white/20">
              <div className="flex flex-col gap-3">
                {/* Year Input */}
                <div className="flex items-center justify-between bg-black/10 rounded-xl px-1 py-1">
                  <button 
                    onClick={() => {
                      const y = parseInt(inputYear) - 1;
                      setInputYear(y.toString());
                      onMonthChange(new Date(y, currentMonth.getMonth(), 1));
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-all"
                  ><ChevronLeft size={16} strokeWidth={3}/></button>
                  <input 
                    type="number"
                    className="w-14 text-center font-black text-lg text-white bg-transparent outline-none hide-arrows py-0 placeholder-white/50"
                    value={inputYear}
                    onChange={handleYearChange}
                    onBlur={() => setInputYear(currentMonth.getFullYear().toString())}
                  />
                  <button 
                    onClick={() => {
                      const y = parseInt(inputYear) + 1;
                      setInputYear(y.toString());
                      onMonthChange(new Date(y, currentMonth.getMonth(), 1));
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-all"
                  ><ChevronRight size={16} strokeWidth={3}/></button>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => {
                    const isCurrent = m === currentMonth.getMonth() + 1;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          onMonthChange(new Date(currentMonth.getFullYear(), m - 1, 1));
                          setShowPicker(false);
                        }}
                        className={`py-1.5 rounded-lg text-sm font-black transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-white text-[#5c7a1d] shadow-[0_4px_10px_rgba(0,0,0,0.15)] scale-105' 
                            : 'bg-transparent text-white/90 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        T{m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-[#1f3b00] hover:bg-[#F4FBE7] rounded-xl transition-all">
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 w-full max-w-sm gap-2 mb-3">
        {weekDays.map(wd => (
          <div key={wd} className="text-center font-black text-sm text-gray-500 uppercase">
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 w-full max-w-sm gap-2 flex-1 items-start">
        {days.map((day, idx) => {
          const dateStr = toDateStr(day.date);
          const isSelected = dateStr === selectedStr;
          const isToday = dateStr === todayStr;
          const hasMeals = daysWithMeals.includes(dateStr);

          // Default styles
          let baseClasses = "w-full aspect-[4/3] rounded-2xl flex items-center justify-center font-extrabold text-[15px] transition-all cursor-pointer border-2 ";
          
          if (!day.isCurrentMonth) {
            baseClasses += "text-gray-300 border-transparent hover:text-gray-500";
          } else if (isSelected) {
            // Selected Day (Solid dark, white text)
            baseClasses += "bg-[#1f3b00] text-white border-[#1f3b00] shadow-md transform scale-105";
          } else if (isToday) {
            // Today but not selected (Dashed green border, light green text)
            baseClasses += "bg-[#FBFDF8] text-[#8CB33D] border-[#B5E361] border-dashed hover:bg-[#F4FBE7]";
          } else {
            // Normal day (White background, transparent border, hover to show border)
            baseClasses += "bg-white text-gray-700 border-transparent hover:border-[#B5E361]/50 hover:bg-gray-50";
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if(!day.isCurrentMonth) {
                    onMonthChange(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                }
                onDateSelect(day.date);
              }}
              className={baseClasses}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer "Hôm nay" button */}
      <div className="w-full max-w-sm mt-6">
        <button 
          onClick={handleGoToday}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[20px] bg-[#EAF5DA] hover:bg-[#DDF7B0] border border-[#B5E361]/30 text-[#1f3b00] font-black transition-all shadow-sm active:scale-[0.98]"
        >
          <CalendarIcon size={18} className="text-[#8CB33D]" />
          Hôm nay
        </button>
      </div>

    </div>
  );
}
