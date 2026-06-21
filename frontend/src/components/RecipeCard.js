import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit2, Trash2, Flame, Wheat, Fish, Droplet, ChefHat } from 'lucide-react';

function RecipeCard({ recipe, onOpenDetail, onAddToPlan, onEdit, onDelete }) {
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

  // Translate category mapping
  const categoryMap = {
    'food': 'Món ăn',
    'drink': 'Đồ uống',
    'snack': 'Ăn vặt',
    'breakfast': 'Bữa sáng',
    'lunch': 'Bữa trưa',
    'dinner': 'Bữa tối'
  };
  const mealCategory = categoryMap[recipe.meal_type] || categoryMap[recipe.category] || recipe.meal_type || recipe.category || 'Món ăn';


  return (
    <div className="relative bg-[#faf7f2] rounded-[24px] p-3.5 sm:p-4 flex flex-col gap-3 border border-[#f0ebe1] hover:shadow-[0_10px_30px_rgb(0,0,0,0.05)] hover:border-[#e2dccf] transition-all duration-300 cursor-pointer group h-full">
      
      {/* Floating Menu Button (Top Right corner) */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 z-30" ref={menuRef}>
          <button 
            type="button"
            className="w-8 h-8 bg-white/50 hover:bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 text-gray-500 hover:text-gray-900 shadow-sm" 
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
                    onEdit(recipe);
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
                    onDelete(recipe);
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

      {/* Top Section: Image + Title + Tags */}
      <div className="flex gap-3 items-start relative z-10" onClick={() => onOpenDetail(recipe)}>
        {/* Image Container */}
        <div className="w-[85px] h-[85px] shrink-0 rounded-[18px] overflow-hidden bg-gradient-to-br from-[#F4FBE7] to-[#EAF7D5] shadow-sm">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.foodName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
               <ChefHat size={24} className="text-[#8CB33D]" />
               <span className="text-[8px] font-black tracking-widest text-[#8CB33D] uppercase">Nutrigo</span>
            </div>
          )}
        </div>
        
        {/* Title and Tags Container */}
        <div className="flex-1 flex flex-col py-0.5 h-[85px] pr-8">
           <h3 className="text-[15px] sm:text-base font-extrabold text-[#2d3748] leading-tight line-clamp-2 mb-2">
             {recipe.foodName}
           </h3>
           <div className="flex flex-wrap gap-1.5 mt-auto">
             <span className="bg-[#c5e87a] text-[#3d6600] px-2.5 py-1 rounded-xl text-[10px] font-extrabold capitalize shadow-sm inline-block">
               {mealCategory}
             </span>
           </div>
        </div>
      </div>

      {/* Select Button */}
      {onAddToPlan && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlan(recipe);
          }}
          className="w-full bg-white group-hover:bg-[#c5e87a] border border-[#e4e1d6] group-hover:border-[#c5e87a] text-[#6d795a] group-hover:text-[#3d6600] font-bold text-sm py-2 rounded-xl transition-all shadow-sm relative z-20 mt-1"
        >
          Add to Meal Plan
        </button>
      )}

      {/* Bottom Section: Macros */}
      <div className="bg-white rounded-[16px] py-2 px-1 sm:px-2 grid grid-cols-4 gap-1 shadow-sm mt-auto relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
            <Flame size={12} strokeWidth={2.5} className="text-[#8CB33D]" /> kcal
          </div>
          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.calories || 0}</span>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-gray-100">
          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
            <Wheat size={12} strokeWidth={2.5} className="text-orange-500" /> Carb
          </div>
          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.carbs || 0}g</span>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-gray-100">
          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
            <Fish size={12} strokeWidth={2.5} className="text-blue-500" /> Pro
          </div>
          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.protein || 0}g</span>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-gray-100">
          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">
            <Droplet size={12} strokeWidth={2.5} className="text-red-500" /> Béo
          </div>
          <span className="text-[11px] sm:text-[12px] font-black text-gray-700">{recipe.fat || 0}g</span>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
