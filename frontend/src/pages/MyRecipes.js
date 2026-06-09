import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import AddToMealPlanModal from '../components/AddToMealPlanModal';
import PageHeader from '../components/PageHeader';
import { ChefHat, Plus, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

function MyRecipes() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'created', 'saved'
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToAddPlan, setPostToAddPlan] = useState(null);

  // Advanced Filter State
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('All'); // 'All', 'breakfast', 'lunch', 'dinner', 'snack'
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All', 'food', 'drink', 'snack', 'fruit', 'other'
  const popoverContainerRef = useRef(null);

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

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts?tab=My Recipes&search=${searchQuery}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRecipes(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch recipes:', e);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleLike = async (recipeId) => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${recipeId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRecipes(recipes.map(r => r.id === recipeId ? { ...r, isLiked: data.isLiked, likes: data.likes } : r));
      }
    } catch (e) {
      console.error('Error liking recipe:', e);
    }
  };

  const handleSave = async (recipeId) => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${recipeId}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRecipes(recipes.map(r => r.id === recipeId ? { ...r, isSaved: data.isSaved } : r));
      }
    } catch (e) {
      console.error('Error saving recipe:', e);
    }
  };

  // Filter recipes based on active tab and advanced filters
  const filteredRecipes = recipes.filter(r => {
    const isOwn = r.user_id === (user ? user.id : 1);
    if (activeTab === 'created' && !isOwn) return false;
    if (activeTab === 'saved' && isOwn) return false;

    // Advanced Filters
    const matchMealType = selectedMealType === 'All' || r.mealType === selectedMealType;
    const matchCategory = selectedCategory === 'All' || r.category === selectedCategory;

    return matchMealType && matchCategory;
  });

  return (
    <div className="my-recipes-page main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
      <div className="mb-8 relative z-30">
        <PageHeader
          title="Công thức của tôi"
          subtitle="Quản lý và tạo mới các công thức nấu ăn lành mạnh của bạn để thêm vào thực đơn tuần."
          icon={ChefHat}
          badge={`${filteredRecipes.length} công thức`}
          actions={
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all hover:bg-black hover:scale-105 active:scale-95"
              onClick={() => navigate('/my-recipes/create')}
            >
              <Plus className="h-4 w-4" />
              Tạo công thức mới
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
                {(selectedMealType !== 'All' || selectedCategory !== 'All') && (
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

                    {/* Row 3: Action Reset Button */}
                    {(selectedMealType !== 'All' || selectedCategory !== 'All') && (
                      <div className="flex justify-end pt-3 border-t border-dashed border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMealType('All');
                            setSelectedCategory('All');
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

      {/* Tabs Switcher */}
      <div className="community-tabs">
        <button
          className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => setActiveTab('All')}
        >
          Tất cả công thức
          <span className="tab-btn-badge">{recipes.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Tự chế biến
          <span className="tab-btn-badge">{recipes.filter(r => r.user_id === (user ? user.id : 1)).length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Đã lưu từ cộng đồng
          <span className="tab-btn-badge">{recipes.filter(r => r.user_id !== (user ? user.id : 1)).length}</span>
        </button>
      </div>

      {/* Recipe Grid */}
      <div className="feed-container mt-6">
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
            {filteredRecipes.map(recipe => (
              <PostCard
                key={recipe.id}
                post={recipe}
                onLike={handleLike}
                onSave={handleSave}
                onOpenDetail={(p) => setSelectedPost(p)}
                onAddToPlan={(p) => setPostToAddPlan(p)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-[24px] border border-gray-100/80 shadow-sm">
            <span className="text-3xl mb-3">🍳</span>
            <h4 className="font-extrabold text-gray-800 text-base mb-1">Chưa có công thức nào</h4>
            <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed mb-4">
              Lưu bài đăng từ cộng đồng lành mạnh hoặc tự tạo công thức của riêng bạn ngay bây giờ!
            </p>
            <button
              onClick={() => navigate('/my-recipes/create')}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all"
            >
              + Tạo công thức đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Detail and Add to Plan Modals */}
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

export default MyRecipes;
