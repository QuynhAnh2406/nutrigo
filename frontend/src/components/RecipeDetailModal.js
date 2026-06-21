import React from 'react';

function RecipeDetailModal({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content post-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-scroll-area">
          <img src={recipe.image} alt={recipe.foodName} className="detail-image" />
          
          <div className="detail-header">
            <h2>{recipe.foodName}</h2>
            <div className="author-info">
              <img src={recipe.avatar} alt={recipe.author} className="author-avatar-small" />
              <span>{recipe.author}</span>
            </div>
            <p className="detail-desc">{recipe.description}</p>
          </div>

          <div className="nutrition-summary">
            <div className="nutri-box">
              <span className="nutri-label">Calories</span>
              <span className="nutri-val">{recipe.calories}</span>
            </div>
            <div className="nutri-box">
              <span className="nutri-label">Carbs</span>
              <span className="nutri-val">{recipe.macros?.carbs}g</span>
            </div>
            <div className="nutri-box">
              <span className="nutri-label">Protein</span>
              <span className="nutri-val">{recipe.macros?.protein}g</span>
            </div>
            <div className="nutri-box">
              <span className="nutri-label">Fat</span>
              <span className="nutri-val">{recipe.macros?.fat}g</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Nguyên liệu</h3>
            <ul className="ingredient-list">
              {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="ingredient-item">
                  <span className="ing-name">{ing.name} ({ing.amount || `${ing.weight_g}g`})</span>
                  <span className="ing-cal">{Math.round(ing.calories || 0)} kcal</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Các bước thực hiện</h3>
            <ol className="instruction-list">
              {recipe.instructions && recipe.instructions.map((step, idx) => (
                <li key={idx} className="instruction-step">
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RecipeDetailModal;
