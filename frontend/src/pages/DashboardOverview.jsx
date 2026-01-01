import React, { useEffect, useState } from 'react';
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
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                // Fetch latest user data ensuring we have the fresh profile
                const userRes = await api.get(`/users/${currentUser.uid}`);
                setStudentProfile(userRes.data);

                // Fetch attendance history
                const attRes = await api.get(`/attendance/student/${currentUser.uid}`);
                // Sort by date/time descending and take top 5
                const sortedAtt = attRes.data
                    .sort((a, b) => new Date(b.date + 'T' + (b.checkInTime || '00:00')) - new Date(a.date + 'T' + (a.checkInTime || '00:00')))
                    .slice(0, 5);
                setAttendanceHistory(sortedAtt);

                // AUTO-SEED LMS DATA CHECK (For Demo Purposes)
                // Check if student has enrollments, if not, trigger seed
                try {
                    const enrollRes = await api.get(`/courses/enrollments/student/${currentUser.uid}`);
                    if (enrollRes.data.length === 0) {
                        console.log("No enrollments found, attempting to seed LMS data...");
                        await api.post(`/seed/lms?studentUid=${currentUser.uid}`);
                        console.log("Seeding complete.");
                    }
                } catch (e) {
                    console.warn("Seeding check failed", e);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const toRoman = (num) => {
        const map = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
        return map[num] || num;
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    // Use fetched profile or fall back to auth context data
    const profile = studentProfile || authUserData || {};

    const studentInfo = {
        name: profile.fullName || "Student Name",
        regNo: profile.rollNumber || "Register No",
        semester: toRoman(profile.semester) || "-",
        degree: profile.department ? `B.E. - ${profile.department}` : "Department",
        mentor: profile.mentor ? `${profile.mentor.fullName} ( ${profile.mentor.rollNumber || 'ID'} )` : "Not Assigned",
        specialLab: "DATA SCIENCE", // Hardcoded as requested/placeholder
        photo: profile.profilePictureUrl || "https://ui-avatars.com/api/?name=" + (profile.fullName || 'User') + "&background=random"
    };

    const stats = {
        cgpa: profile.gpa || "0.00",
        placementFa: "74.8", // Hardcoded
        arrearCount: "0",
        feesDue: "0"
    };

    return (
        <div className="dashboard-overview">
            {/* Top Row: Profile, SGPA, Biometric */}
            <div className="dashboard-top-row">

                {/* Profile Card */}
                <div className="glass-card profile-card">
                    <div className="profile-photo-container">
                        <img
                            src={studentInfo.photo}
                            alt="Student"
                            className="profile-photo"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=User&background=random"; }}
                        />
                    </div>
                    <div className="profile-details">
                        <h2 className="student-name">{studentInfo.name}</h2>
                        <span className="student-meta">{studentInfo.regNo}</span>
                        <span className="student-meta">SEMESTER - {studentInfo.semester}</span>
                        <div className="status-badge">CONTINUING</div>

                        <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>

                        <div className="student-meta" style={{ fontSize: '0.8rem' }}>
                            {studentInfo.degree}
                        </div>

                        <div className="mentor-info">
                            <span>Mentor: {studentInfo.mentor}</span>
                            <Phone size={14} className="text-primary" style={{ cursor: 'pointer' }} />
                        </div>

                        <div className="student-meta" style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                            Special Lab: {studentInfo.specialLab}
                        </div>
                    </div>
                </div>

                {/* SGPA Chart Card */}
                <div className="glass-card sgpa-card">
                    <div className="card-title">
                        Semester Grade Point Average (SGPA)
                    </div>
                    <div style={{ flex: 1, minHeight: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sgpaData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                <XAxis
                                    dataKey="semester"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                />
                                <Bar dataKey="sgpa" radius={[4, 4, 4, 4]} barSize={20}>
                                    {sgpaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biometric Card */}
                <div className="glass-card biometric-card">
                    <div className="card-title">Biometric Details</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <table className="bio-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Device</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceHistory.length > 0 ? attendanceHistory.map((row, idx) => (
                                    <tr key={row.id || idx}>
                                        <td>{row.date}</td>
                                        <td>{row.checkInTime ? row.checkInTime.substring(0, 8) : '--:--:--'}</td>
                                        <td className="device-col" style={{ color: '#4ade80' }}>
                                            {row.device || 'BIOMETRIC'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                                            No recent attendance records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                        <button className="btn btn-sm btn-outline">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Stats */}
            <div className="dashboard-stats-row">
                <div className="glass-card stat-summary-card">
                    <span className="stat-summary-label">Cumulative Grade Point Average (CGPA)</span>
                    <span className="stat-summary-value">{Number(stats.cgpa).toFixed(2)}</span>
                </div>
                <div className="glass-card stat-summary-card">
                    <span className="stat-summary-label">Placement FA %</span>
                    <span className="stat-summary-value">{stats.placementFa}</span>
                </div>
                <div className="glass-card stat-summary-card">
                    <span className="stat-summary-label">Arrear Count</span>
                    <span className="stat-summary-value">{stats.arrearCount}</span>
                </div>
                <div className="glass-card stat-summary-card">
                    <span className="stat-summary-label">Fees Due (₹)</span>
                    <span className="stat-summary-value">{stats.feesDue}</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
