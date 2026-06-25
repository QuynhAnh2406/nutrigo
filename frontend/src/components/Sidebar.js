import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BookOpen, Database, Apple, Store, Leaf, User, Settings, LogOut } from 'lucide-react';

function Sidebar({ user }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isNutritionOpen, setIsNutritionOpen] = useState(
        window.location.pathname === '/ingredients' || window.location.pathname === '/brands'
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleNavLinkClick = (path) => (e) => {
        if (window.location.pathname === path) {
            e.preventDefault();
            window.location.href = path;
        }
    };

    return (
        <div className="sidebar" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 0 }}>
                <img src="/sidebar-bg.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
            </div>

            <div className="logo" onClick={() => window.location.href = '/dashboard'} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#B5E361', borderRadius: '9999px', borderTopLeftRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', flexShrink: 0 }}>
                    <Leaf size={24} style={{ color: '#111827' }} />
                </div>
                <span style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.025em', color: '#ffffff' }}>Nutrigo</span>
            </div>
            <ul className="nav-menu" style={{ position: 'relative', zIndex: 1 }}>
                <NavLink to="/dashboard" onClick={handleNavLinkClick('/dashboard')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard className="nav-icon" size={20} /> Trang chủ
                </NavLink>
                <NavLink to="/meal-plan" onClick={handleNavLinkClick('/meal-plan')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <CalendarDays className="nav-icon" size={20} /> Lịch ăn uống
                </NavLink>
                <NavLink to="/my-recipes" onClick={handleNavLinkClick('/my-recipes')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <BookOpen className="nav-icon" size={20} /> Công thức của tôi
                </NavLink>
                <div className="nav-group">
                    <div 
                        className={`nav-item ${window.location.pathname === '/ingredients' || window.location.pathname === '/brands' ? 'active-group' : ''}`}
                        onClick={() => setIsNutritionOpen(!isNutritionOpen)}
                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Database className="nav-icon" size={20} /> Dinh dưỡng
                        </div>
                        <span style={{ fontSize: '0.8em', transition: 'transform 0.3s', transform: isNutritionOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                    </div>
                    
                    {isNutritionOpen && (
                        <div className="sub-nav-menu">
                            <div className="sub-nav-item">
                                <NavLink to="/ingredients" onClick={handleNavLinkClick('/ingredients')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ fontSize: '0.95em', padding: '0.6rem 1rem', minHeight: 'auto', marginBottom: 0, justifyContent: 'space-between' }}>
                                    <span>Nguyên liệu</span>
                                    <Apple size={16} className="nav-icon" />
                                </NavLink>
                            </div>
                            <div className="sub-nav-item">
                                <NavLink to="/brands" onClick={handleNavLinkClick('/brands')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ fontSize: '0.95em', padding: '0.6rem 1rem', minHeight: 'auto', marginBottom: 0, justifyContent: 'space-between' }}>
                                    <span>Thương hiệu</span>
                                    <Store size={16} className="nav-icon" />
                                </NavLink>
                            </div>
                        </div>
                    )}
                </div>
            </ul>

            <div className="user-profile-wrapper" ref={dropdownRef} style={{ marginTop: 'auto', position: 'relative' }}>
                <div className="user-profile-block" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <img src={currentUser.avatar} alt="User" className="user-avatar" />
                    <div className="user-info">
                        <span className="user-name">{currentUser.name}</span>
                        <span className="user-email">{currentUser.email}</span>
                    </div>
                    <span className="dropdown-icon" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                </div>

                {isDropdownOpen && (
                    <div className="profile-dropdown">
                        <button className="dropdown-item" onClick={() => window.location.href = '/profile?tab=Personal'}><User size={16} /> Thông tin cá nhân</button>
                        <button className="dropdown-item" onClick={() => window.location.href = '/profile?tab=Settings'}><Settings size={16} /> Cài đặt tài khoản</button>
                        <button className="dropdown-item text-red" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;