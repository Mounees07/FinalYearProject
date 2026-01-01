import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Loader, CheckCircle, XCircle, Clock } from 'lucide-react';
import "../student/StudentLeaves.css";
// Reusing styles

const MentorLeaves = () => {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [currentUser]);

    const fetchRequests = async () => {
        try {
            const res = await api.get(`/leaves/mentor/${currentUser.uid}`);
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        const remarks = prompt("Add remarks (optional):", "");
        if (remarks === null) return; // Cancelled

        try {
            await api.post(`/leaves/mentor-action/${id}`, { status, remarks });
            alert(`Leave ${status} successfully!`);
            fetchRequests();
        } catch (err) {
            alert("Action failed: " + err.message);
        }
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    return (
        <div className="leaves-container">
            <div className="leaves-header">
                <h1>Leave Approvals</h1>
            </div>

            <div className="leaves-table-container">
                <table className="leaves-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Dates</th>
                            <th>Reason</th>
                            <th>Parent Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No pending leave requests.
                                </td>
                            </tr>
                        ) : requests.map(req => (
                            <tr key={req.id}>
                                <td style={{ fontWeight: 500 }}>{req.student.fullName}</td>
                                <td>{req.fromDate} to {req.toDate}</td>
                                <td>{req.reason}</td>
                                <td>
                                    <span className="status-badge status-approved">
                                        Verified <CheckCircle size={12} style={{ verticalAlign: 'middle' }} />
                                    </span>
                                </td>
                                <td>
                                    {req.mentorStatus === 'PENDING' ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                style={{ background: '#10b981', border: 'none' }}
                                                onClick={() => handleAction(req.id, 'APPROVED')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                                onClick={() => handleAction(req.id, 'REJECTED')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`status-badge ${req.mentorStatus === 'APPROVED' ? 'status-approved' : 'status-rejected'
                                            }`}>
                                            {req.mentorStatus}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MentorLeaves;
