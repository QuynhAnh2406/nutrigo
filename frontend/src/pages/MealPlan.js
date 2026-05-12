import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GroceryListModal from '../components/GroceryListModal';
import { CalendarDays, Sparkles, ShoppingCart, Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function MealPlan() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('calendar'); // 'calendar' or 'suggestions'
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  
  // Suggestion State
  const [userIngredients, setUserIngredients] = useState(['Trứng', 'Thịt bò']);
  const [ingredientInput, setIngredientInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Drag and drop state
  const [draggedMeal, setDraggedMeal] = useState(null);
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);

  // Calendar Date State
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const days = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    days.push({
      dateObj: d,
      name: dayNames[i],
      formatted: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    });
  }

  const handleAutoFill = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/mealplan/autofill', { method: 'POST' });
      const data = await res.json();
      if(data.success) {
        setWeeklyPlan(data.data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchWeeklyPlan();
  }, []);

  const fetchWeeklyPlan = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/mealplan');
      const data = await res.json();
      if(data.success) {
        setWeeklyPlan(data.data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/mealplan/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIngredients })
      });
      const data = await res.json();
      if(data.success) {
        setSuggestions(data.data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeSection === 'suggestions') {
      fetchSuggestions();
    }
  }, [userIngredients, activeSection]);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (ingredientInput.trim() && !userIngredients.includes(ingredientInput.trim())) {
      setUserIngredients([...userIngredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ing) => {
    setUserIngredients(userIngredients.filter(i => i !== ing));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, day, mealType, recipe) => {
    setDraggedMeal({ sourceDay: day, sourceMealType: mealType, recipe });
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e, targetDay, targetMealType) => {
    e.preventDefault();
    if (!draggedMeal) return;

    // 1. Remove from source
    await fetch('http://localhost:5000/api/mealplan/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: draggedMeal.sourceDay, mealType: draggedMeal.sourceMealType, recipeId: null })
    });

    // 2. Add to target
    await fetch('http://localhost:5000/api/mealplan/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: targetDay, mealType: targetMealType, recipeId: draggedMeal.recipe.id })
    });

    setDraggedMeal(null);
    fetchWeeklyPlan();
  };

  const addToPlan = async (recipe, day, mealType) => {
    await fetch('http://localhost:5000/api/mealplan/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day, mealType, recipeId: recipe.id })
    });
    alert(`Added ${recipe.name} to ${mealType} on ${day}`);
    fetchWeeklyPlan();
  };

  const calculateDailyTotal = (meals) => {
    let total = 0;
    Object.values(meals).forEach(m => {
      if (m && m.calories) total += m.calories;
    });
    return total;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mealplan-page main-content">
      {/* Breadcrumb - Only visible in suggestions mode */}
      {activeSection === 'suggestions' && (
        <nav className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => setActiveSection('calendar')} 
            className="section-title mb-0 text-gray-400 hover:text-green-600 transition-colors"
          >
            Meal Plan
          </button>
          <span className="section-title mb-0 text-gray-400">/</span>
          <h3 className="section-title mb-0">Smart Suggestions</h3>
        </nav>
      )}

      {activeSection === 'calendar' && (
        <div className="no-print mb-8">
          <PageHeader
            title="My Meal Plan"
            subtitle="Plan your week, drag & drop meals, and export when you're ready."
            icon={CalendarDays}
            badge={`${days[0].formatted} → ${days[6].formatted}`}
            actions={
              <>
                <button
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-sm font-extrabold text-gray-900 shadow-sm ring-1 ring-white/70 backdrop-blur transition-colors hover:bg-white"
                  onClick={() => setIsGroceryModalOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Grocery List
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-black"
                  onClick={handleAutoFill}
                >
                  <Sparkles className="h-4 w-4" />
                  Auto-Fill
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-sm font-extrabold text-gray-900 shadow-sm ring-1 ring-white/70 backdrop-blur transition-colors hover:bg-white"
                  onClick={() => setActiveSection('suggestions')}
                >
                  <Lightbulb className="h-4 w-4" />
                  Smart Suggestions
                </button>
              </>
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-2xl bg-white/70 p-1 shadow-sm ring-1 ring-white/70 backdrop-blur">
                <button
                  onClick={prevWeek}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-gray-700 hover:bg-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Prev
                </button>
                <div className="px-3 text-sm font-extrabold text-gray-900 whitespace-nowrap">
                  {days[0].formatted} - {days[6].formatted}
                </div>
                <button
                  onClick={nextWeek}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-gray-700 hover:bg-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="rounded-2xl bg-white/70 px-4 py-2 text-xs font-extrabold text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white" onClick={handlePrint}>
                  🖨️ Export PDF
                </button>
                <button className="rounded-2xl bg-white/70 px-4 py-2 text-xs font-extrabold text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white">
                  💾 Save Template
                </button>
                <button className="rounded-2xl bg-white/70 px-4 py-2 text-xs font-extrabold text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white">
                  ⚖️ Adjust Portions
                </button>
              </div>
            </div>
          </PageHeader>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0 w-full">
          {activeSection === 'calendar' && (
            <div className="calendar-section">
          <div className="calendar-grid-wrapper">
            <div className="calendar-grid">
              {/* Headers */}
              <div className="grid-header empty-cell"></div>
              {weeklyPlan.map(d => {
                const dateObj = days.find(dayInfo => dayInfo.name === d.day);
                return (
                  <div key={d.day} className="grid-header day-header text-center flex flex-col justify-center gap-1">
                    <div className="font-bold">{d.day.substring(0, 3)}</div>
                    {dateObj && <div className="text-xs text-gray-500 font-normal">{dateObj.formatted}</div>}
                    
                    {/* Calorie Progress Bar */}
                    <div className="w-full max-w-[80px] mx-auto mt-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                        <span>{calculateDailyTotal(d.meals)}</span>
                        <span>2000</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${calculateDailyTotal(d.meals) > 2000 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((calculateDailyTotal(d.meals) / 2000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Rows */}
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                <React.Fragment key={mealType}>
                  <div className="grid-cell meal-type-label">
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </div>
                  {weeklyPlan.map(d => {
                    const recipe = d.meals[mealType];
                    return (
                      <div 
                        key={`${d.day}-${mealType}`} 
                        className="grid-cell droppable-cell"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, d.day, mealType)}
                      >
                        {recipe ? (
                          <div 
                            className="recipe-card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, d.day, mealType, recipe)}
                          >
                            <div className="recipe-name">{recipe.name}</div>
                            <div className="recipe-cal">{recipe.calories} kcal</div>
                            <button 
                              className="btn-swap no-print"
                              onClick={() => {
                                 // Quick remove for mock swap
                                 fetch('http://localhost:5000/api/mealplan/update', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ day: d.day, mealType, recipeId: null })
                                 }).then(fetchWeeklyPlan);
                              }}
                            >✕ Remove</button>
                          </div>
                        ) : (
                          <div className="empty-recipe no-print">+ Add</div>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'suggestions' && (
        <div className="suggestions-section">
          <div className="no-print mb-6">
            <PageHeader
              title="Smart Suggestions"
              subtitle="Tell us what's in your fridge — we'll find meals that match."
              icon={Lightbulb}
              actions={
                <button
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-black"
                  onClick={() => setActiveSection('calendar')}
                >
                  <CalendarDays className="h-4 w-4" />
                  Back to Calendar
                </button>
              }
            />
          </div>
          <div className="ingredients-panel">
            <h3>Your Fridge</h3>
            <form onSubmit={handleAddIngredient} className="ingredient-form">
              <input 
                type="text" 
                value={ingredientInput} 
                onChange={(e) => setIngredientInput(e.target.value)} 
                placeholder="Add ingredient (e.g., Salmon)"
              />
              <button type="submit" className="btn-primary">+</button>
            </form>
            <ul className="user-ingredients-list">
              {userIngredients.map((ing, idx) => (
                <li key={idx}>
                  {ing} <button onClick={() => removeIngredient(ing)}>✕</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="suggestions-panel">
            <h3>Suggested Meals ({suggestions.length})</h3>
            <div className="suggestions-list">
              {suggestions.map(s => (
                <div key={s.id} className="suggestion-card">
                  <div className="sugg-header">
                    <h4>{s.name}</h4>
                    <span className={`match-badge ${s.missingCount === 0 ? 'perfect' : 'partial'}`}>
                      {s.matchPercentage}% ({s.matchStatus})
                    </span>
                  </div>
                  <div className="sugg-details">
                    <span>🔥 {s.calories} kcal</span>
                    <span>⏱ {s.prepTime}</span>
                  </div>
                  <div className="sugg-ingredients">
                    <strong>Ingredients: </strong>
                    {s.ingredients.map(ing => {
                      const hasIt = userIngredients.some(ui => ui.toLowerCase() === ing.toLowerCase());
                      return <span key={ing} className={hasIt ? 'has-ing' : 'miss-ing'}>{ing}</span>;
                    })}
                  </div>
                  <div className="sugg-actions">
                    <select id={`day-${s.id}`} className="sugg-select">
                      {weeklyPlan.map(d => <option key={d.day} value={d.day}>{d.day}</option>)}
                    </select>
                    <select id={`meal-${s.id}`} className="sugg-select">
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                    <button 
                      className="btn-primary btn-small"
                      onClick={() => {
                        const day = document.getElementById(`day-${s.id}`).value;
                        const meal = document.getElementById(`meal-${s.id}`).value;
                        addToPlan(s, day, meal);
                      }}
                    >
                      + Add to Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>

        {/* Right Sidebar - Trending Meals */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              🔥 Trending Meals
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80" alt="Avocado Toast" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">Avocado Toast</h4>
                  <span className="text-xs font-medium text-gray-500">320 kcal • Easy</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&q=80" alt="Quinoa Bowl" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">Chicken Quinoa Bowl</h4>
                  <span className="text-xs font-medium text-gray-500">450 kcal • Medium</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=100&q=80" alt="Salmon Salad" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">Grilled Salmon Salad</h4>
                  <span className="text-xs font-medium text-gray-500">380 kcal • Easy</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <img src="https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=100&q=80" alt="Overnight Oats" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">Berry Overnight Oats</h4>
                  <span className="text-xs font-medium text-gray-500">290 kcal • Beginner</span>
                </div>
              </div>
            </div>
            <button 
              className="w-full mt-6 py-3 text-sm text-green-700 font-bold bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              onClick={() => navigate('/community')}
            >
              Explore Community
            </button>
          </div>
        </div>
      </div>

      {isGroceryModalOpen && (
        <GroceryListModal 
          weeklyPlan={weeklyPlan} 
          onClose={() => setIsGroceryModalOpen(false)} 
        />
      )}
    </div>
  );
}

export default MealPlan;
