import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Sparkles, ArrowLeft, ChefHat, Trash2, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function CreateRecipe() {
  const navigate = useNavigate();
  const { healthData } = useOutletContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (healthData && (!healthData.weight || !healthData.height || !healthData.dateOfBirth)) {
      alert("Vui lòng hoàn thiện hồ sơ cá nhân (ngày sinh, chiều cao, cân nặng,...) trước khi tạo công thức mới!");
      navigate('/profile?tab=Edit');
    }
  }, [healthData, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    image: '',
    prepTime: '',
    servings: 1,
    category: 'food'
  });

  const [ingredients, setIngredients] = useState([
    { name: '', weight_g: 0, calories_per_100g: 0, showDropdown: false }
  ]);
  const [instructions, setInstructions] = useState(['']);
  const [dbIngredients, setDbIngredients] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [prepTimeValue, setPrepTimeValue] = useState('');
  const prepTimeUnit = 'phút';

  useEffect(() => {
    const fetchDbIngredients = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/mealplan/ingredients', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setDbIngredients(data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải nguyên liệu', err);
      }
    };
    fetchDbIngredients();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.ingredient-dropdown-container')) {
        setIngredients(prev => prev.map(ing => ing.showDropdown ? { ...ing, showDropdown: false } : ing));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  const filterIngredients = (query) => {
    const baseList = dbIngredients.filter(ing => (!ing.type || ing.type === 'ingredient') && !ing.brand_name);
    if (!query) return baseList.slice(0, 10);
    const normalizedQuery = removeAccents(query.toLowerCase());
    return baseList
      .filter(ing => removeAccents(ing.name.toLowerCase()).includes(normalizedQuery))
      .slice(0, 10);
  };

  const handleIngredientNameChange = (index, value) => {
    const newIngs = [...ingredients];
    newIngs[index].name = value;
    newIngs[index].showDropdown = true;
    setIngredients(newIngs);
  };

  const updateWeight = (index, weight) => {
    setIngredients(ingredients.map((item, i) =>
      i === index ? { ...item, weight_g: parseFloat(weight) || 0 } : item
    ));
  };

  const handleSelectIngredient = (index, ing) => {
    setIngredients(ingredients.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          name: ing.name,
          calories_per_100g: parseFloat(ing.calories_per_100g || 0),
          showDropdown: false
        };
      }
      return item;
    }));
  };

  const handleIngredientBlur = (index) => {
    setTimeout(() => {
      setIngredients(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index].showDropdown = false;
        }
        return next;
      });
    }, 200);
  };

  const handleInstructionChange = (index, value) => {
    const newInsts = [...instructions];
    newInsts[index] = value;
    setInstructions(newInsts);
  };

  const addIngredientRow = () => setIngredients([...ingredients, { name: '', weight_g: 0, calories_per_100g: 0, showDropdown: false }]);
  const removeIngredientRow = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  const addInstructionRow = () => setInstructions([...instructions, '']);
  const removeInstructionRow = (index) => setInstructions(instructions.filter((_, i) => i !== index));

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.foodName.trim()) {
        alert('Vui lòng nhập tên món ăn!');
        return;
      }
    }
    if (currentStep === 2) {
      if (ingredients.length === 0 || !ingredients[0].name.trim()) {
        alert('Vui lòng thêm ít nhất một nguyên liệu!');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 3) {
      nextStep();
      return;
    }

    if (instructions.length === 0 || !instructions[0].trim()) {
      alert('Vui lòng thêm ít nhất một bước chế biến!');
      return;
    }

    const formattedIngredients = ingredients
      .filter(ing => ing.name.trim())
      .map(ing => ({
        name: ing.name,
        weight_g: ing.weight_g,
        calories_per_100g: ing.calories_per_100g
      }));

    const payload = {
      ...formData,
      prepTime: `${prepTimeValue} ${prepTimeUnit}`,
      ingredients: formattedIngredients,
      instructions: instructions.filter(inst => inst.trim() !== ''),
      calories: totalCaloriesCount,
      isRecipe: true
    };

    if (!formData.foodName.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5002/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã tạo công thức thành công! 🎉');
        navigate('/my-recipes');
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

  const totalCaloriesCount = ingredients.reduce((sum, ing) => {
    const cals = Math.round((ing.calories_per_100g || 0) * (ing.weight_g || 0) / 100);
    return sum + (cals || 0);
  }, 0);

  return (
    <div className="create-recipe-page main-content" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
      {/* Page Header */}
      <div className="mb-8">
        <PageHeader
          title="Tạo công thức mới"
          subtitle="Thiết lập công thức nấu ăn lành mạnh của riêng bạn và lưu trữ vào thư viện cá nhân."
          icon={ChefHat}
          actions={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-gray-900 shadow-sm ring-1 ring-white/70 backdrop-blur transition-all hover:bg-white hover:scale-105 active:scale-95"
              onClick={() => navigate('/my-recipes')}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
          }
        />
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Left Form Panel */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6 sm:p-8 flex-1 w-full max-w-4xl animate-in fade-in duration-300">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Stepper UI */}
            <div className="flex items-start justify-between mb-8 relative px-2">
              <div className="absolute left-6 right-6 top-5 h-1.5 bg-gray-100 -z-10 rounded-full translate-y-[-50%]"></div>
              <div
                className="absolute left-6 top-5 h-1.5 bg-[#B5E361] -z-10 rounded-full translate-y-[-50%] transition-all duration-500 ease-out"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? 'calc(50% - 1.5rem)' : 'calc(100% - 3rem)' }}
              ></div>

              {[
                { step: 1, label: 'Thông tin' },
                { step: 2, label: 'Nguyên liệu' },
                { step: 3, label: 'Cách làm' }
              ].map(({ step, label }) => (
                <div key={step} className={`flex flex-col items-center gap-2 bg-white px-2 sm:px-4 ${currentStep >= step ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ring-4 ring-white ${currentStep >= step ? 'bg-[#B5E361] text-[#1f3b00] shadow-md shadow-[#B5E361]/30 scale-110' : 'bg-gray-100 text-gray-400'}`}>
                    {step}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors duration-300 ${currentStep >= step ? 'text-[#2d5200]' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Bước 1: Thông tin cơ bản */}
            <div className={currentStep === 1 ? 'space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in' : 'hidden'}>
              <div className="flex flex-col gap-6">

                {/* Form Fields Container */}
                <div className="flex flex-col space-y-6 w-full">
                  {/* Image Upload Banner */}
                  <div className={`relative w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 transition-colors group hover:border-[#B5E361]/50`}>
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[200px] text-gray-400 hover:text-[#3d6600]">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full min-h-[200px] object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-8">
                          <ChefHat size={36} />
                          <span className="text-sm font-bold">Tải ảnh lên từ máy</span>
                          <span className="text-xs text-gray-400 font-medium">Nhấn vào đây để chọn ảnh</span>
                        </div>
                      )}
                      {formData.image && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Thay đổi ảnh</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Dish Name */}
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700 pl-1">Tên công thức *</label>
                    <input
                      type="text"
                      name="foodName"
                      value={formData.foodName}
                      onChange={handleFormInputChange}
                      placeholder="Ví dụ: Salad Ức Gà, Bún Chả..."
                      required
                      className="px-4 py-3 rounded-2xl border border-gray-150 outline-none text-[15px] font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/10 bg-gray-50/30 transition-all placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-700 pl-1">Mô tả công thức</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormInputChange}
                      placeholder="Nhập mô tả ngắn gọn về món ăn, công dụng sức khỏe, hương vị..."
                      rows="3"
                      className="px-4 py-3 rounded-2xl border border-gray-150 outline-none text-[15px] font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/10 bg-gray-50/30 resize-none transition-all placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm"
                    />
                  </div>

                  {/* Prep Time, Difficulty Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-gray-700 pl-1">Thời gian nấu (phút)</label>
                      <input
                        type="number"
                        min="1"
                        value={prepTimeValue}
                        onChange={(e) => setPrepTimeValue(e.target.value)}
                        className="px-4 py-3 rounded-2xl border border-gray-150 outline-none text-[15px] font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/10 bg-gray-50/30 transition-all placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm"
                      />
                    </div>

                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-gray-700 pl-1">Số phần ăn (khẩu phần)</label>
                      <input
                        type="number"
                        min="1"
                        className="px-4 py-3 rounded-2xl border border-gray-150 outline-none text-[15px] font-semibold focus:border-[#B5E361] focus:ring-2 focus:ring-[#B5E361]/10 bg-gray-50/30 transition-all placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm"
                        value={formData.servings || 1}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, servings: val === '' ? '' : parseInt(val) || 1 });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-col space-y-6 w-full">
                  <div className="form-group flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 pl-1">Loại món</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'food', label: 'Đồ ăn', icon: '🍲' },
                        { value: 'drink', label: 'Đồ uống', icon: '🥤' },
                        { value: 'snack', label: 'Ăn vặt', icon: '🍪' },
                        { value: 'other', label: 'Khác', icon: null }
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: option.value })}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 active:scale-95 ${formData.category === option.value
                              ? 'bg-[#1f3b00] text-white shadow-md'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {option.icon && <span className="text-base">{option.icon}</span>}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bước 2: Nguyên liệu */}
            <div className={currentStep === 2 ? 'space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in' : 'hidden'}>
              {/* Ingredients Section */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-800 pl-1">Nguyên liệu & dinh dưỡng từng phần</label>
                  <button
                    type="button"
                    onClick={addIngredientRow}
                    className="bg-[#B5E361] hover:bg-[#98d15a] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus size={14} />
                    THÊM NGUYÊN LIỆU
                  </button>
                </div>

                <div className="space-y-3 pr-1">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex flex-col gap-3 p-3 bg-white rounded-2xl border border-gray-100 group hover:border-[#B5E361]/40 transition-all duration-300 shadow-sm hover:shadow-md">
                      {/* Name input with custom Dropdown */}
                      <div className="relative w-full ingredient-dropdown-container">
                        <input
                          type="text"
                          placeholder="Nhập tên nguyên liệu (ví dụ: Ức gà)..."
                          value={ing.name}
                          onChange={(e) => handleIngredientNameChange(idx, e.target.value)}
                          onFocus={() => {
                            const newIngs = [...ingredients];
                            newIngs[idx].showDropdown = true;
                            setIngredients(newIngs);
                          }}
                          onBlur={() => handleIngredientBlur(idx)}
                          className="w-full bg-white border-2 border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-bold focus:ring-4 focus:ring-[#B5E361]/25 focus:border-[#B5E361] transition-all"
                        />
                        {/* Chevron Arrow to make it visually clear it's a dropdown */}
                        <button
                          type="button"
                          tabIndex="-1"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const newIngs = [...ingredients];
                            newIngs[idx].showDropdown = !newIngs[idx].showDropdown;
                            setIngredients(newIngs);
                          }}
                          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-900 focus:outline-none cursor-pointer"
                        >
                          <svg className={`fill-current h-5 w-5 transition-transform duration-200 ${ing.showDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </button>
                        {ing.showDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-56 overflow-y-auto bg-white border border-gray-150 rounded-2xl shadow-xl">
                            {filterIngredients(ing.name).map((dbIng) => (
                              <button
                                key={dbIng.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectIngredient(idx, dbIng);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-[#F4FBE7] hover:text-[#1f3b00] transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center"
                              >
                                <span>{dbIng.name}</span>
                                <span className="text-xs text-gray-400 font-bold">
                                  {dbIng.calories_per_100g} kcal / {dbIng.serving_unit || '100g'}
                                </span>
                              </button>
                            ))}
                            {filterIngredients(ing.name).length === 0 && (
                              <div className="px-4 py-3 text-sm text-gray-400 italic text-center">
                                Không tìm thấy nguyên liệu
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Weight and Custom Calories */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {/* Weight */}
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200">
                            <span className="text-[10px] font-bold text-gray-400">Nặng:</span>
                            <input
                              type="number"
                              value={ing.weight_g === 0 ? '' : ing.weight_g}
                              onChange={(e) => updateWeight(idx, e.target.value)}
                              placeholder="0"
                              className="w-12 text-center font-black text-sm text-gray-900 border-none p-0 focus:ring-0"
                            />
                            <span className="text-[10px] font-bold text-gray-400">g</span>
                          </div>

                          {/* Calories per 100g */}
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100" title="Lượng Calories trên 100g (Được tự động điền khi chọn nguyên liệu)">
                            <span className="text-[10px] font-bold text-gray-400">Mật độ:</span>
                            <input
                              type="number"
                              value={ing.calories_per_100g === 0 ? '' : ing.calories_per_100g}
                              placeholder="0"
                              disabled
                              className="w-12 text-center font-black text-sm text-gray-500 bg-transparent border-none p-0 focus:ring-0 cursor-not-allowed"
                            />
                            <span className="text-[9px] font-bold text-gray-400" title="kcal trên 100g">kcal/100g</span>
                          </div>
                        </div>

                        {/* Calculated calories and delete */}
                        <div className="flex items-center gap-3">
                          <div className="text-[11px] font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                            {Math.round((ing.calories_per_100g || 0) * (ing.weight_g || 0) / 100)} kcal
                          </div>

                          <button
                            type="button"
                            onClick={() => removeIngredientRow(idx)}
                            disabled={ingredients.length <= 1}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-dashed border-gray-200 text-right text-xs font-extrabold text-gray-600">
                  Tổng Calo ước tính: <span className="text-base font-black text-green-600 ml-1">{totalCaloriesCount} kcal</span>
                </div>
              </div>

            </div>

            {/* Bước 3: Cách làm */}
            <div className={currentStep === 3 ? 'space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in' : 'hidden'}>
              {/* Instruction Steps Section */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-800 pl-1">Các bước chế biến</label>
                  <button
                    type="button"
                    onClick={addInstructionRow}
                    className="bg-[#B5E361] hover:bg-[#98d15a] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus size={14} />
                    THÊM BƯỚC
                  </button>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  {instructions.map((inst, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#B5E361]/20 transition-all duration-300">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white text-gray-400 flex items-center justify-center font-black text-sm border border-gray-100 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <textarea
                          value={inst}
                          onChange={(e) => handleInstructionChange(idx, e.target.value)}
                          placeholder={`Mô tả chi tiết bước ${idx + 1}...`}
                          rows="2"
                          className="w-full bg-transparent border-none p-0 text-sm font-semibold text-gray-900 focus:ring-0 placeholder:text-gray-300 resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstructionRow(idx)}
                          disabled={instructions.length <= 1}
                          className="self-end sm:self-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Form actions */}
            <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 active:scale-98 rounded-2xl font-extrabold text-sm text-gray-700 transition-all"
                >
                  Quay lại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/my-recipes')}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 active:scale-98 rounded-2xl font-extrabold text-sm text-gray-700 transition-all"
                >
                  Hủy bỏ
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  key="next-btn"
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-[#1f3b00] hover:scale-[1.01] active:scale-[0.99] rounded-2xl font-black text-sm transition-all shadow-sm shadow-[#B5E361]/15"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  key="submit-btn"
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-[#1f3b00] hover:scale-[1.01] active:scale-[0.99] rounded-2xl font-black text-sm transition-all shadow-sm shadow-[#B5E361]/15 disabled:opacity-50"
                >
                  {loading ? 'Đang tạo...' : 'Tạo công thức'}
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Right Side Advices Panel */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-[#F4FBE7] rounded-[24px] p-6 border border-[#B5E361]/25 sticky top-8 flex flex-col gap-4">
            <h3 className="font-extrabold text-[#1f3b00] text-base m-0 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              Công thức lý tưởng 🍏
            </h3>
            <div className="text-[#2d5200]/90 text-xs font-semibold leading-relaxed space-y-3.5">
              <p>Chào mừng bạn đến với góc sáng tạo ẩm thực lành mạnh! Một công thức lý tưởng sẽ hỗ trợ bạn và cộng đồng duy trì lối sống lành mạnh.</p>

              <div className="flex gap-2">
                <span className="text-base select-none">🎯</span>
                <p><strong>Tính chính xác cao:</strong> Hãy nhập đúng tên và định lượng của từng nguyên liệu để lượng calo được tính chuẩn nhất.</p>
              </div>

              <div className="flex gap-2">
                <span className="text-base select-none">📷</span>
                <p><strong>Hình ảnh hấp dẫn:</strong> Một hình ảnh rõ ràng và đẹp mắt sẽ tạo cảm hứng nấu ăn nhiều hơn cho mọi người.</p>
              </div>

              <div className="flex gap-2">
                <span className="text-base select-none">🏷️</span>
                <p><strong>Gắn tag phù hợp:</strong> Chọn đúng bữa ăn và nhóm thực phẩm giúp bộ lọc nâng cao sắp xếp chính xác.</p>
              </div>

              <p className="font-bold pt-1 border-t border-[#B5E361]/20">Nutrigo chúc bạn có những trải nghiệm nấu ăn thật vui và bổ ích! 🍳✨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRecipe;
