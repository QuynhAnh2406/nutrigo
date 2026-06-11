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
    tags: meal.tags ? meal.tags.join(', ') : '',
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
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    const updatedPostData = {
      ...formData,
      tags: tagsArray,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f3b00]/60 backdrop-blur-sm transition-all p-4 sm:p-6" onClick={onClose}>
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
          
          {/* Header Image Area */}
          <div className="relative h-64 sm:h-72 w-full bg-gray-100 shrink-0">
            {formData.image ? (
              <img src={formData.image} alt={formData.foodName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#EAF7D5] to-[#B5E361] flex items-center justify-center">
                <ChefHat size={80} className="text-[#8CB33D]/40" />
              </div>
            )}
            
            {/* Top Bar Actions */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
              <div className="flex gap-2">
                <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#3d6600] uppercase tracking-wider shadow-sm">
                  {meal.mealType || formData.category}
                </span>
                {formData.difficulty && (
                  <span className="bg-[#1f3b00]/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                    {formData.difficulty}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-10 h-10 bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white hover:text-red-500 rounded-full flex items-center justify-center shadow-sm transition-all">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* Title & Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight drop-shadow-md">
                {formData.foodName || 'Món ăn không tên'}
              </h2>
              {formData.description && (
                <p className="text-white/90 text-sm sm:text-base font-medium line-clamp-2 drop-shadow-sm max-w-2xl">
                  {formData.description}
                </p>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
            
            {/* Macros Section */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-8">
              <div className="bg-orange-50 rounded-2xl p-3 sm:p-4 text-center border border-orange-100">
                <Flame className="mx-auto text-orange-500 mb-1" size={24} />
                <div className="text-xl font-black text-orange-950">{meal.calories || currentTotalCalories}</div>
                <div className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-wide">Kcal</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-3 sm:p-4 text-center border border-blue-100">
                <Droplet className="mx-auto text-blue-500 mb-1" size={24} />
                <div className="text-xl font-black text-blue-950">{meal.macros?.protein || 0}g</div>
                <div className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wide">Protein</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-3 sm:p-4 text-center border border-yellow-100">
                <Wheat className="mx-auto text-yellow-500 mb-1" size={24} />
                <div className="text-xl font-black text-yellow-950">{meal.macros?.carbs || 0}g</div>
                <div className="text-[10px] sm:text-xs font-bold text-yellow-600 uppercase tracking-wide">Carbs</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-3 sm:p-4 text-center border border-red-100">
                <Activity className="mx-auto text-red-500 mb-1" size={24} />
                <div className="text-xl font-black text-red-950">{meal.macros?.fat || 0}g</div>
                <div className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wide">Fat</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-extrabold text-[#1f3b00] mb-4 flex items-center gap-2">
                  <ChefHat className="text-[#8CB33D]" size={24} />
                  Nguyên liệu
                </h3>
                <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100 space-y-3">
                  {ingredients.filter(i => i.name).length > 0 ? (
                    ingredients.filter(i => i.name).map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                        <span className="font-bold text-gray-800">{ing.name}</span>
                        <div className="text-right">
                          <span className="block text-sm font-semibold text-gray-600">{ing.amount || 'Vừa đủ'}</span>
                          {ing.calories && <span className="block text-[11px] text-gray-400 font-medium">{ing.calories} kcal</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic text-center py-4">Chưa có nguyên liệu</p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-extrabold text-[#1f3b00] mb-4 flex items-center gap-2">
                  <Clock className="text-[#8CB33D]" size={24} />
                  Cách làm
                  {formData.prepTime && <span className="text-sm font-bold text-gray-500 ml-auto bg-white px-3 py-1 rounded-full border border-gray-200">{formData.prepTime}</span>}
                </h3>
                <div className="space-y-4">
                  {instructions.filter(i => i).length > 0 ? (
                    instructions.filter(i => i).map((inst, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="w-8 h-8 shrink-0 bg-[#EAF7D5] text-[#3d6600] rounded-full flex items-center justify-center font-black text-sm group-hover:bg-[#8CB33D] group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <p className="flex-1 text-gray-700 font-medium leading-relaxed pt-1">
                          {inst}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100 text-center">
                      <p className="text-sm text-gray-400 italic">Chưa có hướng dẫn</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50/50 shrink-0 flex justify-between items-center">
            <button 
              onClick={onDelete}
              className="px-5 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Xóa khỏi lịch</span>
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1f3b00] hover:bg-[#2c5200] flex items-center gap-2 shadow-lg shadow-[#1f3b00]/20 transition-all hover:-translate-y-0.5"
            >
              <Edit2 size={18} />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editing Mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f3b00]/60 backdrop-blur-sm transition-all p-4 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
        <div className="bg-[#1f3b00] px-6 py-5 flex justify-between items-center text-white border-b border-[#3d6600] shrink-0 rounded-t-[32px]">
          <h2 className="text-xl font-black tracking-widest m-0 text-[#EAF7D5] uppercase flex items-center gap-2">
            <Edit2 size={20} />
            Chỉnh sửa món ăn
          </h2>
          <button className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors" onClick={onClose}>✕</button>
        </div>

        <form className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Tên món ăn</label>
            <input type="text" name="foodName" value={formData.foodName} onChange={handleInputChange} className={inputClass} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Hình ảnh món ăn</label>
            <div className="mt-2 flex items-center gap-4">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                  <ChefHat size={24} />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#EAF7D5] file:text-[#3d6600] hover:file:bg-[#B5E361]/40"
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Thời gian chuẩn bị</label>
              <input type="text" name="prepTime" value={formData.prepTime} onChange={handleInputChange} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Độ khó</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className={inputClass}>
                <option value="Easy">Dễ</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-bold text-[#1f3b00] mb-3">Nguyên liệu</h3>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input type="text" value={ing.name || ''} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} className={`${inputClass} flex-1`} placeholder="Tên nguyên liệu" required />
                  <input type="text" value={ing.amount || ''} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} className={`${inputClass} w-24`} placeholder="Lượng" />
                  <input type="number" value={ing.calories || ''} onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)} className={`${inputClass} w-24`} placeholder="Kcal" />
                  <button type="button" onClick={() => removeIngredient(index)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredient} className="mt-3 text-sm font-bold text-[#8CB33D] hover:text-[#5c8a14] px-4 py-2 rounded-xl hover:bg-[#EAF7D5] transition-colors">+ Thêm nguyên liệu</button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-bold text-[#1f3b00] mb-3">Các bước thực hiện</h3>
            <div className="space-y-3">
              {instructions.map((inst, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="mt-2.5 font-black text-[#B5E361] w-6 text-center shrink-0">{index + 1}.</span>
                  <textarea value={inst || ''} onChange={(e) => handleInstructionChange(index, e.target.value)} rows="2" className={`${inputClass} flex-1`} placeholder="Mô tả bước làm..." required />
                  <button type="button" onClick={() => removeInstruction(index)} className="mt-1 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addInstruction} className="mt-3 text-sm font-bold text-[#8CB33D] hover:text-[#5c8a14] px-4 py-2 rounded-xl hover:bg-[#EAF7D5] transition-colors">+ Thêm bước làm</button>
          </div>
        </form>
        
        <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50/50 shrink-0 flex justify-end gap-3 rounded-b-[32px]">
          <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors" onClick={() => setIsEditing(false)}>Hủy</button>
          <button type="button" onClick={handleSave} className="px-6 py-2.5 rounded-xl font-bold text-[#1f3b00] bg-[#B5E361] hover:bg-[#a3d14f] flex items-center gap-2 shadow-lg shadow-[#B5E361]/30 transition-all hover:-translate-y-0.5">
            <Check size={18} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealDetailModal;
