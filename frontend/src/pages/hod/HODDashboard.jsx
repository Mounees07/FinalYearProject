import React from 'react';
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


const HODDashboard = () => {
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
                        <span className="value">24 Active</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon courses"><Building2 /></div>
                    <div className="stat-info">
                        <span className="label">Ongoing Projects</span>
                        <span className="value">08 Active</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon gpa"><TrendingUp /></div>
                    <div className="stat-info">
                        <span className="label">Dept. Success Rate</span>
                        <span className="value">92%</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon tasks"><AlertTriangle /></div>
                    <div className="stat-info">
                        <span className="label">Budget Alerts</span>
                        <span className="value">02 Pending</span>
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
                        <div className="deadline-item">
                            <div className="deadline-icon cs"><FileText /></div>
                            <div className="deadline-info">
                                <h4>Leave Approval - Dr. Smith</h4>
                                <p>Urgent • Dec 29</p>
                            </div>
                        </div>
                        <div className="deadline-item">
                            <div className="deadline-icon math"><FileText /></div>
                            <div className="deadline-info">
                                <h4>Lab Equipment Proposal</h4>
                                <p>Pending Review</p>
                            </div>
                        </div>
                        <div className="deadline-item">
                            <div className="deadline-icon physics"><Bell /></div>
                            <div className="deadline-info">
                                <h4>Department Meeting</h4>
                                <p>In 2 hours</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default HODDashboard;
