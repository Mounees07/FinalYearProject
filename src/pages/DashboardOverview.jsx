
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Phone,
    Loader,
    BookOpen,
    ClipboardList,
    Award,
    FileText,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
    Tooltip,
    LabelList
} from 'recharts';
import './DashboardOverview.css';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';



const DashboardOverview = () => {
    const { currentUser, userData: authUserData } = useAuth();
    const [studentProfile, setStudentProfile] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [sgpaHistory, setSgpaHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        cgpa: "0.00",
        attendance: "0",
        activeCourses: "0",
        pendingAssignments: "0",
        placementStatus: "Not Evaluated"
    });

    const [activeTab, setActiveTab] = useState('Personal');
    const [selectedSem, setSelectedSem] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                const userRes = await api.get(`/users/${currentUser.uid}`);
                setStudentProfile(userRes.data);
                setSelectedSem(userRes.data.semester || 1);

                // Fetch Attendance
                const attRes = await api.get(`/attendance/student/${currentUser.uid}`);
                const attStatsRes = await api.get(`/attendance/stats/${currentUser.uid}`).catch(() => ({ data: { percentage: 0 } }));

                // Fetch Enrollments & Submissions
                const enrollRes = await api.get(`/courses/enrollments/student/${currentUser.uid}`);
                const enrollments = enrollRes.data || [];

                const subsRes = await api.get(`/assignments/student/${currentUser.uid}`).catch(() => ({ data: [] }));

                // Fetch SGPA History
                const sgpaRes = await api.get(`/results/student/${currentUser.uid}/sgpa-history`).catch(() => ({ data: [] }));
                const history = sgpaRes.data || [];
                setSgpaHistory(history);

                let currentSgpa = "N/A";
                if (history.length > 0) {
                    currentSgpa = Number(history[history.length - 1].sgpa).toFixed(2);
                } else if (userRes.data.sgpa) {
                    currentSgpa = Number(userRes.data.sgpa).toFixed(2);
                }

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

                // Fetch Leave Requests (for balance/status)
                const leaveRes = await api.get(`/leaves/student/${currentUser.uid}`).catch(() => ({ data: [] }));
                const approvedLeaves = leaveRes.data ? leaveRes.data.filter(l => l.status === 'APPROVED').length : 0;
                const totalLeaves = 10; // Assuming total leaves allowed is 10
                const leaveBalance = totalLeaves - approvedLeaves;

                // Determine placement status based on semantic criteria
                let placement = "Not Evaluated";
                if (userRes.data.placementStatus) {
                    placement = userRes.data.placementStatus;
                } else if (userRes.data.semester >= 6) {
                    placement = "Eligible";
                }

                setDashboardStats({
                    cgpa: userRes.data.cgpa ? Number(userRes.data.cgpa).toFixed(2) : (userRes.data.gpa ? Number(userRes.data.gpa).toFixed(2) : "N/A"),
                    sgpa: currentSgpa,
                    attendance: attStatsRes.data.percentage !== undefined ? attStatsRes.data.percentage : "0",
                    activeCourses: enrollments.length.toString(),
                    pendingAssignments: pendingCount.toString(),
                    arrearCount: userRes.data.arrearCount || 0,
                    feesDue: userRes.data.feesDue || 0,
                    placementStatus: placement
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

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        // Test with real due fee amount, fall back to default demo amount if 0
        const amountDue = Number(dashboardStats.feesDue);
        const feeAmount = amountDue > 0 ? amountDue : 1000;

        try {
            const response = await api.post('/payments/create-order', {
                amount: feeAmount,
                currency: "INR"
            });

            if (!response.data || response.data.error) {
                alert("Server error. Have you configured your Razorpay Test Keys in application.properties?");
                return;
            }

            const { orderId, amount, currency, keyId } = response.data;

            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'AcaSync Platform',
                description: 'Semester Fee Payment',
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const verifyResult = await api.post('/payments/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyResult.data.status === 'success') {
                            alert("Payment Successful! 🎉");
                            setDashboardStats(prev => ({ ...prev, feesDue: 0 }));
                        }
                    } catch (err) {
                        alert("Payment verification failed.");
                        console.error(err);
                    }
                },
                prefill: {
                    name: studentInfo.name,
                    email: studentInfo.email,
                    contact: studentInfo.phone
                },
                theme: {
                    color: '#6366f1'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Payment flow error:", error);
            alert("Payment could not be initiated. Check server connection or backend keys.");
        }
    };

    return (
        <div className="dashboard-layout-new">
            {/* LEFT COLUMN - Main Content */}
            <div className="dashboard-main-col">

                {/* 1. Welcome & Academic Summary */}
                {/* 1. Welcome Header - Now Separate */}
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Welcome back, {studentInfo.name.split(' ')[0]}! 👋
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Here's your academic overview for Semester {toRoman(studentInfo.semester)}.</p>
                </div>

                {/* 2. Primary Stats Grid - Separate Professional Cards */}
                <div className="stats-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>

                    {/* SGPA Card */}
                    <div className="dash-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Current SGPA</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{dashboardStats.sgpa}</div>
                            </div>
                            <div style={{ width: '120px', height: '50px' }}>
                                <BarChart width={120} height={50} data={sgpaHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <YAxis hide domain={[0, 10]} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.75rem', padding: '4px 8px' }}
                                        itemStyle={{ color: '#10b981' }}
                                        formatter={(value) => [value, 'SGPA']}
                                    />
                                    <Bar dataKey="sgpa" radius={[4, 4, 4, 4]} barSize={8}>
                                        {sgpaHistory.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill="#10b981"
                                                fillOpacity={index === sgpaHistory.length - 1 ? 1 : 0.3}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>+0.2</span> from last sem
                        </div>
                    </div>

                    {/* CGPA Card */}
                    <div className="dash-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Overall CGPA</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{dashboardStats.cgpa}</div>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                                <span style={{ fontSize: '1.5rem' }}>🎓</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Cumulative Score
                        </div>
                    </div>

                    {/* Attendance Card */}
                    <div className="dash-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Attendance</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                                    {dashboardStats.attendance}{String(dashboardStats.attendance).includes('%') ? '' : '%'}
                                </div>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
                                <span style={{ fontSize: '1.5rem' }}>📅</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Total Classes Attended
                        </div>
                    </div>
                </div>

                {/* 3. Secondary Stats Row - Smaller Cards */}
                <div className="stats-grid-row-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>

                    {/* Arrears */}
                    <div className="dash-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: Number(dashboardStats.arrearCount) > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            {Number(dashboardStats.arrearCount) > 0 ? '⚠️' : '✅'}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Arrears</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: Number(dashboardStats.arrearCount) > 0 ? '#ef4444' : '#10b981' }}>
                                {dashboardStats.arrearCount}
                            </div>
                        </div>
                    </div>

                    {/* Fees Due */}
                    <div
                        className="dash-card"
                        style={{
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 12px rgba(248, 113, 113, 0.15)'
                        }}
                        onClick={handlePayment}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(248, 113, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            💰
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fees Due</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f87171' }}>
                                ₹{Number(dashboardStats.feesDue).toLocaleString()}
                            </div>
                        </div>
                        <div style={{
                            background: '#f87171',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            Pay Now
                        </div>
                    </div>

                    {/* Placement Status */}
                    <div className="dash-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            💼
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placement Status</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: dashboardStats.placementStatus === 'Offered' ? '#34d399' : (dashboardStats.placementStatus === 'Not Evaluated' ? '#64748b' : '#60a5fa') }}>
                                {dashboardStats.placementStatus}
                            </div>
                        </div>
                    </div>



                </div>
            </div>

            {/* RIGHT COLUMN - Sidebar (Now Information Column) */}
            <div className="dashboard-sidebar-col">

                {/* 1. Academic Journey (Simplified Dropdown with Profile) */}


                {/* 2. Navigation Tabs */}
                <div className="dash-tabs vertical">
                    {['Education', 'Experience', 'Documents'].map(tab => (
                        <button
                            key={tab}
                            className={`dash-tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 2. Detailed Information Content */}


                {activeTab === 'Education' && (
                    <div className="dash-card info-card animate-fade-in-up">
                        <div className="card-header-row">
                            <h3><span className="icon-user">🎓</span> Education</h3>
                        </div>
                        <div className="education-list">
                            <div className="edu-item" style={{ padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: 'white', marginBottom: '5px', fontSize: '0.95rem' }}>Higher Secondary</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.85em' }}>State Board • 2021</p>
                                <p style={{ color: '#10b981', fontSize: '0.85em', fontWeight: 'bold' }}>94.5% Aggregate</p>
                            </div>
                            <div className="edu-item" style={{ padding: '15px 0' }}>
                                <h4 style={{ color: 'white', marginBottom: '5px', fontSize: '0.95rem' }}>Secondary School</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.85em' }}>State Board • 2019</p>
                                <p style={{ color: '#10b981', fontSize: '0.85em', fontWeight: 'bold' }}>98.2% Aggregate</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Experience' && (
                    <div className="dash-card info-card animate-fade-in-up">
                        <div className="card-header-row">
                            <h3><span className="icon-user">💼</span> Experience</h3>
                        </div>
                        <div className="xp-list" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                            <p>No internships added yet.</p>
                            <button className="btn-edit" style={{ marginTop: '10px' }}>Add Experience</button>
                        </div>
                    </div>
                )}

                {activeTab === 'Documents' && (
                    <div className="dash-card info-card animate-fade-in-up">
                        <div className="card-header-row">
                            <h3><span className="icon-user">📂</span> Documents</h3>
                        </div>
                        <div className="documents-grid-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            {['MarkSheet_Sem1.pdf', 'MarkSheet_Sem2.pdf', 'Bonafide_Cert.pdf'].map((doc, idx) => (
                                <div key={idx} className="doc-item-sidebar" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ color: '#3b82f6' }}>
                                        📄
                                    </div>
                                    <span style={{ fontSize: '0.85em', color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc}</span>
                                    <button style={{ fontSize: '0.75em', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>⬇</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Recent Activity & Biometric Log */}
                <div className="dash-card activity-card" style={{ marginTop: '20px' }}>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3>Biometric & Recent Activity</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>Last 5 Updates</span>
                    </div>

                    <div className="timeline-list">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item, idx) => (
                                <div key={idx} className="timeline-item">
                                    <div className={`t-dot ${item.type === 'attendance' ? 'green' : item.type === 'submission' ? 'purple' : 'blue'}`}></div>
                                    <div className="t-content">
                                        <div className="t-title" style={{ fontWeight: '500', fontSize: '0.9rem' }}>{item.title}</div>
                                        <div className="t-time" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {item.type === 'attendance' ? (
                                                /* Explicit Biometric Date Display */
                                                <span style={{ color: '#34d399', fontWeight: '500' }}>
                                                    {new Date(item.timestamp).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : (
                                                <span>{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            )}
                                        </div>
                                    </div>
                                    {item.type === 'attendance' && (
                                        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            PRESENT
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-activity" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent activity found.</div>
                        )}
                    </div>
                </div>
            </div>


        </div >
    );
};

export default DashboardOverview;
