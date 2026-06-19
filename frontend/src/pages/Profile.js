import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { UserCircle2, Settings } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const getGoalLabel = (goal) => {
  switch (goal) {
    case 'Lose weight': return 'Giảm cân';
    case 'Maintain weight': return 'Duy trì cân nặng';
    case 'Gain weight': return 'Tăng cân';
    case 'Build muscle': return 'Tăng cơ';
    default: return goal || 'Duy trì cân nặng';
  }
};

const getBmiStatusLabel = (status) => {
  switch (status) {
    case 'Underweight': return 'Thiếu cân';
    case 'Normal': return 'Bình thường';
    case 'Overweight': return 'Thừa cân';
    case 'Obese': return 'Béo phì';
    default: return status;
  }
};

function Profile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'Personal');

  useEffect(() => {
    if (tabParam) {
      // Only allow Personal/Edit/Settings for now
      if (tabParam === 'Edit') setActiveTab('Edit');
      else if (tabParam === 'Settings') setActiveTab('Settings');
      else setActiveTab('Personal');
    }
  }, [tabParam]);

  // Get User Profile & Health Data from MainLayout context
  const { user, setUser, healthData, setHealthData, metrics } = useOutletContext();
  
  // Local form state for editing to prevent immediate global state updates
  const [formData, setFormData] = useState({
    ...healthData,
    email: user.email,
    avatarUrl: user.avatar
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);

  // Re-sync local form if healthData or user changes (e.g. initial load)
  useEffect(() => {
    if (activeTab === 'Edit') {
      setFormData({
        ...healthData,
        email: user.email,
        avatarUrl: user.avatar
      });
      setAvatarPreview(user.avatar);
    }
  }, [activeTab, healthData, user.email, user.avatar]);

  const saveHealthToDb = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5002/api/profile/health', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || 'Male',
        height: formData.height,
        weight: formData.weight,
        activityLevel: formData.activityLevel || 'Sedentary',
        goal: formData.goal || 'Maintain weight',
        dietaryPreference: formData.dietaryPreference,
        allergies: formData.allergies,
        cookingSkill: formData.cookingSkill || 'Beginner',
        phone: formData.phone,
        email: formData.email,
        avatarUrl: formData.avatarUrl
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to save profile');
    }

    // Map DB -> frontend state shape
    const row = data.data || {};

    // Update global user state with new email and avatar
    setUser(prev => ({
      ...prev,
      email: formData.email,
      avatar: row.avatar_url || prev.avatar
    }));

    setHealthData((prev) => ({
      ...prev,
      dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : prev.dateOfBirth,
      gender: row.gender ?? prev.gender,
      height: (row.height_cm !== null && row.height_cm !== undefined) ? parseFloat(row.height_cm) : prev.height,
      weight: (row.weight_kg !== null && row.weight_kg !== undefined) ? parseFloat(row.weight_kg) : prev.weight,
      activityLevel: row.activity_level ?? prev.activityLevel,
      goal: row.goal ?? prev.goal,
      dietaryPreference: row.dietary_preference ?? prev.dietaryPreference,
      allergies: row.allergies ?? prev.allergies,
      cookingSkill: row.cooking_skill ?? prev.cookingSkill,
      phone: row.phone ?? prev.phone
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const renderTabContent = () => {
    switch (activeTab) {

      case 'Personal':
        return (
          <div className="profile-tab-content personal-profile animate-in">
            <div className="bg-gradient-to-br from-[#B5E361] via-[#8CB33D] to-[#4facfe] p-8 rounded-[2.5rem] mb-8 shadow-xl shadow-green-200 relative overflow-hidden group border-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-700 group-hover:scale-125"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
              
              <h4 className="font-black text-white mb-8 flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">🥗</div>
                <div>
                  <span className="block text-xl tracking-tight">Tóm tắt Năng lượng & Dinh dưỡng</span>
                  <span className="block text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mt-1">Thông tin Sức khỏe Cá nhân hóa</span>
                </div>
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-xl px-5 py-6 rounded-[2rem] border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
                  <span className="block text-[10px] text-white/60 uppercase font-black tracking-widest mb-3">Chỉ số BMI</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl text-white font-black">{metrics.bmi}</strong>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${metrics.bmiStatus === 'Normal' ? 'bg-white/30 text-white' : 'bg-orange-400/40 text-white'}`}>
                      {getBmiStatusLabel(metrics.bmiStatus)}
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl px-5 py-6 rounded-[2rem] border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
                  <span className="block text-[10px] text-white/60 uppercase font-black tracking-widest mb-3">BMR (Nghỉ ngơi)</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl text-white font-black">{metrics.bmr}</strong>
                    <small className="text-[10px] text-white/60 font-black uppercase tracking-tighter">kcal</small>
                  </div>
                  <span className="text-[9px] text-white/40 font-bold block mt-1 uppercase">Tỉ lệ trao đổi chất cơ bản</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xl px-5 py-6 rounded-[2rem] border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
                  <span className="block text-[10px] text-white/60 uppercase font-black tracking-widest mb-3">TDEE (Hàng ngày)</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl text-white font-black">{metrics.tdee}</strong>
                    <small className="text-[10px] text-white/60 font-black uppercase tracking-tighter">kcal</small>
                  </div>
                  <span className="text-[9px] text-white/40 font-bold block mt-1 uppercase">Mức năng lượng duy trì</span>
                </div>

                <div className="bg-white/95 backdrop-blur-md px-5 py-6 rounded-[2rem] shadow-2xl shadow-green-900/10 hover:scale-105 transition-all duration-300">
                  <span className="block text-[10px] text-[#3d6600]/60 uppercase font-black tracking-widest mb-3">Mục tiêu hấp thụ</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl text-[#3d6600] font-black">{metrics.targetCalories}</strong>
                    <small className="text-[10px] text-[#3d6600]/60 font-black uppercase tracking-tighter">kcal</small>
                  </div>
                  <div className="mt-2 text-[10px] bg-[#B5E361] px-3 py-1 rounded-full text-[#3d6600] font-black inline-block shadow-sm">
                    {getGoalLabel(healthData.goal)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="profile-form border p-6 rounded-2xl border-gray-100 bg-white">
                <h4 className="font-bold mb-4 text-gray-800">Thông tin cơ bản</h4>
                <div className="form-grid opacity-80 pointer-events-none">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input type="date" value={healthData.dateOfBirth} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Tuổi</label>
                    <input type="number" value={metrics.age || 0} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select value={healthData.gender || 'Male'} disabled className="bg-gray-50 border-gray-200 custom-select">
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Chiều cao (cm)</label>
                    <input type="number" value={healthData.height} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Cân nặng (kg)</label>
                    <input type="number" value={healthData.weight} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ Email</label>
                    <input type="email" value={user.email} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" value={healthData.phone || 'Chưa thiết lập'} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                </div>
              </div>

              <div className="profile-form border p-6 rounded-2xl border-gray-100 bg-white flex flex-col h-full">
                <h4 className="font-bold mb-4 text-gray-800">Khảo sát & Tùy chọn</h4>
                <div className="form-grid opacity-80 pointer-events-none">
                  <div className="form-group col-span-2">
                    <label>Mục tiêu</label>
                    <select value={healthData.goal || 'Maintain weight'} disabled className="bg-gray-50 border-gray-200 custom-select">
                      <option value="Lose weight">Giảm cân</option>
                      <option value="Maintain weight">Duy trì cân nặng</option>
                      <option value="Gain weight">Tăng cân</option>
                      <option value="Build muscle">Tăng cơ</option>
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Mức độ vận động</label>
                    <select value={healthData.activityLevel || 'Sedentary'} disabled className="bg-gray-50 border-gray-200 custom-select">
                      <option value="Sedentary">Ít vận động (Ít hoặc không tập thể dục)</option>
                      <option value="Light">Nhẹ nhàng (Tập thể dục 1-3 lần/tuần)</option>
                      <option value="Moderate">Vừa phải (Tập thể dục 4-5 lần/tuần)</option>
                      <option value="Active">Năng động (Tập thể dục hàng ngày hoặc cường độ cao 3-4 lần/tuần)</option>
                      <option value="Very Active">Rất năng động (Tập thể dục cường độ cao hàng ngày)</option>
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Chế độ ăn ưa thích</label>
                    <input type="text" value={healthData.dietaryPreference || ''} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Dị ứng</label>
                    <input type="text" value={healthData.allergies || ''} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Khả năng nấu nướng</label>
                    <select value={healthData.cookingSkill || ''} disabled className="bg-gray-50 border-gray-200 custom-select">
                      <option value="Beginner">Người mới bắt đầu (Ít hoặc không có kinh nghiệm)</option>
                      <option value="Intermediate">Trung bình (Có thể nấu theo công thức dễ dàng)</option>
                      <option value="Advanced">Nâng cao (Người nấu ăn gia đình có kinh nghiệm)</option>
                      <option value="Expert">Chuyên gia (Đầu bếp chuyên nghiệp hoặc tay nghề cao)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Edit':
        return (
          <div className="profile-tab-content edit-profile animate-in space-y-8">
            <div className="bg-gradient-to-br from-[#B5E361] to-[#8CB33D] p-8 rounded-[2.5rem] mb-8 shadow-xl shadow-green-100 relative overflow-hidden group border-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-700 group-hover:scale-125"></div>
              <h4 className="font-black text-white mb-2 flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">📝</div>
                <div>
                  <span className="block text-xl tracking-tight">Chỉnh sửa hồ sơ của bạn</span>
                  <span className="text-white/80 text-sm font-medium">Cập nhật dữ liệu sức khỏe chính xác để đạt kết quả tốt nhất</span>
                </div>
              </h4>
            </div>

            <form
              className="space-y-8"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  await saveHealthToDb();
                  alert('Cập nhật hồ sơ thành công! ✨');
                  setActiveTab('Personal');
                } catch (err) {
                  console.error(err);
                  alert('Lưu thất bại. Vui lòng kiểm tra kết nối mạng.');
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {/* Basic Info Section */}
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl">
                <h4 className="font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                  Thông tin cơ bản
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleFormChange} className="bg-white/80 border-gray-100 focus:ring-2 focus:ring-green-400 transition-all" />
                  </div>
                  <div className="form-group opacity-60">
                    <label>Tuổi</label>
                    <input type="number" value={metrics.age || 0} disabled className="bg-gray-50/50 cursor-not-allowed" />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select name="gender" value={formData.gender || 'Male'} onChange={handleFormChange} className="custom-select bg-white/80">
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Chiều cao (cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleFormChange} className="bg-white/80" />
                  </div>
                  <div className="form-group">
                    <label>Cân nặng (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleFormChange} className="bg-white/80" />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleFormChange} 
                      placeholder="tenbancuaban@example.com" 
                      className="bg-white/80"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ảnh đại diện</label>
                    <div className="space-y-3">
                      <img
                        src={avatarPreview || user.avatar || 'https://via.placeholder.com/96'}
                        alt="Ảnh đại diện"
                        className="w-24 h-24 object-cover rounded-full border border-gray-200"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (!file.type.startsWith('image/')) {
                            alert('Vui lòng chọn một tệp ảnh hợp lệ.');
                            return;
                          }
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Kích thước ảnh không quá 2MB.');
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = () => {
                            setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
                            setAvatarPreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="bg-white/80"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" name="phone" value={formData.phone || ''} onChange={handleFormChange} placeholder="Nhập số điện thoại của bạn" className="bg-white/80" />
                  </div>
                </div>
              </div>

              {/* Survey Preferences Section */}
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl">
                <h4 className="font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                  Khảo sát & Mục tiêu sức khỏe
                </h4>
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Mục tiêu sức khỏe</label>
                    <select name="goal" value={formData.goal || 'Maintain weight'} onChange={handleFormChange} className="custom-select bg-white/80">
                      <option value="Lose weight">Giảm cân</option>
                      <option value="Maintain weight">Duy trì cân nặng</option>
                      <option value="Gain weight">Tăng cân</option>
                      <option value="Build muscle">Tăng cơ</option>
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Mức độ vận động</label>
                    <select name="activityLevel" value={formData.activityLevel || 'Sedentary'} onChange={handleFormChange} className="custom-select bg-white/80">
                      <option value="Sedentary">Ít vận động (Ít hoặc không tập thể dục)</option>
                      <option value="Light">Nhẹ nhàng (Tập thể dục 1-3 lần/tuần)</option>
                      <option value="Moderate">Vừa phải (Tập thể dục 4-5 lần/tuần)</option>
                      <option value="Active">Năng động (Tập thể dục hàng ngày hoặc cường độ cao 3-4 lần/tuần)</option>
                      <option value="Very Active">Rất năng động (Tập thể dục cường độ cao 6-7 lần/tuần)</option>
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Chế độ ăn ưa thích</label>
                    <input type="text" name="dietaryPreference" value={formData.dietaryPreference || ''} onChange={handleFormChange} placeholder="Ví dụ: Ăn chay, Keto, Không hải sản" className="bg-white/80" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Dị ứng</label>
                    <input type="text" name="allergies" value={formData.allergies || ''} onChange={handleFormChange} placeholder="Ví dụ: Đậu phộng, Động vật có vỏ" className="bg-white/80" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Khả năng nấu nướng</label>
                    <select name="cookingSkill" value={formData.cookingSkill || 'Beginner'} onChange={handleFormChange} className="custom-select bg-white/80">
                      <option value="Beginner">Người mới bắt đầu (Ít hoặc không có kinh nghiệm)</option>
                      <option value="Intermediate">Trung bình (Có thể nấu theo công thức dễ dàng)</option>
                      <option value="Advanced">Nâng cao (Người nấu ăn gia đình có kinh nghiệm)</option>
                      <option value="Expert">Chuyên gia (Đầu bếp chuyên nghiệp hoặc tay nghề cao)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`
                    px-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all duration-300
                    flex items-center gap-2
                    ${isSaving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#B5E361] to-[#8CB33D] hover:scale-105 hover:shadow-green-200 active:scale-95'
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang lưu thay đổi...
                    </>
                  ) : (
                    <>
                      <span>Lưu thay đổi</span>
                      <span className="text-xl">✨</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );
      
      case 'Settings':
        return (
          <div className="profile-tab-content account-settings animate-in">
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Địa chỉ Email</h4>
                  <p>{user.email}</p>
                </div>
                <button className="btn-outline">Thay đổi</button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Mật khẩu</h4>
                  <p>Mật khẩu</p>
                </div>
                <button className="btn-outline">Cập nhật</button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Thông báo qua Email</h4>
                  <p>Nhận lời nhắc lịch ăn hàng ngày</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page main-content">
      <div className="mb-8">
        <PageHeader
          title="Hồ sơ của tôi"
          icon={UserCircle2}
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition-colors ${
                  activeTab === 'Personal' ? 'bg-gray-900 text-white' : 'bg-white/70 text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white'
                }`}
                onClick={() => setActiveTab('Personal')}
              >
                <UserCircle2 className="h-4 w-4" />
                Cá nhân
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition-colors ${
                  activeTab === 'Settings' ? 'bg-gray-900 text-white' : 'bg-white/70 text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white'
                }`}
                onClick={() => setActiveTab('Settings')}
              >
                <Settings className="h-4 w-4" />
                Cài đặt
              </button>
            </div>
          }
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT MAIN AREA */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title mb-0">
              {activeTab === 'Settings'
                ? 'Cài đặt tài khoản'
                : activeTab === 'Edit'
                  ? 'Chỉnh sửa thông tin'
                  : 'Thông tin cá nhân'}
            </h3>
            {activeTab === 'Personal' ? (
              <button className="btn-primary" onClick={() => setActiveTab('Edit')}>
                Chỉnh sửa thông tin
              </button>
            ) : activeTab === 'Edit' ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab('Personal')}
              >
                Quay lại
              </button>
            ) : null}
          </div>

          <div className="profile-content-area">
            {renderTabContent()}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <div className="h-24 bg-gradient-to-r from-[#a8e063] to-[#56ab2f]"></div>
            <div className="px-6 pb-6 flex flex-col items-center text-center relative">
              <img 
                src={user.avatar} 
                alt="Ảnh đại diện" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md -mt-12 mb-3 bg-white object-cover" 
              />
              <h2 className="text-xl font-bold text-gray-800">
                {user.name} {user.isPremium && <span title="Thành viên Premium" className="text-yellow-500">👑</span>}
              </h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>

              
              <button className="btn-secondary w-full">Chia sẻ hồ sơ</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
