import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
    Building2,
    Users,
    TrendingUp,
    Bell,
    FileText,
    Briefcase,
    AlertTriangle
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import '../../pages/DashboardOverview.css';
import './HODDashboard.css';


const HODDashboard = () => {
    const { currentUser, userData } = useAuth();
    const [stats, setStats] = useState({
        faculty: 0,
        projects: 0,
        students: 0,
        courses: 0,
        pendingLeaves: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!userData?.department) {
                // If userData is loaded but department is missing, we might stop loading or wait
                if (userData) setLoading(false);
                return;
            }
            try {
                const res = await api.get(`/department/dashboard/${userData.department}`);
                const data = res.data;
                setStats({
                    faculty: data.totalFaculty,
                    projects: data.totalCourses,
                    students: data.totalStudents,
                    courses: data.totalCourses,
                    pendingLeaves: data.pendingLeaves
                });
                setRecentRequests(data.recentActivities);
            } catch (err) {
                console.error("Failed to fetch department stats", err);
            } finally {
                setLoading(false);
            }
        };
        if (userData) {
            fetchDashboardData();
        }
    }, [userData]);

    const deptData = [
        { month: 'Jan', performance: 75, research: 40 },
        { month: 'Feb', performance: 78, research: 45 },
        { month: 'Mar', performance: 82, research: 55 },
        { month: 'Apr', performance: 85, research: 60 },
    ];

    return (
        <div className="dashboard-overview">
            <header className="page-header">
                <h1>Department Management</h1>
                <p>Overview of faculty performance, department research, and student outcomes.</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon attendance"><Briefcase /></div>
                    <div className="stat-info">
                        <span className="label">Department Faculty</span>
                        <span className="value">{stats.faculty} Active</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon courses"><Building2 /></div>
                    <div className="stat-info">
                        <span className="label">Active Courses</span>
                        <span className="value">{stats.courses} Ongoing</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon gpa"><TrendingUp /></div>
                    <div className="stat-info">
                        <span className="label">Total Students</span>
                        <span className="value">{stats.students}</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon tasks"><AlertTriangle /></div>
                    <div className="stat-info">
                        <span className="label">Pending Requests</span>
                        <span className="value">{stats.pendingLeaves} Pending</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="chart-section glass-card">
                    <div className="card-header">
                        <h3>Academic & Research Growth</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={deptData}>
                                <defs>
                                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="performance" stroke="#ec4899" fillOpacity={1} fill="url(#colorPerf)" />
                                <Area type="monotone" dataKey="research" stroke="#8b5cf6" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="upcoming-section glass-card">
                    <div className="card-header">
                        <h3>Recent Requests</h3>
                    </div>
                    <div className="deadline-list">
                        {recentRequests.length === 0 ? (
                            <p className="text-muted p-4">No recent requests.</p>
                        ) : (
                            recentRequests.map((req, idx) => (
                                <div className="deadline-item" key={idx}>
                                    <div className="deadline-icon cs"><FileText /></div>
                                    <div className="deadline-info">
                                        <h4>{req.reason}</h4>
                                        <p>{req.student?.fullName || "Student"} • {new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default HODDashboard;
