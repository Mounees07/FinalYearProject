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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Calculate pagination derived state
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistory = history.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(history.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

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
                    <>
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentHistory.map(record => (
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

                        {totalPages > 1 && (
                            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', padding: '20px', gap: '15px', alignItems: 'center' }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '5px 10px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === 1 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </button>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Page <span style={{ color: 'white', fontWeight: 'bold' }}>{currentPage}</span> of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '5px 10px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === totalPages ? 0.5 : 1
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
