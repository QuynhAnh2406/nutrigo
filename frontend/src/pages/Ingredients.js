import React, { useState, useEffect, useRef } from 'react';
import { Search, Flame, Scale, SlidersHorizontal, RotateCcw, Store, Apple, Coffee, Cookie, Soup } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Ingredients({ mode = 'ingredient' }) {
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [calorieRange, setCalorieRange] = useState('All');
  const brandSearchQuery = '';
  const popoverContainerRef = useRef(null);
  const portionWeight = 100;

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

  const fetchIngredients = async () => {
    try {
      const res = await fetch('http://localhost:5002/api/mealplan/ingredients');
      const data = await res.json();
      if (data.success && data.data) {
        setIngredients(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchSearch = removeAccents(ing.name?.toLowerCase() || '').includes(removeAccents(searchQuery.toLowerCase()));
    const matchMode = (ing.type || 'ingredient') === mode;
    const matchCategory = selectedCategory === 'All' || (ing.category || 'food') === selectedCategory;
    const matchBrand =
      mode === 'ingredient' ||
      !brandSearchQuery.trim() ||
      (ing.brand_name && removeAccents(ing.brand_name.toLowerCase()).includes(removeAccents(brandSearchQuery.toLowerCase())));

    const matchCalorie = () => {
      if (calorieRange === 'All') return true;
      const cal = parseFloat(ing.calories_per_100g) || 0;
      if (calorieRange === '<100') return cal < 100;
      if (calorieRange === '100-300') return cal >= 100 && cal <= 300;
      if (calorieRange === '300-500') return cal > 300 && cal <= 500;
      if (calorieRange === '>500') return cal > 500;
      return true;
    };

    return matchSearch && matchMode && matchCategory && matchBrand && matchCalorie();
  });

  const calcVal = (val100g) => {
    const raw = (parseFloat(val100g || 0) * portionWeight) / 100;
    return Number(raw.toFixed(1));
  };

  return (
    <div className="ingredients-page main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
      <div className="mb-2 relative z-30">
        <PageHeader
          title={mode === 'ingredient' ? 'Nguyên liệu cơ bản' : 'Thương hiệu/Đồ ăn ngoài'}
          subtitle={
            mode === 'ingredient'
              ? 'Tra cứu thông số dinh dưỡng của các loại nguyên liệu nấu ăn cơ bản.'
              : 'Tra cứu thông số dinh dưỡng của các món ăn từ các thương hiệu phổ biến.'
          }
          icon={Scale}
          badge={`${filteredIngredients.length} ${mode === 'ingredient' ? 'nguyên liệu' : 'món ăn'}`}

        >
          <div className="relative w-full flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600 z-10" />
              <input
                type="text"
                placeholder={mode === 'ingredient' ? "Tìm kiếm nguyên liệu (VD: Ức gà, Trứng...)" : "Tìm kiếm thương hiệu, đồ ăn (VD: KFC, Pizza...)"}
                className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pl-12 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-500 outline-none ring-0 backdrop-blur focus:border-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative" ref={popoverContainerRef}>
              <button
                type="button"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={`h-full px-4 rounded-2xl border transition-all flex items-center gap-2 text-xs sm:text-sm font-extrabold ${showAdvancedFilter
                    ? 'bg-[#B5E361] border-[#B5E361] text-[#1f3b00]'
                    : 'border-white/70 bg-white/70 text-gray-700 hover:bg-white hover:border-white'
                  }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Bộ lọc nâng cao</span>
                {(selectedCategory !== 'All' || calorieRange !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
              {showAdvancedFilter && (
                <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-[22px] border border-gray-150 shadow-xl p-5 animate-in fade-in-50 zoom-in-95 duration-200">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] text-gray-500 font-bold mb-1">
                        Phân loại chi tiết
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === 'All'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('food')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${selectedCategory === 'food'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          <Soup className="h-3.5 w-3.5" />
                          <span>Đồ ăn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('drink')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${selectedCategory === 'drink'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          <Coffee className="h-3.5 w-3.5" />
                          <span>Đồ uống</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('snack')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${selectedCategory === 'snack'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          <Cookie className="h-3.5 w-3.5" />
                          <span>Ăn vặt</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100">
                      <span className="text-[13px] text-gray-500 font-bold mb-1">
                        Khoảng năng lượng (Calo)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setCalorieRange('All')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calorieRange === 'All'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalorieRange('<100')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calorieRange === '<100'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          &lt; 100 kcal
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalorieRange('100-300')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calorieRange === '100-300'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          100 - 300 kcal
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalorieRange('300-500')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calorieRange === '300-500'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          300 - 500 kcal
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalorieRange('>500')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calorieRange === '>500'
                              ? 'bg-[#B5E361] text-[#1f3b00]'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          &gt; 500 kcal
                        </button>
                      </div>
                    </div>

                    {(selectedCategory !== 'All' || calorieRange !== 'All') && (
                      <div className="flex justify-end pt-3 border-t border-dashed border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('All');
                            setCalorieRange('All');
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

      {filteredIngredients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-50 duration-500">
          {filteredIngredients.map((ing) => (
            <div
              key={ing.id}
              className="group relative bg-white rounded-[24px] border border-gray-100/60 p-6 shadow-[0_8px_20px_rgb(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(181,227,97,0.15)] hover:-translate-y-1 overflow-hidden cursor-default flex flex-col justify-between min-h-[210px]"
            >
              {/* Decorative Background Blob */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-100/40 to-[#B5E361]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

              {/* Front Content */}
              <div className="relative z-10 transition-all duration-500 group-hover:-translate-y-4 group-hover:opacity-0 group-hover:scale-95 flex flex-col h-full">
                {/* Top Badges */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black tracking-wide bg-gray-50 text-gray-500 border border-gray-100/80 shadow-sm flex items-center gap-1">
                      {(ing.type || 'ingredient') === 'brand' ? (
                        <>
                          <Store className="h-3.5 w-3.5 text-gray-400" />
                          <span>{ing.brand_name || 'Khác'}</span>
                        </>
                      ) : (
                        <>
                          <Apple className="h-3.5 w-3.5 text-green-500" />
                          <span>{mode === 'ingredient' ? 'Nguyên liệu' : 'Thương hiệu'}</span>
                        </>
                      )}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black tracking-wide bg-[#B5E361]/10 text-[#2d5214] border border-[#B5E361]/20 shadow-sm flex items-center gap-1">
                      {ing.category === 'drink' ? (
                        <>
                          <Coffee className="h-3.5 w-3.5 text-[#5c8b1a]" />
                          <span>Đồ uống</span>
                        </>
                      ) : ing.category === 'snack' ? (
                        <>
                          <Cookie className="h-3.5 w-3.5 text-[#5c8b1a]" />
                          <span>Ăn vặt</span>
                        </>
                      ) : (
                        <>
                          <Soup className="h-3.5 w-3.5 text-[#5c8b1a]" />
                          <span>Đồ ăn</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-extrabold text-[#112308] text-xl leading-snug line-clamp-2 mb-auto" title={ing.name}>
                  {ing.name}
                </h4>

                {/* Bottom: Calories & Serving */}
                <div className="mt-5 flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-400 tracking-wide mb-0.5 flex items-center gap-1">
                      <Flame size={12} className="fill-orange-400 text-orange-400" /> Năng lượng
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-orange-500 tracking-tighter drop-shadow-sm">
                        {calcVal(ing.calories_per_100g)}
                      </span>
                      <span className="text-sm font-bold text-orange-600/70">kcal</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-black text-gray-400 tracking-wide mb-1">
                      Khẩu phần
                    </span>
                    <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-sm font-bold text-gray-600 border border-gray-100">
                      {ing.serving_unit || '100g'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Overlay: Nutrition Info (Light sleek mode) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f2f8db]/95 to-[#fcfdf7]/95 backdrop-blur-md px-5 pt-7 pb-4 opacity-0 translate-y-8 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-500 ease-out flex flex-col justify-center pointer-events-none z-20">
                <h4 className="font-extrabold text-[#112308] text-[14px] leading-snug tracking-wide text-center mb-2 pb-2 border-b border-[#112308]/5">
                  <span className="block text-[13px] opacity-80 mb-0.5">Thành phần dinh dưỡng</span>
                  <span className="block text-[#659A1D] text-[16px] font-black">{ing.name}</span>
                  <span className="block text-[11px] font-bold text-gray-500 mt-0.5">Cho {ing.serving_unit || '100g'}</span>
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.4)]"></span> Đạm
                    </span>
                    <span className="font-black text-[#112308] text-[15px]">{calcVal(ing.protein_per_100g)} <span className="text-[11px] text-gray-500 font-bold">g</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.4)]"></span> Tinh bột
                    </span>
                    <span className="font-black text-[#112308] text-[15px]">{calcVal(ing.carbs_per_100g)} <span className="text-[11px] text-gray-500 font-bold">g</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.4)]"></span> Chất béo
                    </span>
                    <span className="font-black text-[#112308] text-[15px]">{calcVal(ing.fat_per_100g)} <span className="text-[11px] text-gray-500 font-bold">g</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.4)]"></span> Chất xơ
                    </span>
                    <span className="font-black text-[#112308] text-[15px]">{calcVal(ing.fiber_per_100g)} <span className="text-[11px] text-gray-500 font-bold">g</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-[24px] border border-gray-100/80 shadow-sm">
          <Search className="h-10 w-10 text-gray-300 mb-3" />
          <h4 className="font-extrabold text-gray-800 text-base mb-1">Không tìm thấy {mode === 'ingredient' ? 'nguyên liệu' : 'món ăn'} nào</h4>
          <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed">
            Hãy thử tìm bằng từ khóa khác!
          </p>
        </div>
      )}

    </div>
  );
}

export default Ingredients;
