import React from 'react';

function GroceryListModal({ weeklyPlan, onClose }) {
  // Extract and deduplicate ingredients
  const extractIngredients = () => {
    const ingredientCounts = {};

    weeklyPlan.forEach(day => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
        const recipeList = day.meals[mealType];
        if (recipeList && Array.isArray(recipeList)) {
          recipeList.forEach(recipe => {
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach(ing => {
                const lowerIng = ing.toLowerCase().trim();
                if (ingredientCounts[lowerIng]) {
                  ingredientCounts[lowerIng].count += 1;
                } else {
                  ingredientCounts[lowerIng] = { name: ing, count: 1 };
                }
              });
            }
          });
        }
      });
    });

    return Object.values(ingredientCounts).sort((a, b) => a.name.localeCompare(b.name));
  };

  const ingredientsList = extractIngredients();

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">🛒 Danh sách mua sắm</h2>
            <p className="text-sm text-gray-500 mt-1">Các nguyên liệu cần thiết cho tuần này</p>
          </div>
          <button className="text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>✕</button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {ingredientsList.length > 0 ? (
            <div className="space-y-3">
              {ingredientsList.map((ing, index) => (
                <label key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                  <input type="checkbox" className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                  <span className="flex-1 text-gray-800 font-medium">{ing.name}</span>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {ing.count > 1 ? `x${ing.count}` : ''}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-3 block">🤷‍♂️</span>
              <p>Kế hoạch ăn uống của bạn đang trống.</p>
              <p className="text-sm mt-1">Hãy thêm món ăn để tạo danh sách mua sắm!</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button className="w-full btn-primary py-3 rounded-xl font-bold text-lg" onClick={() => alert("Đã sao chép vào bộ nhớ tạm!")}>
            Sao chép vào bộ nhớ tạm
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroceryListModal;
