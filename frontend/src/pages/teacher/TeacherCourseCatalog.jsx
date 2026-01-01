import React, { useState, useEffect } from 'react';
import { BookOpen, Users } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './TeacherCourseCatalog.css';

const TeacherCourseCatalog = () => {
    const { currentUser } = useAuth();
    const [mySections, setMySections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch ONLY my taught sections (assigned by HOD)
            const sectionRes = await api.get(`/courses/sections/faculty/${currentUser.uid}`);
            setMySections(sectionRes.data);
        } catch (error) {
            console.error("Error fetching course data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading academic data...</div>;

    return (
        <div className="teacher-catalog-container">
            {/* Header */}
            <header className="catalog-header">
                <div className="header-title">
                    <h1>My Classes</h1>
                    <p>View and manage the course sections assigned to you by the Department Head.</p>
                </div>
            </header>

            {/* My Classes View */}
            <div className="sections-container">
                {mySections.length === 0 ? (
                    <div className="empty-state p-12 text-center bg-white/5 rounded-xl border border-white/10">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-500" />
                        <h3 className="text-xl font-semibold mb-2">No Courses Assigned</h3>
                        <p className="text-gray-400 mb-6">You have not been assigned any courses for this semester yet.</p>
                        <p className="text-sm text-gray-500">Please contact your HOD regarding course allocation.</p>
                    </div>
                ) : (
                    <div className="sections-grid">
                        {mySections.map(section => (
                            <div key={section.id} className="section-card">
                                <div className="section-header">
                                    <div className="flex-1">
                                        <span className="course-code">{section.course.code}</span>
                                        <h3 className="course-name">{section.course.name}</h3>
                                    </div>
                                    <span className="semester-badge">{section.semester} {section.year}</span>
                                </div>

                                <p className="section-desc">{section.course.description}</p>

                                <div className="text-sm text-gray-300 mb-3 flex items-center gap-2">
                                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5 text-xs text-gray-400 mr-2">Instructor</span>
                                    <span className="font-medium text-primary-light">{section.faculty?.fullName}</span>
                                </div>

                                <div className="section-footer">
                                    <div className="student-count">
                                        <Users size={16} />
                                        <span>Active Students</span>
                                    </div>
                                    <button className="manage-btn">
                                        Manage Class →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherCourseCatalog;
