import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Calendar,
    MessageSquare,
    Heart,
    TrendingUp,
    Award,
    Clock,
    ChevronRight,
    Loader,
    CheckCircle2,
    AlertCircle,
    Bell,
    Send,
    BookOpen,
    ArrowUpRight,
    Zap
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import '../../pages/DashboardOverview.css';
import './Mentor.css';

const MentorDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [stats, setStats] = useState({
        menteeCount: 0,
        pendingMeetings: 2,
        avgGpa: 3.54,
        successRate: 92
    });
    const [recentMentees, setRecentMentees] = useState([]);
    const [atRiskStudents, setAtRiskStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState("");

    const menteeProgressData = [
        { week: 'W1', avgGpa: 3.2 },
        { week: 'W2', avgGpa: 3.4 },
        { week: 'W3', avgGpa: 3.3 },
        { week: 'W4', avgGpa: 3.6 },
        { week: 'W5', avgGpa: 3.5 },
        { week: 'W6', avgGpa: 3.8 },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            try {
                const menteesRes = await api.get(`/users/mentees/${currentUser.uid}`);
                const mentees = menteesRes.data;

                setRecentMentees(mentees.slice(0, 3));
                const atRisk = mentees.filter(m => (m.gpa && m.gpa < 2.5) || (m.attendance && m.attendance < 75));
                setAtRiskStudents(atRisk);

                if (mentees.length > 0) {
                    const totalGpa = mentees.reduce((acc, m) => acc + (m.gpa || 3.0), 0);
                    setStats(prev => ({
                        ...prev,
                        menteeCount: mentees.length,
                        avgGpa: (totalGpa / mentees.length).toFixed(2)
                    }));
                }

            } catch (err) {
                console.error("Error fetching mentor dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    const handleBroadcast = (e) => {
        e.preventDefault();
        if (!announcement.trim()) return;
        alert(`Announcement sent to ${stats.menteeCount} mentees: ${announcement}`);
        setAnnouncement("");
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    return (
        <div className="dashboard-overview mentor-premium">
            <header className="page-header">
                <div className="header-greeting">
                    <h1>Welcome back, Mentor {userData?.fullName?.split(' ')[0]}!</h1>
                    <p>You have {stats.menteeCount} students under your guidance. Here's a summary of their progress.</p>
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
                        <span className="label">Total Mentees</span>
                        <span className="value">{stats.menteeCount} Students</span>
                    </div>
                    <div className="stat-badge positive"><ArrowUpRight size={12} /> 12%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon attendance"><Calendar /></div>
                    <div className="stat-info">
                        <span className="label">Meetings</span>
                        <span className="value">{stats.pendingMeetings} Today</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon gpa"><TrendingUp /></div>
                    <div className="stat-info">
                        <span className="label">Avg Mentee GPA</span>
                        <span className="value">{stats.avgGpa}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon tasks"><Award /></div>
                    <div className="stat-info">
                        <span className="label">Current Success</span>
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
                                <h3>Mentee Performance Trend</h3>
                                <p className="subtitle">Average success rate across departments</p>
                            </div>
                            <div className="card-actions">
                                <select className="mini-select">
                                    <option>Monthly</option>
                                    <option>Weekly</option>
                                </select>
                            </div>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={menteeProgressData}>
                                    <defs>
                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="avgGpa" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGpa)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bottom-grid">
                        {/* Broadcast Section */}
                        <div className="broadcast-section glass-card">
                            <div className="card-header">
                                <div className="header-with-icon">
                                    <Zap size={20} className="text-primary" />
                                    <h3>Quick Announcement</h3>
                                </div>
                            </div>
                            <form onSubmit={handleBroadcast} className="broadcast-form">
                                <textarea
                                    placeholder="Type a message to all your mentees..."
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                ></textarea>
                                <button type="submit" className="btn btn-primary broadcast-btn">
                                    <Send size={16} />
                                    Broadcast
                                </button>
                            </form>
                        </div>

                        {/* Resource Links */}
                        <div className="resources-section glass-card">
                            <div className="card-header">
                                <h3>Quick Resources</h3>
                            </div>
                            <div className="resource-list">
                                <a href="#" className="resource-item">
                                    <div className="resource-icon b1"><BookOpen size={16} /></div>
                                    <span>Mentoring Guidelines</span>
                                </a>
                                <a href="#" className="resource-item">
                                    <div className="resource-icon b2"><Bell size={16} /></div>
                                    <span>Faculty Notices</span>
                                </a>
                                <a href="#" className="resource-item">
                                    <div className="resource-icon b3"><MessageSquare size={16} /></div>
                                    <span>Counseling PPTs</span>
                                </a>
                            </div>
                        </div>
                    </div>


                </div>

                <div className="sidebar-area">
                    {/* At Risk Section */}
                    {atRiskStudents.length > 0 && (
                        <div className="risk-alerts-section glass-card">
                            <div className="card-header">
                                <div className="header-with-icon">
                                    <AlertCircle size={20} className="text-danger" />
                                    <h3>At-Risk Students</h3>
                                </div>
                            </div>
                            <div className="risk-list">
                                {atRiskStudents.map(student => (
                                    <div key={student.id} className="risk-item">
                                        <div className="risk-info">
                                            <h4>{student.fullName}</h4>
                                            <p>{student.department} • GPA: {student.gpa || 'N/A'}</p>
                                        </div>
                                        <div className="risk-tag">Intervene</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Mentees */}
                    <div className="recent-mentees-section glass-card">
                        <div className="card-header">
                            <h3>Recent Mentees</h3>
                            <button className="btn-text">View All</button>
                        </div>
                        <div className="mentee-mini-list">
                            {recentMentees.length > 0 ? recentMentees.map(mentee => (
                                <div key={mentee.id} className="mentee-mini-item">
                                    <div className="mini-avatar">{mentee.fullName.charAt(0)}</div>
                                    <div className="mini-info">
                                        <h4>{mentee.fullName}</h4>
                                        <span>{mentee.email}</span>
                                    </div>
                                    <div className="mini-status">
                                        {mentee.gpa > 3.5 ? <CheckCircle2 size={16} color="#10b981" /> : <AlertCircle size={16} color="#f59e0b" />}
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-mini-state">
                                    <p>No mentees assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="priority-tasks glass-card">
                        <div className="card-header">
                            <h3>Priority Tasks</h3>
                        </div>
                        <div className="deadline-list">
                            <div className="deadline-item">
                                <div className="deadline-icon cs"><MessageSquare /></div>
                                <div className="deadline-info">
                                    <h4>Counseling Request</h4>
                                    <p>Rahul S. • Personal</p>
                                </div>
                                <ChevronRight className="item-arrow" size={16} />
                            </div>
                            <div className="deadline-item">
                                <div className="deadline-icon physics"><Heart /></div>
                                <div className="deadline-info">
                                    <h4>Well-being Alert</h4>
                                    <p>3 Alerts detected</p>
                                </div>
                                <ChevronRight className="item-arrow" size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
