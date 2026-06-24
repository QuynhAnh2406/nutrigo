import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { UserCircle2, Settings, Activity, HeartPulse, Zap, Target, Leaf } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const getGoalLabel = (goal) => {
  switch (goal) {
    case 'Lose weight': return 'Giảm cân';
    case 'Maintain weight': return 'Duy trì cân nặng';
    case 'Gain weight': return 'Tăng cân';
    case 'Build muscle': return 'Tăng cơ';
    default: return goal || 'Chưa thiết lập';
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

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
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
    name: user.name || '',
    email: user.email || '',
    avatarUrl: user.avatar || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Re-sync local form if healthData or user changes (e.g. initial load)
  useEffect(() => {
    if (activeTab === 'Edit') {
      setFormData({
        ...healthData,
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatar || ''
      });
      setAvatarPreview(user.avatar);
    }
  }, [activeTab, healthData, user.name, user.email, user.avatar]);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newEmail) {
      setModalError('Vui lòng nhập email mới.');
      return;
    }
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/profile/health', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...healthData,
          email: newEmail,
          fullName: user.name,
          avatarUrl: user.avatar
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể cập nhật email.');
      }
      setUser(prev => ({ ...prev, email: newEmail }));
      setShowEmailModal(false);
      setNewEmail('');
      alert('Cập nhật email thành công! ✨');
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setModalError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setModalError('Mật khẩu mới xác nhận không khớp.');
      return;
    }
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể cập nhật mật khẩu.');
      }
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setToast({ show: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setModalLoading(false);
    }
  };

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
        gender: formData.gender || '',
        height: formData.height,
        weight: formData.weight,
        activityLevel: formData.activityLevel || '',
        goal: formData.goal || '',
        dietaryPreference: formData.dietaryPreference,
        allergies: formData.allergies,
        cookingSkill: formData.cookingSkill || '',
        phone: formData.phone,
        email: formData.email,
        avatarUrl: formData.avatarUrl,
        fullName: formData.name
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to save profile');
    }

    // Map DB -> frontend state shape
    const row = data.data || {};

    // Update global user state with new email, avatar, and name
    setUser(prev => ({
      ...prev,
      name: row.full_name || prev.name,
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
            <div className="bg-white p-8 rounded-[2rem] mb-8 shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#B5E361]/20 to-[#4facfe]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-orange-300/10 to-[#8CB33D]/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-50">
                <div className="w-14 h-14 bg-gradient-to-br from-[#B5E361]/20 to-[#8CB33D]/20 rounded-2xl flex items-center justify-center shadow-sm border border-[#B5E361]/30 text-[#8CB33D]">
                  <Leaf size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-xl tracking-tight mb-1">Tóm tắt năng lượng & dinh dưỡng</h4>
                  <p className="text-sm text-gray-500 font-medium">Theo dõi các chỉ số sức khỏe cá nhân của bạn</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-[#B5E361]/50 transition-all duration-300 flex flex-col justify-between group/card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 tracking-wide">Chỉ số BMI</span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover/card:text-[#B5E361] transition-colors">
                      <Activity size={16} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">{metrics.bmi || 0}</span>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${metrics.bmiStatus === 'Normal' ? 'bg-[#B5E361]/20 text-[#2d5214]' : 'bg-orange-100 text-orange-700'}`}>
                      {getBmiStatusLabel(metrics.bmiStatus)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-[#B5E361]/50 transition-all duration-300 flex flex-col justify-between group/card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 tracking-wide">BMR (Nghỉ ngơi)</span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover/card:text-blue-500 transition-colors">
                      <HeartPulse size={16} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">{metrics.bmr || 0}</span>
                      <span className="text-sm font-bold text-gray-400">kcal</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">Năng lượng cơ bản</span>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-[#B5E361]/50 transition-all duration-300 flex flex-col justify-between group/card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 tracking-wide">TDEE (Hàng ngày)</span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover/card:text-orange-500 transition-colors">
                      <Zap size={16} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">{metrics.tdee || 0}</span>
                      <span className="text-sm font-bold text-gray-400">kcal</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">Năng lượng duy trì</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#B5E361]/20 to-[#8CB33D]/20 rounded-2xl p-5 border border-[#B5E361]/40 shadow-sm hover:shadow-md hover:border-[#B5E361] transition-all duration-300 flex flex-col justify-between group/card relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover/card:scale-125 transition-transform duration-500"><Target size={80} /></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-xs font-bold text-[#2d5214] tracking-wide">Mục tiêu hấp thụ</span>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-3xl font-black text-[#1f3b00] tracking-tighter">{metrics.targetCalories || 0}</span>
                      <span className="text-sm font-bold text-[#3d6600]/70">kcal</span>
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-white/60 text-[#2d5214] backdrop-blur-sm shadow-sm">
                      {getGoalLabel(healthData.goal)}
                    </span>
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
                    <select value={healthData.gender || ''} disabled className="bg-gray-50 border-gray-200 custom-select">
                      <option value="">Chưa thiết lập</option>
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
                    <select value={healthData.goal || ''} disabled className="bg-gray-50 border-gray-200 custom-select">
                      <option value="">Chưa thiết lập</option>
                      <option value="Lose weight">Giảm cân</option>
                      <option value="Maintain weight">Duy trì cân nặng</option>
                      <option value="Gain weight">Tăng cân</option>
                      <option value="Build muscle">Tăng cơ</option>
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Mức độ vận động</label>
                    <select value={healthData.activityLevel || ''} disabled className="bg-gray-50 border-gray-200 custom-select">
                      <option value="">Chưa thiết lập</option>
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
                      <option value="">Chưa thiết lập</option>
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


            <form
              className="space-y-8"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  await saveHealthToDb();
                  alert('Cập nhật hồ sơ thành công!');
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
                  {/* Hàng 1 */}
                  {/* Left: 1. Ảnh đại diện */}
                  <div className="form-group">
                    <label>Ảnh đại diện</label>
                    <div className="flex items-center gap-4 bg-white/80 border border-gray-150 rounded-2xl px-4 py-2 h-[48px]">
                      <img
                        src={avatarPreview || user.avatar || 'https://via.placeholder.com/96'}
                        alt="Ảnh đại diện"
                        className="w-8 h-8 object-cover rounded-full border border-gray-100 shadow-sm bg-white shrink-0"
                      />
                      <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#B5E361]/25 text-[#1f3b00] hover:bg-[#B5E361]/35 cursor-pointer text-[11px] font-black transition-all active:scale-95">
                        Chọn ảnh
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
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Kích thước ảnh không quá 5MB.');
                              return;
                            }

                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
                              setAvatarPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Right: 1. Chiều cao (cm) */}
                  <div className="form-group">
                    <label>Chiều cao (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height || ''}
                      onChange={handleFormChange}
                      className="bg-white/80"
                    />
                  </div>

                  {/* Hàng 2 */}
                  {/* Left: 2. Họ và tên */}
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleFormChange}
                      placeholder="Nhập họ và tên"
                      className="bg-white/80 border-gray-100 focus:ring-2 focus:ring-green-400 transition-all"
                      required
                    />
                  </div>

                  {/* Right: 2. Cân nặng (kg) */}
                  <div className="form-group">
                    <label>Cân nặng (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight || ''}
                      onChange={handleFormChange}
                      className="bg-white/80"
                    />
                  </div>

                  {/* Hàng 3 */}
                  {/* Left: 3. Ngày sinh và Tuổi (1 hàng) */}
                  <div className="flex gap-4">
                    <div className="form-group flex-1">
                      <label>Ngày sinh</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth || ''}
                        onChange={handleFormChange}
                        className="bg-white/80 border-gray-100 focus:ring-2 focus:ring-green-400 transition-all"
                      />
                    </div>
                    <div className="form-group w-32 opacity-60">
                      <label>Tuổi</label>
                      <input
                        type="number"
                        value={calculateAge(formData.dateOfBirth) || 0}
                        disabled
                        className="bg-gray-50/50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Right: 3. Địa chỉ Email */}
                  <div className="form-group">
                    <label>Địa chỉ Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleFormChange}
                      placeholder="tenbancuaban@example.com"
                      className="bg-white/80"
                    />
                  </div>

                  {/* Hàng 4 */}
                  {/* Left: 4. Giới tính */}
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleFormChange}
                      className="custom-select bg-white/80"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                    </select>
                  </div>

                  {/* Right: 4. Số điện thoại */}
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleFormChange}
                      placeholder="Nhập số điện thoại của bạn"
                      className="bg-white/80"
                    />
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
                    <select name="goal" value={formData.goal || ''} onChange={handleFormChange} className="custom-select bg-white/80">
                      <option value="">Chọn mục tiêu sức khỏe</option>
                      <option value="Lose weight">Giảm cân</option>
                      <option value="Maintain weight">Duy trì cân nặng</option>
                      <option value="Gain weight">Tăng cân</option>
                      <option value="Build muscle">Tăng cơ</option>
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Mức độ vận động</label>
                    <select name="activityLevel" value={formData.activityLevel || ''} onChange={handleFormChange} className="custom-select bg-white/80">
                      <option value="">Chọn mức độ vận động</option>
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
                    <select name="cookingSkill" value={formData.cookingSkill || ''} onChange={handleFormChange} className="custom-select bg-white/80">
                      <option value="">Chọn khả năng nấu nướng</option>
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
                      <span className="text-xl"></span>
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
                <button className="btn-outline" onClick={() => { setShowEmailModal(true); setModalError(''); setNewEmail(user.email); }}>Thay đổi</button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Mật khẩu</h4>
                  <p>Mật khẩu</p>
                </div>
                <button className="btn-outline" onClick={() => { setShowPasswordModal(true); setModalError(''); setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}>Cập nhật</button>
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
            <div className="flex flex-wrap gap-2 items-center">
              <button
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition-colors ${activeTab === 'Personal' ? 'bg-gray-900 text-white' : 'bg-white/70 text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white'
                  }`}
                onClick={() => setActiveTab('Personal')}
              >
                <UserCircle2 className="h-4 w-4" />
                Cá nhân
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition-colors ${activeTab === 'Settings' ? 'bg-gray-900 text-white' : 'bg-white/70 text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white'
                  }`}
                onClick={() => setActiveTab('Settings')}
              >
                <Settings className="h-4 w-4" />
                Cài đặt
              </button>
              {activeTab === 'Personal' && (
                <button 
                  className="btn-primary ml-2 py-2 text-sm shadow-sm" 
                  onClick={() => setActiveTab('Edit')}
                >
                  Chỉnh sửa thông tin
                </button>
              )}
              {activeTab === 'Edit' && (
                <button
                  type="button"
                  className="btn-secondary ml-2 py-2 text-sm shadow-sm"
                  onClick={() => setActiveTab('Personal')}
                >
                  Quay lại
                </button>
              )}
            </div>
          }
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT MAIN AREA */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title mb-0">
              {activeTab === 'Settings'
                ? 'Cài đặt tài khoản'
                : activeTab === 'Edit'
                  ? 'Chỉnh sửa thông tin'
                  : 'Thông tin cá nhân'}
            </h3>
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
              <h2 className="text-xl font-bold text-gray-800 mb-1 mt-2">
                {formData.name || user.name} {user.isPremium && <span title="Thành viên Premium" className="text-yellow-500">👑</span>}
              </h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>


              <button className="btn-secondary w-full">Chia sẻ hồ sơ</button>
            </div>
          </div>
        </div>

      </div>

      {/* EMAIL MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-11/12 max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Thay đổi địa chỉ Email</h3>
            <p className="text-gray-500 text-sm mb-6">Nhập địa chỉ email mới bạn muốn sử dụng.</p>

            {modalError && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email mới</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nhapemailmoi@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEmailModal(false); setModalError(''); }}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-extrabold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-sm font-extrabold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-11/12 max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Cập nhật Mật khẩu</h3>
            <p className="text-gray-500 text-sm mb-6">Vui lòng điền thông tin để cập nhật mật khẩu của bạn.</p>

            {modalError && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setModalError(''); }}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-extrabold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#B5E361] to-[#8CB33D] text-sm font-extrabold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[10000] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-right-8 duration-300 w-72">
          <style>{`
            @keyframes toast-progress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <span className="text-sm font-bold">✓</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{toast.message}</p>
          </div>
          <div className="h-1 bg-gray-100 w-full">
            <div
              className="h-full bg-green-500"
              style={{ animation: 'toast-progress 5s linear forwards' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
