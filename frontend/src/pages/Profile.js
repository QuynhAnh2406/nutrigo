import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { UserCircle2, Settings, Activity, HeartPulse, Zap, Target, Leaf, ArrowLeft, Camera, ChevronDown, Check } from 'lucide-react';


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

const CustomSelect = ({ name, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-white/80 hover:bg-white text-gray-700 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B5E361]/30 focus:border-[#8CB33D] text-left cursor-pointer"
      >
        <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-[#8CB33D] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-[#B5E361]/10 hover:text-[#1f3b00] cursor-pointer transition-all duration-150 ${opt.value === value ? 'font-bold bg-gray-50/50 text-[#1f3b00]' : 'font-medium'}`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={14} className="text-[#8CB33D] shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      if (!form) return;
      const elements = Array.from(form.elements).filter(
        (el) =>
          !el.disabled &&
          !el.readOnly &&
          (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') &&
          el.type !== 'hidden'
      );
      const index = elements.indexOf(e.target);
      if (index > -1 && index < elements.length - 1) {
        elements[index + 1].focus();
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {

      case 'Personal':
        return (
          <div className="profile-tab-content personal-profile animate-in flex-1 flex flex-col">


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="profile-form border p-4 rounded-2xl border-gray-100 bg-white">
                <h4 className="font-bold mb-2 text-gray-800">Thông tin cơ bản</h4>
                <div className="form-grid opacity-80 pointer-events-none flex-1 content-between">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input type="date" value={healthData.dateOfBirth} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Tuổi</label>
                    <input type="number" value={metrics.age || 0} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" value={healthData.phone || 'Chưa thiết lập'} disabled className="bg-gray-50 border-gray-200" />
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
                  <div className="form-group col-span-2">
                    <label>Địa chỉ Email</label>
                    <input type="email" value={user.email} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                </div>
              </div>

              <div className="profile-form border p-4 rounded-2xl border-gray-100 bg-white flex flex-col h-full">
                <h4 className="font-bold mb-2 text-gray-800">Khảo sát & Tùy chọn</h4>
                <div className="form-grid opacity-80 pointer-events-none flex-1 content-between">
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
          <div className="profile-tab-content edit-profile animate-in flex-1 flex flex-col">
            
            
            <form
              id="edit-profile-form"
              className="flex flex-col flex-1"
              onKeyDown={handleKeyDown}
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  await saveHealthToDb();
                  setToast({ show: true, message: 'Cập nhật hồ sơ thành công!' });
                  setActiveTab('Personal');
                } catch (err) {
                  console.error(err);
                  alert('Lưu thất bại. Vui lòng kiểm tra kết nối mạng.');
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
                {/* Basic Info Section */}
                <div className="profile-form border p-4 rounded-2xl border-gray-100 bg-white flex flex-col h-full">
                <h4 className="font-bold mb-2 text-gray-800">
                  Thông tin cơ bản
                </h4>
                <div className="form-grid flex-1 content-between">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleFormChange}
                      className="bg-white/80 border-gray-100 focus:ring-2 focus:ring-green-400 transition-all"
                    />
                  </div>
                  <div className="form-group opacity-60">
                    <label>Tuổi</label>
                    <input
                      type="number"
                      value={calculateAge(formData.dateOfBirth) || 0}
                      disabled
                      className="bg-gray-50/50 cursor-not-allowed"
                    />
                  </div>

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

                  <div className="form-group">
                    <label>Giới tính</label>
                    <CustomSelect
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleFormChange}
                      options={[
                        { value: 'Male', label: 'Nam' },
                        { value: 'Female', label: 'Nữ' }
                      ]}
                      placeholder="Chọn giới tính"
                    />
                  </div>
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
                  <div className="form-group col-span-2">
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
                </div>
              </div>

              {/* Survey Preferences Section */}
              <div className="profile-form border p-4 rounded-2xl border-gray-100 bg-white flex flex-col h-full">
                <h4 className="font-bold mb-2 text-gray-800">
                  Khảo sát & Tùy chọn
                </h4>
                <div className="form-grid flex-1 content-between">
                  <div className="form-group col-span-2">
                    <label>Mục tiêu</label>
                    <CustomSelect
                      name="goal"
                      value={formData.goal || ''}
                      onChange={handleFormChange}
                      options={[
                        { value: 'Lose weight', label: 'Giảm cân' },
                        { value: 'Maintain weight', label: 'Duy trì cân nặng' },
                        { value: 'Gain weight', label: 'Tăng cân' },
                        { value: 'Build muscle', label: 'Tăng cơ' }
                      ]}
                      placeholder="Chọn mục tiêu"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Mức độ vận động</label>
                    <CustomSelect
                      name="activityLevel"
                      value={formData.activityLevel || ''}
                      onChange={handleFormChange}
                      options={[
                        { value: 'Sedentary', label: 'Ít vận động (Ít hoặc không tập thể dục)' },
                        { value: 'Light', label: 'Nhẹ nhàng (Tập thể dục 1-3 lần/tuần)' },
                        { value: 'Moderate', label: 'Vừa phải (Tập thể dục 4-5 lần/tuần)' },
                        { value: 'Active', label: 'Năng động (Tập thể dục hàng ngày hoặc cường độ cao 3-4 lần/tuần)' },
                        { value: 'Very Active', label: 'Rất năng động (Tập thể dục cường độ cao 6-7 lần/tuần)' }
                      ]}
                      placeholder="Chọn mức độ vận động"
                    />
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
                    <CustomSelect
                      name="cookingSkill"
                      value={formData.cookingSkill || ''}
                      onChange={handleFormChange}
                      options={[
                        { value: 'Beginner', label: 'Người mới bắt đầu (Ít hoặc không có kinh nghiệm)' },
                        { value: 'Intermediate', label: 'Trung bình (Có thể nấu theo công thức dễ dàng)' },
                        { value: 'Advanced', label: 'Nâng cao (Người nấu ăn gia đình có kinh nghiệm)' },
                        { value: 'Expert', label: 'Chuyên gia (Đầu bếp chuyên nghiệp hoặc tay nghề cao)' }
                      ]}
                      placeholder="Chọn khả năng nấu nướng"
                    />
                  </div>
                </div>
              </div>
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
                  <h4>Mật khẩu</h4>
                  <p>Mật khẩu</p>
                </div>
                <button className="btn-outline" onClick={() => { setShowPasswordModal(true); setModalError(''); setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}>Cập nhật</button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Thông báo giờ ăn</h4>
                  <p>Nhận thông báo khi đến giờ ăn các bữa</p>
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
      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT MAIN AREA (Forms and Tabs) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {activeTab === 'Edit' && (
                <button
                  type="button"
                  onClick={() => {
                    const initialState = {
                      ...healthData,
                      name: user.name || '',
                      email: user.email || '',
                      avatarUrl: user.avatar || ''
                    };
                    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialState);
                    
                    if (isChanged) {
                      setShowCancelConfirm(true);
                    } else {
                      setActiveTab('Personal');
                    }
                  }}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:text-[#1f3b00] hover:bg-[#B5E361]/30 transition-all active:scale-95"
                  title="Quay lại"
                >
                  <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
              )}
              <h3 className="section-title !mb-0 leading-none flex items-center h-10">
                {activeTab === 'Settings'
                  ? 'Cài đặt tài khoản'
                  : activeTab === 'Edit'
                    ? 'Chỉnh sửa thông tin'
                    : 'Hồ sơ tài khoản'}
              </h3>
            </div>
            
            <div className="flex gap-2">
              {activeTab === 'Edit' ? (
                <button
                  type="submit"
                  form="edit-profile-form"
                  disabled={isSaving}
                  className={`
                    btn-primary px-8 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 h-10
                    ${isSaving
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:brightness-105 active:scale-95'
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <span>Lưu</span>
                  )}
                </button>
              ) : (
                <>
                  <button
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold shadow-sm transition-colors ${activeTab === 'Personal' ? 'bg-[#8CB33D] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('Personal')}
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Cá nhân
                  </button>
                  <button
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold shadow-sm transition-colors ${activeTab === 'Settings' ? 'bg-[#8CB33D] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveTab('Settings')}
                  >
                    <Settings className="h-4 w-4" />
                    Cài đặt
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="profile-content-area flex-1 flex flex-col">
            {renderTabContent()}
          </div>
        </div>

        {/* RIGHT SIDEBAR (Avatar & Edit) */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col">
          <div className="sticky top-8 flex flex-col gap-4 h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-16 bg-gradient-to-br from-[#cde983] via-[#b5e361] to-[#98d13a]"></div>
              <div className="px-5 pb-5 flex flex-col items-center text-center relative">
                {activeTab === 'Edit' ? (
                  <div className="relative -mt-10 mb-2">
                    <img
                      src={avatarPreview || user.avatar || 'https://via.placeholder.com/96'}
                      alt="Ảnh đại diện"
                      className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white object-cover"
                    />
                    <label className="absolute bottom-0 right-0 w-6 h-6 bg-[#B5E361] text-[#1f3b00] rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform" title="Đổi ảnh đại diện">
                      <Camera size={12} strokeWidth={3} />
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
                ) : (
                  <img
                    src={user.avatar}
                    alt="Ảnh đại diện"
                    className="w-20 h-20 rounded-full border-4 border-white shadow-md -mt-10 mb-2 bg-white object-cover"
                  />
                )}

                {activeTab === 'Edit' ? (
                  <div className="w-full mt-2 mb-3">
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleFormChange}
                      className="w-full text-center text-lg font-bold border-b-2 border-gray-200 focus:border-[#B5E361] bg-transparent outline-none pb-1 transition-colors"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                ) : (
                  <h2 className="text-lg font-bold text-gray-800 mb-0.5">
                    {user.name} {user.isPremium && <span title="Thành viên Premium" className="text-yellow-500">👑</span>}
                  </h2>
                )}
                
                <p className="text-gray-500 text-xs mb-4">{user.email}</p>

                {activeTab !== 'Edit' && (
                  <button 
                    className="btn-primary w-full text-sm py-2 mb-1"
                    onClick={() => setActiveTab('Edit')}
                  >
                    Chỉnh sửa thông tin cá nhân
                  </button>
                )}
              </div>
            </div>

            {/* Tóm tắt năng lượng & dinh dưỡng */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group flex-1 flex flex-col">
              <div className="relative z-10 flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                <div className="w-8 h-8 bg-gradient-to-br from-[#B5E361]/20 to-[#8CB33D]/20 rounded-xl flex items-center justify-center text-[#8CB33D]">
                  <Leaf size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm tracking-tight">Năng lượng & Dinh dưỡng</h4>
                </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10 flex-1 justify-between">
                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex items-center justify-between group/card transition-all hover:border-[#B5E361]/50">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 tracking-wide block mb-0.5 uppercase">Chỉ số BMI</span>
                    <span className="text-xl font-black text-gray-900 tracking-tighter">{metrics.bmi || 0}</span>
                  </div>
                  <div className="text-right">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover/card:text-[#B5E361] transition-colors ml-auto mb-1">
                      <Activity size={12} />
                    </div>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${metrics.bmiStatus === 'Normal' ? 'bg-[#B5E361]/20 text-[#2d5214]' : 'bg-orange-100 text-orange-700'}`}>
                      {getBmiStatusLabel(metrics.bmiStatus)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex items-center justify-between group/card transition-all hover:border-[#B5E361]/50">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 tracking-wide block mb-0.5 uppercase">BMR (Nghỉ ngơi)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-gray-900 tracking-tighter">{metrics.bmr || 0}</span>
                      <span className="text-[10px] font-bold text-gray-400">kcal</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover/card:text-blue-500 transition-colors">
                    <HeartPulse size={12} />
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex items-center justify-between group/card transition-all hover:border-[#B5E361]/50">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 tracking-wide block mb-0.5 uppercase">TDEE (Hàng ngày)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-gray-900 tracking-tighter">{metrics.tdee || 0}</span>
                      <span className="text-[10px] font-bold text-gray-400">kcal</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover/card:text-orange-500 transition-colors">
                    <Zap size={12} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#B5E361]/20 to-[#8CB33D]/20 rounded-xl p-3 border border-[#B5E361]/40 flex items-center justify-between group/card relative overflow-hidden transition-all hover:border-[#B5E361]">
                  <div className="absolute -right-2 -bottom-2 opacity-10 group-hover/card:scale-125 transition-transform duration-500"><Target size={40} /></div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold text-[#2d5214] tracking-wide block mb-0.5 uppercase">Mục tiêu hấp thụ</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-[#1f3b00] tracking-tighter">{metrics.targetCalories || 0}</span>
                      <span className="text-[10px] font-bold text-[#3d6600]/70">kcal</span>
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col items-end">
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/60 text-[#2d5214] backdrop-blur-sm shadow-sm whitespace-nowrap text-right">
                      {getGoalLabel(healthData.goal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CANCEL CONFIRM MODAL */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1f3b00]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#B5E361]/30 p-8 w-[90%] max-w-md text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-[#1f3b00] mb-3 uppercase tracking-wide">Xác nhận</h3>
            <p className="text-gray-600 mb-8 font-medium leading-relaxed">
              Các thông tin bạn đã nhập chưa được Lưu. Bạn có chắc chắn muốn Hủy?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setActiveTab('Personal');
                }}
                className="flex-1 px-6 py-3.5 rounded-2xl font-black text-[#1f3b00] bg-[#B5E361] hover:bg-[#a3d14f] shadow-lg shadow-[#B5E361]/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1f3b00]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#B5E361]/30 p-8 w-[90%] max-w-md transform transition-all scale-100 animate-in zoom-in-95 duration-200">
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1f3b00]/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#B5E361]/30 p-8 w-[90%] max-w-md transform transition-all scale-100 animate-in zoom-in-95 duration-200">
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
