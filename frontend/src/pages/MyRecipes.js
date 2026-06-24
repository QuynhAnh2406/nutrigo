import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import MealDetailModal from '../components/MealDetailModal';
import AddToMealPlanModal from '../components/AddToMealPlanModal';
import PageHeader from '../components/PageHeader';
import { BookOpen, Plus, Search, SlidersHorizontal, RotateCcw, Trash2 } from 'lucide-react';

function MyRecipes() {
  const navigate = useNavigate();
  const { healthData } = useOutletContext();

  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPost, setSelectedPost] = useState(null);
  const [postToAddPlan, setPostToAddPlan] = useState(null);
  const [recipeToEdit, setRecipeToEdit] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const confirmDeleteRecipe = async () => {
    if (!recipeToDelete) return;
    try {
      const res = await fetch(`http://localhost:5002/api/recipes/${recipeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setRecipes(recipes.filter(r => r.id !== recipeToDelete.id));
        setRecipeToDelete(null);
      } else {
        alert(data.message || 'Xóa thất bại');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối server');
    }
  };

  const handleCreateRecipe = () => {
    if (!healthData || !healthData.weight || !healthData.height || !healthData.dateOfBirth) {
      alert("Vui lòng hoàn thiện hồ sơ cá nhân (ngày sinh, chiều cao, cân nặng,...) trước khi tạo công thức mới!");
      navigate('/profile?tab=Edit');
      return;
    }
    navigate('/my-recipes/create');
  };

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
      const res = await fetch(`http://localhost:5002/api/recipes?tab=My Recipes`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRecipes(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch recipes:', e);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Helper to remove Vietnamese tones for searching
  const removeTones = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  };

  // Filter recipes based on advanced filters and search query
  const filteredRecipes = recipes.filter(r => {

    // Advanced Filters
    const matchMealType = selectedMealType === 'All' || r.mealType === selectedMealType;
    const matchCategory = selectedCategory === 'All' || r.category === selectedCategory;

    if (!matchMealType || !matchCategory) return false;

    // Search Query Filter
    if (searchQuery) {
      const normalizedSearch = removeTones(searchQuery);
      const name = removeTones(r.foodName);
      const desc = removeTones(r.description);
      return name.includes(normalizedSearch) || desc.includes(normalizedSearch);
    }

    return true;
  });

  return (
    <div className="my-recipes-page main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
      <div className="mb-2 relative z-30">
        <PageHeader
          title="Công thức của tôi"
          subtitle="Nơi lưu giữ và sáng tạo những bữa ăn tuyệt vời mang đậm phong cách cá nhân."
          icon={BookOpen}
          badge={`${filteredRecipes.length} công thức`}
          actions={
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all hover:bg-black hover:scale-105 active:scale-95"
              onClick={handleCreateRecipe}
            >
              <Plus className="h-4 w-4" />
              Tạo công thức mới
            </button>
          }
        >
          <div className="relative w-full flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600 z-10" />
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



      {/* Recipe Grid */}
      <div className="feed-container mt-2">
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                post={recipe}
                onOpenDetail={(p) => setSelectedPost(p)}
                onAddToPlan={(p) => {
                  if (!healthData.weight || !healthData.height || !healthData.dateOfBirth) {
                    alert("Vui lòng hoàn thiện hồ sơ cá nhân (ngày sinh, chiều cao, cân nặng) trước khi thêm thực đơn!");
                    navigate('/profile?tab=Edit');
                    return;
                  }
                  setPostToAddPlan(p);
                }}
                onEdit={(p) => setRecipeToEdit(p)}
                onDelete={(p) => setRecipeToDelete(p)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-[24px] border border-gray-100/80 shadow-sm">
            <span className="text-3xl mb-3">🍳</span>
            <h4 className="font-extrabold text-gray-800 text-base mb-1">Chưa có công thức nào</h4>
            <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed mb-4">
              Bạn chưa có công thức nào. Hãy tự tạo công thức của riêng bạn ngay bây giờ!
            </p>
            <button
              onClick={handleCreateRecipe}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all"
            >
              + Tạo công thức đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Detail, Edit and Add to Plan Modals */}
      {selectedPost && (
        <MealDetailModal
          meal={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={() => {
            setRecipeToDelete(selectedPost);
            setSelectedPost(null);
          }}
          onSaveSuccess={() => {
            fetchRecipes();
            setSelectedPost(null);
          }}
        />
      )}

      {recipeToEdit && (
        <MealDetailModal
          meal={recipeToEdit}
          initialIsEditing={true}
          onClose={() => setRecipeToEdit(null)}
          onDelete={() => {
            setRecipeToDelete(recipeToEdit);
            setRecipeToEdit(null);
          }}
          onSaveSuccess={() => {
            fetchRecipes();
            setRecipeToEdit(null);
          }}
        />
      )}

      {recipeToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1f3b00]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#B5E361]/30 p-8 w-[90%] max-w-md text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-[#EAF7D5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 className="text-[#3d6600]" size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-[#1f3b00] mb-3 uppercase tracking-wide">Xóa công thức?</h3>
            <p className="text-gray-600 mb-8 font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa công thức <span className="font-extrabold text-[#3d6600]">{recipeToDelete.foodName || recipeToDelete.name}</span> không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setRecipeToDelete(null)}
                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                Trở lại
              </button>
              <button
                onClick={confirmDeleteRecipe}
                className="flex-1 px-6 py-3.5 rounded-2xl font-black text-[#1f3b00] bg-[#B5E361] hover:bg-[#a3d14f] shadow-lg shadow-[#B5E361]/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
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
