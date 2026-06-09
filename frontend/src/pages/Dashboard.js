import React, { useState, useEffect } from 'react';
import { X, Heart, Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

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
      default: return goal || 'Duy trì cân nặng';
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

  const [posts, setPosts] = useState([]);
  const [nutritionDB, setNutritionDB] = useState({});
  const [weeklyPlan, setWeeklyPlan] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ 
    foodName: '', 
    calories: 0, 
    macros: '', 
    recipe: '', 
    author: '@current_user',
    ingredients: [{ name: '', weight: '' }]
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        const weekStartStr = monday.toISOString().split('T')[0];

        const [ingRes, postRes, mealPlanRes] = await Promise.all([
          fetch('http://localhost:5002/api/ingredients'),
          fetch('http://localhost:5002/api/posts'),
          fetch(`http://localhost:5002/api/mealplan?weekStart=${weekStartStr}`)
        ]);
        const ingData = await ingRes.json();
        const postData = await postRes.json();
        const mealPlanData = await mealPlanRes.json();
        
        if (ingData.success) setNutritionDB(ingData.data);
        if (postData.success) setPosts(postData.data);
        if (mealPlanData.success) setWeeklyPlan(mealPlanData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Automatically calculate total nutrition based on ingredients
  useEffect(() => {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    uploadData.ingredients.forEach(ing => {
      const data = nutritionDB[ing.name];
      const weight = parseFloat(ing.weight) || 0;
      if (data && weight > 0) {
        totalCal += (data.cal * weight) / 100;
        totalP += (data.p * weight) / 100;
        totalC += (data.c * weight) / 100;
        totalF += (data.f * weight) / 100;
      }
    });

    setUploadData(prev => ({
      ...prev,
      calories: Math.round(totalCal),
      macros: `${Math.round(totalC)}g C • ${Math.round(totalP)}g P • ${Math.round(totalF)}g F`
    }));
  }, [uploadData.ingredients, nutritionDB]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.foodName || !uploadData.calories || !uploadData.recipe) return;
    
    try {
      const response = await fetch('http://localhost:5002/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadData)
      });
      const result = await response.json();
      
      if (result.success) {
        setPosts([result.data, ...posts]);
        setIsUploading(false);
        setUploadData({ 
          foodName: '', 
          calories: 0, 
          macros: '', 
          recipe: '', 
          author: '@current_user',
          ingredients: [{ name: '', weight: '' }]
        });
      }
    } catch (error) {
      console.error('Error uploading meal:', error);
    }
  };

  const addIngredient = () => {
    setUploadData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', weight: '' }]
    }));
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...uploadData.ingredients];
    newIngredients[index][field] = value;
    setUploadData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index) => {
    if (uploadData.ingredients.length === 1) return;
    const newIngredients = uploadData.ingredients.filter((_, i) => i !== index);
    setUploadData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const toggleExpand = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const quotes = [
    "Bắt đầu ngày mới với năng lượng tích cực!",
    "Sức khỏe là vốn quý nhất.",
    "Ăn uống lành mạnh, sống vui khỏe mỗi ngày.",
    "Cơ thể bạn là những gì bạn ăn.",
    "Hôm nay là một ngày tuyệt vời để bắt đầu sống khỏe mạnh."
  ];
  const quote = quotes[time.getDay() % quotes.length];

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

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      calories: i === 0 ? todayCalories : Math.floor(Math.random() * 500) + 1800
    });
  }

  return (
    <div className="main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
      {/* Modal Upload */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Modal content */}
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-2xl font-bold text-gray-900">Chia sẻ món ăn mới 🥘</h3>
              <button onClick={() => setIsUploading(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="flex flex-col flex-1 overflow-hidden">
               {/* Modal Form body */}
               <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                  <input 
                    type="text" 
                    placeholder="Tên món ăn" 
                    value={uploadData.foodName} 
                    onChange={e => setUploadData({...uploadData, foodName: e.target.value})} 
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none"
                    required 
                  />
                  <div className="space-y-3">
                    {uploadData.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2">
                        <select value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)} className="flex-1 px-4 py-2 border rounded-xl outline-none" required>
                          <option value="">Nguyên liệu...</option>
                          {Object.keys(nutritionDB).map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <input type="number" placeholder="Gam (g)" value={ing.weight} onChange={e => updateIngredient(idx, 'weight', e.target.value)} className="w-24 px-4 py-2 border rounded-xl outline-none" required />
                        <button type="button" onClick={() => removeIngredient(idx)} className="text-red-500">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={addIngredient} className="text-blue-500 text-sm font-bold">+ Thêm nguyên liệu</button>
                  </div>
                  <textarea 
                    placeholder="Hướng dẫn thực hiện..." 
                    value={uploadData.recipe} 
                    onChange={e => setUploadData({...uploadData, recipe: e.target.value})} 
                    className="w-full h-32 px-5 py-3 border rounded-xl outline-none resize-none"
                    required
                  />
               </div>
               <div className="pt-6 flex gap-3 shrink-0">
                  <button type="button" onClick={() => setIsUploading(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Hủy</button>
                  <button type="submit" className="flex-1 py-3 bg-[#B5E361] rounded-xl font-bold">Đăng</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Header / Date */}
      <div className="mb-8">
        <PageHeader
          title={time.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          subtitle="Bắt đầu ngày mới tràn đầy năng lượng cùng Nutrigo!"
          actions={
            <div className="rounded-full bg-white/55 px-4 py-2 text-sm font-extrabold text-[#1f3b00] ring-1 ring-white/60 backdrop-blur">
              🕒 {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">🎯</div>
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
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl">⚡</div>
            <div>
              <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">TDEE</span>
              <strong className="text-xl text-gray-900">{metrics.tdee || '--'} <small className="text-[10px] opacity-40">kcal</small></strong>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center gap-4 hover:border-orange-200 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl">🔥</div>
            <div>
              <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">BMR</span>
              <strong className="text-xl text-gray-900">{metrics.bmr || '--'} <small className="text-[10px] opacity-40">kcal</small></strong>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">⚖️</div>
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
          <h4 className="font-bold mb-4">Thang đo BMI</h4>
          <div className="w-full h-4 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-500 relative">
              <div 
                  className="absolute top-[-8px] w-1 h-8 bg-black rounded" 
                  style={{ left: `${Math.min(Math.max((metrics.bmi - 15) * 4, 0), 100)}%` }}
              ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>15</span>
              <span>18.5 (Bình thường)</span>
              <span>25 (Thừa cân)</span>
              <span>40</span>
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

      {/* Community Section Header */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h3 className="section-title mb-0 flex items-center gap-2">🌏 Công thức từ Cộng đồng</h3>
        <button onClick={() => setIsUploading(true)} className="px-4 py-2 bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-[#1f3b00] font-extrabold rounded-2xl text-xs shadow-sm hover:scale-105 active:scale-95 transition-all">Chia sẻ món ăn</button>
      </div>

      {/* Community Horizontal List */}
      <div className="menu-list" style={{ overflowY: 'visible', paddingBottom: '40px' }}>
        <div className="flex flex-row gap-5 overflow-x-auto pb-10 pt-2 px-1 snap-x no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {posts.map(post => (
            <div key={post.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm w-[260px] shrink-0 snap-center relative hover:shadow-md hover:border-green-100 transition-all duration-300 animate-in fade-in-50 duration-500">
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">{post.author === '@current_user' ? '😎' : '👩‍🍳'}</div>
                  <div className="text-[12px] font-bold">{post.author === '@current_user' ? 'Bạn' : post.author}</div>
                </div>
                <div className="flex gap-1">
                  <Heart className="w-4 h-4 text-gray-300" />
                  <Bookmark className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Image/Emoji Area */}
              <div className="px-4 pb-2">
                <div className="w-full h-[120px] bg-gray-50 rounded-2xl flex items-center justify-center relative">
                   <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      <div className="bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-black text-orange-600 border border-orange-50 shadow-sm">{post.calories} KCAL</div>
                      <div className="bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-black text-blue-600 border border-blue-50 shadow-sm">
                        {typeof post.macros === 'string' 
                          ? post.macros.replace(/g /g, '').replace(/• /g, '•') 
                          : post.macros ? `${post.macros.carbs}C • ${post.macros.protein}P • ${post.macros.fat}F` : ''}
                      </div>
                   </div>
                   <div className="text-[50px]">{post.foodName.toLowerCase().includes('chicken') ? '🍗' : post.foodName.toLowerCase().includes('bowl') ? '🥗' : '🥑'}</div>
                   <div className="absolute bottom-2 right-2 text-[10px] bg-white/90 px-2 py-0.5 rounded-full font-bold">⭐ {post.rating}</div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 pt-1">
                <h4 className="text-[14px] font-bold h-[2.8em] overflow-hidden line-clamp-2 leading-tight">{post.foodName}</h4>
                
                {post.isExpanded && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl text-[11px] max-h-[100px] overflow-y-auto italic">
                    {post.recipe}
                  </div>
                )}

                <button 
                  onClick={() => toggleExpand(post.id)} 
                  className={`w-full mt-3 py-2 rounded-lg text-[10px] font-bold transition-all ${post.isExpanded ? 'bg-gray-100' : 'bg-gray-900 text-white'}`}
                >
                  {post.isExpanded ? 'ĐÓNG' : 'XEM CÔNG THỨC'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
