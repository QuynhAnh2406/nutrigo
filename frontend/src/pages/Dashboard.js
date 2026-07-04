import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Sparkles, LayoutDashboard, Clock, Target, Zap, Flame, Scale, X,
  Coffee, Utensils, Cookie, UtensilsCrossed,
  CheckCircle2, AlertCircle, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';
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
  "Hãy ăn để khỏe mạnh, không chỉ để no.",
  "Sức khỏe bắt đầu từ chiếc đĩa trên bàn ăn.",
  "Thay đổi nhỏ trong bữa ăn tạo nên khác biệt lớn cho sức khỏe.",
];

/* ─── Column Chart ───────────────────────────────────── */
function CalorieBarChart({ days, targetCalories }) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const maxCal = Math.max(targetCalories * 1.35, ...days.map(d => d.calories), 200);
  const targetPct = Math.min((targetCalories / maxCal) * 100, 100);
  const CHART_H = 220; // px height of bar area

  return (
    <div className="w-full select-none">
      <div className="flex gap-1.5" style={{ alignItems: 'stretch' }}>

        {/* Y-axis labels column */}
        <div className="shrink-0 flex flex-col justify-between" style={{ width: 36, height: CHART_H, paddingTop: 2 }}>
          {[1, 0.75, 0.5, 0.25, 0].map((f) => (
            <span key={f} className="text-[9px] text-gray-500 font-bold text-right leading-none">
              {(() => { const v = Math.round(maxCal * f); return v >= 1000 ? `${(v/1000).toFixed(1)}k` : v; })()}
            </span>
          ))}
        </div>

        {/* Bars + X-labels: one column per day */}
        <div className="flex-1 flex gap-1.5">
          {days.map((day, idx) => {
            const isToday = idx === days.length - 1;
            const pct = day.calories > 0 ? Math.min((day.calories / maxCal) * 100, 100) : 0;
            const ratio = targetCalories > 0 ? day.calories / targetCalories : 0;
            const isOver = ratio > 1.05;
            const isGood = ratio >= 0.7 && ratio <= 1.05;
            const isHovered = hoveredIdx === idx;

            const barGradient = isToday
              ? 'linear-gradient(to top, #7ab82a, #c8ec5a)'
              : isOver
                ? 'linear-gradient(to top, #ea580c, #fb923c)'
                : isGood
                  ? 'linear-gradient(to top, #22c55e, #86efac)'
                  : 'linear-gradient(to top, #cbd5e1, #e2e8f0)';

            const glowShadow = isHovered
              ? (isToday ? '0 4px 20px rgba(181,227,97,0.5)' : isGood ? '0 4px 14px rgba(134,239,172,0.4)' : isOver ? '0 4px 14px rgba(251,146,60,0.4)' : 'none')
              : 'none';

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Bar area */}
                <div className="w-full relative flex items-end justify-center" style={{ height: CHART_H }}>

                  {/* Grid lines behind bar (drawn per-column) */}
                  {[0.25, 0.5, 0.75, 1].map(f => (
                    <div key={f} className="absolute w-full pointer-events-none"
                      style={{ bottom: `${f * 100}%`, borderTop: '1px dashed #f0f0f0', left: 0, right: 0 }} />
                  ))}
                  <div className="absolute w-full pointer-events-none"
                    style={{ bottom: 0, borderTop: '1.5px solid #e5e7eb', left: 0, right: 0 }} />

                  {/* Target line segment */}
                  <div className="absolute w-full pointer-events-none"
                    style={{ bottom: `${targetPct}%`, borderTop: '2px dashed #B5E361', opacity: 0.75, left: 0, right: 0 }} />

                  {/* Bar track */}
                  <div
                    className="relative overflow-hidden transition-all duration-200"
                    style={{
                      width: '80%',
                      height: '100%',
                      background: isToday ? 'rgba(181,227,97,0.12)' : 'rgba(243,244,246,0.85)',
                      borderRadius: '8px 8px 4px 4px',
                    }}
                  >
                    {/* Filled bar */}
                    <div
                      className="absolute bottom-0 w-full"
                      style={{
                        height: `${pct}%`,
                        background: barGradient,
                        borderRadius: '8px 8px 3px 3px',
                        boxShadow: glowShadow,
                        transform: isHovered ? 'scaleX(0.88)' : 'scaleX(1)',
                        transition: 'height 0.65s ease-out, box-shadow 0.2s, transform 0.15s',
                      }}
                    />
                    {/* Value inside bar */}
                    {pct > 22 && (
                      <div className="absolute bottom-2 w-full text-center pointer-events-none">
                        <span className={`text-[8px] font-black leading-none ${isToday ? 'text-[#1f3b00]' : isOver ? 'text-orange-900' : isGood ? 'text-green-900' : 'text-gray-500'}`}>
                          {day.calories >= 1000 ? `${(day.calories / 1000).toFixed(1)}k` : day.calories}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tooltip — absolutely positioned above bar track, no layout impact */}
                  <div
                    className="absolute pointer-events-none"
                    style={{ bottom: `${pct}%`, left: '50%', transform: 'translateX(-50%)', zIndex: 20, marginBottom: 6,
                      opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}
                  >
                    <div className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-lg relative">
                      {day.calories > 0 ? `${day.calories.toLocaleString()} kcal` : 'Chưa có dữ liệu'}
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </div>
                </div>

                {/* X-axis label — same column, right below bar */}
                <div className="flex flex-col items-center mt-1.5">
                  <span className={`text-[9px] font-black leading-tight ${isToday ? 'text-[#2d5200]' : 'text-gray-700'}`}>
                    {day.date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </span>
                  <span className={`text-[8px] font-semibold leading-tight ${isToday ? 'text-[#5a8a00]' : 'text-gray-500'}`}>
                    {day.date.getDate()}/{day.date.getMonth() + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MỤC TIÊU label on the right of target line */}
        <div className="shrink-0 relative pointer-events-none" style={{ width: 40, height: CHART_H }}>
          <div className="absolute right-0 text-[7.5px] font-black text-[#6a9e1f] bg-[#fffdf0] px-0.5 leading-none"
            style={{ bottom: `calc(${targetPct}% - 5px)` }}>
            MỤC TIÊU
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────── */
function Dashboard() {
  const { metrics, healthData } = useOutletContext();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [calorieHistory, setCalorieHistory] = useState({});
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [quote, setQuote] = useState('');
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week

  const getGoalLabel = g => ({ 'Lose weight': 'Giảm cân', 'Maintain weight': 'Duy trì', 'Gain weight': 'Tăng cân', 'Build muscle': 'Tăng cơ' }[g] || g || 'Chưa thiết lập');
  const getBmiLabel = s => ({ Underweight: 'Thiếu cân', Normal: 'Bình thường', Overweight: 'Thừa cân', Obese: 'Béo phì' }[s] || s);
  const getBmiPct = bmi => bmi ? Math.min(Math.max(((parseFloat(bmi) - 15) / 20) * 100, 0), 100) : 0;

  const handleDayClick = async (date) => {
    try {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const res = await fetch(`http://localhost:5002/api/mealplan/day?date=${d.toISOString().split('T')[0]}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (data.success) setSelectedDayDetail({ date, meals: data.data });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    (async () => {
      try {
        const today = new Date();
        const diff = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
        const weekStartStr = new Date(today.setDate(diff)).toISOString().split('T')[0];
        const r1 = await fetch(`http://localhost:5002/api/mealplan?weekStart=${weekStartStr}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
        const d1 = await r1.json();
        if (d1.success) setWeeklyPlan(d1.data);

        // Fetch history for the selected week range
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + weekOffset * 7);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        const toStr = d => { const ld = new Date(d); ld.setMinutes(ld.getMinutes() - ld.getTimezoneOffset()); return ld.toISOString().split('T')[0]; };
        const r2 = await fetch(`http://localhost:5002/api/mealplan/history?startDate=${toStr(startDate)}&endDate=${toStr(endDate)}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
        const d2 = await r2.json();
        if (d2.success) {
          const map = {};
          d2.data.forEach(i => { map[i.meal_date_str] = Math.round(Number(i.total_calories || 0)); });
          setCalorieHistory(map);
        }
      } catch (e) { console.error(e); }
    })();
  }, [weekOffset]);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { setQuote(quotes[Math.floor(Math.random() * quotes.length)]); }, []);

  const getTodayCal = () => {
    const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const str = d.toISOString().split('T')[0];
    if (calorieHistory[str] !== undefined) return calorieHistory[str];
    const name = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
    const plan = weeklyPlan.find(x => x.day === name);
    let t = 0;
    if (plan?.meals) Object.values(plan.meals).forEach(a => { if (Array.isArray(a)) a.forEach(m => { if (m?.calories) t += Number(m.calories); }); });
    return t;
  };

  const todayCal = getTodayCal();
  const target = metrics.targetCalories || 2000;
  const progress = Math.min((todayCal / target) * 100, 100);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i) + weekOffset * 7);
    const ld = new Date(d); ld.setMinutes(ld.getMinutes() - ld.getTimezoneOffset());
    return { date: d, calories: calorieHistory[ld.toISOString().split('T')[0]] || 0 };
  });

  // Week label helpers
  const weekStart = days[0].date;
  const weekEnd   = days[6].date;
  const fmtDate   = d => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  const weekLabel = `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`;
  const isCurrentWeek = weekOffset === 0;

  const activeDays = days.filter(d => d.calories > 0);
  const goodDays  = days.filter(d => d.calories > 0 && d.calories >= target * 0.7 && d.calories <= target * 1.05);
  const overDays  = days.filter(d => d.calories > target * 1.05);
  const avgCal    = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length) : 0;

  const ratio = todayCal > 0 && target > 0 ? todayCal / target : 0;
  const status = ratio > 1.05 ? 'over' : ratio >= 0.7 ? 'good' : todayCal > 0 ? 'under' : 'none';
  const statusMap = {
    good:  { label: '✓ Đạt mục tiêu', cls: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/20' },
    over:  { label: '↑ Vượt mức',     cls: 'bg-red-400/25 text-red-100 border-red-300/20' },
    under: { label: '↓ Chưa đủ',      cls: 'bg-white/15 text-white/70 border-white/10' },
    none:  { label: 'Chưa ghi nhận',  cls: 'bg-black/10 text-white/50 border-white/5' },
  };

  /* right-side stat cards — only TDEE, BMR, BMI */
  const stats = [
    { icon: Zap,   bg: 'bg-green-50',  color: 'text-green-600',  label: 'TDEE', value: metrics.tdee || '--', unit: 'kcal/ngày' },
    { icon: Flame, bg: 'bg-orange-50', color: 'text-orange-500', label: 'BMR',  value: metrics.bmr  || '--', unit: 'kcal/ngày' },
    { icon: Scale, bg: 'bg-blue-50',   color: 'text-blue-500',   label: 'BMI',  value: metrics.bmi  || '--', unit: null,
      badge: metrics.bmiStatus ? { text: getBmiLabel(metrics.bmiStatus), cls: metrics.bmiStatus === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700' } : null },
  ];

  return (
    <div className="main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>

      {/* PAGE HEADER */}
      <div className="mb-5">
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
          <p className="text-sm text-[#1a3300] font-semibold italic mt-1">"{quote}"</p>
        </PageHeader>
      </div>

      {/* COMPLETE PROFILE BANNER */}
      {(!healthData.weight || !healthData.height || !healthData.dateOfBirth) && (
        <div className="mb-5 p-px bg-gradient-to-r from-[#B5E361] via-[#8CB33D] to-[#4facfe] rounded-[1.75rem] shadow-md shadow-green-100">
          <div className="bg-white/95 rounded-[1.7rem] px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#B5E361] to-[#8CB33D] rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">Hoàn tất Hồ sơ Sức khỏe ✨</p>
                <p className="text-xs text-gray-400 mt-0.5">Cần thêm thông tin để tính toán mục tiêu calo chính xác.</p>
              </div>
            </div>
            <button onClick={() => navigate('/profile?tab=Edit')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-gray-700 transition-all hover:scale-105 shrink-0">
              Điền ngay <ArrowRight className="w-3 h-3 text-[#B5E361]" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MAIN 2-COLUMN LAYOUT
          LEFT  (flex-1): chart + 7-day + BMI
          RIGHT (w-72):   hero card + stat cards
         ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-5 items-start">

        {/* ─── LEFT COLUMN ─────────────────────── */}
        <div className="col-span-2 flex flex-col gap-5">

          {/* CHART */}
          <div className="bg-[#fffdf0] rounded-[2rem] border border-amber-100/60 shadow-sm p-6">
            {/* Week navigation bar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#B5E361] to-[#8CB33D] rounded-full" />
                <h2 className="text-base font-black text-[#112308] tracking-tight">Phân tích mức độ ăn uống</h2>
              </div>
              {/* navigator */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(w => w - 1)}
                  className="w-7 h-7 rounded-xl bg-amber-100/70 hover:bg-[#B5E361]/40 flex items-center justify-center transition-all hover:scale-105"
                >
                  <ChevronLeft className="w-4 h-4 text-[#3d6600]" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="text-[10px] font-black text-[#2d5200]">{weekLabel}</span>
                  {isCurrentWeek && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 bg-[#B5E361]/30 text-[#2d5200] rounded-full">Tuần này</span>
                  )}
                </div>
                <button
                  onClick={() => setWeekOffset(w => Math.min(w + 1, 0))}
                  disabled={isCurrentWeek}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isCurrentWeek
                      ? 'bg-gray-100 opacity-30 cursor-not-allowed'
                      : 'bg-amber-100/70 hover:bg-[#B5E361]/40 hover:scale-105'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-[#3d6600]" />
                </button>
              </div>
              {/* legend */}
              <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 flex-wrap">
                {[
                  { color: 'bg-[#B5E361]',  label: 'Hôm nay' },
                  { color: 'bg-green-300',  label: 'Đạt mục tiêu' },
                  { color: 'bg-orange-400', label: 'Vượt mức' },
                  { color: 'bg-slate-200',  label: 'Chưa đủ' },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${color} inline-block`} />{label}
                  </span>
                ))}
              </div>
            </div>
            <CalorieBarChart days={days} targetCalories={target} />
            {/* compact stats strip */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center bg-amber-50/60 rounded-2xl overflow-hidden divide-x divide-amber-100/80">
                {[
                  { icon: Activity,     iconColor: 'text-purple-400', label: 'TB 7 ngày', val: avgCal ? `${avgCal.toLocaleString()}` : '--',   unit: 'kcal',      bg: '' },
                  { icon: CheckCircle2, iconColor: 'text-emerald-400', label: 'Ngày đạt',  val: `${goodDays.length}`,                            unit: `/ 7`,       bg: '' },
                  { icon: AlertCircle,  iconColor: 'text-red-400',    label: 'Vượt mức',  val: `${overDays.length}`,                            unit: `/ 7`,       bg: '' },
                  { icon: null,         iconColor: '',                label: 'Tổng tuần', val: days.reduce((s,d)=>s+d.calories,0).toLocaleString(), unit: 'kcal',   bg: '' },
                  {
                    icon: null, iconColor: '', label: 'So với mục tiêu',
                    val: avgCal > 0 ? (avgCal > target ? '+' : '') + Math.round(avgCal - target).toLocaleString() : '--',
                    unit: avgCal > 0 ? 'kcal' : '',
                    valColor: avgCal > target * 1.05 ? 'text-orange-500' : avgCal >= target * 0.7 && avgCal > 0 ? 'text-emerald-600' : 'text-gray-700',
                  },
                ].map(({ icon: Icon, iconColor, label, val, unit, valColor }, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-center py-3 px-2 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      {Icon && <Icon className={`w-3 h-3 ${iconColor} shrink-0`} />}
                      <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest truncate">{label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm font-black leading-none ${valColor || 'text-gray-800'}`}>{val}</span>
                      {unit && <span className="text-[9px] text-gray-400 font-semibold">{unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-DAY HISTORY CARDS */}
          <div className="bg-[#fffdf0] rounded-[2rem] border border-amber-100/60 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#B5E361] to-[#8CB33D] rounded-full" />
              <h2 className="text-base font-black text-[#112308] tracking-tight">Lịch sử calo (7 ngày qua)</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#B5E361]/25 to-transparent" />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const isToday = idx === 6;
                const r = target > 0 && day.calories > 0 ? day.calories / target : 0;
                const isOver = r > 1.05, isGood = r >= 0.7 && r <= 1.05;
                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day.date)}
                    className={`relative p-3 rounded-2xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md select-none
                      ${isToday
                        ? 'bg-gradient-to-br from-[#e8f9c0] to-[#c9ea5b] border-[#B5E361]/50 shadow-sm'
                        : 'bg-amber-50/50 border-amber-100/60 hover:bg-amber-50 hover:border-amber-200/60'}`}
                  >
                    {isToday && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#6aaa12]" />}
                    <span className={`text-[9px] font-black tracking-wide ${isToday ? 'text-[#2d5200]' : 'text-gray-400'}`}>
                      {day.date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </span>
                    <span className={`text-base font-black leading-none ${isToday ? 'text-[#1f3b00]' : 'text-gray-800'}`}>
                      {day.date.getDate()}
                    </span>
                    {day.calories > 0 ? (
                      <span className={`text-[9px] font-black leading-none text-center ${
                        isToday ? 'text-[#2d5200]' : isOver ? 'text-orange-500' : isGood ? 'text-emerald-600' : 'text-gray-400'
                      }`}>
                        {day.calories >= 1000 ? `${(day.calories / 1000).toFixed(1)}k` : day.calories}
                        <span className="block text-[7px] opacity-60 font-semibold">kcal</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-300 font-bold">--</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BMI SCALE */}
          <div className="bg-[#fffdf0] rounded-[2rem] border border-amber-100/60 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#B5E361] to-[#8CB33D] rounded-full" />
              <h2 className="text-base font-black text-[#112308] tracking-tight">Thang đo BMI</h2>
              {metrics.bmi && (
                <span className={`ml-auto text-[9px] px-2.5 py-1 rounded-full font-black ${
                  metrics.bmiStatus === 'Normal' ? 'bg-green-100 text-green-700' :
                  metrics.bmiStatus === 'Underweight' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>BMI {metrics.bmi} · {getBmiLabel(metrics.bmiStatus)}</span>
              )}
            </div>
            <div className="relative mt-8 pt-8 pb-4 mb-2">
              {metrics.bmi && (
                <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${getBmiPct(metrics.bmi)}%` }}>
                  <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md whitespace-nowrap animate-bounce">
                    {metrics.bmi}
                  </span>
                  <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                </div>
              )}
              <div className="w-full h-3.5 rounded-full flex overflow-hidden relative">
                <div style={{ width: '17.5%' }} className="bg-blue-300 h-full" />
                <div style={{ width: '32.5%' }} className="bg-green-400 h-full" />
                <div style={{ width: '25%' }}   className="bg-orange-300 h-full" />
                <div style={{ width: '25%' }}   className="bg-red-400 h-full" />
                {metrics.bmi && (
                  <div className="absolute top-[-5px] bottom-[-5px] w-[3px] bg-gray-900 rounded"
                    style={{ left: `calc(${getBmiPct(metrics.bmi)}% - 1.5px)` }} />
                )}
              </div>
              <div className="relative text-[9px] font-bold mt-3 h-8">
                {[
                  { pos: '0%',    val: '15',   label: 'Rất gầy' },
                  { pos: '17.5%', val: '18.5', label: 'Bình thường' },
                  { pos: '50%',   val: '25',   label: 'Thừa cân' },
                  { pos: '75%',   val: '30',   label: 'Béo phì' },
                  { pos: '100%',  val: '35+',  label: 'Nguy hiểm' },
                ].map(({ pos, val, label }) => (
                  <div key={pos} className="absolute -translate-x-1/2 text-center" style={{ left: pos }}>
                    <span className="block font-black text-gray-700 text-[9px]">{val}</span>
                    <span className="text-[7.5px] text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-5">
              {[
                { label: 'Thiếu cân',   range: '< 18.5',      cls: 'bg-blue-50 text-blue-600 border-blue-100' },
                { label: 'Bình thường', range: '18.5 – 24.9', cls: 'bg-green-50 text-green-700 border-green-100' },
                { label: 'Thừa cân',    range: '25 – 29.9',   cls: 'bg-orange-50 text-orange-700 border-orange-100' },
                { label: 'Béo phì',     range: '≥ 30',        cls: 'bg-red-50 text-red-600 border-red-100' },
              ].map(({ label, range, cls }) => (
                <span key={label} className={`text-[9px] font-black px-2 py-1 rounded-full border ${cls}`}>
                  {label} <span className="opacity-60">({range})</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ──────────────────────── */}
        <div className="col-span-1 flex flex-col gap-4">

          {/* HERO CARD */}
          <div className="relative bg-gradient-to-br from-[#c5eb56] via-[#9bcf26] to-[#65a812] rounded-[1.75rem] p-5 overflow-hidden shadow-xl shadow-green-200/70 group">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-black/8 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-4">
              {/* label + status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                    <Target className="text-white w-4 h-4" />
                  </div>
                  <span className="text-[#1a3800]/70 font-black text-[9px] uppercase tracking-widest leading-tight">Mục tiêu<br/>hôm nay</span>
                </div>
                <span className={`text-[8px] font-black px-2 py-1 rounded-full border backdrop-blur-sm ${statusMap[status].cls}`}>
                  {statusMap[status].label}
                </span>
              </div>

              {/* big number */}
              <div>
                <p className="text-white/55 text-[10px] font-semibold mb-0.5">Đã nạp hôm nay</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white leading-none tracking-tight">
                    {todayCal.toLocaleString()}
                  </span>
                  <span className="text-white/45 text-xs font-bold">kcal</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-white/40 text-[10px] font-semibold">mục tiêu:</span>
                  <span className="text-white/80 text-[10px] font-black">{target.toLocaleString()} kcal</span>
                </div>
              </div>

              {/* progress */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[#1a3800]/55 text-[8px] font-black uppercase tracking-wider">Tiến trình</span>
                  <span className="text-white text-[9px] font-black">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-black/15 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: progress >= 100 ? 'linear-gradient(90deg,#fb923c,#ef4444)' : 'rgba(255,255,255,0.9)',
                      boxShadow: '0 0 8px rgba(255,255,255,0.5)'
                    }} />
                </div>
                <p className="text-[#1a3800]/50 text-[9px] mt-1.5 font-semibold">
                  Mục tiêu: <span className="text-[#1a3800]/80 font-black">{getGoalLabel(healthData.goal)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* STAT CARDS — stacked vertically */}
          {stats.map(({ icon: Icon, bg, color, label, value, unit, badge, valueColor }) => (
            <div key={label} className="bg-[#fffdf0] rounded-[1.5rem] border border-amber-100/60 shadow-sm px-4 py-3.5 flex items-center gap-3 hover:shadow-md hover:border-amber-200/60 transition-all group">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8.5px] text-gray-400 font-black uppercase tracking-widest mb-0.5">{label}</p>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className={`text-2xl font-black leading-none ${valueColor || 'text-gray-900'}`}>{value}</span>
                  {unit && <span className="text-[9px] text-gray-400 font-semibold">{unit}</span>}
                </div>
                {badge && (
                  <span className={`inline-block mt-1 text-[8px] px-1.5 py-0.5 rounded-full font-black ${badge.cls}`}>
                    {badge.text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── DAY DETAIL MODAL ──────────────────── */}
      {selectedDayDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#fcfdfa] to-[#f5fbf0]">
              <div>
                <h4 className="text-base font-extrabold text-[#1f3b00]">
                  {selectedDayDetail.date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </h4>
                <p className="text-xs text-green-600 font-semibold mt-0.5">Chi tiết bữa ăn trong ngày</p>
              </div>
              <button onClick={() => setSelectedDayDetail(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
              {selectedDayDetail.meals.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                    <UtensilsCrossed size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Chưa có món ăn nào</p>
                    <p className="text-xs text-gray-400 mt-0.5">Lịch ăn uống ngày này đang trống.</p>
                  </div>
                </div>
              ) : selectedDayDetail.meals.map((meal, idx) => {
                const mealIcons = { breakfast: <Coffee className="text-[#8CB33D]" size={13} />, lunch: <Utensils className="text-orange-500" size={13} />, snack: <Cookie className="text-yellow-600" size={13} />, dinner: <UtensilsCrossed className="text-blue-500" size={13} /> };
                const mealLabels = { breakfast: 'Bữa sáng', lunch: 'Bữa trưa', snack: 'Bữa phụ', dinner: 'Bữa tối' };
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/60 border border-gray-100 rounded-2xl hover:border-[#B5E361]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-white border border-gray-100">
                        {meal.image_url
                          ? <img src={meal.image_url} alt={meal.food_name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={16} /></div>}
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-gray-400 bg-white px-1.5 py-0.5 rounded-md mb-1 border border-gray-100">
                          {mealIcons[meal.meal_type]} {mealLabels[meal.meal_type] || meal.meal_type}
                        </span>
                        <p className="font-extrabold text-sm text-gray-800 leading-tight">{meal.food_name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#8CB33D] block">{meal.calories} kcal</span>
                      <span className="text-[9px] text-gray-400 font-bold">{Math.round(meal.carbs)}C · {Math.round(meal.protein)}P · {Math.round(meal.fat)}F</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedDayDetail.meals.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-[#fafdf6]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Tổng dinh dưỡng</span>
                  <span className="text-base font-black text-[#1f3b00]">
                    {selectedDayDetail.meals.reduce((s, m) => s + Number(m.calories || 0), 0)} kcal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Carb',    key: 'carbs',   color: 'text-orange-500' },
                    { label: 'Protein', key: 'protein', color: 'text-blue-500' },
                    { label: 'Fat',     key: 'fat',     color: 'text-red-500' },
                  ].map(({ label, key, color }) => (
                    <div key={label} className="bg-white p-2 rounded-xl border border-gray-100">
                      <p className="text-[8px] text-gray-400 font-bold">{label}</p>
                      <p className={`text-xs font-black ${color}`}>{selectedDayDetail.meals.reduce((s, m) => s + Math.round(Number(m[key] || 0)), 0)}g</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
