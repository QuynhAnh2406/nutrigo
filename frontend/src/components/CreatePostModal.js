import React, { useState } from 'react';

function CreatePostModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    image: '',
    prepTime: '',
    difficulty: 'Easy',
    tags: ''
  });

  const [ingredients, setIngredients] = useState([{ name: '', amount: '', calories: '' }]);
  const [instructions, setInstructions] = useState(['']);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    // Calculate total calories preview
    const totalCal = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);

    const newPostData = {
      ...formData,
      tags: tagsArray,
      ingredients: ingredients.filter(i => i.name),
      instructions: instructions.filter(i => i),
      calories: totalCal
    };

    onSubmit(newPostData);
  };

  const currentTotalCalories = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-post-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Đăng món ăn mới</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Tên món ăn *</label>
            <input type="text" name="foodName" value={formData.foodName} onChange={handleInputChange} required placeholder="Ví dụ: Salad ức gà" />
          </div>
          
          <div className="form-group">
            <label>Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Chia sẻ một chút về món ăn này..." rows="2" />
          </div>

          <div className="form-group">
            <label>Đường dẫn hình ảnh (URL)</label>
            <input type="url" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thời gian chuẩn bị</label>
              <input type="text" name="prepTime" value={formData.prepTime} onChange={handleInputChange} placeholder="Ví dụ: 20 phút" />
            </div>
            <div className="form-group">
              <label>Độ khó</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                <option value="Easy">Dễ</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Nhãn (phân cách bằng dấu phẩy)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Ít Calo, Chay, Keto..." />
          </div>

          <div className="form-section">
            <h3>Nguyên liệu</h3>
            {ingredients.map((ing, index) => (
              <div key={index} className="dynamic-row">
                <input type="text" placeholder="Tên nguyên liệu (Ví dụ: Ức gà)" value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} required />
                <input type="text" placeholder="Định lượng (Ví dụ: 100g)" value={ing.amount} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} />
                <input type="number" placeholder="Calo" value={ing.calories} onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)} />
                <button type="button" onClick={() => removeIngredient(index)} className="btn-remove">✕</button>
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="btn-add-row">+ Thêm nguyên liệu</button>
            <div className="total-calo-preview">
              Tổng lượng calo ước tính: <strong>{currentTotalCalories} kcal</strong>
            </div>
          </div>

          <div className="form-section">
            <h3>Các bước thực hiện</h3>
            {instructions.map((inst, index) => (
              <div key={index} className="dynamic-row">
                <span className="step-number">{index + 1}.</span>
                <textarea placeholder="Mô tả bước này..." value={inst} onChange={(e) => handleInstructionChange(index, e.target.value)} required rows="2" />
                <button type="button" onClick={() => removeInstruction(index)} className="btn-remove">✕</button>
              </div>
            ))}
            <button type="button" onClick={addInstruction} className="btn-add-row">+ Thêm bước</button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary">Đăng</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
