import React from 'react';

function PostCard({ post, onOpenDetail, onAddToPlan }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-info">
          <img src={post.avatar} alt={post.author} className="author-avatar" />
          <div>
            <span className="author-name">{post.author}</span>
            <span className="post-time">{post.timeAgo}</span>
          </div>
        </div>
        <button className="btn-icon">⋯</button>
      </div>

      <div className="post-content" onClick={() => onOpenDetail(post)}>
        <img src={post.image} alt={post.foodName} className="post-image" />
        <h3 className="post-title">{post.foodName}</h3>
        <p className="post-desc">{post.description}</p>
        
        <div className="post-tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>

        <div className="post-stats">
          <span>🔥 {post.calories} kcal</span>
          <span>⏱ {post.prepTime}</span>
          <span>⭐ {post.rating}</span>
        </div>
      </div>

      <div className="post-actions">
        <div className="action-group" style={{ width: '100%' }}>
          <button className="action-btn add-meal-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onAddToPlan && onAddToPlan(post)}>
            + Thêm vào Lịch ăn
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
