import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Fallback for user if prop is missing somehow
  const currentUser = user || {
    name: 'Khách',
    email: 'khach@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Khach&background=random'
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
        <div className="logo-icon"></div>
        Nutrigo
      </div>
      <ul className="nav-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⊞</span> Trang chủ
        </NavLink>
        <NavLink to="/meal-plan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📋</span> Lịch ăn uống
        </NavLink>
        <NavLink to="/community" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👥</span> Cộng đồng lành mạnh
        </NavLink>
        <NavLink to="/favourites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">❤️</span> Yêu thích
        </NavLink>
      </ul>

      <div className="user-profile-wrapper" style={{ marginTop: 'auto', position: 'relative' }}>
        <div 
          className="user-profile-block" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img src={currentUser.avatar} alt="User" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-email">{currentUser.email}</span>
          </div>
          <span className="dropdown-icon" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
        </div>

        {isDropdownOpen && (
          <div className="profile-dropdown">
            <button className="dropdown-item" onClick={() => window.location.href = '/profile?tab=Personal'}>
              👤 Thông tin cá nhân
            </button>
            <button className="dropdown-item" onClick={() => window.location.href = '/profile?tab=Settings'}>
              ⚙️ Cài đặt tài khoản
            </button>
            <button className="dropdown-item text-red" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
