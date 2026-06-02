import React, { useState, useEffect } from 'react';
import { Heart, Search, CalendarPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Favourites() {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts');
      const data = await res.json();
      if (data.success) {
        // Filter only saved items and map a mock mealType based on id for demo purposes
        const savedPosts = data.data.filter(p => p.isSaved).map(p => {
          let mealType = 'Breakfast';
          if (p.id % 3 === 0) mealType = 'Lunch';
          else if (p.id % 2 === 0) mealType = 'Dinner';
          return { ...p, mealType };
        });
        setFavorites(savedPosts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (postId) => {
    try {
      await fetch(`http://localhost:5000/api/posts/${postId}/favorite`, { method: 'POST' });
      setFavorites(favorites.filter(f => f.id !== postId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAllToMealPlan = async () => {
    if (favorites.length === 0) {
      alert("Bạn chưa có món ăn yêu thích nào!");
      return;
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let dayIndex = 0;

    for (let fav of favorites) {
      await fetch('http://localhost:5000/api/mealplan/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          day: days[dayIndex % 7], 
          mealType: fav.mealType.toLowerCase(), 
          recipeId: fav.id 
        })
      });
      dayIndex++;
    }
    alert("Đã thêm tất cả món ăn yêu thích vào Lịch ăn uống tuần này!");
  };

  const getFilterLabel = (filter) => {
    switch(filter) {
      case 'All': return 'Tất cả';
      case 'Breakfast': return 'Bữa sáng';
      case 'Lunch': return 'Bữa trưa';
      case 'Dinner': return 'Bữa tối';
      default: return filter;
    }
  };

  const filteredFavorites = favorites.filter(f => {
    const matchSearch = f.foodName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'All' || f.mealType === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="main-content favourites-page">
      <div className="mb-8">
        <PageHeader
          title="Món ăn yêu thích"
          subtitle="Các món ăn bạn đã lưu, sẵn sàng thêm vào lịch ăn uống tuần này."
          icon={Heart}
          badge={`${favorites.length} đã lưu`}
          actions={
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-black"
              onClick={handleAddAllToMealPlan}
            >
              <CalendarPlus className="h-4 w-4" />
              Thêm tất cả vào Lịch ăn
            </button>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn yêu thích..."
                className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pl-12 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-500 outline-none ring-0 backdrop-blur focus:border-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', 'Breakfast', 'Lunch', 'Dinner'].map((filter) => (
                <button
                  key={filter}
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 transition-colors ${
                    activeFilter === filter
                      ? 'bg-gray-900 text-white ring-gray-900'
                      : 'bg-white/70 text-gray-800 ring-white/70 hover:bg-white'
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {getFilterLabel(filter)}
                </button>
              ))}
            </div>
          </div>
        </PageHeader>
      </div>

      <div className="favourites-grid">
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map(fav => (
            <div key={fav.id} className="fav-card">
              <div className="fav-image-wrapper">
                <img src={fav.image} alt={fav.foodName} className="fav-image" />
                <span className="fav-meal-badge">{getFilterLabel(fav.mealType)}</span>
                <button className="btn-remove-fav" onClick={() => handleRemove(fav.id)}>✕</button>
              </div>
              <div className="fav-info">
                <h3>{fav.foodName}</h3>
                <div className="fav-stats">
                  <span>🔥 {fav.calories} kcal</span>
                  <span>⏱ {fav.prepTime}</span>
                </div>
                <div className="fav-macros text-xs mt-2 text-gray-500">
                  {typeof fav.macros === 'string' 
                      ? fav.macros.replace(/g /g, '').replace(/• /g, '•') 
                      : fav.macros ? `${fav.macros.carbs}C • ${fav.macros.protein}P • ${fav.macros.fat}F` : ''}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">Không tìm thấy món ăn yêu thích nào phù hợp.</div>
        )}
      </div>
    </div>
  );
}

export default Favourites;
