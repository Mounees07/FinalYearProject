import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    Users,
    Calendar,
    FileText,
    TrendingUp,
    Clock,
    ChevronRight,
    Loader,
    CheckCircle2,
    AlertCircle,
    Bell,
    Send,
    BookOpen,
    ArrowUpRight,
    Zap,
    Award
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import '../../pages/DashboardOverview.css';
import './Teacher.css';

const TeacherDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [mySections, setMySections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        pendingGrades: 12,
        classAvg: 84.5,
        successRate: 92
    });
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [announcement, setAnnouncement] = useState("");

    const classPerformanceData = [
        { name: 'CS101', attendance: 85, performance: 78 },
        { name: 'CS202', attendance: 92, performance: 88 },
        { name: 'CS303', attendance: 78, performance: 82 },
        { name: 'CS404', attendance: 95, performance: 91 },
        { name: 'CS505', attendance: 88, performance: 85 },
        { name: 'CS606', attendance: 90, performance: 89 },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            try {
                const res = await api.get(`/courses/sections/faculty/${currentUser.uid}`);
                console.log("TeacherDashboard fetched sections:", res.data);
                const sections = Array.isArray(res.data) ? res.data : [];
                setMySections(sections);

                // Calculate stats based on sections if possible, else mock for now as backend might not return full stats
                // Mocking upcoming classes for demo
                setUpcomingClasses([
                    { subject: 'Data Structures (CS202)', time: '10:00 AM', room: 'Room 302', icon: 'cs' },
                    { subject: 'Network Security (CS404)', time: '01:00 PM', room: 'LAB 01', icon: 'physics' },
                    { subject: 'Faculty Meeting', time: '04:00 PM', room: 'Conference Room', icon: 'math' }
                ]);

                setStats(prev => ({
                    ...prev,
                    totalStudents: 184 // Mock value
                }));

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [currentUser]);

    const handleBroadcast = (e) => {
        e.preventDefault();
        if (!announcement.trim()) return;
        alert(`Announcement sent to students: ${announcement}`);
        setAnnouncement("");
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    return (
        <div className="dashboard-overview teacher-premium">
            <header className="page-header">
                <div className="header-greeting">
                    <h1>Welcome back, Professor {userData?.fullName?.split(' ')[0]}!</h1>
                    <p>You have {stats.totalStudents} students across {mySections.length} active sections. Here's a summary of their progress.</p>
                </div>
                <div className="header-controls">
                    <div className="header-date glass-card">
                        <Calendar size={18} />
                        <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon courses"><Users /></div>
                    <div className="stat-info">
                        <span className="label">Total Students</span>
                        <span className="value">{stats.totalStudents}</span>
                    </div>
                    <div className="stat-badge positive"><ArrowUpRight size={12} /> +5%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon attendance"><FileText /></div>
                    <div className="stat-info">
                        <span className="label">Pending Grades</span>
                        <span className="value">{stats.pendingGrades} Items</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon gpa"><TrendingUp /></div>
                    <div className="stat-info">
                        <span className="label">Class Average</span>
                        <span className="value">{stats.classAvg}%</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon tasks"><Award /></div>
                    <div className="stat-info">
                        <span className="label">Course Completion</span>
                        <span className="value">{stats.successRate}%</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="main-content-area">
                    {/* Performance Chart */}
                    <div className="chart-section glass-card">
                        <div className="card-header">
                            <div>
                                <h3>Class Performance Overview</h3>
                                <p className="subtitle">Attendance vs Academic Performance</p>
                            </div>
                            <div className="card-actions">
                                <select className="mini-select">
                                    <option>This Sem</option>
                                    <option>Last Sem</option>
                                </select>
                            </div>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={classPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="performance" fill="#6366f1" radius={[4, 4, 0, 0]} name="Performance" />
                                    <Bar dataKey="attendance" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Attendance" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bottom-grid">
                        {/* Broadcast Section */}
                        <div className="broadcast-section glass-card">
                            <div className="card-header">
                                <div className="header-with-icon">
                                    <Zap size={20} className="text-primary" />
                                    <h3>Class Announcement</h3>
                                </div>
                            </div>
                            <form onSubmit={handleBroadcast} className="broadcast-form">
                                <textarea
                                    placeholder="Type a message to your active classes..."
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                ></textarea>
                                <button type="submit" className="btn btn-primary broadcast-btn">
                                    <Send size={16} />
                                    Broadcast
                                </button>
                            </form>
                        </div>

                        {/* Recent Sections / Resources */}
                        <div className="resources-section glass-card">
                            <div className="card-header">
                                <h3>My Sections</h3>
                            </div>
                            <div className="resource-list">
                                {mySections.slice(0, 3).map((section, idx) => (
                                    <Link to={`/teacher/courses/${section.id}/manage`} key={section.id} className="resource-item">
                                        <div className={`resource-icon b${(idx % 3) + 1}`}><BookOpen size={16} /></div>
                                        <span>{section.courseName} ({section.sectionName})</span>
                                    </Link>
                                ))}
                                {mySections.length === 0 && <p className="text-muted text-sm">No active sections assigned.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-area">
                    {/* Upcoming Schedule */}
                    <div className="priority-tasks glass-card">
                        <div className="card-header">
                            <h3>Today's Schedule</h3>
                        </div>
                        <div className="deadline-list">
                            {upcomingClasses.map((cls, idx) => (
                                <div className="deadline-item" key={idx}>
                                    <div className={`deadline-icon ${cls.icon}`}><Clock /></div>
                                    <div className="deadline-info">
                                        <h4>{cls.subject}</h4>
                                        <p>{cls.room} • {cls.time}</p>
                                    </div>
                                    <ChevronRight className="item-arrow" size={16} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Grades / Actions */}
                    <div className="recent-mentees-section glass-card">
                        <div className="card-header">
                            <h3>Pending Grades</h3>
                            <button className="btn-text">View All</button>
                        </div>
                        <div className="mentee-mini-list">
                            <div className="mentee-mini-item">
                                <div className="mini-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>A</div>
                                <div className="mini-info">
                                    <h4>Assignment 3</h4>
                                    <span>CS101 • 12 Pending</span>
                                </div>
                                <div className="mini-status">
                                    <AlertCircle size={16} color="#f59e0b" />
                                </div>
                            </div>
                            <div className="mentee-mini-item">
                                <div className="mini-avatar" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>L</div>
                                <div className="mini-info">
                                    <h4>Lab Report 2</h4>
                                    <span>CS202 • 5 Pending</span>
                                </div>
                                <div className="mini-status">
                                    <CheckCircle2 size={16} color="#10b981" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Resources */}
                    <div className="resources-section glass-card" style={{ marginTop: 0 }}>
                        <div className="card-header">
                            <h3>Quick Links</h3>
                        </div>
                        <div className="resource-list">
                            <Link to="/grading" className="resource-item">
                                <div className="resource-icon b1"><FileText size={16} /></div>
                                <span>Grading Portal</span>
                            </Link>
                            <Link to="/teacher/courses" className="resource-item">
                                <div className="resource-icon b2"><BookOpen size={16} /></div>
                                <span>Course Catalog</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
