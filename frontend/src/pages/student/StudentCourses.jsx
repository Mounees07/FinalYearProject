import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Clock } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './StudentCourses.css';

const StudentCourses = () => {
    const { currentUser } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const response = await api.get(`/courses/enrollments/student/${currentUser.uid}`);
                setEnrollments(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchEnrollments();
        }
    }, [currentUser]);

    if (loading) return <div className="p-8 text-center">Loading courses...</div>;

    return (
        <div className="student-courses-container">
            <header className="page-header">
                <h1>My Courses</h1>
                <p>Manage your academic courses and track progress.</p>
            </header>

            <div className="courses-grid">
                {enrollments.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} className="text-gray-400 mb-4" />
                        <h3>No Courses Enrolled</h3>
                        <p>You are not currently enrolled in any courses.</p>
                    </div>
                ) : (
                    enrollments.map(enrollment => (
                        <div key={enrollment.id} className="course-card glass-card">
                            <div className="course-header">
                                <div className="course-code">{enrollment.section.course.code}</div>
                                <h2>{enrollment.section.course.name}</h2>
                            </div>

                            <div className="course-details">
                                <div className="detail-item">
                                    <User size={16} />
                                    <span>{enrollment.section.faculty.fullName}</span>
                                </div>
                                <div className="detail-item">
                                    <Calendar size={16} />
                                    <span>{enrollment.section.semester} {enrollment.section.year}</span>
                                </div>
                            </div>

                            <div className="course-description">
                                {enrollment.section.course.description}
                            </div>

                            <div className="course-footer">
                                <span className="credits-badge">{enrollment.section.course.credits} Credits</span>
                                <button className="btn btn-sm btn-primary">View Content</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentCourses;
