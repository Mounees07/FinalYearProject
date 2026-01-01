import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Loader, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import './StudentAttendance.css';

const StudentAttendance = () => {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alreadyMarked, setAlreadyMarked] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);

    useEffect(() => {
        fetchData();
        checkToday();
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/attendance/student/${currentUser.uid}`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkToday = async () => {
        try {
            const res = await api.get(`/attendance/check-today/${currentUser.uid}`);
            setAlreadyMarked(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAttendance = async () => {
        try {
            const res = await api.post(`/attendance/mark?studentUid=${currentUser.uid}`);
            setAlreadyMarked(true);
            setTodayStatus(res.data);
            fetchData(); // Refresh list
            alert(`Attendance Marked: ${res.data.status}`);
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    return (
        <div className="attendance-page">
            <div className="attendance-header">
                <h1>My Attendance</h1>
                <div className="mark-section">
                    {alreadyMarked ? (
                        <div className="marked-badge">
                            <CheckCircle size={24} /> Attendance Marked for Today
                        </div>
                    ) : (
                        <button className="btn-mark" onClick={handleMarkAttendance}>
                            <CheckCircle size={20} /> Mark Attendance for Today
                        </button>
                    )}
                </div>
            </div>

            <div className="attendance-stats">
                <div className="stat-card">
                    <h3>Total Present</h3>
                    <p>{history.length}</p>
                </div>
                {/* Future: Add Absent count if we track total days */}
            </div>

            <div className="history-list glass-card">
                <h2>Attendance History</h2>
                {history.length === 0 ? (
                    <p className="empty-text">No attendance records found.</p>
                ) : (
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(record => (
                                <tr key={record.id}>
                                    <td>{record.date}</td>
                                    <td>{record.checkInTime}</td>
                                    <td>
                                        <span className={`status-badge ${record.status === 'LATE' ? 'status-late' : 'status-present'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
