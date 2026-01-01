import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Plus, Search, Loader, Trash2, Edit } from 'lucide-react';
import './StudentLeaves.css';

const StudentLeaves = () => {
    const { currentUser } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);

    // Edit Mode State
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        leaveType: 'Medical',
        fromDate: '',
        toDate: '',
        reason: '',
        parentEmail: ''
    });

    useEffect(() => {
        fetchLeaves();
    }, [currentUser]);

    const fetchLeaves = async () => {
        try {
            const res = await api.get(`/leaves/student/${currentUser.uid}`);
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyOrUpdate = async (e) => {
        e.preventDefault();
        setApplyLoading(true);
        try {
            if (editingId) {
                // Update Logic
                await api.put(`/leaves/${editingId}?studentUid=${currentUser.uid}`, formData);
                alert("Leave request updated successfully.");
            } else {
                // Create Logic
                await api.post(`/leaves/apply?studentUid=${currentUser.uid}`, formData);
                alert("Leave applied successfully! An email has been sent to your parent for approval.");
            }

            setShowModal(false);
            setEditingId(null);
            setFormData({ leaveType: 'Medical', fromDate: '', toDate: '', reason: '', parentEmail: '' });
            fetchLeaves();
        } catch (err) {
            alert("Operation failed: " + err.message);
        } finally {
            setApplyLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leave request?")) return;
        try {
            await api.delete(`/leaves/${id}?studentUid=${currentUser.uid}`);
            setLeaves(leaves.filter(l => l.id !== id));
        } catch (err) {
            alert("Failed to delete: " + err.message);
        }
    };

    const openEditModal = (leave) => {
        setEditingId(leave.id);
        setFormData({
            leaveType: leave.leaveType,
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            reason: leave.reason,
            parentEmail: leave.parentEmail
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ leaveType: 'Medical', fromDate: '', toDate: '', reason: '', parentEmail: '' });
        setShowModal(true);
    };

    const getStatusClass = (status) => {
        if (status === 'APPROVED') return 'status-approved';
        if (status === 'REJECTED' || status === 'REJECTED_BY_PARENT') return 'status-rejected';
        return 'status-pending';
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    return (
        <div className="leaves-container">
            <div className="leaves-header">
                <h1>My Leaves</h1>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} /> Apply Leave
                </button>
            </div>

            <div className="filter-bar">
                <Search size={20} color="#94a3b8" />
                <input type="text" placeholder="Search by leave type or remarks..." className="search-input" />
            </div>

            <div className="leaves-table-container">
                <table className="leaves-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Dates</th>
                            <th>Reason</th>
                            <th>Parent Status</th>
                            <th>Mentor Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    No leave requests found. Click "Apply Leave" to create one.
                                </td>
                            </tr>
                        ) : leaves.map(leave => (
                            <tr key={leave.id}>
                                <td>{leave.leaveType}</td>
                                <td>{leave.fromDate} to {leave.toDate}</td>
                                <td>{leave.reason}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(leave.parentStatus)}`}>
                                        {leave.parentStatus}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(leave.mentorStatus)}`}>
                                        {leave.mentorStatus}
                                    </span>
                                </td>
                                <td>
                                    {leave.parentStatus === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="icon-btn"
                                                style={{ color: '#6366f1' }}
                                                onClick={() => openEditModal(leave)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="icon-btn"
                                                style={{ color: '#ef4444' }}
                                                onClick={() => handleDelete(leave.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <div className="modal-header">
                            <h2>{editingId ? 'Edit Leave Request' : 'Apply for Leave'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleApplyOrUpdate} className="modal-form">
                            <div className="form-group">
                                <label>Leave Type</label>
                                <select
                                    className="form-input"
                                    value={formData.leaveType}
                                    onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                                >
                                    <option>Medical</option>
                                    <option>Personal</option>
                                    <option>Academic</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>From Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        required
                                        value={formData.fromDate}
                                        onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>To Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        required
                                        value={formData.toDate}
                                        onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Parent Email (for Approval)</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="parent@example.com"
                                    required
                                    value={formData.parentEmail}
                                    onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    required
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-submit" disabled={applyLoading}>
                                {applyLoading ? 'Processing...' : (editingId ? 'Update Request' : 'Submit Request')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLeaves;
