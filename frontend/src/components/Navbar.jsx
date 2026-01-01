import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="navbar glass-card">
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search for courses, assignments..." />
            </div>

            <div className="nav-actions">
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
