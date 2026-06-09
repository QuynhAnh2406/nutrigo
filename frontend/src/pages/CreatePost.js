import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilLine, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function CreatePost() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    image: '',
    prepTime: '',
    difficulty: 'Easy',
    tags: ''
  });

  const [ingredients, setIngredients] = useState([{ name: '', amount: '', calories: '' }]);
  const [instructions, setInstructions] = useState(['']);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngs = [...ingredients];
    newIngs[index][field] = value;
    setIngredients(newIngs);
  };

  const handleInstructionChange = (index, value) => {
    const newInsts = [...instructions];
    newInsts[index] = value;
    setInstructions(newInsts);
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '', calories: '' }]);
  const addInstruction = () => setInstructions([...instructions, '']);

  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
  const removeInstruction = (index) => setInstructions(instructions.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    // Calculate total calories preview
    const totalCal = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);

    const newPostData = {
      ...formData,
      tags: tagsArray,
      ingredients: ingredients.filter(i => i.name),
      instructions: instructions.filter(i => i),
      calories: totalCal
    };

    try {
      const res = await fetch('http://localhost:5002/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/community');
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const currentTotalCalories = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);

  return (
    <div className="create-post-page main-content">
      <div className="mb-8">
        <PageHeader
          title="Đăng món ăn mới"
          subtitle="Chia sẻ công thức với cộng đồng — hãy làm nó rõ ràng, chính xác và ngon miệng."
          icon={PencilLine}
          actions={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-sm font-extrabold text-gray-900 shadow-sm ring-1 ring-white/70 backdrop-blur transition-colors hover:bg-white"
              onClick={() => navigate('/community')}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại Cộng đồng
            </button>
          }
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT FORM AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group mb-6">
            <label className="font-bold text-gray-800">Tên món ăn *</label>
            <input type="text" name="foodName" value={formData.foodName} onChange={handleInputChange} required placeholder="Ví dụ: Salad ức gà" className="w-full p-3 rounded-xl border border-gray-200" />
          </div>
          
          <div className="form-group mb-6">
            <label className="font-bold text-gray-800">Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Chia sẻ một chút về món ăn này..." rows="3" className="w-full p-3 rounded-xl border border-gray-200" />
          </div>

          <div className="form-group mb-6">
            <label className="font-bold text-gray-800">Đường dẫn hình ảnh (URL)</label>
            <input type="url" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." className="w-full p-3 rounded-xl border border-gray-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="form-group">
              <label className="font-bold text-gray-800">Thời gian chuẩn bị</label>
              <input type="text" name="prepTime" value={formData.prepTime} onChange={handleInputChange} placeholder="Ví dụ: 20 phút" className="w-full p-3 rounded-xl border border-gray-200" />
            </div>
            <div className="form-group">
              <label className="font-bold text-gray-800">Độ khó</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-white">
                <option value="Easy">Dễ</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-8">
            <label className="font-bold text-gray-800">Nhãn (phân cách bằng dấu phẩy)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Ít Calo, Chay, Keto..." className="w-full p-3 rounded-xl border border-gray-200" />
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Nguyên liệu</h3>
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-4 mb-4 items-center">
                <input type="text" placeholder="Tên nguyên liệu (Ví dụ: Ức gà)" value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} required className="flex-2 p-3 rounded-xl border border-gray-200 min-w-0" />
                <input type="text" placeholder="Định lượng (Ví dụ: 100g)" value={ing.amount} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} className="flex-1 p-3 rounded-xl border border-gray-200 min-w-0" />
                <input type="number" placeholder="Calo" value={ing.calories} onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)} className="flex-1 p-3 rounded-xl border border-gray-200 min-w-0" />
                <button type="button" onClick={() => removeIngredient(index)} className="text-red-500 hover:text-red-700 font-bold px-2">✕</button>
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="text-green-600 font-bold hover:text-green-700">+ Thêm nguyên liệu</button>
            <div className="mt-4 pt-4 border-t border-gray-200 text-right">
              Tổng lượng calo ước tính: <strong className="text-xl text-green-600">{currentTotalCalories} kcal</strong>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Các bước thực hiện</h3>
            {instructions.map((inst, index) => (
              <div key={index} className="flex gap-4 mb-4 items-start">
                <span className="font-bold text-gray-500 mt-3 w-6">{index + 1}.</span>
                <textarea placeholder="Mô tả bước này..." value={inst} onChange={(e) => handleInstructionChange(index, e.target.value)} required rows="2" className="flex-1 p-3 rounded-xl border border-gray-200" />
                <button type="button" onClick={() => removeInstruction(index)} className="text-red-500 hover:text-red-700 font-bold px-2 mt-3">✕</button>
              </div>
            ))}
            <button type="button" onClick={addInstruction} className="text-green-600 font-bold hover:text-green-700">+ Thêm bước</button>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" className="btn-secondary px-8 py-3" onClick={() => navigate('/community')}>Hủy</button>
            <button type="submit" className="btn-primary px-8 py-3">Đăng món ăn</button>
          </div>
        </form>
        </div>

        {/* RIGHT SIDE PANEL */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-green-50 rounded-2xl p-6 border border-green-100 sticky top-8">
            <h3 className="font-bold text-green-800 mb-3">
              Chia sẻ là yêu thương 💚
            </h3>
            <div className="text-green-700 text-sm leading-relaxed space-y-3">
              <p>Chúng tôi rất mong đợi những món ăn của bạn! Để công thức nổi bật hơn, hãy tải lên những bức ảnh rõ nét nhé.</p>
              <p>Ngoài ra, hãy kiểm tra lại định lượng nguyên liệu. Nhiều thành viên sẽ sử dụng công thức này để theo dõi dinh dưỡng hằng ngày, do đó tính chính xác rất quan trọng.</p>
              <p>Cuối cùng, hãy giữ cho các bước đơn giản và đừng quên thêm các thẻ nhãn để mọi người dễ dàng tìm thấy món ăn của bạn.</p>
              <p className="font-medium pt-2">Chúc bạn nấu ăn vui vẻ!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
