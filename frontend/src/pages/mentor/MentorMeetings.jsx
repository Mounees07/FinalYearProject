import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Loader, Trash2, Calendar, Clock, MapPin, User, Video, Edit } from 'lucide-react';
import './MentorMeetings.css'; // We will create this or inline styles

const MentorMeetings = () => {
    const { currentUser } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        startTime: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        fetchMeetings();
    }, [currentUser]);

    const fetchMeetings = async () => {
        try {
            const res = await api.get(`/meetings/mentor/${currentUser.uid}`);
            // Sort by upcoming
            const sorted = res.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            setMeetings(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id, title) => {
        if (!window.confirm(`Are you sure you want to cancel the meeting "${title}"? The mentee will be notified.`)) return;
        try {
            await api.delete(`/meetings/${id}`);
            setMeetings(meetings.filter(m => m.id !== id));
            alert("Meeting cancelled successfully.");
        } catch (err) {
            alert("Failed to cancel: " + err.message);
        }
    };

    const handleEdit = (meeting) => {
        setEditData(meeting);
        setFormData({
            title: meeting.title,
            startTime: meeting.startTime,
            location: meeting.location,
            description: meeting.description || ''
        });
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/meetings/${editData.id}`, formData);
            alert("Meeting updated successfully!");
            setShowModal(false);
            setEditData(null);
            fetchMeetings();
        } catch (err) {
            alert("Failed to update: " + err.message);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        });
    };

    if (loading) return <div className="loading-screen"><Loader className="animate-spin" /></div>;

    return (
        <div className="meetings-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Mentorship Schedule</h1>
                    <p>Manage your upcoming sessions and group meetings.</p>
                </div>
            </header>

            <div className="meetings-grid">
                {meetings.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={48} style={{ opacity: 0.2, margin: '20px auto' }} />
                        <p>No upcoming meetings found.</p>
                    </div>
                ) : meetings.map(meeting => (
                    <div key={meeting.id} className="meeting-card glass-card">
                        <div className="meeting-date">
                            <span className="month">{new Date(meeting.startTime).toLocaleString('default', { month: 'short' })}</span>
                            <span className="day">{new Date(meeting.startTime).getDate()}</span>
                        </div>

                        <div className="meeting-details">
                            <h3>{meeting.title}</h3>
                            <div className="meeting-meta">
                                <span className="meta-item">
                                    <Clock size={14} /> {formatDate(meeting.startTime)}
                                </span>
                                <span className="meta-item">
                                    {meeting.location.includes('http') ? <Video size={14} /> : <MapPin size={14} />}
                                    {meeting.location}
                                </span>
                                <span className="meta-item highlight">
                                    <User size={14} /> {meeting.mentee.fullName}
                                </span>
                            </div>
                            {meeting.description && <p className="meeting-desc">{meeting.description}</p>}
                        </div>

                        <div className="meeting-actions" style={{ flexDirection: 'column', gap: '8px' }}>
                            <button
                                className="icon-btn"
                                onClick={() => handleEdit(meeting)}
                                title="Edit Meeting"
                                style={{ color: '#6366f1' }}
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                className="icon-btn danger"
                                onClick={() => handleCancel(meeting.id, meeting.title)}
                                title="Cancel and Notify Student"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <div className="modal-header">
                            <h2>Edit Meeting</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdate} className="modal-form">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Location / Link</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-submit">Update Meeting</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorMeetings;
