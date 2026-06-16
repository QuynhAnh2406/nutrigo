import React, { useState } from 'react';
import { Clock, ChefHat, Flame, Droplet, Wheat, Activity, Edit2, Trash2, X, Check } from 'lucide-react';

function MealDetailModal({ meal, onClose, onDelete, onSaveSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    foodName: meal.foodName || '',
    description: meal.description || '',
    image: meal.image || '',
    prepTime: meal.prepTime || '',
    difficulty: meal.difficulty || 'Medium',

    category: meal.category || 'food',
    healthLevel: meal.healthLevel || 'medium'
  });

  const [ingredients, setIngredients] = useState(
    meal.ingredients && meal.ingredients.length > 0 
      ? meal.ingredients 
      : [{ name: '', amount: '', calories: '' }]
  );
  const [instructions, setInstructions] = useState(
    meal.instructions && meal.instructions.length > 0
      ? meal.instructions
      : ['']
  );

  if (!meal) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '', calories: '' }]);
  const addInstruction = () => setInstructions([...instructions, '']);

  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
  const removeInstruction = (index) => setInstructions(instructions.filter((_, i) => i !== index));

  const handleSave = async (e) => {
    e.preventDefault();
    const updatedPostData = {
      ...formData,
      ingredients: ingredients.filter(i => i.name),
      instructions: instructions.filter(i => i)
    };

    try {
      const res = await fetch(`http://localhost:5002/api/posts/${meal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPostData)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        if (onSaveSuccess) onSaveSuccess();
      } else {
        alert("Lưu thất bại: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi lưu.");
    }
  };

  const currentTotalCalories = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);
  const inputClass = isEditing ? "w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#8CB33D] focus:ring-2 focus:ring-[#8CB33D]/20 transition-all" : "bg-gray-50 cursor-not-allowed text-gray-700 font-medium w-full border border-gray-100 rounded-xl px-4 py-2.5";

  // Viewing Mode Design
  if (!isEditing) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f3b00]/70 backdrop-blur-md transition-all p-4 sm:p-6 animate-in fade-in duration-300" onClick={onClose}>
        <div className="bg-[#fcfdfa] rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20" onClick={e => e.stopPropagation()}>
          
          {/* Left Column: Image & Hero Info */}
          <div className="relative w-full md:w-2/5 h-72 md:h-full shrink-0 group overflow-hidden">
            {formData.image ? (
              <img src={formData.image} alt={formData.foodName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#EAF7D5] to-[#B5E361] flex items-center justify-center">
                <ChefHat size={100} className="text-[#8CB33D]/30" />
              </div>
            )}
            
            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1400] via-[#0a1400]/50 to-transparent opacity-90"></div>
            
            {/* Top Badges */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
              <div className="flex flex-col gap-2">
                <span className="bg-[#B5E361] px-4 py-1.5 rounded-full text-xs font-black text-[#1f3b00] uppercase tracking-widest shadow-lg inline-block w-fit">
                  {meal.mealType || formData.category}
                </span>
                {formData.difficulty && (
                  <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm inline-block w-fit border border-white/10">
                    {formData.difficulty}
                  </span>
                )}
              </div>
              {/* Close button for mobile */}
              <button onClick={onClose} className="md:hidden w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Title & Description Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                {formData.foodName || 'Món ăn không tên'}
              </h2>
              {formData.description && (
                <p className="text-white/80 text-sm font-medium line-clamp-3 drop-shadow-md leading-relaxed">
                  {formData.description}
                </p>
              )}
              
              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsEditing(true)} className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95">
                  <Edit2 size={18} /> Chỉnh sửa
                </button>
                <button onClick={onDelete} className="w-14 h-14 bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white rounded-2xl flex items-center justify-center transition-all shrink-0 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/20">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 flex flex-col h-full relative">
            {/* Close button for Desktop */}
            <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 z-20 w-10 h-10 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-all hover:rotate-90">
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              
              {/* Macros Container */}
              <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-[#1f3b00] flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#EAF7D5] rounded-2xl flex items-center justify-center text-[#3d6600] shadow-sm">
                      <Activity size={24} />
                    </div>
                    Giá trị dinh dưỡng
                  </h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-[1.25rem] bg-gradient-to-b from-orange-50 to-orange-100/50 border border-orange-100/50 hover:shadow-md hover:shadow-orange-100 transition-all">
                    <Flame className="text-orange-500 mb-2" size={24} />
                    <span className="text-xl font-black text-orange-950 leading-none mb-1">{meal.calories || currentTotalCalories}</span>
                    <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">Kcal</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-[1.25rem] bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-100/50 hover:shadow-md hover:shadow-blue-100 transition-all">
                    <Droplet className="text-blue-500 mb-2" size={24} />
                    <span className="text-xl font-black text-blue-950 leading-none mb-1">{meal.macros?.protein || 0}g</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Protein</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-[1.25rem] bg-gradient-to-b from-yellow-50 to-yellow-100/50 border border-yellow-100/50 hover:shadow-md hover:shadow-yellow-100 transition-all">
                    <Wheat className="text-yellow-500 mb-2" size={24} />
                    <span className="text-xl font-black text-yellow-950 leading-none mb-1">{meal.macros?.carbs || 0}g</span>
                    <span className="text-[9px] font-bold text-yellow-600 uppercase tracking-widest">Carbs</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-[1.25rem] bg-gradient-to-b from-red-50 to-red-100/50 border border-red-100/50 hover:shadow-md hover:shadow-red-100 transition-all">
                    <Activity className="text-red-500 mb-2" size={24} />
                    <span className="text-xl font-black text-red-950 leading-none mb-1">{meal.macros?.fat || 0}g</span>
                    <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Fat</span>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-2xl font-black text-[#1f3b00] flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#EAF7D5] rounded-2xl flex items-center justify-center text-[#3d6600] shadow-sm">
                        <ChefHat size={24} />
                      </div>
                      Nguyên liệu
                    </h3>
                    <span className="text-xs font-bold text-[#3d6600] bg-[#EAF7D5] px-3 py-1.5 rounded-full border border-[#B5E361]/30">
                      {ingredients.filter(i => i.name).length} mục
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ingredients.filter(i => i.name).length > 0 ? (
                      ingredients.filter(i => i.name).map((ing, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#B5E361]/50 hover:shadow-md transition-all cursor-default relative">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#B5E361] group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(181,227,97,0.6)]"></div>
                            <span className="font-bold text-gray-800">{ing.name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-[#3d6600]">{ing.amount || 'Vừa đủ'}</span>
                            {ing.calories && <span className="text-[10px] font-bold text-gray-400 mt-0.5">{ing.calories} kcal</span>}
                          </div>

                          {/* Hover Tooltip */}
                          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white border border-[#B5E361]/30 shadow-xl rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:-translate-y-2 scale-95 group-hover:scale-100 pointer-events-none">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100 text-center">
                              Chi tiết dinh dưỡng
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">Calories</span>
                                <span className="text-xs font-black text-orange-500">
                                  {ing.calories_per_100g ? Math.round(ing.calories_per_100g * (ing.weight_g || 100) / 100) : (ing.calories || 0)} <span className="text-[9px] text-orange-400 uppercase">kcal</span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">Protein</span>
                                <span className="text-xs font-black text-blue-500">
                                  {ing.protein_per_100g ? (ing.protein_per_100g * (ing.weight_g || 100) / 100).toFixed(1) : 0}<span className="text-[9px] text-blue-400 uppercase">g</span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">Carbs</span>
                                <span className="text-xs font-black text-yellow-500">
                                  {ing.carbs_per_100g ? (ing.carbs_per_100g * (ing.weight_g || 100) / 100).toFixed(1) : 0}<span className="text-[9px] text-yellow-400 uppercase">g</span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">Fat</span>
                                <span className="text-xs font-black text-red-500">
                                  {ing.fat_per_100g ? (ing.fat_per_100g * (ing.weight_g || 100) / 100).toFixed(1) : 0}<span className="text-[9px] text-red-400 uppercase">g</span>
                                </span>
                              </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-[#B5E361]/30 rotate-45"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                        <p className="text-sm text-gray-400 font-bold">Chưa có thông tin nguyên liệu</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-[#1f3b00] flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#EAF7D5] rounded-2xl flex items-center justify-center text-[#3d6600] shadow-sm">
                        <Clock size={24} />
                      </div>
                      Cách làm
                    </h3>
                    {formData.prepTime && (
                      <span className="text-xs font-bold text-[#1f3b00] bg-[#B5E361] px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(181,227,97,0.3)] border border-[#a3d14f] flex items-center gap-1.5">
                        <Clock size={12} /> {formData.prepTime}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative pl-2">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100 rounded-full"></div>
                    <div className="space-y-6 relative z-10">
                      {instructions.filter(i => i).length > 0 ? (
                        instructions.filter(i => i).map((inst, idx) => (
                          <div key={idx} className="flex gap-5 group">
                            <div className="w-9 h-9 shrink-0 bg-white border-2 border-gray-200 text-gray-400 rounded-full flex items-center justify-center font-black text-sm shadow-sm group-hover:border-[#B5E361] group-hover:bg-[#B5E361] group-hover:text-[#1f3b00] group-hover:scale-110 transition-all duration-300">
                              {idx + 1}
                            </div>
                            <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:border-[#B5E361]/30 transition-all duration-300">
                              <p className="text-gray-700 font-medium text-[15px] leading-relaxed">
                                {inst}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-3xl ml-12 bg-gray-50/50">
                          <p className="text-sm text-gray-400 font-bold">Chưa có hướng dẫn thực hiện</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Editing Mode
  return (
    <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F4FBE7] border border-[#B5E361]/30 rounded-xl flex items-center justify-center text-green-700">
              <Edit2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">Chỉnh sửa món ăn</h2>
              <p className="text-xs text-gray-400 font-bold mt-0.5">Cập nhật thông tin chi tiết cho món ăn của bạn.</p>
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5" onSubmit={handleSave}>
          
          {/* Image Upload Banner */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#B5E361]/50 transition-colors group">
            <label className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[160px] text-gray-400 hover:text-[#3d6600]">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-48 object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <ChefHat size={32} />
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
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Tên món ăn *</label>
            <input 
              type="text" name="foodName" value={formData.foodName} onChange={handleInputChange} 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all placeholder:text-gray-300" 
              placeholder="Ví dụ: Salad Ức Gà, Bún Chả..." required 
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Mô tả</label>
            <textarea 
              name="description" value={formData.description} onChange={handleInputChange} rows="2" 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-[#B5E361]/30 transition-all placeholder:text-gray-300 resize-none" 
              placeholder="Nhập mô tả ngắn gọn về món ăn này..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prep Time */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Thời gian nấu</label>
              <input 
                type="text" name="prepTime" value={formData.prepTime} onChange={handleInputChange} 
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all placeholder:text-gray-300"
                placeholder="Ví dụ: 30 phút"
              />
            </div>
            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider pl-1">Độ khó</label>
              <select 
                name="difficulty" value={formData.difficulty} onChange={handleInputChange} 
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/30 transition-all cursor-pointer"
              >
                <option value="Easy">Dễ</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó</option>
              </select>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-gray-800 uppercase tracking-wider pl-1">Nguyên liệu</label>
              <button 
                type="button" onClick={addIngredient}
                className="bg-[#B5E361] hover:bg-[#98d15a] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                + THÊM NGUYÊN LIỆU
              </button>
            </div>
            
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#B5E361]/20 transition-all duration-300">
                  <div className="flex-1">
                    <input 
                      type="text" value={ing.name || ''} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/25 focus:border-[#B5E361] transition-all" 
                      placeholder="Tên nguyên liệu" required 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" value={ing.amount || ''} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} 
                      className="w-20 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/25 focus:border-[#B5E361] transition-all" 
                      placeholder="Lượng" 
                    />
                    <input 
                      type="number" value={ing.calories || ''} onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)} 
                      className="w-20 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/25 focus:border-[#B5E361] transition-all" 
                      placeholder="Kcal" 
                    />
                    <button type="button" onClick={() => removeIngredient(index)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {ingredients.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold text-xs">
                  Chưa có nguyên liệu nào được thêm
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-gray-800 uppercase tracking-wider pl-1">Cách làm</label>
              <button 
                type="button" onClick={addInstruction}
                className="bg-[#B5E361] hover:bg-[#98d15a] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                + THÊM BƯỚC LÀM
              </button>
            </div>
            
            <div className="space-y-3">
              {instructions.map((inst, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#B5E361]/20 transition-all duration-300">
                  <div className="w-6 h-6 mt-1 shrink-0 bg-[#EAF7D5] text-[#3d6600] rounded-full flex items-center justify-center font-black text-xs">
                    {index + 1}
                  </div>
                  <textarea 
                    value={inst || ''} onChange={(e) => handleInstructionChange(index, e.target.value)} rows="2" 
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-bold focus:ring-2 focus:ring-[#B5E361]/25 focus:border-[#B5E361] transition-all resize-none" 
                    placeholder="Mô tả bước làm..." required 
                  />
                  <button type="button" onClick={() => removeInstruction(index)} className="mt-1 p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {instructions.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold text-xs">
                  Chưa có cách làm nào được thêm
                </div>
              )}
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 bg-gray-950 border-t border-gray-900 shrink-0">
          <div className="flex justify-end gap-3 w-full">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-3 text-white text-xs font-black rounded-xl hover:bg-white/5 transition-all">
              HỦY
            </button>
            <button type="button" onClick={handleSave} className="px-6 py-3 bg-[#B5E361] text-[#1f3b00] text-xs font-black rounded-xl hover:bg-[#a7e965] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#B5E361]/10 active:scale-95">
              <Check size={16} strokeWidth={3} /> XÁC NHẬN
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MealDetailModal;
