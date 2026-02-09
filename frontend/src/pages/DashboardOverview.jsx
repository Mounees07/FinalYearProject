import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Phone,
    Loader
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell
} from 'recharts';
import './DashboardOverview.css';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const sgpaData = [
    { semester: 'I', sgpa: 8.33 },
    { semester: 'II', sgpa: 8.26 },
    { semester: 'III', sgpa: 8.32 },
    { semester: 'IV', sgpa: 8.25 },
    { semester: 'V', sgpa: 8.61 },
    { semester: 'VI', sgpa: 8.46 },
];

const DashboardOverview = () => {
    const { currentUser, userData: authUserData } = useAuth();
    const [studentProfile, setStudentProfile] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        cgpa: "0.00",
        attendance: "0",
        activeCourses: "0",
        pendingAssignments: "0"
    });

    const [activeTab, setActiveTab] = useState('Personal');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                const userRes = await api.get(`/users/${currentUser.uid}`);
                setStudentProfile(userRes.data);

                // Fetch Attendance
                const attRes = await api.get(`/attendance/student/${currentUser.uid}`);

                // Fetch Enrollments & Submissions
                const enrollRes = await api.get(`/courses/enrollments/student/${currentUser.uid}`);
                const enrollments = enrollRes.data || [];

                const subsRes = await api.get(`/assignments/student/${currentUser.uid}`).catch(() => ({ data: [] }));

                // --- Process Recent Activity ---
                const activities = [];

                // 1. Add Attendance
                attRes.data.forEach(att => {
                    activities.push({
                        type: 'attendance',
                        title: 'Biometric Check-in',
                        timestamp: new Date(att.date + 'T' + (att.checkInTime || '00:00:00')),
                        rawDate: att.date
                    });
                });

                // 2. Add Submissions
                subsRes.data.forEach(sub => {
                    activities.push({
                        type: 'submission',
                        title: `Submitted: ${sub.assignment.title}`,
                        timestamp: new Date(sub.submissionDate),
                        rawDate: sub.submissionDate
                    });
                });

                // Sort: Newest First
                const sortedActivities = activities
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 5); // Take top 5

                setRecentActivity(sortedActivities);
                // -------------------------------

                let pendingCount = 0;
                const assignmentPromises = enrollments.map(e =>
                    api.get(`/assignments/section/${e.section.id}`).then(res => res.data).catch(() => [])
                );
                const allSectionAssignments = (await Promise.all(assignmentPromises)).flat();

                const submissionIds = new Set(subsRes.data.map(s => s.assignment.id));

                pendingCount = allSectionAssignments.filter(a => !submissionIds.has(a.id)).length;

                setDashboardStats({
                    cgpa: userRes.data.gpa ? Number(userRes.data.gpa).toFixed(2) : "N/A",
                    attendance: userRes.data.attendance ? Number(userRes.data.attendance).toFixed(1) : (attRes.data.length > 0 ? "Present" : "N/A"),
                    activeCourses: enrollments.length.toString(),
                    pendingAssignments: pendingCount.toString()
                });

                if (enrollments.length === 0) {
                    // Auto-seeding disabled per user request
                    // try { await api.post(`/seed/lms?studentUid=${currentUser.uid}`); } catch (e) { }
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const navigate = useNavigate();

    // Safety redirect for COE users if they land here
    useEffect(() => {
        if (authUserData?.role === 'COE') {
            navigate('/coe/dashboard', { replace: true });
        }
    }, [authUserData, navigate]);

    const toRoman = (num) => {
        const map = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
        return map[num] || num;
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    const profile = studentProfile || authUserData || {};
    const studentInfo = {
        name: profile.fullName || "Student Name",
        regNo: profile.rollNumber || "Register No",
        semester: profile.semester || 1,
        degree: profile.department ? `B.E. - ${profile.department}` : "Computer Science",
        mentor: profile.mentor ? `${profile.mentor.fullName}` : "Not Assigned",
        email: profile.email,
        phone: "+91 98765 43210", // Placeholder
        dob: "15 March 2003", // Placeholder
        gender: "Male", // Placeholder
        nationality: "Indian",
        photo: profile.profilePictureUrl || "https://ui-avatars.com/api/?name=" + (profile.fullName || 'User') + "&background=random"
    };

    return (
        <div className="dashboard-layout-new">
            {/* LEFT COLUMN - Main Content */}
            <div className="dashboard-main-col">

                {/* 1. Progress Section */}
                <div className="dash-card progress-card">
                    <div className="card-header-row">
                        <h3>Academic Journey</h3>
                        <span className="percentage-badge">{(studentInfo.semester / 8 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-fill" style={{ width: `${(studentInfo.semester / 8) * 100}%` }}></div>
                    </div>
                    <div className="steps-row">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <div key={sem} className={`step-item ${studentInfo.semester >= sem ? 'completed' : ''}`}>
                                <div className="step-icon">
                                    {studentInfo.semester > sem ? '✓' : sem}
                                </div>
                                <span>Sem {toRoman(sem)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Navigation Tabs */}
                <div className="dash-tabs">
                    {['Personal', 'Education', 'Experience', 'Documents'].map(tab => (
                        <button
                            key={tab}
                            className={`dash-tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 3. Information Card */}
                <div className="dash-card info-card animate-fade-in-up">
                    <div className="card-header-row">
                        <h3><span className="icon-user">👤</span> Personal Information</h3>
                        <button className="btn-edit">Edit</button>
                    </div>

                    <div className="info-grid">
                        <div className="info-field">
                            <label>Full Name</label>
                            <div className="value">{studentInfo.name}</div>
                        </div>
                        <div className="info-field">
                            <label>Register Number</label>
                            <div className="value">{studentInfo.regNo}</div>
                        </div>
                        <div className="info-field">
                            <label>Date of Birth</label>
                            <div className="value">{studentInfo.dob}</div>
                        </div>
                        <div className="info-field">
                            <label>Student Type</label>
                            <div className="value">Regular / Full Time</div>
                        </div>
                        <div className="info-field">
                            <label>Gender</label>
                            <div className="value">{studentInfo.gender}</div>
                        </div>
                        <div className="info-field">
                            <label>Nationality</label>
                            <div className="value">{studentInfo.nationality}</div>
                        </div>
                        <div className="info-field">
                            <label>Department</label>
                            <div className="value">{studentInfo.degree}</div>
                        </div>
                        <div className="info-field">
                            <label>Current Semester</label>
                            <div className="value">{toRoman(studentInfo.semester)}</div>
                        </div>
                    </div>
                </div>

                {/* 4. Contact Info (Extra) */}
                <div className="dash-card info-card">
                    <div className="card-header-row">
                        <h3>✉️ Contact Information</h3>
                    </div>
                    <div className="info-grid half">
                        <div className="info-field">
                            <label>Email Address</label>
                            <div className="value lowercase">{studentInfo.email}</div>
                        </div>
                        <div className="info-field">
                            <label>Phone Number</label>
                            <div className="value">{studentInfo.phone}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - Sidebar */}
            <div className="dashboard-sidebar-col">

                {/* 1. Profile Summary */}
                <div className="dash-card profile-summary-card">
                    <div className="profile-header-s">
                        <img src={studentInfo.photo} className="avatar-lg" alt="Profile" />
                        <div className="profile-text-s">
                            <h4>{studentInfo.name}</h4>
                            <div className="status-row">
                                <span className="status-dot"></span>
                                <span className="status-text">Active</span>
                                <span className="id-text">ID: {studentInfo.regNo}</span>
                            </div>
                        </div>
                        <button className="btn-icon-s">✎</button>
                    </div>

                    <div className="completion-section">
                        <div className="comp-labels">
                            <span>Profile Completion</span>
                            <span className="comp-val">90%</span>
                        </div>
                        <div className="comp-bar-bg">
                            <div className="comp-bar-fill" style={{ width: '90%' }}></div>
                        </div>
                        <p className="comp-hint">Add your resume to reach 100%</p>
                    </div>

                    {/* Quick Stats Boxes */}
                    <div className="quick-stats-row">
                        <div className="stat-box-s">
                            <div className="stat-val-s">{dashboardStats.activeCourses}</div>
                            <div className="stat-label-s">Courses</div>
                        </div>
                        <div className="stat-box-s green">
                            <div className="stat-val-s">{dashboardStats.pendingAssignments}</div>
                            <div className="stat-label-s">Assignments</div>
                        </div>
                    </div>


                </div>

                {/* 2. Recent Activity / Attendance */}
                <div className="dash-card activity-card">
                    <h3>Recent Activity</h3>
                    <div className="timeline-list">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item, idx) => (
                                <div key={idx} className="timeline-item">
                                    <div className={`t-dot ${item.type === 'submission' ? 'purple' : 'blue'}`}></div>
                                    <div className="t-content">
                                        <div className="t-title">{item.title}</div>
                                        <div className="t-time">
                                            {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-activity">No recent activity</div>
                        )}
                    </div>
                </div>

                {/* 3. Academic Stats */}
                <div className="dash-card small-stats">
                    <div className="flex-bw">
                        <span>CGPA</span>
                        <span className="bold-val">{dashboardStats.cgpa}</span>
                    </div>
                    <div className="divider"></div>
                    <div className="flex-bw">
                        <span>Mentor</span>
                        <span className="bold-val right-align">{studentInfo.mentor}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardOverview;
