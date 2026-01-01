import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Mail,
    Phone,
    ExternalLink,
    MoreVertical,
    UserPlus,
    Loader,
    Upload,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import '../../pages/DashboardOverview.css';
import './Mentees.css';

const Mentees = () => {
    const { currentUser } = useAuth();
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [allStudents, setAllStudents] = useState([]);
    const [adding, setAdding] = useState(false);

    // Meeting Modal State
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [meetingForm, setMeetingForm] = useState({
        title: "",
        description: "",
        location: "",
        startTime: "",
    });
    const [scheduling, setScheduling] = useState(false);

    useEffect(() => {
        fetchMentees();
    }, [currentUser]);

    const fetchMentees = async () => {
        if (!currentUser) return;
        try {
            const res = await api.get(`/users/mentees/${currentUser.uid}`);
            setMentees(res.data);
        } catch (err) {
            console.error("Error fetching mentees", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            const res = await api.get('/users/role/STUDENT');
            // Filter out students who already have this mentor or just show all for assignment
            setAllStudents(res.data.filter(s => s.mentor?.firebaseUid !== currentUser.uid));
        } catch (err) {
            console.error("Error fetching students", err);
        }
    };

    const handleAddMentee = async (studentUid) => {
        setAdding(true);
        try {
            await api.post('/users/assign-mentor', {
                studentUid: studentUid,
                mentorUid: currentUser.uid
            });
            setShowAddModal(false);
            fetchMentees();
        } catch (err) {
            alert("Failed to assign mentee: " + err.message);
        } finally {
            setAdding(false);
        }
    };


    const handleScheduleMeeting = async (e) => {
        e.preventDefault();
        if (!selectedMentee && !window.confirm("Schedule this meeting for ALL your mentees?")) return;

        setScheduling(true);
        try {
            if (selectedMentee) {
                // Individual Meeting
                await api.post(`/meetings/schedule`, meetingForm, {
                    params: {
                        mentorUid: currentUser.uid,
                        menteeUid: selectedMentee.firebaseUid
                    }
                });
            } else {
                // Bulk Meeting (No specific mentee selected)
                await api.post(`/meetings/schedule-bulk`, meetingForm, {
                    params: { mentorUid: currentUser.uid }
                });
            }
            alert("Meeting scheduled! Mentee has been notified via email.");
            setShowMeetingModal(false);
            setMeetingForm({ title: "", description: "", location: "", startTime: "" });
        } catch (err) {
            alert("Failed to schedule meeting: " + err.message);
        } finally {
            setScheduling(false);
        }
    };

    const getStatusColor = (gpa) => {
        if (gpa >= 3.8) return '#10b981'; // Excellent
        if (gpa >= 3.0) return '#6366f1'; // Good
        if (gpa >= 2.0) return '#f59e0b'; // Needs Support
        return '#ef4444'; // At Risk
    };

    const getStatusText = (gpa) => {
        if (gpa >= 3.8) return 'Excellent';
        if (gpa >= 3.0) return 'Good';
        if (gpa >= 2.0) return 'Needs Support';
        return 'At Risk';
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    return (
        <div className="mentees-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>My Mentees</h1>
                    <p>Monitor individual student performance and provide direct guidance.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => { setSelectedMentee(null); setShowMeetingModal(true); }}>
                        <Calendar size={18} />
                        Schedule Group Meeting
                    </button>
                    <button className="btn btn-primary" onClick={() => { fetchAvailableStudents(); setShowAddModal(true); }}>
                        <UserPlus size={18} />
                        Add Mentee
                    </button>
                </div>
            </header>

            <div className="mentee-controls glass-card">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search mentees by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            <div className="mentees-grid">
                {mentees.filter(m => (m.fullName || "Unknown Student").toLowerCase().includes(searchTerm.toLowerCase())).map(mentee => (
                    <div key={mentee.id} className="mentee-card glass-card animate-fade-in">
                        <div className="mentee-card-header">
                            <div className="mentee-avatar">
                                {mentee.profilePictureUrl ? <img src={mentee.profilePictureUrl} alt="" /> : (mentee.fullName || "?").charAt(0)}
                            </div>
                            <div className="mentee-main-info">
                                <h3>{mentee.fullName}</h3>
                                <span className="mentee-status" style={{
                                    color: getStatusColor(mentee.gpa || 3.0),
                                    backgroundColor: `${getStatusColor(mentee.gpa || 3.0)}15`
                                }}>
                                    {getStatusText(mentee.gpa || 3.0)}
                                </span>
                            </div>
                            <button className="icon-btn"><MoreVertical size={18} /></button>
                        </div>

                        <div className="mentee-academic-info">
                            <span className="academic-item"><strong>Roll:</strong> {mentee.rollNumber || 'N/A'}</span>
                            <span className="academic-item"><strong>Dept:</strong> {mentee.department || 'N/A'}</span>
                            <span className="academic-item"><strong>Batch:</strong> Sem {mentee.semester || '?'}-{mentee.section || '?'}</span>
                        </div>

                        <div className="mentee-metrics">
                            <div className="metric">
                                <span className="metric-label">Current GPA</span>
                                <span className="metric-value">{mentee.gpa || "0.0"}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Attendance</span>
                                <span className="metric-value">{mentee.attendance || "0"}%</span>
                            </div>
                        </div>

                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${mentee.attendance || 0}%`, backgroundColor: getStatusColor(mentee.gpa || 3.0) }}
                            ></div>
                        </div>

                        <div className="mentee-contact">
                            <a href={`mailto:${mentee.email}`} className="contact-link"><Mail size={16} /></a>
                            <a href={`tel:${mentee.phone || '#'}`} className="contact-link"><Phone size={16} /></a>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => { setSelectedMentee(mentee); setShowMeetingModal(true); }}
                            >
                                <Calendar size={14} /> Schedule
                            </button>
                            <button className="btn btn-text">
                                Details <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {mentees.length === 0 && <p className="empty-state">No mentees assigned yet.</p>}
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <div className="modal-header">
                            <h2>Assign New Mentee</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
                        </div>
                        <div className="student-list">
                            {allStudents.length === 0 ? <p>No students available to assign.</p> :
                                allStudents.map(student => (
                                    <div key={student.id} className="student-item">
                                        <div className="student-info">
                                            <span className="name">{student.fullName}</span>
                                            <span className="email">{student.email}</span>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleAddMentee(student.firebaseUid)}
                                            disabled={adding}
                                        >
                                            {adding ? 'Assigning...' : 'Assign'}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
            {showMeetingModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <div className="modal-header">
                            <h2>{selectedMentee ? `Schedule Meeting with ${selectedMentee.fullName}` : "Schedule Group Meeting"}</h2>
                            <button className="close-btn" onClick={() => setShowMeetingModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleScheduleMeeting} className="meeting-form">
                            <div className="form-group">
                                <label>Meeting Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Academic Review"
                                    required
                                    value={meetingForm.title}
                                    onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group text-white">
                                <label>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={meetingForm.startTime}
                                    onChange={e => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Location / Link</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cabin 204 or Meet URL"
                                    required
                                    value={meetingForm.location}
                                    onChange={e => setMeetingForm({ ...meetingForm, location: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    placeholder="Brief agenda..."
                                    value={meetingForm.description}
                                    onChange={e => setMeetingForm({ ...meetingForm, description: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full" disabled={scheduling}>
                                {scheduling ? 'Sending Invite...' : 'Schedule & Send Email'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mentees;
