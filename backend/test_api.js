const http = require('http');

const req = http.request('http://localhost:5002/api/mealplan/add-with-recipe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', console.error);

req.write(JSON.stringify({
  day: 'Thursday',
  mealType: 'breakfast',
  mealDate: '2026-06-11',
  saveToMyRecipe: true,
  recipeData: {
    id: null,
    name: 'Test Meal',
    description: 'Test',
    prepTime: '30 phút',
    imageUrl: '',
    ingredients: [
      { name: 'Gạo tẻ', weight_g: 100, calories_per_100g: 130 }
    ]
  }
}));
req.end();
