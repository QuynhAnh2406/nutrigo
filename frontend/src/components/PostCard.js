import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

function PostCard({ post, onOpenDetail, onAddToPlan, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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
        
        {(onEdit || onDelete) && (
          <div className="relative" ref={menuRef}>
            <button 
              type="button"
              className="btn-icon w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreHorizontal size={18} className="text-gray-500 hover:text-gray-800" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-150 rounded-2xl shadow-xl py-2 w-40 z-50 animate-in fade-in duration-100">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(post);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 size={14} className="text-gray-500" />
                    Sửa công thức
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(post);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-black text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} className="text-red-500" />
                    Xóa công thức
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content" onClick={() => onOpenDetail(post)}>
        <img src={post.image} alt={post.foodName} className="post-image" />
        <h3 className="post-title">{post.foodName}</h3>
        <p className="post-desc">{post.description}</p>
        

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
