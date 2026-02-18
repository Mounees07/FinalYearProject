import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit, Save, X, User, Upload, Download, FileText, Plus, SlidersHorizontal, Filter } from 'lucide-react';
import api from '../../utils/api';
import '../DashboardOverview.css';
import './Admin.css';
import Pagination from '../../components/Pagination';

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Initial state moved here for consistency
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        fullName: '',
        role: 'STUDENT',
        department: '',
        rollNumber: '',
        password: ''
    });

    // Bulk Upload State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkRole, setBulkRole] = useState('STUDENT');
    const [uploading, setUploading] = useState(false);
    const [uploadLogs, setUploadLogs] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const roles = ['STUDENT', 'TEACHER', 'MENTOR', 'HOD', 'ADMIN', 'COE', 'PRINCIPAL', 'GATE_SECURITY'];
            const promises = roles.map(role => api.get(`/users/role/${role}`).catch(() => ({ data: [] })));
            const results = await Promise.all(promises);
            const allUsers = results.flatMap(r => r.data).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            // Unique by ID or Firebase UID
            const uniqueUsers = Array.from(new Map(allUsers.map(u => [u.id || u.firebaseUid, u])).values());
            setUsers(uniqueUsers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uid) => {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await api.delete(`/users/${uid}`);
            setUsers(users.filter(u => u.firebaseUid !== uid));
        } catch (err) {
            alert('Failed to delete user: ' + err.message);
        }
    };

    const handleEditStart = (user) => {
        setEditUser({ ...user });
    };

    const handleEditSave = async () => {
        try {
            await api.put(`/users/${editUser.firebaseUid}`, editUser);
            setUsers(users.map(u => u.firebaseUid === editUser.firebaseUid ? editUser : u));
            setEditUser(null);
            alert('User updated successfully');
        } catch (err) {
            alert('Failed to update: ' + err.message);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/create-user', newUser);
            alert('User created successfully. They can now login with this email.');
            setShowCreateModal(false);
            setNewUser({ email: '', fullName: '', role: 'STUDENT', department: '', rollNumber: '', password: '' });
            fetchUsers();
        } catch (err) {
            alert('Failed to create user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkFile) {
            alert("Please select a CSV file first.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', bulkFile);
        formData.append('role', bulkRole);

        try {
            const res = await api.post('/users/bulk-register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadLogs(res.data || ["Upload successful!"]);
            setBulkFile(null);
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error("Bulk upload failed", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            setUploadLogs(["Error: " + errorMsg]);
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "Full Name,Email,Password,Roll Number (Optional),Department (Optional),Semester (Optional),Section (Optional)";
        const sample = "John Doe,student@example.com,securePassword123,20IT001,IT,4,A";
        const content = headers + "\n" + sample;
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "user_bulk_upload_template.csv";
        a.click();
    };

    const filteredUsers = users.filter(u =>
        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );



    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="student-list-container">
            {/* Header Section */}
            <div className="student-list-header">
                <h2 className="page-title">User Management</h2>
                <div className="header-actions">
                    <div className="search-bar-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    {/* Action Buttons */}
                    <button className="action-btn-yellow">
                        <SlidersHorizontal size={24} />
                    </button>
                    <button className="action-btn-yellow" onClick={() => setShowBulkModal(true)} title="Bulk Upload">
                        <Upload size={24} />
                    </button>
                    <button
                        className="action-btn-yellow large"
                        onClick={() => setShowCreateModal(true)}
                        title="Add User"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="student-table-card">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input type="checkbox" className="custom-checkbox" />
                            </th>
                            <th>User Name</th>
                            <th>Role</th>
                            <th>Email Address</th>
                            <th>Department</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map((user) => (
                                    <tr key={user.id || user.firebaseUid} className="student-row">
                                        <td className="checkbox-cell">
                                            <input type="checkbox" className="custom-checkbox" />
                                        </td>
                                        <td>
                                            <div className="student-name-cell">
                                                <div className="avatar-circle" style={{ backgroundColor: '#E6E6F2' }}>
                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={16} />}
                                                </div>
                                                <div className="name-info">
                                                    {editUser && editUser.id === user.id ? (
                                                        <input
                                                            value={editUser.fullName}
                                                            onChange={e => setEditUser({ ...editUser, fullName: e.target.value })}
                                                            className="form-input-sm"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="student-name">{user.fullName || 'Unknown User'}</span>
                                                    )}
                                                    <span className="student-email" style={{ fontSize: '0.8rem', color: '#A098AE' }}>{user.id || user.firebaseUid?.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {editUser && editUser.id === user.id ? (
                                                <select
                                                    value={editUser.role}
                                                    onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                                                    className="form-select-sm"
                                                >
                                                    {['STUDENT', 'TEACHER', 'MENTOR', 'HOD', 'ADMIN', 'COE', 'PRINCIPAL', 'GATE_SECURITY'].map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`role-badge ${user.role?.toLowerCase()}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="email-cell font-medium-blue">
                                                {user.email}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="dept-cell font-bold-blue">
                                                {user.department || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons-cell">
                                                {editUser && editUser.id === user.id ? (
                                                    <>
                                                        <button onClick={handleEditSave} className="icon-action-btn" style={{ color: '#4CAF50' }} title="Save">
                                                            <Save size={20} />
                                                        </button>
                                                        <button onClick={() => setEditUser(null)} className="icon-action-btn" style={{ color: '#FB7D5B' }} title="Cancel">
                                                            <X size={20} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="icon-action-btn"
                                                            onClick={() => handleEditStart(user)}
                                                            title="Edit"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            className="icon-action-btn delete"
                                                            onClick={() => handleDelete(user.firebaseUid)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="loading-cell">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer Section with Pagination */}
                <div className="table-footer">
                    <span className="showing-text">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)}-
                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} data
                    </span>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2>Create New User</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreate} className="modal-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    className="form-input"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    {['STUDENT', 'TEACHER', 'MENTOR', 'HOD', 'ADMIN', 'COE', 'PRINCIPAL', 'GATE_SECURITY'].map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {newUser.role === 'STUDENT' && (
                                <>
                                    <div className="form-group">
                                        <label>Roll Number (Reg No)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={newUser.rollNumber}
                                            onChange={e => setNewUser({ ...newUser, rollNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={newUser.department}
                                            onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {['TEACHER', 'MENTOR', 'HOD'].includes(newUser.role) && (
                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newUser.department}
                                        onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Password (Temporary)</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    minLength={6}
                                    placeholder="Min 6 characters"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full">Create User & Enable Login</button>
                        </form>
                    </div>
                </div>
            )}

            {showBulkModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2>Bulk User Upload</h2>
                            <button className="close-btn" onClick={() => setShowBulkModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="bulk-instructions" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} /> CSV Format Guide
                                </h4>
                                <p style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                                    Your CSV file must include the following headers in order: <br />
                                    <code>Full Name, Email, Password, Roll Number, Department, Semester, Section</code>
                                </p>
                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="text-btn"
                                    style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <Download size={14} /> Download Sample Template
                                </button>
                            </div>

                            <form onSubmit={handleBulkUpload}>
                                <div className="form-group">
                                    <label>Select Role for Batch</label>
                                    <select
                                        className="form-input"
                                        value={bulkRole}
                                        onChange={e => setBulkRole(e.target.value)}
                                    >
                                        {['STUDENT', 'TEACHER', 'MENTOR', 'HOD', 'ADMIN', 'COE', 'PRINCIPAL', 'GATE_SECURITY'].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Upload CSV File</label>
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept=".csv"
                                        onChange={e => setBulkFile(e.target.files[0])}
                                        required
                                        style={{ padding: '10px' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={uploading || !bulkFile}
                                    style={{ marginTop: '10px' }}
                                >
                                    {uploading ? 'Uploading & Processing...' : 'Upload & Register Users'}
                                </button>
                            </form>

                            {uploadLogs.length > 0 && (
                                <div className="upload-logs" style={{ marginTop: '20px', maxHeight: '200px', overflowY: 'auto', background: '#000', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                    <h5 style={{ color: '#fff', marginBottom: '5px' }}>Processing Logs:</h5>
                                    {uploadLogs.map((log, idx) => (
                                        <div key={idx} style={{ color: log.toLowerCase().includes('error') ? '#ff6b6b' : '#51cf66', marginBottom: '2px' }}>
                                            {log}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserList;
