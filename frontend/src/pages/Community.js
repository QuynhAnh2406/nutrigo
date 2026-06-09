import React, { useState, useEffect, useCallback } from 'react';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import AddToMealPlanModal from '../components/AddToMealPlanModal';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('For You');
  
  // Advanced Filter State
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHealthLevel, setSelectedHealthLevel] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedCalories, setSelectedCalories] = useState('All');
  const popoverContainerRef = React.useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToAddPlan, setPostToAddPlan] = useState(null);

  const tabs = [
    { value: 'For You', label: 'Dành cho bạn' },
    { value: 'Latest', label: 'Mới nhất' },
    { value: 'Món Ăn Của Tôi', label: 'Món ăn của tôi' },
    { value: 'Following', label: 'Đang theo dõi' },
    { value: 'Popular', label: 'Phổ biến' }
  ];

  const fetchPosts = useCallback(async () => {
    try {
      let url = `http://localhost:5002/api/posts?tab=${activeTab}&search=${searchQuery}`;
      const res = await fetch(url);
      const data = await res.json();
      if(data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverContainerRef.current && !popoverContainerRef.current.contains(event.target)) {
        setShowAdvancedFilter(false);
      }
    }
    if (showAdvancedFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvancedFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${postId}/like`, { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: data.isLiked, likes: data.likes } : p));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSave = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${postId}/favorite`, { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        setPosts(posts.map(p => p.id === postId ? { ...p, isSaved: data.isSaved } : p));
      }
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <div className="community-page main-content">
      <div className="mb-8 relative z-30">
        <PageHeader
          title="Cộng đồng lành mạnh"
          subtitle="Khám phá các công thức nấu ăn, lưu món ăn yêu thích và lên lịch ăn uống hàng tuần."
          icon={Users}
          badge={`${posts.length} món ăn`}
          actions={
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all hover:bg-black hover:scale-105 active:scale-95"
              onClick={() => navigate('/community/create-post')}
            >
              <Plus className="h-4 w-4" />
              Đăng món ăn mới
            </button>
          }
        >
          <div className="relative w-full flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm công thức (VD: Salad, cá hồi...)"
                className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pl-12 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-500 outline-none ring-0 backdrop-blur focus:border-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative" ref={popoverContainerRef}>
              <button
                type="button"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={`h-full px-4 rounded-2xl border transition-all flex items-center gap-2 text-xs sm:text-sm font-extrabold ${showAdvancedFilter ? 'bg-[#B5E361] border-[#B5E361] text-[#1f3b00]' : 'border-white/70 bg-white/70 text-gray-700 hover:bg-white hover:border-white'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Bộ lọc nâng cao</span>
                {(selectedMealType !== 'All' || selectedCategory !== 'All' || selectedHealthLevel !== 'All' || selectedRating !== 'All' || selectedTag !== 'All' || selectedCalories !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* Advanced Filter Popover */}
              {showAdvancedFilter && (
                <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-[22px] border border-gray-150 shadow-xl p-5 animate-in fade-in-50 zoom-in-95 duration-200">
                  <div className="flex flex-col gap-4">
                    
                    {/* Row 1: Meal Type Filter */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Tag bữa ăn</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedMealType === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('breakfast')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedMealType === 'breakfast' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🍳 Sáng
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('lunch')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedMealType === 'lunch' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🍲 Trưa
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('snack')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedMealType === 'snack' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🍪 Phụ
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMealType('dinner')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedMealType === 'dinner' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🌃 Tối
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Category Filter */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Phân loại</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('food')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedCategory === 'food' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🍲 Đồ ăn
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('drink')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedCategory === 'drink' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🥤 Đồ uống
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('snack')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedCategory === 'snack' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🍪 Ăn vặt
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('fruit')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedCategory === 'fruit' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🍎 Hoa quả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('other')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedCategory === 'other' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Khác
                        </button>
                      </div>
                    </div>

                    {/* Row 3: Health Level Filter */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Tốt cho sức khỏe</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHealthLevel('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedHealthLevel === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedHealthLevel('excellent')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedHealthLevel === 'excellent' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🟢 Rất tốt
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedHealthLevel('good')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedHealthLevel === 'good' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🟡 Tốt
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedHealthLevel('medium')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedHealthLevel === 'medium' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          🟠 Bình thường
                        </button>
                      </div>
                    </div>

                    {/* Row 4: Rating Filter */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Đánh giá sao</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRating('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedRating === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRating('4.5')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedRating === '4.5' ? 'bg-yellow-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          ⭐ 4.5+
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRating('4.0')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedRating === '4.0' ? 'bg-yellow-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          ⭐ 4.0+
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRating('3.0')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${selectedRating === '3.0' ? 'bg-yellow-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          ⭐ 3.0+
                        </button>
                      </div>
                    </div>

                    {/* Row 5: Tags Filter */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Nhãn dán nổi bật</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTag('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedTag === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Tất cả
                        </button>
                        {['Ít calo', 'Giàu đạm', 'Ít Carb', 'Ăn chay', 'Keto', 'Dưới 15 phút', 'Dưới 30 phút'].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(tag)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedTag === tag ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Row 6: Calories Filter */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Lượng Calo</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCalories('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCalories === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalories('< 300')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCalories === '< 300' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          &lt; 300 kcal
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalories('300-500')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCalories === '300-500' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          300 - 500 kcal
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalories('500-700')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCalories === '500-700' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          500 - 700 kcal
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalories('> 700')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCalories === '> 700' ? 'bg-[#B5E361] text-[#1f3b00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          &gt; 700 kcal
                        </button>
                      </div>
                    </div>

                    {/* Row 7: Action Reset Button */}
                    {(selectedMealType !== 'All' || selectedCategory !== 'All' || selectedHealthLevel !== 'All' || selectedRating !== 'All' || selectedTag !== 'All' || selectedCalories !== 'All') && (
                      <div className="flex justify-end pt-3 border-t border-dashed border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMealType('All');
                            setSelectedCategory('All');
                            setSelectedHealthLevel('All');
                            setSelectedRating('All');
                            setSelectedTag('All');
                            setSelectedCalories('All');
                          }}
                          className="flex items-center gap-1 text-xs text-red-500 font-bold hover:text-red-700 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Đặt lại bộ lọc
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageHeader>
      </div>

      {/* TABS */}
      <div className="community-tabs">
        {tabs.map(t => (
          <button 
            key={t.value} 
            className={`tab-btn ${activeTab === t.value ? 'active' : ''}`}
            onClick={() => setActiveTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* FEED */}
      <div className="feed-container">
        {(() => {
          const filteredPosts = posts.filter(r => {
            const matchMealType = selectedMealType === 'All' || r.mealType === selectedMealType;
            const matchCategory = selectedCategory === 'All' || r.category === selectedCategory;
            const matchHealthLevel = selectedHealthLevel === 'All' || r.healthLevel === selectedHealthLevel;
            const matchRating = selectedRating === 'All' || parseFloat(r.rating || 0) >= parseFloat(selectedRating);
            const matchTag = selectedTag === 'All' || (r.tags && r.tags.includes(selectedTag));
            
            const matchCalories = (() => {
              if (selectedCalories === 'All') return true;
              const cal = parseFloat(r.calories || 0);
              if (selectedCalories === '< 300') return cal < 300;
              if (selectedCalories === '300-500') return cal >= 300 && cal <= 500;
              if (selectedCalories === '500-700') return cal > 500 && cal <= 700;
              if (selectedCalories === '> 700') return cal > 700;
              return true;
            })();

            return matchMealType && matchCategory && matchHealthLevel && matchRating && matchTag && matchCalories;
          });
          
          return filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={handleLike}
                onSave={handleSave}
                onOpenDetail={(p) => setSelectedPost(p)}
                onAddToPlan={(p) => setPostToAddPlan(p)}
              />
            ))
          ) : (
            <div className="empty-state">Không tìm thấy món ăn nào.</div>
          );
        })()}
      </div>

      {/* MODALS */}

      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

      {postToAddPlan && (
        <AddToMealPlanModal 
          post={postToAddPlan} 
          onClose={() => setPostToAddPlan(null)} 
        />
      )}
    </div>
  );
}

export default Community;
