import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit2, Trash2, Flame, Wheat, Fish, Droplet, ChefHat } from 'lucide-react';

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

  // Try to determine meal category or use generic
  const mealCategory = post.meal_type || post.category || 'Món ăn';


  return (
    <div className="relative bg-[#faf7f2] rounded-[28px] p-4 sm:p-5 flex flex-col gap-4 border border-[#f0ebe1] hover:shadow-[0_10px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
      
      {/* Floating Menu Button (Top Right corner) */}
      {(onEdit || onDelete) && (
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button 
            type="button"
            className="w-8 h-8 bg-white/50 hover:bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 text-gray-500 hover:text-gray-900" 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-44 animate-in fade-in slide-in-from-top-2 z-50">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(post);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                >
                  <Edit2 size={14} className="text-gray-400" />
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
                  className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                  <Trash2 size={14} className="text-red-400" />
                  Xóa công thức
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Top Section: Image + Title + Button */}
      <div className="flex gap-4 sm:gap-5 items-stretch cursor-pointer relative z-10" onClick={() => onOpenDetail(post)}>
        {/* Image Container */}
        <div className="w-[120px] h-[90px] sm:w-[150px] sm:h-[110px] shrink-0 rounded-[20px] overflow-hidden bg-gradient-to-br from-[#F4FBE7] to-[#EAF7D5] shadow-sm">
          {post.image ? (
            <img src={post.image} alt={post.foodName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
               <ChefHat size={28} className="text-[#8CB33D]" />
               <span className="text-[9px] font-black tracking-widest text-[#8CB33D] uppercase">Nutrigo</span>
            </div>
          )}
        </div>
        
        {/* Title and Button Container */}
        <div className="flex-1 flex flex-col justify-between py-1 pr-6">
           <h3 className="text-base sm:text-[18px] font-extrabold text-[#2d3748] leading-tight line-clamp-2">
             {post.foodName}
           </h3>
           
           {onAddToPlan && (
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onAddToPlan(post);
               }}
               className="mt-auto bg-[#c5e87a] hover:bg-[#b8de6b] text-[#3d6600] font-black text-xs sm:text-sm py-2 px-4 rounded-[14px] transition-colors self-start shadow-sm"
             >
               Add to Meal Plan
             </button>
           )}
        </div>
      </div>

      {/* Middle Section: Tags & Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 mt-1">
         {/* Tags */}
         <div className="flex gap-2">
            <span className="bg-[#c5e87a] text-[#3d6600] px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize shadow-sm">
              {mealCategory}
            </span>
         </div>
         

      </div>

      {/* Bottom Section: Macros */}
      <div className="bg-white rounded-[16px] py-3 px-3 sm:px-5 flex justify-between items-center text-gray-500 text-xs sm:text-[13px] font-bold shadow-sm mt-1">
         <div className="flex items-center gap-1.5 text-gray-700">
           <Flame size={15} strokeWidth={2.5} className="text-gray-400" /> 
           {post.calories || 0} <span className="text-[11px] font-medium text-gray-400">kcal</span>
         </div>
         <div className="w-px h-5 bg-gray-100"></div>
         <div className="flex items-center gap-1.5 text-gray-700">
           <Wheat size={15} strokeWidth={2.5} className="text-gray-400" /> 
           {post.carbs || 0}g <span className="text-[11px] font-medium text-gray-400">C</span>
         </div>
         <div className="w-px h-5 bg-gray-100"></div>
         <div className="flex items-center gap-1.5 text-gray-700">
           <Fish size={15} strokeWidth={2.5} className="text-gray-400" /> 
           {post.protein || 0}g <span className="text-[11px] font-medium text-gray-400">P</span>
         </div>
         <div className="w-px h-5 bg-gray-100"></div>
         <div className="flex items-center gap-1.5 text-gray-700">
           <Droplet size={15} strokeWidth={2.5} className="text-gray-400" /> 
           {post.fat || 0}g <span className="text-[11px] font-medium text-gray-400">F</span>
         </div>
      </div>

    </div>
  );
}

export default PostCard;
