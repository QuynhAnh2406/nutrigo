import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Sparkles, LayoutDashboard, Clock, Target, Zap, Flame, Scale } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const quotes = [
  "Sức khỏe là vốn quý nhất.",
  "Ăn uống lành mạnh hôm nay, vun đắp sức khỏe ngày mai.",
  "Một cơ thể khỏe mạnh bắt đầu từ những lựa chọn nhỏ mỗi ngày.",
  "Dinh dưỡng tốt là nền móng của một cuộc sống trọn vẹn.",
  "Hãy chăm sóc cơ thể như cách bạn trân trọng chính mình.",
  "Mỗi bữa ăn là một cơ hội để nuôi dưỡng sức khỏe.",
  "Cơ thể bạn phản ánh những gì bạn lựa chọn mỗi ngày.",
  "Ăn đúng cách, sống tích cực, khỏe mạnh dài lâu.",
  "Sự cân bằng trong dinh dưỡng tạo nên sự cân bằng trong cuộc sống.",
  "Một chế độ ăn tốt là món quà bạn dành cho tương lai.",
  "Khỏe mạnh không phải mục tiêu, mà là một hành trình.",
  "Thay đổi nhỏ trong bữa ăn tạo nên khác biệt lớn cho sức khỏe.",
  "Dinh dưỡng hôm nay quyết định năng lượng ngày mai.",
  "Một cơ thể khỏe cần được nuôi dưỡng bằng những điều tốt đẹp.",
  "Hãy ăn để khỏe mạnh, không chỉ để no.",
  "Mỗi lựa chọn thực phẩm là một bước tiến đến phiên bản khỏe hơn.",
  "Sức khỏe bắt đầu từ chiếc đĩa trên bàn ăn.",
  "Nuôi dưỡng cơ thể, nâng cao chất lượng cuộc sống.",
  "Cân bằng dinh dưỡng là chìa khóa của sức khỏe bền vững.",
  "Hôm nay ăn lành mạnh, ngày mai sống khỏe mạnh."
];

