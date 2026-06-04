import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import AddToMealPlanModal from '../components/AddToMealPlanModal';
import PageHeader from '../components/PageHeader';
import { ChefHat, Plus, Search, X, Check, Flame, Clock, Users, Trash2, Sparkles, Heart, SlidersHorizontal, RotateCcw } from 'lucide-react';

function MyRecipes() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'created', 'saved'
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToAddPlan, setPostToAddPlan] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Advanced Filter State
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('All'); // 'All', 'breakfast', 'lunch', 'dinner', 'snack'
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All', 'food', 'drink', 'snack', 'fruit'
  const [selectedHealthLevel, setSelectedHealthLevel] = useState('All'); // 'All', 'excellent', 'good', 'medium'
  const [selectedRating, setSelectedRating] = useState('All'); // 'All', '4.5', '4.0', '3.0'
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

  // Form State for new recipe creation
  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    image: '',
    prepTime: '',
    difficulty: 'Easy',
    tags: '',
    mealType: 'breakfast',
    category: 'food',
    healthLevel: 'medium'
  });
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', calories: '' }]);
  const [instructions, setInstructions] = useState(['']);

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts?tab=My Recipes&search=${searchQuery}`);
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
      const res = await fetch(`http://localhost:5000/api/posts/${recipeId}/like`, { method: 'POST' });
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
      const res = await fetch(`http://localhost:5000/api/posts/${recipeId}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRecipes(recipes.map(r => r.id === recipeId ? { ...r, isSaved: data.isSaved } : r));
      }
    } catch (e) {
      console.error('Error saving recipe:', e);
    }
  };

  const handleFormInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngs = [...ingredients];
    newIngs[index][field] = value;
    setIngredients(newIngs);
  };

  const handleInstructionChange = (index, value) => {
    const newInsts = [...instructions];
    newInsts[index] = value;
    setInstructions(newInsts);
  };

  const addIngredientRow = () => setIngredients([...ingredients, { name: '', amount: '', calories: '' }]);
  const removeIngredientRow = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  const addInstructionRow = () => setInstructions([...instructions, '']);
  const removeInstructionRow = (index) => setInstructions(instructions.filter((_, i) => i !== index));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodName.trim()) return;

    setLoading(true);
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    const totalCal = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);

    const newRecipeData = {
      ...formData,
      tags: tagsArray,
      ingredients: ingredients.filter(i => i.name),
      instructions: instructions.filter(i => i),
      calories: totalCal,
      isRecipe: true
    };

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipeData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã tạo công thức thành công! 🎉');
        setIsCreateModalOpen(false);
        setFormData({
          foodName: '',
          description: '',
          image: '',
          prepTime: '',
          difficulty: 'Easy',
          tags: '',
          mealType: 'breakfast',
          category: 'food',
          healthLevel: 'medium'
        });
        setIngredients([{ name: '', amount: '', calories: '' }]);
        setInstructions(['']);
        fetchRecipes();
      } else {
        alert(data.message || 'Lỗi khi tạo công thức.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối tới server.');
    } finally {
      setLoading(false);
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
    const matchHealthLevel = selectedHealthLevel === 'All' || r.healthLevel === selectedHealthLevel;
    const matchRating = selectedRating === 'All' || parseFloat(r.rating || 0) >= parseFloat(selectedRating);

    return matchMealType && matchCategory && matchHealthLevel && matchRating;
  });

  const totalCaloriesCount = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);

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
              onClick={() => setIsCreateModalOpen(true)}
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
                {(selectedMealType !== 'All' || selectedCategory !== 'All' || selectedHealthLevel !== 'All' || selectedRating !== 'All') && (
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

                    {/* Row 5: Action Reset Button */}
                    {(selectedMealType !== 'All' || selectedCategory !== 'All' || selectedHealthLevel !== 'All' || selectedRating !== 'All') && (
                      <div className="flex justify-end pt-3 border-t border-dashed border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMealType('All');
                            setSelectedCategory('All');
                            setSelectedHealthLevel('All');
                            setSelectedRating('All');
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
              onClick={() => setIsCreateModalOpen(true)}
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

      {/* Create Recipe Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[28px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3 shrink-0">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-green-600 animate-pulse" /> Tạo công thức nấu ăn mới
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Tên món ăn *</label>
                  <input
                    type="text"
                    name="foodName"
                    value={formData.foodName}
                    onChange={handleFormInputChange}
                    placeholder="Ví dụ: Salad ức gà, Bún chả..."
                    required
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361]"
                  />
                </div>

                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Đường dẫn hình ảnh (URL)</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleFormInputChange}
                    placeholder="Nhập liên kết ảnh (Tùy chọn)..."
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361]"
                  />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Mô tả công thức</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormInputChange}
                  placeholder="Nhập mô tả ngắn gọn về món ăn..."
                  rows="2"
                  className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Thời gian nấu</label>
                  <input
                    type="text"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleFormInputChange}
                    placeholder="VD: 25 phút"
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361]"
                  />
                </div>

                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Độ khó</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleFormInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] bg-white cursor-pointer"
                  >
                    <option value="Easy">Dễ (Easy)</option>
                    <option value="Medium">Trung bình (Medium)</option>
                    <option value="Hard">Khó (Hard)</option>
                  </select>
                </div>

                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Nhãn dán (cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleFormInputChange}
                    placeholder="VD: Ít Calo, Giàu đạm, Chay..."
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361]"
                  />
                </div>
              </div>

              {/* Advanced recipe options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Bữa ăn đề xuất</label>
                  <select
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleFormInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] bg-white cursor-pointer"
                  >
                    <option value="breakfast">🍳 Bữa sáng (Breakfast)</option>
                    <option value="lunch">🍲 Bữa trưa (Lunch)</option>
                    <option value="snack">🍪 Bữa phụ (Snack)</option>
                    <option value="dinner">🌃 Bữa tối (Dinner)</option>
                  </select>
                </div>

                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Phân loại chi tiết</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] bg-white cursor-pointer"
                  >
                    <option value="food">🍲 Đồ ăn (Food)</option>
                    <option value="drink">🥤 Đồ uống (Drink)</option>
                    <option value="snack">🍪 Ăn vặt (Snack)</option>
                    <option value="fruit">🍎 Hoa quả (Fruit)</option>
                  </select>
                </div>

                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">Tốt cho sức khỏe</label>
                  <select
                    name="healthLevel"
                    value={formData.healthLevel}
                    onChange={handleFormInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] bg-white cursor-pointer"
                  >
                    <option value="excellent">🟢 Rất tốt</option>
                    <option value="good">🟡 Tốt</option>
                    <option value="medium">🟠 Bình thường</option>
                  </select>
                </div>
              </div>

              {/* Ingredients List Builder */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider pl-1">Danh sách nguyên liệu chi tiết</span>
                  <button
                    type="button"
                    onClick={addIngredientRow}
                    className="text-[10px] font-black text-green-600 hover:text-green-700"
                  >
                    + THÊM DÒNG
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Tên nguyên liệu (VD: Ức gà)"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                        required
                        className="flex-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361] min-w-0"
                      />
                      <input
                        type="text"
                        placeholder="Định lượng (VD: 150g)"
                        value={ing.amount}
                        onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361] min-w-0"
                      />
                      <input
                        type="number"
                        placeholder="Calo"
                        value={ing.calories}
                        onChange={(e) => handleIngredientChange(idx, 'calories', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361] min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredientRow(idx)}
                        disabled={ingredients.length <= 1}
                        className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 text-right text-xs font-bold text-gray-600">
                  Tổng Calo ước tính: <span className="text-sm font-black text-green-600">{totalCaloriesCount} kcal</span>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider pl-1">Các bước chế biến</span>
                  <button
                    type="button"
                    onClick={addInstructionRow}
                    className="text-[10px] font-black text-green-600 hover:text-green-700"
                  >
                    + THÊM BƯỚC
                  </button>
                </div>

                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {instructions.map((inst, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-xs font-black text-gray-400 mt-2.5 w-4">{idx + 1}.</span>
                      <textarea
                        placeholder="Mô tả bước làm này..."
                        value={inst}
                        onChange={(e) => handleInstructionChange(idx, e.target.value)}
                        required
                        rows="1"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361] resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeInstructionRow(idx)}
                        disabled={instructions.length <= 1}
                        className="p-1.5 text-gray-300 hover:text-red-500 mt-1 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-extrabold text-sm text-gray-700 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-[#1f3b00] hover:scale-[1.02] active:scale-[0.98] rounded-xl font-extrabold text-sm transition-all shadow-sm shadow-[#B5E361]/10"
                >
                  {loading ? 'Đang tạo...' : 'Tạo công thức'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRecipes;
