import React, { useState } from 'react';
import { ChefHat, Edit2, Trash2, X, Check } from 'lucide-react';

function MealDetailModal({ meal, onClose, onDelete, onSaveSuccess, initialIsEditing = false }) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
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
      const res = await fetch(`http://localhost:5002/api/recipes/${meal.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
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

  const inputClassName = (baseClass) => {
    return `${baseClass} ${!isEditing ? 'bg-gray-100 opacity-70 cursor-not-allowed' : 'bg-gray-50 focus:ring-2 focus:ring-[#B5E361]/30'}`;
  };

  const whiteInputClassName = (baseClass) => {
    return `${baseClass} ${!isEditing ? 'bg-gray-100 opacity-70 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-[#B5E361]/25 focus:border-[#B5E361]'}`;
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F4FBE7] border border-[#B5E361]/30 rounded-xl flex items-center justify-center text-green-700">
              {isEditing ? <Edit2 size={20} /> : <ChefHat size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">{isEditing ? 'Chỉnh sửa món ăn' : 'Chi tiết món ăn'}</h2>
              <p className="text-xs text-gray-400 font-bold mt-0.5">{isEditing ? 'Cập nhật thông tin chi tiết cho món ăn của bạn.' : 'Xem thông tin chi tiết của món ăn.'}</p>
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form className="p-6 overflow-y-auto flex-1 custom-scrollbar" onSubmit={handleSave}>
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Column: Image & Basic Info */}
            <div className="flex-1 space-y-6 md:max-w-[320px] shrink-0">
              {/* Image Upload Banner */}
              <div className={`relative w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 transition-colors group ${!isEditing ? 'opacity-70' : 'hover:border-[#B5E361]/50'}`}>
                <label className={`${!isEditing ? 'cursor-default' : 'cursor-pointer'} flex flex-col items-center justify-center w-full min-h-[200px] text-gray-400 ${!isEditing ? '' : 'hover:text-[#3d6600]'}`}>
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full min-h-[200px] object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <ChefHat size={36} />
                      <span className="text-sm font-bold">{isEditing ? 'Tải ảnh lên từ máy' : 'Chưa có hình ảnh'}</span>
                      {isEditing && <span className="text-xs text-gray-400 font-medium">Nhấn vào đây để chọn ảnh</span>}
                    </div>
                  )}
                  {formData.image && isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Thay đổi ảnh</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    disabled={!isEditing}
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
                <label className="text-[12px] font-black text-gray-700 pl-1">Tên món ăn *</label>
                <input 
                  type="text" name="foodName" value={formData.foodName} onChange={handleInputChange} 
                  disabled={!isEditing}
                  className={inputClassName("w-full border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold transition-all placeholder:text-gray-300")} 
                  placeholder="Ví dụ: Salad Ức Gà, Bún Chả..." required 
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-gray-700 pl-1">Mô tả</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange} rows="3" 
                  disabled={!isEditing}
                  className={inputClassName("w-full border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-semibold transition-all placeholder:text-gray-300 resize-none")} 
                  placeholder="Nhập mô tả ngắn gọn về món ăn này..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Prep Time */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-gray-700 pl-1">Thời gian nấu</label>
                  <input 
                    type="text" name="prepTime" value={formData.prepTime} onChange={handleInputChange} 
                    disabled={!isEditing}
                    className={inputClassName("w-full border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold transition-all placeholder:text-gray-300")}
                    placeholder="Ví dụ: 30 phút"
                  />
                </div>
                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-gray-700 pl-1">Độ khó</label>
                  <select 
                    name="difficulty" value={formData.difficulty} onChange={handleInputChange} 
                    disabled={!isEditing}
                    className={inputClassName("w-full border-none rounded-xl px-4 py-3 text-sm text-gray-900 font-bold transition-all" + (isEditing ? " cursor-pointer" : ""))}
                  >
                    <option value="Easy">Dễ</option>
                    <option value="Medium">Trung bình</option>
                    <option value="Hard">Khó</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Ingredients & Instructions */}
            <div className="flex-[1.5] flex flex-col space-y-6">
              
              {/* Ingredients */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <label className="text-[13px] font-black text-gray-800 px-2">Nguyên liệu</label>
                  {isEditing && (
                    <button 
                      type="button" onClick={addIngredient}
                      className="bg-white hover:bg-[#B5E361] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border border-gray-200 hover:border-[#B5E361]"
                    >
                      + Thêm nguyên liệu
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 px-1">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-2xl border border-gray-100 group hover:border-[#B5E361]/40 hover:shadow-md transition-all duration-300">
                      <div className="flex-1">
                        <input 
                          type="text" value={ing.name || ''} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} 
                          disabled={!isEditing}
                          className={whiteInputClassName("w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-bold transition-all")} 
                          placeholder="Tên nguyên liệu" required 
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" value={ing.amount || ''} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} 
                          disabled={!isEditing}
                          className={whiteInputClassName("w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-bold transition-all")} 
                          placeholder="Lượng" 
                        />
                        <input 
                          type="number" value={ing.calories || ''} onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)} 
                          disabled={!isEditing}
                          className={whiteInputClassName("w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-bold transition-all text-orange-600")} 
                          placeholder="Kcal" 
                        />
                        {isEditing && (
                          <button type="button" onClick={() => removeIngredient(index)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {ingredients.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold text-xs bg-gray-50/50">
                      Chưa có nguyên liệu nào được thêm
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <label className="text-[13px] font-black text-gray-800 px-2">Cách làm</label>
                  {isEditing && (
                    <button 
                      type="button" onClick={addInstruction}
                      className="bg-white hover:bg-[#B5E361] text-[#1f3b00] text-[10px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border border-gray-200 hover:border-[#B5E361]"
                    >
                      + Thêm bước làm
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 px-1">
                  {instructions.map((inst, index) => (
                    <div key={index} className="flex gap-4 items-start p-3 bg-white rounded-2xl border border-gray-100 group hover:border-[#B5E361]/40 hover:shadow-md transition-all duration-300">
                      <div className="w-8 h-8 mt-0.5 shrink-0 bg-gradient-to-br from-[#EAF7D5] to-[#f4fbe7] border border-[#B5E361]/30 text-[#3d6600] rounded-full flex items-center justify-center font-black text-xs shadow-sm">
                        {index + 1}
                      </div>
                      <textarea 
                        value={inst || ''} onChange={(e) => handleInstructionChange(index, e.target.value)} rows="2" 
                        disabled={!isEditing}
                        className={whiteInputClassName("flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-bold transition-all resize-none")} 
                        placeholder="Mô tả bước làm..." required 
                      />
                      {isEditing && (
                        <button type="button" onClick={() => removeInstruction(index)} className="mt-1 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  {instructions.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold text-xs bg-gray-50/50">
                      Chưa có cách làm nào được thêm
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#eef8da] to-[#f4fbe7] border-t border-[#e2f1c3] shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            
            {/* Macros Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Calories */}
              <div className="bg-[#fcfdfa] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px] shadow-sm border border-white">
                <span className="text-[10px] sm:text-[11px] font-black text-[#95b058] mb-0.5">Calories</span>
                <span className="text-lg sm:text-2xl font-black text-[#3d6600] leading-none mt-1">{meal.calories || 0}</span>
              </div>
              {/* Protein */}
              <div className="bg-[#f2f8fc] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px] shadow-sm border border-white">
                <span className="text-[10px] sm:text-[11px] font-black text-[#4b8beb] mb-0.5">Protein</span>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-lg sm:text-2xl font-black text-[#2563eb] leading-none">{meal.macros?.protein || 0}</span>
                  <span className="text-[10px] sm:text-xs font-black text-[#60a5fa]">g</span>
                </div>
              </div>
              {/* Carbs */}
              <div className="bg-[#fff9f0] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px] shadow-sm border border-white">
                <span className="text-[10px] sm:text-[11px] font-black text-[#f17b35] mb-0.5">Carbs</span>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-lg sm:text-2xl font-black text-[#ea580c] leading-none">{meal.macros?.carbs || 0}</span>
                  <span className="text-[10px] sm:text-xs font-black text-[#fb923c]">g</span>
                </div>
              </div>
              {/* Fat */}
              <div className="bg-[#fff4f5] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px] shadow-sm border border-white">
                <span className="text-[10px] sm:text-[11px] font-black text-[#f15e61] mb-0.5">Fat</span>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-lg sm:text-2xl font-black text-[#e11d48] leading-none">{meal.macros?.fat || 0}</span>
                  <span className="text-[10px] sm:text-xs font-black text-[#fb7185]">g</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {!isEditing ? (
                <>
                  {onDelete && (
                    <button type="button" onClick={onDelete} className="px-4 py-2.5 text-red-500 font-black rounded-xl hover:bg-white transition-all flex items-center gap-1.5 shadow-sm">
                      <Trash2 size={16} strokeWidth={3} /> Xóa
                    </button>
                  )}
                  <button type="button" onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-white text-[#1f3b00] text-[13px] font-black rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border border-[#e2f1c3]">
                    <Edit2 size={16} strokeWidth={3} /> Chỉnh sửa
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2.5 text-gray-500 text-[13px] font-black rounded-xl hover:bg-white transition-all shadow-sm border border-[#e2f1c3] bg-white/50">
                    Hủy
                  </button>
                  <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-[#B5E361] text-[#1f3b00] text-[13px] font-black rounded-xl hover:bg-[#a7e965] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 border border-[#9dcf46]">
                    <Check size={16} strokeWidth={3} /> Xác nhận
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default MealDetailModal;
