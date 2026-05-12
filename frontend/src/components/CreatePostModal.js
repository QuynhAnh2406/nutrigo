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
          <h2>Post New Meal</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Food Name *</label>
            <input type="text" name="foodName" value={formData.foodName} onChange={handleInputChange} required placeholder="e.g., Chicken Salad" />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Share a little about this meal..." rows="2" />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input type="url" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prep Time</label>
              <input type="text" name="prepTime" value={formData.prepTime} onChange={handleInputChange} placeholder="e.g., 20 mins" />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Low Calorie, Vegan, Keto..." />
          </div>

          <div className="form-section">
            <h3>Ingredients</h3>
            {ingredients.map((ing, index) => (
              <div key={index} className="dynamic-row">
                <input type="text" placeholder="Ingredient (e.g., Chicken breast)" value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} required />
                <input type="text" placeholder="Amount (e.g., 100g)" value={ing.amount} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} />
                <input type="number" placeholder="Calories" value={ing.calories} onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)} />
                <button type="button" onClick={() => removeIngredient(index)} className="btn-remove">✕</button>
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="btn-add-row">+ Add Ingredient</button>
            <div className="total-calo-preview">
              Estimated Total Calories: <strong>{currentTotalCalories} kcal</strong>
            </div>
          </div>

          <div className="form-section">
            <h3>Instructions</h3>
            {instructions.map((inst, index) => (
              <div key={index} className="dynamic-row">
                <span className="step-number">{index + 1}.</span>
                <textarea placeholder="Step description..." value={inst} onChange={(e) => handleInstructionChange(index, e.target.value)} required rows="2" />
                <button type="button" onClick={() => removeInstruction(index)} className="btn-remove">✕</button>
              </div>
            ))}
            <button type="button" onClick={addInstruction} className="btn-add-row">+ Add Instruction</button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
