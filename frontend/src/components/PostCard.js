import React from 'react';

function PostCard({ post, onLike, onSave, onOpenDetail, onAddToPlan }) {
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
        <div className="action-group">
          <button className={`action-btn ${post.isLiked ? 'liked' : ''}`} onClick={() => onLike(post.id)}>
            {post.isLiked ? '❤️' : '🤍'} {post.likes}
          </button>
          <button className="action-btn" onClick={() => onOpenDetail(post)}>
            💬 {post.comments.length}
          </button>
          <button className="action-btn">
            ↗️ Share
          </button>
        </div>
        
        <div className="action-group">
          <button className="action-btn add-meal-btn" onClick={() => onAddToPlan && onAddToPlan(post)}>
            + Meal Plan
          </button>
          <button className={`action-btn ${post.isSaved ? 'saved' : ''}`} onClick={() => onSave(post.id)}>
            {post.isSaved ? '🔖 Saved' : '🔖 Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
