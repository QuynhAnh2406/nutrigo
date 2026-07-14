const express = require('express');
const router = express.Router();
const db = require('../config/db');

async function getUnsplashImage(keyword, index = 0) {
  try {
    const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(keyword + ' food')}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) throw new Error('Unsplash fetch failed');
    const html = await response.text();
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g;
    const matches = html.match(regex);
    if (matches && matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches));
      const selected = uniqueMatches[index % uniqueMatches.length] || uniqueMatches[0];
      return `${selected}?auto=format&fit=crop&w=800&q=80`;
    }
  } catch (e) {
    console.error('Failed to scrape Unsplash image:', e);
  }
  return `https://loremflickr.com/800/600/food,${encodeURIComponent(keyword)}?random=${index}`;
}

router.post('/generate-recipe', async (req, res) => {
  try {
    const { ingredients, mealType, category, maxCalories } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách nguyên liệu không hợp lệ.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API Key chưa được thiết lập ở backend.' });
    }

    const { rows: dbIngredients } = await db.query('SELECT name FROM ingredients');
    const validDbNames = dbIngredients.map(r => r.name).join(', ');
    let preferencePrompt = '';

    if (mealType && mealType !== 'All') {
      const typeVi = mealType === 'breakfast' ? 'bữa sáng' : mealType === 'lunch' ? 'bữa trưa' : mealType === 'dinner' ? 'bữa tối' : 'bữa phụ';
      preferencePrompt += `\n- Món ăn này BẮT BUỘC phải phù hợp để ăn vào ${typeVi}.`;
    }
    if (category && category !== 'All') {
      const catVi = category === 'food' ? 'món ăn (đồ ăn)' : category === 'drink' ? 'đồ uống' : 'đồ ăn vặt (snack)';
      preferencePrompt += `\n- Thể loại của món này BẮT BUỘC phải là ${catVi}.`;
    }

    let healthPrompt = '';
    let dbMaxCalories = null;
    const userId = req.user ? req.user.id : null;

    if (userId) {
      const { rows: healthRows } = await db.query(
        'SELECT * FROM user_health_data WHERE user_id = $1',
        [userId]
      );
      if (healthRows.length > 0) {
        const h = healthRows[0];
        let age = 25;
        if (h.date_of_birth) {
          const today = new Date();
          const birthDate = new Date(h.date_of_birth);
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
        const weight = Number(h.weight_kg) || 60;
        const height = Number(h.height_cm) || 165;
        const multipliers = {
          'Sedentary': 1.2,
          'Lightly Active': 1.375,
          'Moderately Active': 1.55,
          'Very Active': 1.725,
          'Extra Active': 1.9
        };
        let bmr = 0;
        if (h.gender === 'Male') {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else if (h.gender === 'Female') {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 78;
        }
        const tdee = Math.round(bmr * (multipliers[h.activity_level] || 1.2));
        let targetCal = tdee;
        if (h.goal === 'Lose Weight') targetCal -= 500;
        else if (h.goal === 'Gain Weight') targetCal += 500;

        healthPrompt += `\n- Người dùng này có thông số cơ thể: Giới tính ${h.gender === 'Male' ? 'Nam' : 'Nữ'}, Nặng ${weight}kg, Cao ${height}cm, Tuổi ${age}, Cường độ vận động: ${h.activity_level}.`;
        healthPrompt += `\n- Mục tiêu sức khỏe của người dùng là: ${h.goal === 'Lose Weight' ? 'Giảm cân (cần thâm hụt calo)' : h.goal === 'Gain Weight' ? 'Tăng cân (cần thặng dư calo)' : 'Giữ cân (cân bằng calo)'}.`;
        if (h.allergies && h.allergies.trim()) {
          healthPrompt += `\n- CẢNH BÁO DỊ ỨNG: Người dùng bị dị ứng với các thành phần sau: ${h.allergies}. BẮT BUỘC KHÔNG được sử dụng bất cứ nguyên liệu nào liên quan đến thực phẩm gây dị ứng này trong các công thức gợi ý.`;
        }
        if (h.dietary_preference && h.dietary_preference !== 'None') {
          healthPrompt += `\n- Chế độ ăn kiêng ưu tiên: ${h.dietary_preference}. Hãy chọn các món phù hợp với chế độ ăn này.`;
        }
        if (!maxCalories) {
          dbMaxCalories = Math.round(targetCal * 0.35); // 35% of daily target calo
        }
      }
    }

    if (maxCalories) {
      preferencePrompt += `\n- Lượng calo (calories) của TẤT CẢ các món ăn gợi ý BẮT BUỘC phải nhỏ hơn hoặc bằng ${maxCalories} kcal.`;
    } else if (dbMaxCalories) {
      preferencePrompt += `\n- Lượng calo gợi ý cho bữa ăn này BẮT BUỘC phải nhỏ hơn hoặc bằng ${dbMaxCalories} kcal (dựa trên 35% của calo mục tiêu ngày của người dùng).`;
    }

    preferencePrompt += healthPrompt;

    const prompt = `Hãy đóng vai làm một đầu bếp chuyên nghiệp. Dưới đây là danh sách các nguyên liệu tôi đang có: ${ingredients.join(', ')}.
Hãy gợi ý đúng 3 lựa chọn món ăn khác nhau (khác biệt về cách làm hoặc hương vị), ngon, dễ làm, và phù hợp nhất với các nguyên liệu này (bạn có thể thêm một số gia vị hoặc nguyên liệu phụ cực kỳ thông dụng khác).
Yêu cầu bắt buộc:
- Tất cả các món ăn được gợi ý BẮT BUỘC phải là món ăn lành mạnh (healthy), dinh dưỡng tốt cho sức khỏe, hạn chế tối đa dầu mỡ xấu hoặc chất béo bão hòa dư thừa, và có lượng calo cân đối.
- Tên nguyên liệu ("name") trong phần "ingredients" của kết quả JSON BẮT BUỘC phải khớp hoàn toàn với một trong các tên nguyên liệu có trong danh sách nguyên liệu chuẩn sau đây: [${validDbNames}]. Vui lòng không tự tạo ra tên nguyên liệu mới ngoài danh sách này.
- Khối lượng ("weight") của từng nguyên liệu phải là một số nguyên đại diện cho số gram tương ứng (ví dụ: 150, 300, 50).
${preferencePrompt}

Trả về kết quả dưới dạng JSON duy nhất, có cấu trúc như sau:
{
  "recipes": [
    {
      "title": "Tên món ăn 1 (Viết hoa chữ cái đầu tiên, ví dụ: Trứng Chiên Cà Chua)",
      "description": "Mô tả ngắn gọn về hương vị và sự kết hợp của món ăn",
      "imageKeyword": "BẮT BUỘC chọn đúng 1 trong các từ khóa tiếng Anh đơn giản sau: 'pork', 'beef', 'chicken', 'salmon', 'fish', 'tofu', 'egg', 'salad', 'soup', 'pasta', 'rice', 'bread', 'smoothie', 'dessert', 'vegetables', 'shrimp', 'squid', 'mushroom', 'potato', 'cake', 'fruit'. Vui lòng chọn từ khóa phù hợp nhất với nguyên liệu chính của món ăn.",
      "cookingTime": 25,
      "category": "chỉ được chọn một trong các giá trị sau: 'food' (đồ ăn), 'drink' (đồ uống), 'snack' (ăn vặt), 'fruit' (trái cây), 'other' (khác)",
      "mealType": "chỉ được chọn một trong các giá trị sau: 'breakfast' (bữa sáng), 'lunch' (bữa trưa), 'dinner' (bữa tối), 'snack' (bữa phụ)",
      "calories": 350,
      "carbs": 40,
      "protein": 25,
      "fat": 15,
      "ingredients": [
        {
          "name": "Tên nguyên liệu chuẩn, ví dụ: 'Trứng gà'",
          "weight": 100
        },
        {
          "name": "Tên nguyên liệu chuẩn khác, ví dụ: 'Cà chua'",
          "weight": 150
        }
      ],
      "steps": ["Mô tả chi tiết bước 1 (ghi rõ chi tiết cách sơ chế, thời gian nấu)", "Mô tả chi tiết bước 2 (ghi rõ cách nấu, cách gia giảm gia vị cho chuẩn vị)"]
    },
    {
      "title": "Tên món ăn 2",
      "description": "Mô tả...",
      "cookingTime": 20,
      "category": "food",
      "mealType": "lunch",
      "calories": 400,
      "carbs": 35,
      "protein": 30,
      "fat": 12,
      "ingredients": [
        {
          "name": "Ức gà (không da)",
          "weight": 200
        }
      ],
      "steps": []
    },
    {
      "title": "Tên món ăn 3",
      "description": "Mô tả...",
      "cookingTime": 30,
      "category": "food",
      "mealType": "dinner",
      "calories": 380,
      "carbs": 45,
      "protein": 20,
      "fat": 10,
      "ingredients": [
        {
          "name": "Đậu phụ",
          "weight": 150
        }
      ],
      "steps": []
    }
  ]
}
Chú ý: 
- cookingTime, calories, carbs, protein, fat phải bắt buộc là các số nguyên (number), không kèm đơn vị.
- category và mealType bắt buộc phải chọn đúng giá trị tiếng Anh được liệt kê ở trên (ví dụ: 'food' và 'breakfast').
- Không viết thêm bất kỳ văn bản giải thích nào khác ngoài chuỗi JSON này.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      let errMsg = 'Không thể kết nối đến AI Service.';
      try {
        const errObj = JSON.parse(errText);
        if (errObj.error && errObj.error.message) {
          errMsg = `AI Service: ${errObj.error.message}`;
        }
      } catch (e) {}
      return res.status(502).json({ success: false, message: errMsg });
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      return res.status(500).json({ success: false, message: 'AI không trả về nội dung phù hợp.' });
    }

    let recipeData;
    try {
      recipeData = JSON.parse(textResponse.trim());
    } catch (parseErr) {
      console.error('Failed to parse Gemini output:', textResponse);
      return res.status(500).json({ success: false, message: 'Dữ liệu trả về từ AI không đúng cấu trúc.' });
    }

    if (recipeData && Array.isArray(recipeData.recipes)) {
      const validKeywords = ['pork', 'beef', 'chicken', 'salmon', 'fish', 'tofu', 'egg', 'salad', 'soup', 'pasta', 'rice', 'bread', 'smoothie', 'dessert', 'vegetables', 'shrimp', 'squid', 'mushroom', 'potato', 'cake', 'fruit'];
      await Promise.all(recipeData.recipes.map(async (recipe, idx) => {
        let keyword = recipe.imageKeyword || 'food';
        if (!validKeywords.includes(keyword.toLowerCase())) {
          const titleLower = recipe.title.toLowerCase();
          const keywordMatch = validKeywords.find(kw => {
            if (kw === 'pork' && (titleLower.includes('lợn') || titleLower.includes('heo'))) return true;
            if (kw === 'beef' && titleLower.includes('bò')) return true;
            if (kw === 'chicken' && titleLower.includes('gà')) return true;
            if (kw === 'salmon' && titleLower.includes('hồi')) return true;
            if (kw === 'fish' && titleLower.includes('cá')) return true;
            if (kw === 'tofu' && titleLower.includes('đậu phụ')) return true;
            if (kw === 'egg' && titleLower.includes('trứng')) return true;
            if (kw === 'salad' && titleLower.includes('salad')) return true;
            if (kw === 'soup' && (titleLower.includes('súp') || titleLower.includes('canh'))) return true;
            if (kw === 'rice' && titleLower.includes('cơm')) return true;
            if (kw === 'bread' && titleLower.includes('bánh mì')) return true;
            if (kw === 'shrimp' && titleLower.includes('tôm')) return true;
            if (kw === 'squid' && titleLower.includes('mực')) return true;
            if (kw === 'mushroom' && titleLower.includes('nấm')) return true;
            if (kw === 'potato' && titleLower.includes('khoai tây')) return true;
            return false;
          });
          keyword = keywordMatch || 'food';
        }
        recipe.image_url = await getUnsplashImage(keyword, idx);
      }));
    }

    return res.status(200).json({
      success: true,
      data: recipeData
    });
  } catch (error) {
    console.error('AI generate error:', error);
    return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi hệ thống khi gọi AI.' });
  }
});

module.exports = router;
