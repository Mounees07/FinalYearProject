import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const { userData, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const themeMenuRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
                setIsThemeMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return <Sun size={20} />;
            case 'dark': return <Moon size={20} />;
            case 'system': return <Monitor size={20} />;
            default: return <Moon size={20} />;
        }
    };

    return (
        <nav className="navbar glass-card">
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search for assignments..." />
            </div>

            <div className="nav-actions">
                <div className="theme-wrapper" ref={themeMenuRef}>
                    <button
                        className="icon-btn theme-toggle-btn"
                        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                        title="Change Theme"
                    >
                        {getThemeIcon()}
                    </button>

                    {isThemeMenuOpen && (
                        <div className="theme-menu animate-fade-in">
                            <button
                                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                            >
                                <Sun size={16} />
                                <span>Light</span>
                            </button>
                            <button
                                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                            >
                                <Moon size={16} />
                                <span>Dark</span>
                            </button>
                            <button
                                className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                                onClick={() => { setTheme('system'); setIsThemeMenuOpen(false); }}
                            >
                                <Monitor size={16} />
                                <span>System</span>
                            </button>
                        </div>
                    )}
                </div>

                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <button className="icon-btn" onClick={handleLogout} title="Logout">
                    <LogOut size={20} />
                </button>

                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{userData?.fullName || 'User'}</span>
                        <span className="user-role">{userData?.role || 'Role'}</span>
                    </div>
                    <div className="avatar">
                        {userData?.profilePictureUrl ? (
                            <img src={userData.profilePictureUrl} alt="avatar" />
                        ) : (
                            <User size={24} />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
