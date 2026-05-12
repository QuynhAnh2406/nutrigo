import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Fallback for user if prop is missing somehow
  const currentUser = user || {
    name: 'Guest User',
    email: 'guest@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=random'
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
          <span className="nav-icon">⊞</span> Dashboard
        </NavLink>
        <NavLink to="/meal-plan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📋</span> Meal Plan
        </NavLink>
        <NavLink to="/community" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👥</span> HealthyLife Community
        </NavLink>
        <NavLink to="/favourites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">❤️</span> Favourites
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
              👤 Personal Information
            </button>
            <button className="dropdown-item" onClick={() => window.location.href = '/profile?tab=Settings'}>
              ⚙️ Account Settings
            </button>
            <button className="dropdown-item text-red" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
