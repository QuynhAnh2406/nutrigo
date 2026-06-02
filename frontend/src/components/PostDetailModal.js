import React from 'react';

function PostDetailModal({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content post-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-scroll-area">
          <img src={post.image} alt={post.foodName} className="detail-image" />
          
          <div className="detail-header">
            <h2>{post.foodName}</h2>
            <div className="author-info">
              <img src={post.avatar} alt={post.author} className="author-avatar-small" />
              <span>{post.author}</span>
            </div>
            <p className="detail-desc">{post.description}</p>
          </div>

          <div className="nutrition-summary">
            <div className="nutri-box">
              <span className="nutri-label">Calories</span>
              <span className="nutri-val">{post.calories}</span>
            </div>
            <div className="nutri-box">
              <span className="nutri-label">Carbs</span>
              <span className="nutri-val">{post.macros.carbs}g</span>
            </div>
            <div className="nutri-box">
              <span className="nutri-label">Protein</span>
              <span className="nutri-val">{post.macros.protein}g</span>
            </div>
            <div className="nutri-box">
              <span className="nutri-label">Fat</span>
              <span className="nutri-val">{post.macros.fat}g</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Nguyên liệu</h3>
            <ul className="ingredient-list">
              {post.ingredients.map((ing, idx) => (
                <li key={idx} className="ingredient-item">
                  <span className="ing-name">{ing.name} ({ing.amount})</span>
                  <span className="ing-cal">{ing.calories} kcal</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Các bước thực hiện</h3>
            <ol className="instruction-list">
              {post.instructions.map((step, idx) => (
                <li key={idx} className="instruction-step">
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="detail-section">
            <h3>Bình luận ({post.comments.length})</h3>
            <div className="comment-list">
              {post.comments.map(c => (
                <div key={c.id} className="comment-item">
                  <strong>{c.user}:</strong> {c.text}
                </div>
              ))}
            </div>
            <div className="comment-input-area">
               <input type="text" placeholder="Thêm bình luận..." className="comment-input" />
               <button className="btn-primary btn-small">Đăng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailModal;
