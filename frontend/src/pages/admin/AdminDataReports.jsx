import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Search, Filter, X, ChevronRight, Mail, Phone, Calendar, Edit, Save } from 'lucide-react';
import api from '../../utils/api';
import '../DashboardOverview.css';
import './Admin.css';

const AdminDataReports = () => {
    const [activeTab, setActiveTab] = useState('faculty'); // 'faculty' or 'students'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        fetchData();
        setSearchTerm('');
        setSelectedUser(null);
        setIsEditing(false);
    }, [activeTab]);

    useEffect(() => {
        if (selectedUser) {
            setEditFormData({
                fullName: selectedUser.fullName || '',
                role: selectedUser.role || '',
                department: selectedUser.department || '',
                rollNumber: selectedUser.rollNumber || ''
            });
            setIsEditing(false);
        }
    }, [selectedUser]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        setUpdateLoading(true);
        try {
            const res = await api.put(`/users/${selectedUser.firebaseUid}`, editFormData);
            // Update local state
            const updatedUser = { ...selectedUser, ...res.data };
            setSelectedUser(updatedUser);

            // Update the list data
            setData(prevData => prevData.map(u =>
                (u.firebaseUid === updatedUser.firebaseUid) ? updatedUser : u
            ));

            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update user", err);
            alert("Failed to update user details");
        } finally {
            setUpdateLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'faculty') {
                const roles = ['TEACHER', 'HOD', 'MENTOR'];
                const promises = roles.map(role => api.get(`/users/role/${role}`).catch(() => ({ data: [] })));
                const results = await Promise.all(promises);
                const combined = results.flatMap(r => r.data);
                // Unique
                const unique = Array.from(new Map(combined.map(u => [u.id || u.firebaseUid || u.email, u])).values());
                setData(unique);
            } else {
                const res = await api.get('/users/role/STUDENT');
                setData(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setDetailsLoading(true);
        setUserDetails(null);
        try {
            if (activeTab === 'faculty') {
                // Fetch assigned sections
                // Assuming endpoint: /courses/sections/faculty/{uid}
                const res = await api.get(`/courses/sections/faculty/${user.firebaseUid}`);
                setUserDetails({ sections: res.data || [] });
            } else {
                // Fetch enrolled courses
                // Assuming endpoint: /courses/enrollments/student/{uid}
                const res = await api.get(`/courses/enrollments/student/${user.firebaseUid}`);
                setUserDetails({ enrollments: res.data || [] });
            }
        } catch (err) {
            console.error("Failed to fetch user details", err);
            setUserDetails({ error: "Could not fetch details." });
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredData = data.filter(u =>
        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-layout-new">
            <div className="dashboard-main-col">
                <div className="dash-card">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Institutional Data Repository</h2>
                            <p className="text-gray-400 text-sm">Comprehensive records of all academic personnel and students.</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="admin-tabs-container">
                        <button
                            className={`admin-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
                            onClick={() => setActiveTab('faculty')}
                        >
                            <Users size={18} />
                            <span>Faculty Directory</span>
                        </button>
                        <button
                            className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveTab('students')}
                        >
                            <GraduationCap size={18} />
                            <span>Student Registry</span>
                        </button>
                    </div>

                    {/* Search Toolbar */}
                    <div className="admin-toolbar">
                        <div className="admin-search-box">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder={activeTab === 'faculty' ? 'Search faculty by name, dept...' : 'Search students by name, roll no...'}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-secondary flex-center gap-2">
                            <Filter size={18} />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Data Table */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name & Contact</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        {activeTab === 'students' && <th>Roll No</th>}
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(user => (
                                        <tr
                                            key={user.id || user.firebaseUid}
                                            className="admin-table-row"
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-initials">
                                                        {user.fullName ? user.fullName.charAt(0) : '?'}
                                                    </div>
                                                    <div className="user-info">
                                                        <div className="user-name">{user.fullName}</div>
                                                        <div className="user-email">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`admin-badge ${user.role ? user.role.toLowerCase() : 'student'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="text-secondary">
                                                {user.department || 'N/A'}
                                            </td>
                                            {activeTab === 'students' && (
                                                <td className="font-mono text-secondary">
                                                    {user.rollNumber || '-'}
                                                </td>
                                            )}
                                            <td className="text-right">
                                                <button className="view-details-btn">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan={activeTab === 'students' ? 5 : 4} className="empty-state">
                                                No records found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Side Panel / Modal */}
            {selectedUser && (
                <div className="admin-side-panel-overlay animate-fade-in" onClick={() => setSelectedUser(null)}>
                    <div className="admin-side-panel glass-card-solid" onClick={e => e.stopPropagation()}>
                        <div className="panel-header">
                            <div className="flex-1 mr-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={editFormData.fullName}
                                        onChange={handleEditChange}
                                        className="edit-input-title"
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <h2 className="panel-title">{selectedUser.fullName}</h2>
                                )}
                                <p className="panel-subtitle">{selectedUser.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-indigo-400"
                                        title="Edit Profile"
                                    >
                                        <Edit size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSaveChanges}
                                        disabled={updateLoading}
                                        className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-full transition-colors text-white"
                                        title="Save Changes"
                                    >
                                        {updateLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="close-panel-btn"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="panel-content custom-scrollbar">
                            {/* User Profile Summary */}
                            <div className="glass-panel-section">
                                <h3 className="section-label">Profile Details</h3>
                                <div className="info-grid">
                                    <div className="info-row">
                                        <span className="label">Role</span>
                                        {isEditing ? (
                                            <select
                                                name="role"
                                                value={editFormData.role}
                                                onChange={handleEditChange}
                                                className="edit-input-select"
                                            >
                                                {['STUDENT', 'TEACHER', 'MENTOR', 'HOD', 'PRINCIPAL', 'COE', 'ADMIN'].map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`admin-badge ${selectedUser.role ? selectedUser.role.toLowerCase() : 'student'}`}>
                                                {selectedUser.role}
                                            </span>
                                        )}
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Department</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="department"
                                                value={editFormData.department}
                                                onChange={handleEditChange}
                                                className="edit-input-text"
                                                placeholder="Department"
                                            />
                                        ) : (
                                            <span className="value">{selectedUser.department || 'N/A'}</span>
                                        )}
                                    </div>
                                    {(selectedUser.role === 'STUDENT' || editFormData.role === 'STUDENT') && (
                                        <div className="info-row">
                                            <span className="label">Roll/Reg No</span>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="rollNumber"
                                                    value={editFormData.rollNumber}
                                                    onChange={handleEditChange}
                                                    className="edit-input-text font-mono"
                                                    placeholder="Roll Number"
                                                />
                                            ) : (
                                                <span className="value font-mono">{selectedUser.rollNumber || '-'}</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="info-row">
                                        <span className="label">Join Date</span>
                                        <span className="value">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Data Section */}
                            <div className="mt-8">
                                <h3 className="section-title flex items-center gap-2">
                                    {activeTab === 'faculty' ? <BookOpen size={20} className="text-primary" /> : <GraduationCap size={20} className="text-primary" />}
                                    {activeTab === 'faculty' ? 'Teaching Portfolio' : 'Academic Record'}
                                </h3>

                                {detailsLoading ? (
                                    <div className="loading-container py-10"><div className="loading-spinner"></div></div>
                                ) : (
                                    <>
                                        {activeTab === 'faculty' && userDetails?.sections && (
                                            <div className="course-list">
                                                {userDetails.sections.length > 0 ? userDetails.sections.map(sec => (
                                                    <div key={sec.id} className="course-card-mini">
                                                        <h4 className="course-title">{sec.course?.name}</h4>
                                                        <div className="course-meta">
                                                            <span className="course-code">{sec.course?.code}</span>
                                                            <span className="student-count">{sec.enrollmentCount || 0} Students</span>
                                                        </div>
                                                        <div className="course-tags">
                                                            <span className="badge-mini purple">Sem {sec.semester}</span>
                                                            <span className="badge-mini blue">{sec.year}</span>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="empty-state-card">
                                                        <BookOpen size={32} className="mx-auto text-muted mb-2" />
                                                        <p className="text-muted">No active courses assigned.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'students' && userDetails?.enrollments && (
                                            <div className="course-list">
                                                {userDetails.enrollments.length > 0 ? userDetails.enrollments.map(enroll => (
                                                    <div key={enroll.id} className="enrollment-card-mini group">
                                                        <div>
                                                            <p className="font-bold">{enroll.section?.course?.name}</p>
                                                            <p className="text-xs text-gray-400 font-mono mt-1">{enroll.section?.course?.code}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="badge-mini green">Enrolled</span>
                                                            <p className="text-[10px] text-gray-500 mt-1">
                                                                {new Date(enroll.enrollmentDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="empty-state-card">
                                                        <GraduationCap size={32} className="mx-auto text-muted mb-2" />
                                                        <p className="text-muted">Not enrolled in any courses.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDataReports;
