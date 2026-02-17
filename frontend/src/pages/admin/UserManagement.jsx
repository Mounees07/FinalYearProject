import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit, Save, X, User, Upload, Download, FileText } from 'lucide-react';
import api from '../../utils/api';
import '../DashboardOverview.css';
import './Admin.css';
import Pagination from '../../components/Pagination';

const UserManagement = () => {
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

    const getRoleBadgeClass = (role) => {
        const base = 'admin-badge';
        return `${base} ${role ? role.toLowerCase() : 'student'}`;
    };

    if (loading) {
        return (
            <div className="dashboard-layout-new">
                <div className="dashboard-main-col" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout-new">
            <div className="dashboard-main-col">
                <div className="dash-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>User Management</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px' }}>
                                <Search size={18} color="var(--text-secondary)" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', marginLeft: '10px', outline: 'none' }}
                                />
                            </div>
                            <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)} style={{ marginRight: '10px' }}>
                                <Upload size={18} style={{ marginRight: '5px' }} /> Bulk Upload
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                + Create User
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>User</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map(user => (
                                        <tr key={user.id || user.firebaseUid} className="admin-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div className="user-avatar-small">
                                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={14} />}
                                                    </div>
                                                    {editUser && editUser.id === user.id ? (
                                                        <input
                                                            value={editUser.fullName}
                                                            onChange={e => setEditUser({ ...editUser, fullName: e.target.value })}
                                                            className="form-input"
                                                            style={{ padding: '6px 10px' }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontWeight: 500 }}>{user.fullName}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {editUser && editUser.id === user.id ? (
                                                    <select
                                                        value={editUser.role}
                                                        onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                                                        className="form-input"
                                                        style={{ padding: '6px 10px' }}
                                                    >
                                                        {['STUDENT', 'TEACHER', 'MENTOR', 'HOD', 'ADMIN', 'COE', 'PRINCIPAL', 'GATE_SECURITY'].map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={getRoleBadgeClass(user.role)}>
                                                        {user.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', opacity: 0.8 }}>{user.email}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                {editUser && editUser.id === user.id ? (
                                                    <>
                                                        <button onClick={handleEditSave} className="icon-btn admin-action-btn" style={{ color: '#10b981', marginRight: '8px' }}><Save size={18} /></button>
                                                        <button onClick={() => setEditUser(null)} className="icon-btn admin-action-btn" style={{ color: '#ef4444' }}><X size={18} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditStart(user)} className="icon-btn admin-action-btn" style={{ color: '#6366f1', marginRight: '8px' }}><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete(user.firebaseUid)} className="icon-btn admin-action-btn" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

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

export default UserManagement;
