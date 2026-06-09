import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Flame, ShieldAlert, Sparkles, Scale, SlidersHorizontal, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const portionWeight = 100; // Fixed default portion weight
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  // Advanced Filter State and Ref
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All', 'food', 'drink', 'snack'
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    type: 'ingredient',
    serving_unit: '100g',
    category: 'food',
    brand_name: ''
  });

  const fetchIngredients = async () => {
    try {
      const res = await fetch('http://localhost:5002/api/mealplan/ingredients');
      const data = await res.json();
      if (data.success && data.data) {
        setIngredients(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch ingredients:', e);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5002/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          calories_per_100g: parseFloat(formData.calories) || 0,
          protein_per_100g: parseFloat(formData.protein) || 0,
          carbs_per_100g: parseFloat(formData.carbs) || 0,
          fat_per_100g: parseFloat(formData.fat) || 0,
          fiber_per_100g: parseFloat(formData.fiber) || 0,
          type: formData.type || 'ingredient',
          serving_unit: formData.type === 'brand' ? (formData.serving_unit || '1 phần') : '100g',
          category: formData.type === 'brand' ? (formData.category || 'food') : 'food',
          brand_name: formData.type === 'brand' ? (formData.brand_name || '') : null
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã thêm thực phẩm thành công! 🎉');
        setIsModalOpen(false);
        setFormData({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: '',
          type: 'ingredient',
          serving_unit: '100g',
          category: 'food',
          brand_name: ''
        });
        fetchIngredients();
      } else {
        alert(data.message || 'Lỗi khi thêm nguyên liệu.');
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối tới server.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered ingredients list
  const filteredIngredients = ingredients.filter(ing => {
    const matchSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab = activeTab === 'All' || (ing.type || 'ingredient') === activeTab;
    const matchCategory = selectedCategory === 'All' || (ing.category || 'food') === selectedCategory;
    
    // If activeTab is 'ingredient', don't filter by brand since raw ingredients don't have brand_name
    const matchBrand = activeTab === 'ingredient' || !brandSearchQuery.trim() ||
      (ing.brand_name && ing.brand_name.toLowerCase().includes(brandSearchQuery.toLowerCase()));
    return matchSearch && matchTab && matchCategory && matchBrand;
  });

  // Helper to calculate nutrient value based on current portion weight
  const calcVal = (val100g) => {
    const raw = (parseFloat(val100g || 0) * portionWeight) / 100;
    return Number(raw.toFixed(1));
  };

  return (
    <div className="ingredients-page main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
      <div className="mb-8 relative z-30">
        <PageHeader
          title="Tra cứu dinh dưỡng"
          subtitle="Tra cứu nhanh thông số Calo và chất dinh dưỡng của từng thực phẩm theo khối lượng phần ăn tùy chọn."
          icon={Scale}
          badge={`${ingredients.length} nguyên liệu`}
          actions={
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all hover:bg-black hover:scale-105 active:scale-95"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Thêm nguyên liệu mới
            </button>
          }
        >
          {/* Push Search bar up to PageHeader */}
          <div className="relative w-full flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm nguyên liệu (VD: Ức gà, Trứng...)"
                className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pl-12 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-500 outline-none ring-0 backdrop-blur focus:border-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative" ref={popoverContainerRef}>
              <button
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={`h-full px-4 rounded-2xl border transition-all flex items-center gap-2 text-xs sm:text-sm font-extrabold ${showAdvancedFilter ? 'bg-[#B5E361] border-[#B5E361] text-[#1f3b00]' : 'border-white/70 bg-white/70 text-gray-700 hover:bg-white hover:border-white'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Bộ lọc nâng cao</span>
                {(selectedCategory !== 'All' || brandSearchQuery.trim() !== '') && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* Advanced Filter Popover */}
              {showAdvancedFilter && (
                <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-[22px] border border-gray-150 shadow-xl p-5 animate-in fade-in-50 zoom-in-95 duration-200">
                  <div className="flex flex-col gap-4">
                    
                    {/* Row 1: Category Filter */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Phân loại chi tiết</span>
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
                      </div>
                    </div>

                    {/* Row 2: Brand Text Filter (only show if activeTab is not 'ingredient') */}
                    {activeTab !== 'ingredient' && (
                      <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Thương hiệu / Xuất xứ</span>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Nhập tên thương hiệu (VD: KFC...)"
                            value={brandSearchQuery}
                            onChange={(e) => setBrandSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-150 bg-gray-50/50 py-2.5 px-3 text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#B5E361] transition-all"
                          />
                          {brandSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setBrandSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Row 3: Action Buttons */}
                    {(selectedCategory !== 'All' || brandSearchQuery.trim() !== '') && (
                      <div className="flex justify-end pt-3 border-t border-dashed border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('All');
                            setBrandSearchQuery('');
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

      {/* Navigation Tabs */}
      <div className="community-tabs">
        <button 
          className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => setActiveTab('All')}
        >
          Tất cả 
          <span className="tab-btn-badge">{ingredients.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ingredient' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingredient')}
        >
          Nguyên liệu cơ bản 
          <span className="tab-btn-badge">{ingredients.filter(i => (i.type || 'ingredient') === 'ingredient').length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'brand' ? 'active' : ''}`}
          onClick={() => setActiveTab('brand')}
        >
          Thương hiệu / Đồ ăn ngoài 
          <span className="tab-btn-badge">{ingredients.filter(i => i.type === 'brand').length}</span>
        </button>
      </div>

      {/* Control Panel: Removed weight slider */}
      <div className="mb-6"></div>

      {/* Ingredients Grid */}
      {filteredIngredients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-50 duration-500">
          {filteredIngredients.map(ing => (
            <div key={ing.id} className="bg-white rounded-[22px] border border-gray-100/85 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#B5E361]/50 hover:scale-[1.01] flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-[#183000] text-base leading-snug truncate mb-3" title={ing.name}>
                  {ing.name}
                </h4>
                
                {/* Calories Display */}
                <div className="mb-4 bg-orange-50/20 border border-orange-100/30 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-[10px] text-orange-600 font-black uppercase tracking-wider flex items-center gap-1">
                    <Flame size={12} className="fill-orange-600" /> Năng lượng
                  </span>
                  <span className="text-base font-black text-orange-600">
                    {calcVal(ing.calories_per_100g)} <small className="text-[10px] font-bold">kcal</small>
                  </span>
                </div>

                {/* Macros list */}
                <div className="space-y-2">
                  <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider mb-2">Thành phần dinh dưỡng ({ing.serving_unit || '100g'})</span>
                  
                  {/* Protein */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-500">🥩 Đạm (Protein):</span>
                    <span className="font-black text-[#1f3b00]">{calcVal(ing.protein_per_100g)}g</span>
                  </div>

                  {/* Carbs */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-500">🍞 Tinh bột (Carbs):</span>
                    <span className="font-black text-[#1f3b00]">{calcVal(ing.carbs_per_100g)}g</span>
                  </div>

                  {/* Fat */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-500">🥑 Chất béo (Fat):</span>
                    <span className="font-black text-[#1f3b00]">{calcVal(ing.fat_per_100g)}g</span>
                  </div>

                  {/* Fiber */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-500">🥗 Chất xơ (Fiber):</span>
                    <span className="font-black text-[#1f3b00]">{calcVal(ing.fiber_per_100g)}g</span>
                  </div>
                </div>
              </div>

              {/* Tag indicator on base */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex flex-wrap gap-1.5 justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <div className="flex gap-1.5 flex-wrap">
                  <span className={(ing.type || 'ingredient') === 'brand' ? 'text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg font-extrabold' : 'text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg'}>
                    {(ing.type || 'ingredient') === 'brand' ? `🏬 ${ing.brand_name || 'Đồ ăn ngoài'}` : '🍏 Nguyên liệu'}
                  </span>
                  <span className="text-gray-500 bg-gray-100/60 px-2 py-0.5 rounded-lg font-extrabold">
                    {ing.category === 'drink' ? '🥤 Đồ uống' : ing.category === 'snack' ? '🍪 Ăn vặt' : '🍲 Đồ ăn'}
                  </span>
                </div>
                <span className="text-gray-400">Khẩu phần: {ing.serving_unit || '100g'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-[24px] border border-gray-100/80 shadow-sm">
          <span className="text-3xl mb-3">🔍</span>
          <h4 className="font-extrabold text-gray-800 text-base mb-1">Không tìm thấy nguyên liệu nào</h4>
          <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed mb-4">
            Hãy thử tìm bằng từ khóa khác hoặc thêm nguyên liệu mới này vào hệ thống của chúng tôi!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all"
          >
            + Thêm nguyên liệu ngay
          </button>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-amber-500" /> Thêm nguyên liệu mới
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tên thực phẩm / món ăn</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Ví dụ: Trà sữa Phúc Long, Salad gà..."
                  value={formData.name}
                  onChange={handleInputChange}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15"
                  required
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Phân loại</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setFormData({
                      ...formData,
                      type: nextType,
                      serving_unit: nextType === 'ingredient' ? '100g' : '',
                      category: 'food',
                      brand_name: ''
                    });
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15 bg-white cursor-pointer"
                >
                  <option value="ingredient">🍏 Nguyên liệu cơ bản</option>
                  <option value="brand">🏬 Thương hiệu / Đồ ăn ngoài</option>
                </select>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nhóm thực phẩm chi tiết</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15 bg-white cursor-pointer"
                >
                  <option value="food">🍲 Đồ ăn (Cơm, mì, thịt, rau...)</option>
                  <option value="drink">🥤 Đồ uống (Trà sữa, cafe, nước ngọt...)</option>
                  <option value="snack">🍪 Đồ ăn vặt (Khoai tây chiên, bánh kẹo...)</option>
                </select>
              </div>

              {formData.type === 'brand' && (
                <>
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tên thương hiệu / Cửa hàng</label>
                    <input 
                      type="text" 
                      name="brand_name"
                      placeholder="Ví dụ: KFC, Highlands, Phúc Long..."
                      value={formData.brand_name}
                      onChange={handleInputChange}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15"
                      required
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Đơn vị khẩu phần (VD: 1 cốc, 1 cái, 1 miếng)</label>
                    <input 
                      type="text" 
                      name="serving_unit"
                      placeholder="Nhập đơn vị tính (VD: 1 ly, 1 miếng...)"
                      value={formData.serving_unit === '100g' ? '' : formData.serving_unit}
                      onChange={handleInputChange}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-150 outline-none text-sm font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/15"
                      required
                    />
                  </div>
                </>
              )}

              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Giá trị dinh dưỡng trên 100g</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Calories */}
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Calo (kcal)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="calories"
                      placeholder="0"
                      value={formData.calories}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361]"
                    />
                  </div>

                  {/* Protein */}
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Đạm (Protein g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="protein"
                      placeholder="0"
                      value={formData.protein}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361]"
                    />
                  </div>

                  {/* Carbs */}
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tinh bột (Carbs g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="carbs"
                      placeholder="0"
                      value={formData.carbs}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361]"
                    />
                  </div>

                  {/* Fat */}
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Chất béo (Fat g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="fat"
                      placeholder="0"
                      value={formData.fat}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361]"
                    />
                  </div>

                  {/* Fiber */}
                  <div className="form-group flex flex-col gap-1 col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Chất xơ (Fiber g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="fiber"
                      placeholder="0"
                      value={formData.fiber}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:border-[#B5E361]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-extrabold text-sm text-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-[#1f3b00] hover:scale-[1.02] active:scale-[0.98] rounded-xl font-extrabold text-sm transition-all shadow-sm"
                >
                  {loading ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ingredients;
