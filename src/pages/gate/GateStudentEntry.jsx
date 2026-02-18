import React, { useState } from 'react';
import api from '../../utils/api';
import { Search, UserCheck, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './GateStudentEntry.css';

const GateStudentEntry = () => {
    const { currentUser } = useAuth();
    const [rollNumber, setRollNumber] = useState('');
    const [leaveData, setLeaveData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setLeaveData(null);
        setSuccessMessage(null);

        try {
            const response = await api.get(`/leaves/security/active/${rollNumber}`);
            setLeaveData(response.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError("No active approved leave found for this student today.");
            } else {
                setError("An error occurred while fetching data.");
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (!leaveData) return;
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(`/leaves/security/${leaveData.id}/action?action=${action}`);
            setLeaveData(response.data);
            setSuccessMessage(`Student marked as ${action === 'EXIT' ? 'Exited' : 'Returned'} successfully.`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gate-entry-container">
            <div className="header-section">
                <h1>Student Entry/Exit Scanner</h1>
                <p>Verify approved leaves and track student movement.</p>
            </div>

            <div className="search-section glass-card">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="input-group">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Enter Student Roll Number"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="error-message glass-card">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="success-message glass-card">
                    <CheckCircle size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {leaveData && (
                <div className="result-card glass-card fade-in">
                    <div className="student-info">
                        <div className="student-details">
                            <h2>{leaveData.student.fullName}</h2>
                            <p className="roll-no">{leaveData.student.rollNumber}</p>
                            <p className="dept">{leaveData.student.department} - {leaveData.student.section}</p>
                        </div>
                        {leaveData.student.profilePictureUrl ? (
                            <img src={leaveData.student.profilePictureUrl} alt="Profile" className="student-photo" />
                        ) : (
                            <div className="student-photo-placeholder">
                                <UserCheck size={40} />
                            </div>
                        )}
                    </div>

                    <div className="leave-details">
                        <div className="detail-item">
                            <label>Leave Type</label>
                            <span>{leaveData.leaveType}</span>
                        </div>
                        <div className="detail-item">
                            <label>Reason</label>
                            <span>{leaveData.reason}</span>
                        </div>
                        <div className="detail-item">
                            <label>Duration</label>
                            <span>{leaveData.fromDate} to {leaveData.toDate}</span>
                        </div>
                        <div className="detail-item status">
                            <label>Status</label>
                            <span className="approved-badge">APPROVED</span>
                        </div>
                    </div>

                    <div className="timestamp-details">
                        <div className="time-block">
                            <label>Exit Time</label>
                            {leaveData.actualExitTime ? (
                                <span className="time-value">
                                    {new Date(leaveData.actualExitTime).toLocaleTimeString()}
                                </span>
                            ) : (
                                <span className="time-pending">Not Exited</span>
                            )}
                        </div>
                        <div className="time-block">
                            <label>Return Time</label>
                            {leaveData.actualReturnTime ? (
                                <span className="time-value">
                                    {new Date(leaveData.actualReturnTime).toLocaleTimeString()}
                                </span>
                            ) : (
                                <span className="time-pending">Not Returned</span>
                            )}
                        </div>
                    </div>

                    <div className="action-buttons">
                        {!leaveData.actualExitTime ? (
                            <button
                                className="action-btn exit-btn"
                                onClick={() => handleAction('EXIT')}
                                disabled={loading}
                            >
                                Mark Exit
                            </button>
                        ) : !leaveData.actualReturnTime ? (
                            <button
                                className="action-btn return-btn"
                                onClick={() => handleAction('RETURN')}
                                disabled={loading}
                            >
                                Mark Return
                            </button>
                        ) : (
                            <div className="completed-badge">
                                <CheckCircle size={20} />
                                <span>Entry Completed</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GateStudentEntry;
