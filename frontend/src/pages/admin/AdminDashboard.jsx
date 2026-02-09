import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    Activity,
    Settings,
    BarChart2,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../DashboardOverview.css';
import './Admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        systemHealth: 'Operational'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Fetch Users Count
                // We'll iterate roles as we did in UserManagement to get a true count
                const roles = ['STUDENT', 'TEACHER', 'MENTOR', 'HOD', 'ADMIN', 'COE', 'PRINCIPAL'];
                const userPromises = roles.map(role => api.get(`/users/role/${role}`).catch(() => ({ data: [] })));
                const userResults = await Promise.all(userPromises);
                const allUsers = userResults.flatMap(r => r.data);
                // Deduplicate just in case
                const uniqueUsers = new Set(allUsers.map(u => u.id || u.firebaseUid)).size;

                // 2. Fetch Courses Count
                let coursesCount = 0;
                try {
                    // Try fetching all courses. If not available, fallback to 0 or mock
                    const coursesRes = await api.get('/courses/all'); // Assuming this exists or returns list
                    if (Array.isArray(coursesRes.data)) {
                        coursesCount = coursesRes.data.length;
                    }
                } catch (e) {
                    // If endpoint doesn't exist, try getting teacher courses if possible, or just 0
                    console.warn("Could not fetch global course count", e);
                }

                setStats({
                    totalUsers: uniqueUsers,
                    totalCourses: coursesCount,
                    systemHealth: 'Operational'
                });
            } catch (err) {
                console.error("Dashboard stats error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const sections = [
        { title: 'User Management', icon: <Users size={24} />, desc: 'Manage students, teachers, and staff accounts.', link: '/admin/users', color: '#3b82f6' },
        { title: 'Course Oversight', icon: <BookOpen size={24} />, desc: 'Review curriculums and course content.', link: '/admin/courses', color: '#10b981' },
        { title: 'System Settings', icon: <Settings size={24} />, desc: 'Configure platform parameters.', link: '/admin/settings', color: '#6366f1' },
        { title: 'Institutional Data Repository', icon: <BarChart2 size={24} />, desc: 'View Individual Datas', link: '/admin/reports', color: '#f59e0b' },
    ];

    if (loading) {
        return (
            <div className="dashboard-layout-new">
                <div className="dashboard-main-col" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout-new">
            <div className="dashboard-main-col">
                <div className="welcome-banner animate-fade-in">
                    <div className="banner-content">
                        <h1>System Administration</h1>
                        <p>Full control over the educational platform ecosystem. Monitor performance, manage users, and configure system settings.</p>
                    </div>
                    <div className="banner-icon">
                        <Shield size={48} color="white" style={{ opacity: 0.9 }} />
                    </div>
                </div>

                <div className="stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card glass-card">
                        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                            <Users size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalUsers}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                            <BookOpen size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalCourses}</span>
                            <span className="stat-label">Active Courses</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                            <Activity size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.systemHealth}</span>
                            <span className="stat-label">System Health</span>
                        </div>
                    </div>
                </div>

                <h3 className="section-title animate-fade-in" style={{ animationDelay: '0.2s', fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: '1rem' }}>Administration Modules</h3>

                <div className="admin-modules-grid animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    {sections.map((section, idx) => (
                        <div key={idx} className="module-card glass-card" onClick={() => navigate(section.link)}>
                            <div className="module-icon-wrapper" style={{
                                background: `${section.color}20`,
                                color: section.color,
                                boxShadow: `0 0 20px ${section.color}10`
                            }}>
                                {section.icon}
                            </div>
                            <div className='module-content'>
                                <h4>{section.title}</h4>
                                <p>{section.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-sidebar-col animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="dash-card profile-summary-card">
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button className="btn btn-primary w-full" onClick={() => navigate('/admin/users')}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Users size={16} /> Create New User
                            </div>
                        </button>
                        <button className="btn btn-secondary w-full" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                            System Broadcast (Soon)
                        </button>
                        <button className="btn btn-secondary w-full" onClick={() => navigate('/admin/settings')}>
                            View Audit Logs
                        </button>
                    </div>
                </div>

                {/* System Info Widget */}
                <div className="dash-card glass-card" style={{ marginTop: '20px', padding: '20px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Server Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                        <span style={{ fontSize: '0.9rem', color: '#fff' }}>Database: Connected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                        <span style={{ fontSize: '0.9rem', color: '#fff' }}>Gateway: Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