function Dashboard() {
  const { metrics, healthData } = useOutletContext();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  const getGoalLabel = (goal) => {
    switch (goal) {
      case 'Lose weight': return 'Giảm cân';
      case 'Maintain weight': return 'Duy trì cân nặng';
      case 'Gain weight': return 'Tăng cân';
      case 'Build muscle': return 'Tăng cơ';
      default: return goal || 'Chưa thiết lập';
    }
  };

  const getBmiStatusLabel = (status) => {
    switch (status) {
      case 'Underweight': return 'Thiếu cân';
      case 'Normal': return 'Bình thường';
      case 'Overweight': return 'Thừa cân';
      case 'Obese': return 'Béo phì';
      default: return status;
    }
  };

  const getBmiPercentage = (bmi) => {
    if (!bmi) return 0;
    const val = parseFloat(bmi);
    const minBmi = 15;
    const maxBmi = 35;
    return Math.min(Math.max(((val - minBmi) / (maxBmi - minBmi)) * 100, 0), 100);
  };

  const [weeklyPlan, setWeeklyPlan] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        const weekStartStr = monday.toISOString().split('T')[0];

        const res = await fetch(`http://localhost:5002/api/mealplan?weekStart=${weekStartStr}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        const mealPlanData = await res.json();
        
        if (mealPlanData.success) setWeeklyPlan(mealPlanData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  const getTodayCalories = () => {
    const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todayPlan = weeklyPlan.find(d => d.day === todayDayName);
    let total = 0;
    if (todayPlan && todayPlan.meals) {
      Object.values(todayPlan.meals).forEach(mealArray => {
        if (Array.isArray(mealArray)) {
          mealArray.forEach(m => {
            if (m && m.calories) total += Number(m.calories);
          });
        }
      });
    }
    return total;
  };

  const todayCalories = getTodayCalories();
  const targetCalories = metrics.targetCalories || 2000;
  const progressPercent = Math.min((todayCalories / targetCalories) * 100, 100);

  const pastCalories = useMemo(() => {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 500) + 1800);
  }, []);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      calories: i === 0 ? todayCalories : pastCalories[6 - i]
    });
  }

  return (
    <div className="main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>


      {/* Header / Date */}
      <div className="mb-8">
        <PageHeader
          icon={LayoutDashboard}
          title={time.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          subtitle="Bắt đầu ngày mới tràn đầy năng lượng cùng Nutrigo!"
          actions={
            <div className="rounded-full bg-white/55 px-4 py-2 text-sm font-extrabold text-[#1f3b00] ring-1 ring-white/60 backdrop-blur flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#3d6600]" />
              <span>{time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          }
        >
          <div className="mt-1">
            <span className="block text-[10px] text-[#3d6600]/80 font-black uppercase tracking-widest mb-1">Trích dẫn dinh dưỡng của ngày</span>
            <p className="text-base text-[#1a3300] font-semibold italic">"{quote}"</p>
          </div>
        </PageHeader>
      </div>

      {/* COMPLETE PROFILE CTA FOR NEW USERS */}
      {(!healthData.weight || !healthData.height || !healthData.dateOfBirth) && (
        <div className="mb-8 p-1 bg-gradient-to-r from-[#B5E361] via-[#8CB33D] to-[#4facfe] rounded-[2.5rem] shadow-xl shadow-green-100 animate-in slide-in-from-bottom-4 duration-700 mt-8">
          <div className="bg-white/90 backdrop-blur-md rounded-[2.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B5E361] to-[#8CB33D] rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-green-200 shrink-0 animate-pulse">
                <Sparkles className="text-white w-10 h-10" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Hoàn tất Hồ sơ Sức khỏe! ✨</h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Để cung cấp mục tiêu calo chính xác và lịch ăn uống cá nhân hóa, chúng tôi cần một số thông tin như cân nặng, chiều cao và ngày sinh của bạn.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile?tab=Edit')}
              className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-gray-800 transition-all shadow-xl hover:scale-105 shrink-0"
            >
              Điền thông tin
              <ArrowRight className="w-5 h-5 text-[#B5E361]" />
            </button>
          </div>
        </div>
      )}

      <h3 className="section-title mt-8">Bảng theo dõi sức khỏe</h3>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* HERO CARD: DAILY TARGET */}
        <div className="flex-1 bg-gradient-to-br from-[#B5E361] via-[#8CB33D] to-[#4facfe] rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl shadow-green-200 group border-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                  <Target className="text-white w-6 h-6" />
                </div>
                <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Mục tiêu hàng ngày</span>
              </div>
              <h3 className="text-white text-6xl font-black mt-6 flex items-baseline gap-3">
                {targetCalories}
                <span className="text-xl text-white/50 font-bold uppercase tracking-widest">kcal</span>
              </h3>
              <p className="text-white/80 text-sm mt-3 flex items-center gap-2">
                Mục tiêu để <span className="text-white font-black px-3 py-1 bg-white/20 rounded-xl backdrop-blur-sm shadow-sm">{getGoalLabel(healthData.goal)}</span>
              </p>
            </div>

            <div className="mt-10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-white/70 text-xs font-black uppercase tracking-wider">Tiến trình hàng ngày</span>
                <span className="text-white text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{todayCalories} / {targetCalories} kcal</span>
              </div>
              <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
                <div className="h-full bg-white rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.8)]" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4 w-full lg:w-[280px]">
          <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center gap-4 hover:border-[#B5E361]/50 transition-all">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">TDEE</span>
              <strong className="text-xl text-gray-900">{metrics.tdee || '--'} <small className="text-[10px] opacity-40">kcal</small></strong>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center gap-4 hover:border-orange-200 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">BMR</span>
              <strong className="text-xl text-gray-900">{metrics.bmr || '--'} <small className="text-[10px] opacity-40">kcal</small></strong>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">BMI</span>
              <div className="flex items-center gap-2">
                <strong className="text-xl text-gray-900">{metrics.bmi || '--'}</strong>
                {metrics.bmiStatus && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${metrics.bmiStatus === 'Normal' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{getBmiStatusLabel(metrics.bmiStatus)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bmi-scale-wrapper mb-8 p-6 bg-white rounded-2xl border border-gray-100">
          <h4 className="font-bold mb-2">Thang đo BMI</h4>
          
          <div className="relative mb-2 mt-8 pt-8 pb-4">
              {/* Tooltip containing the BMI value */}
              {metrics.bmi && (
                  <div 
                      className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                      style={{ left: `${getBmiPercentage(metrics.bmi)}%` }}
                  >
                      <span className="bg-gray-900 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md whitespace-nowrap animate-bounce">
                          Chỉ số: {metrics.bmi}
                      </span>
                      {/* Downward triangle/arrow */}
                      <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
                  </div>
              )}

              {/* The multi-colored bar */}
              <div className="w-full h-4 rounded-full flex overflow-hidden bg-gray-100 relative">
                  <div style={{ width: '17.5%' }} className="bg-blue-300 h-full" title="Gầy (< 18.5)"></div>
                  <div style={{ width: '32.5%' }} className="bg-green-400 h-full" title="Bình thường (18.5 - 24.9)"></div>
                  <div style={{ width: '25%' }} className="bg-orange-300 h-full" title="Thừa cân (25.0 - 29.9)"></div>
                  <div style={{ width: '25%' }} className="bg-red-400 h-full" title="Béo phì (>= 30.0)"></div>

                  {/* The pointer pin inside or overlaying the bar */}
                  {metrics.bmi && (
                      <div 
                          className="absolute top-[-6px] bottom-[-6px] w-[3px] bg-gray-900 rounded transition-all duration-300"
                          style={{ left: `calc(${getBmiPercentage(metrics.bmi)}% - 1.5px)` }}
                      ></div>
                  )}
              </div>

              {/* Labels aligned on the number line */}
              <div className="relative text-[10px] text-gray-500 font-bold mt-3 h-8">
                  <div className="absolute -translate-x-1/2 text-center" style={{ left: '0%' }}>
                      <span className="block font-black text-gray-700">15</span>
                      <span className="text-[8px] text-gray-400 font-medium">Rất gầy</span>
                  </div>
                  <div className="absolute -translate-x-1/2 text-center" style={{ left: '17.5%' }}>
                      <span className="block font-black text-gray-700">18.5</span>
                      <span className="text-[8px] text-gray-400 font-medium">Bình thường</span>
                  </div>
                  <div className="absolute -translate-x-1/2 text-center" style={{ left: '50%' }}>
                      <span className="block font-black text-gray-700">25</span>
                      <span className="text-[8px] text-gray-400 font-medium">Thừa cân</span>
                  </div>
                  <div className="absolute -translate-x-1/2 text-center" style={{ left: '75%' }}>
                      <span className="block font-black text-gray-700">30</span>
                      <span className="text-[8px] text-gray-400 font-medium">Béo phì</span>
                  </div>
                  <div className="absolute -translate-x-1/2 text-center" style={{ left: '100%' }}>
                      <span className="block font-black text-gray-700">35+</span>
                      <span className="text-[8px] text-gray-400 font-medium">Nguy hiểm</span>
                  </div>
              </div>
          </div>
      </div>

      <h3 className="section-title mt-8">Lịch sử calo (7 ngày qua)</h3>

      <div className="grid grid-cols-7 gap-3 mb-10">
        {days.map((day, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border text-center flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:scale-105 ${idx === 6 ? 'bg-gradient-to-br from-[#EAF5DA] to-[#B5E361] border-[#B5E361]/40 text-[#1f3b00] shadow-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
            <span className={`text-xs ${idx === 6 ? 'text-[#3d6600]/80 font-black' : 'text-gray-400 font-bold'}`}>{day.date.toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
            <span className="text-lg font-black">{day.date.getDate()}</span>
            {day.calories > 0 ? (
              <span className={`text-xs font-extrabold ${idx === 6 ? 'text-[#2d5200]' : 'text-orange-500'}`}>{day.calories} kcal</span>
            ) : (
              <span className="text-xs text-gray-300 font-bold">--</span>
            )}
          </div>
        ))}
      </div>


    </div>
  );
}

export default Dashboard;
