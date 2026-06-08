import React, { useState } from 'react';

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
      const res = await fetch(`http://localhost:5000/api/posts/${meal.id}`, {
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
  const inputClass = isEditing ? "" : "bg-gray-50 cursor-not-allowed text-gray-700 font-medium";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-post-modal !p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#1f3b00] px-6 py-5 flex justify-between items-center text-white border-b border-[#3d6600]">
          <h2 className="text-xl font-black tracking-widest m-0 text-[#EAF7D5] uppercase">{isEditing ? 'Chỉnh sửa món ăn' : 'Chi tiết bữa ăn'}</h2>
          <button className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors" onClick={onClose}>✕</button>
        </div>

        <form className="create-post-form p-6" onSubmit={handleSave}>
          <div className="form-group">
            <label>Tên món ăn</label>
            <input type="text" name="foodName" value={formData.foodName} onChange={handleInputChange} disabled={!isEditing} className={inputClass} required />
          </div>
          
          <div className="form-group">
            <label>Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} disabled={!isEditing} rows="2" className={inputClass} />
          </div>

          <div className="form-group">
            <label>Hình ảnh món ăn</label>
            <div className="mt-2 flex items-center gap-4">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              )}
              {isEditing && (
                <input 
                  type="file" 
                  accept="image/*" 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#B5E361]/20 file:text-[#3d6600] hover:file:bg-[#B5E361]/40"
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
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thời gian chuẩn bị</label>
              <input type="text" name="prepTime" value={formData.prepTime} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
            </div>
            <div className="form-group">
              <label>Độ khó</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} disabled={!isEditing} className={inputClass}>
                <option value="Easy">Dễ</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó</option>
              </select>
            </div>
          </div>



          <div className="form-section">
            <h3>Nguyên liệu</h3>
            {ingredients.map((ing, index) => (
              <div key={index} className="dynamic-row">
                <input type="text" value={ing.name || ''} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} disabled={!isEditing} className={inputClass} placeholder="Tên" required />
                <input type="text" value={ing.amount || ''} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} disabled={!isEditing} className={inputClass} placeholder="Lượng" />
                <input type="number" value={ing.calories || ''} onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)} disabled={!isEditing} className={inputClass} placeholder="Calo" />
                {isEditing && (
                  <button type="button" onClick={() => removeIngredient(index)} className="btn-remove">✕</button>
                )}
              </div>
            ))}
            {isEditing && (
              <button type="button" onClick={addIngredient} className="btn-add-row">+ Thêm nguyên liệu</button>
            )}
            <div className="total-calo-preview mt-3">
              Tổng lượng calo ước tính: <strong>{currentTotalCalories} kcal</strong>
            </div>
          </div>

          <div className="form-section">
            <h3>Các bước thực hiện</h3>
            {instructions.map((inst, index) => (
              <div key={index} className="dynamic-row">
                <span className="step-number">{index + 1}.</span>
                <textarea value={inst || ''} onChange={(e) => handleInstructionChange(index, e.target.value)} disabled={!isEditing} rows="2" className={inputClass} placeholder="Mô tả..." required />
                {isEditing && (
                  <button type="button" onClick={() => removeInstruction(index)} className="btn-remove">✕</button>
                )}
              </div>
            ))}
            {isEditing && (
              <button type="button" onClick={addInstruction} className="btn-add-row">+ Thêm bước</button>
            )}
          </div>

          <div className="form-actions mt-6 flex justify-between">
            {!isEditing ? (
              <button type="button" className="btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={onDelete}>Xóa khỏi lịch</button>
            ) : (
              <div></div> // Placeholder to keep flex-between layout
            )}
            <div className="flex gap-3">
              {!isEditing ? (
                <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
              ) : (
                <>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Lưu thay đổi</button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MealDetailModal;
