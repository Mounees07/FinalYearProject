import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Mail,
    ExternalLink,
    Briefcase,
    Shield,
    X
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './HODFaculty.css';

const HODFaculty = () => {
    const { userData } = useAuth();
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // New Faculty Form State
    const [newFaculty, setNewFaculty] = useState({
        fullName: '',
        email: '',
        role: 'TEACHER',
        password: '',
        department: '',
        rollNumber: '' // Used as Employee ID for faculty
    });

    useEffect(() => {
        if (userData?.department) {
            setNewFaculty(prev => ({ ...prev, department: userData.department }));
            fetchFaculty();
        }
    }, [userData]);

    const fetchFaculty = async () => {
        try {
            // Using the endpoint we found in UserController
            const res = await api.get(`/users/faculty/department?department=${userData.department}`);
            setFaculty(res.data);
        } catch (error) {
            console.error("Failed to fetch faculty", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFaculty = async (e) => {
        e.preventDefault();
        try {
            // Using create-user endpoint to register new faculty
            await api.post('/users/create-user', newFaculty);
            await fetchFaculty();
            setShowAddModal(false);
            setNewFaculty({
                fullName: '',
                email: '',
                role: 'TEACHER',
                password: '',
                department: userData.department,
                rollNumber: ''
            });
            alert('Faculty member added successfully!');
        } catch (error) {
            console.error("Failed to add faculty", error);
            alert("Error adding faculty: " + (error.response?.data?.message || error.message));
        }
    };

    const filteredFaculty = faculty.filter(f =>
        f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="hod-faculty-container">
            <header className="faculty-header">
                <div className="header-content">
                    <h1>Faculty Directory</h1>
                    <p>Manage academic staff within the {userData?.department} department</p>
                </div>
                <div className="action-bar">
                    <div className="search-bar-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="add-faculty-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} /> Add Faculty
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin text-indigo-500"><Users size={48} /></div>
                </div>
            ) : (
                <div className="faculty-grid">
                    {filteredFaculty.length > 0 ? (
                        filteredFaculty.map(member => (
                            <div key={member.id} className="faculty-card">
                                <div className="faculty-avatar">
                                    {member.profilePictureUrl ? (
                                        <img src={member.profilePictureUrl} alt={member.fullName} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        member.fullName?.charAt(0)
                                    )}
                                </div>
                                <h3 className="faculty-name">{member.fullName}</h3>
                                <span className="faculty-role">{member.role}</span>

                                <div className="faculty-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Employee ID</span>
                                        <span>{member.rollNumber || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Status</span>
                                        <span className="text-green-500 font-bold">Active</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Joined</span>
                                        <span>{new Date().getFullYear()}</span>
                                    </div>
                                </div>

                                <div className="faculty-actions">
                                    <button className="card-btn btn-view">
                                        <ExternalLink size={16} className="mx-auto" />
                                    </button>
                                    <a href={`mailto:${member.email}`} className="card-btn btn-email block text-center pt-2">
                                        Email
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Users size={64} style={{ opacity: 0.5 }} />
                            <h3>No Faculty Found</h3>
                            <p>Try adjusting your search or add a new faculty member.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Faculty Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                            <Briefcase className="text-indigo-500" />
                            Onboard New Faculty
                        </h2>

                        <form onSubmit={handleAddFaculty}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        required
                                        className="form-input"
                                        value={newFaculty.fullName}
                                        onChange={e => setNewFaculty({ ...newFaculty, fullName: e.target.value })}
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-input"
                                        value={newFaculty.role}
                                        onChange={e => setNewFaculty({ ...newFaculty, role: e.target.value })}
                                    >
                                        <option value="TEACHER">TEACHER</option>
                                        <option value="MENTOR">MENTOR</option>
                                        <option value="HOD">HOD</option>
                                        <option value="COE">COE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="form-input"
                                    value={newFaculty.email}
                                    onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })}
                                    placeholder="faculty@college.edu"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Employee ID</label>
                                <input
                                    required
                                    className="form-input"
                                    value={newFaculty.rollNumber}
                                    onChange={e => setNewFaculty({ ...newFaculty, rollNumber: e.target.value })}
                                    placeholder="EMP-001"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Default Password</label>
                                <input
                                    required
                                    type="password"
                                    className="form-input"
                                    value={newFaculty.password}
                                    onChange={e => setNewFaculty({ ...newFaculty, password: e.target.value })}
                                    placeholder="Create a secure password"
                                />
                            </div>

                            <button type="submit" className="submit-btn">
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HODFaculty;
