import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users,
    ArrowLeft,
    Clock,
    Play,
    Edit3,
    Settings,
    Shield,
    Trash2,
    X,
    Save,
    Award,
    Image,
    Type,
    FileText,
    Video
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './TeacherCourseManage.css';

const TeacherCourseManage = () => {
    const { currentUser, userData } = useAuth();
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sectionDetails, setSectionDetails] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    // Form state for New Lesson
    const [newLesson, setNewLesson] = useState({
        title: '',
        contentType: 'VIDEO',
        contentUrl: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Assignment State
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        dueDate: '',
        maxPoints: 100
    });
    const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

    // Edit Lesson State
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [editLessonForm, setEditLessonForm] = useState(null);

    // Edit Course Details State
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editForm, setEditForm] = useState({ description: '', difficultyLevel: '', thumbnailUrl: '' });

    // Feature States
    const [testEnabled, setTestEnabled] = useState(false);

    // Grading State
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
    const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sectionResult, enrollResult] = await Promise.allSettled([
                    api.get(`/courses/sections/${sectionId}`),
                    api.get(`/courses/sections/${sectionId}/enrollments`)
                ]);

                let details = null;

                if (sectionResult.status === 'fulfilled') {
                    details = sectionResult.value.data;
                }

                if (enrollResult.status === 'fulfilled') {
                    const eData = enrollResult.value.data;
                    const filtered = eData.filter(e => e.student && e.student.role === 'STUDENT');
                    setEnrollments(filtered);

                    if (!details && eData.length > 0) {
                        details = eData[0].section;
                    }
                }

                if (details) {
                    setSectionDetails(details);
                    setTestEnabled(details.testsEnabled || false);
                    if (details.course?.id) {
                        fetchLessons(details.course.id);
                    }
                    fetchAssignments(sectionId);
                    fetchResults(sectionId);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (sectionId) fetchData();
    }, [sectionId, navigate]);

    const fetchLessons = async (courseId) => {
        setLoadingLessons(true);
        try {
            const res = await api.get(`/courses/${courseId}/lessons`);
            setLessons(res.data);
        } catch (error) {
            console.error("Failed to fetch lessons", error);
        } finally {
            setLoadingLessons(false);
        }
    };

    const fetchAssignments = async (sId) => {
        try {
            const res = await api.get(`/assignments/section/${sId}`);
            setAssignments(res.data);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        }
    };

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        setIsSubmittingAssignment(true);
        try {
            const res = await api.post(`/assignments/section/${sectionId}`, newAssignment);
            setAssignments([...assignments, res.data]);
            setNewAssignment({ title: '', description: '', dueDate: '', maxPoints: 100 });
            alert("Assignment created successfully");
        } catch (err) {
            alert("Failed to create assignment: " + err.message);
        } finally {
            setIsSubmittingAssignment(false);
        }
    };

    const fetchResults = async (sId) => {
        try {
            const res = await api.get(`/assignments/teacher/section/${sId}/submissions`);
            if (Array.isArray(res.data)) {
                setSubmissions(res.data.sort((a, b) =>
                    new Date(b.submissionDate) - new Date(a.submissionDate)
                ));
            }
        } catch (error) {
            console.error("Failed to fetch results", error);
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        if (!newLesson.title || !newLesson.contentUrl) return;
        if (!sectionDetails?.course?.id) {
            alert("Course details missing");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post(`/courses/${sectionDetails.course.id}/lessons`, {
                ...newLesson,
                orderIndex: lessons.length + 1
            });
            setLessons([...lessons, res.data]);
            setNewLesson({ title: '', contentType: 'VIDEO', contentUrl: '', description: '' });
        } catch (error) {
            console.error("Failed to add lesson", error);
            alert("Failed to add lesson.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await api.delete(`/courses/lessons/${lessonId}`);
            setLessons(lessons.filter(l => l.id !== lessonId));
        } catch (error) {
            console.error("Failed to delete lesson", error);
            alert("Failed to delete lesson.");
        }
    };

    const handleEditLesson = (lesson) => {
        setEditLessonForm(lesson);
        setIsEditingLesson(true);
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/courses/lessons/${editLessonForm.id}`, editLessonForm);
            setLessons(lessons.map(l => l.id === editLessonForm.id ? res.data : l));
            setIsEditingLesson(false);
            setEditLessonForm(null);
        } catch (error) {
            console.error("Failed to update lesson", error);
            alert("Failed to save lesson changes.");
        }
    };

    const handleEditDetails = () => {
        setEditForm({
            description: sectionDetails?.course?.description || '',
            difficultyLevel: sectionDetails?.course?.difficultyLevel || '',
            thumbnailUrl: sectionDetails?.course?.thumbnailUrl || ''
        });
        setIsEditingDetails(true);
    };

    const handleSaveDetails = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/courses/${sectionDetails.course.id}`, editForm);
            setSectionDetails({
                ...sectionDetails,
                course: { ...sectionDetails.course, ...res.data }
            });
            setIsEditingDetails(false);
        } catch (error) {
            console.error("Failed to update course", error);
            alert("Failed to update course details");
        }
    };

    // NAVIGATE TO SEPARATE PAGE
    const handleManageQuestions = () => {
        navigate(`/teacher/courses/${sectionId}/questions`);
    };

    const handleTestToggle = async () => {
        try {
            const res = await api.patch(`/courses/sections/${sectionId}/toggle-tests`);
            setTestEnabled(res.data.testsEnabled);
            alert(`Course Tests are now ${res.data.testsEnabled ? 'ENABLED' : 'DISABLED'} for students.`);
        } catch (error) {
            console.error("Failed to toggle tests", error);
            alert("Failed to update test settings.");
        }
    };

    const handleGradeClick = (submission) => {
        setGradingSubmission(submission);
        setGradeForm({
            grade: submission.grade !== null ? submission.grade : '',
            feedback: submission.feedback || ''
        });
    };

    const handleSubmitGrade = async (e) => {
        e.preventDefault();
        setIsSubmittingGrade(true);
        try {
            const res = await api.post(`/assignments/submissions/${gradingSubmission.id}/grade`, {
                grade: gradeForm.grade,
                feedback: gradeForm.feedback
            });
            // Update local state
            setSubmissions(submissions.map(s => s.id === gradingSubmission.id ? { ...s, ...res.data } : s));
            setGradingSubmission(null);
            alert("Graded successfully!");
        } catch (err) {
            console.error("Failed to grade", err);
            alert("Failed to grade: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmittingGrade(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg-deep)' }}>
            <div className="text-indigo-500 animate-spin"><Settings size={64} style={{ color: 'var(--primary)' }} /></div>
            <div className="font-bold text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Synchronizing Academic Data...</div>
        </div>
    );

    if (!sectionDetails) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center" style={{ background: 'var(--bg-deep)' }}>
            <Shield size={64} className="mb-8" style={{ color: 'var(--danger)', opacity: 0.5 }} />
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Access Synchronized Error</h2>
            <button onClick={() => navigate('/teacher/courses')} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
                Return to Catalog
            </button>
        </div>
    );

    return (
        <div className="teacher-manage-container">
            <button onClick={() => navigate('/teacher/courses')} className="back-btn">
                <ArrowLeft size={18} /> BACK TO CATALOG
            </button>

            <div className="manage-banner">
                <div className="banner-image-container">
                    {sectionDetails?.course?.thumbnailUrl ? (
                        <img src={sectionDetails.course.thumbnailUrl} className="banner-image" alt="Course Banner" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={48} />
                        </div>
                    )}
                </div>
                <div className="banner-content">
                    <span className="academic-badge">Academic Excellence</span>
                    <h1 className="course-title-main">
                        {sectionDetails?.course?.name}
                    </h1>
                    <div className="banner-stats">
                        <div className="stat-item"><Users size={16} style={{ color: 'var(--primary)' }} /><span>Instructor <b className="stat-value">{sectionDetails?.faculty?.fullName}</b></span></div>
                        <div className="stat-item"><Clock size={16} style={{ color: 'var(--primary)' }} /><span>Difficulty: <b className="stat-value">{sectionDetails?.course?.difficultyLevel || 'Standard'}</b></span></div>
                    </div>

                    <div className="banner-actions">
                        <button onClick={handleEditDetails} className="btn-premium btn-primary-purple"><Edit3 size={16} /> Edit Details</button>
                        <button onClick={handleTestToggle} className={`btn-premium ${testEnabled ? 'bg-green-600 border-green-600 text-white' : 'btn-outline-green'}`}>{testEnabled ? 'Tests Active' : 'Enable Tests'}</button>
                        <button onClick={handleManageQuestions} className="btn-premium btn-outline-violet">Manage Questions</button>
                    </div>
                </div>
            </div>

            <div className="manage-grid">
                <div className="content-card">
                    <div className="card-header-flex"><h3 className="card-title">Enrolled Students ({sectionDetails.enrollmentCount || enrollments.length})</h3></div>
                    <div className="overflow-x-auto">
                        <table className="premium-table">
                            <thead><tr><th>Name</th><th>Email</th><th className="text-right">Enrolled Date</th></tr></thead>
                            <tbody>
                                {enrollments.map(e => (
                                    <tr key={e.id}>
                                        <td><div className="student-info-cell"><div className="student-avatar">{e.student.fullName?.charAt(0)}</div><span className="student-name">{e.student.fullName}</span></div></td>
                                        <td className="email-cell">{e.student.email}</td>
                                        <td className="date-cell">{new Date(e.enrollmentDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-header-flex"><h3 className="card-title">Course Content</h3>{loadingLessons && <span className="text-xs animate-pulse" style={{ color: 'var(--primary)' }}>Syncing...</span>}</div>
                    {(userData?.role === 'TEACHER' || userData?.role === 'ADMIN' || userData?.role === 'MENTOR') && (
                        <form onSubmit={handleAddLesson} className="lesson-form">
                            <span className="form-label-mini">New Lesson Title</span><input className="premium-input" placeholder="Instructional Title" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} required />
                            <div className="flex gap-4 mb-4"><div className="flex-1"><span className="form-label-mini">Media Type</span><select className="premium-input" value={newLesson.contentType} onChange={(e) => setNewLesson({ ...newLesson, contentType: e.target.value })}><option value="VIDEO">Video</option><option value="PDF">PDF Document</option><option value="DOC">Document</option></select></div></div>
                            <span className="form-label-mini">Resource URL</span><input className="premium-input" placeholder="Vimeo/Drive/PDF URL" value={newLesson.contentUrl} onChange={(e) => setNewLesson({ ...newLesson, contentUrl: e.target.value })} required />
                            <button type="submit" className="btn-publish" disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Add Lesson'}</button>
                        </form>
                    )}
                    <div className="lesson-list">
                        {lessons.length === 0 ? <p className="text-center py-10 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No lessons published yet</p> : lessons.map((lesson, index) => (
                            <div key={lesson.id} className="lesson-item">
                                <div className="lesson-main"><span className="lesson-number">{index + 1}.</span><div className="lesson-info"><span className="lesson-name">{lesson.title}</span><span className="lesson-meta">{lesson.contentType?.toLowerCase() || 'content'}</span></div></div>
                                <div className="lesson-actions"><Play size={16} className="action-icon icon-play" onClick={() => lesson.contentUrl && window.open(lesson.contentUrl, '_blank')} />{(userData?.role === 'TEACHER' || userData?.role === 'ADMIN' || userData?.role === 'MENTOR') && (<><Edit3 size={16} className="action-icon icon-edit" onClick={() => handleEditLesson(lesson)} /><Trash2 size={16} className="action-icon icon-trash" onClick={() => handleDeleteLesson(lesson.id)} /></>)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ASSIGNMENTS SECTION */}
                <div className="content-card">
                    <div className="card-header-flex"><h3 className="card-title">Assignments</h3></div>
                    {(userData?.role === 'TEACHER' || userData?.role === 'ADMIN' || userData?.role === 'MENTOR') && (
                        <form onSubmit={handleAddAssignment} className="lesson-form">
                            <span className="form-label-mini">Assignment Title</span>
                            <input className="premium-input" placeholder="e.g. Mid-Term Project" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} required />

                            <span className="form-label-mini">Description</span>
                            <textarea className="premium-input" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="Instructions..." value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} />

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <span className="form-label-mini">Due Date</span>
                                    <input type="datetime-local" className="premium-input" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} required />
                                </div>
                                <div className="flex-1">
                                    <span className="form-label-mini">Max Points</span>
                                    <input type="number" className="premium-input" value={newAssignment.maxPoints} onChange={(e) => setNewAssignment({ ...newAssignment, maxPoints: e.target.value })} required />
                                </div>
                            </div>

                            <button type="submit" className="btn-publish" style={{ background: '#8b5cf6' }} disabled={isSubmittingAssignment}>
                                {isSubmittingAssignment ? 'Creating...' : 'Create Assignment'}
                            </button>
                        </form>
                    )}
                    <div className="lesson-list">
                        {assignments.length === 0 ? <p className="text-center py-10 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No assignments created yet</p> : assignments.map((assign, index) => (
                            <div key={assign.id} className="lesson-item">
                                <div className="lesson-main">
                                    <span className="lesson-number" style={{ color: '#a78bfa' }}>A{index + 1}.</span>
                                    <div className="lesson-info">
                                        <span className="lesson-name">{assign.title}</span>
                                        <span className="lesson-meta">Due: {new Date(assign.dueDate).toLocaleString()} | {assign.maxPoints} pts</span>
                                    </div>
                                </div>
                                <div className="lesson-actions">
                                    <FileText size={16} className="action-icon icon-play" style={{ color: '#a78bfa' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="assessment-card">
                <h3 className="card-title" style={{ marginBottom: '2.5rem' }}>Academic Performance Results</h3>
                <div className="overflow-x-auto">
                    {submissions.length === 0 ? (
                        <div className="text-center py-20 rounded-3xl border border-dashed" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--glass-border)' }}><Award size={48} className="mx-auto mb-4" style={{ color: 'var(--primary)', opacity: 0.5 }} /><p className="font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Data will synchronize once students submit assignments</p></div>
                    ) : (
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Assignment</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Submitted On</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td><span className="student-name">{sub.student?.fullName || 'Anonymous'}</span></td>
                                        <td className="text-xs font-bold uppercase tracking-tighter" style={{ color: 'var(--text-secondary)' }}>{sub.assignment?.title}</td>
                                        <td className="score-cell">{sub.grade !== null ? sub.grade : '-'} / {sub.assignment?.maxPoints || 100}</td>
                                        <td>
                                            <span className={`status-badge ${sub.grade >= 40 ? 'status-passed' : sub.grade === null ? 'bg-yellow-500/10 text-yellow-500' : 'status-failed'}`}>
                                                {sub.grade !== null ? (sub.grade >= 40 ? 'Passed' : 'Failed') : 'Pending Review'}
                                            </span>
                                        </td>
                                        <td className="date-cell" style={{ textAlign: 'left' }}>{new Date(sub.submissionDate).toLocaleDateString()}</td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => handleGradeClick(sub)}
                                                className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-bold text-xs uppercase tracking-wider"
                                            >
                                                {sub.grade !== null ? 'Update Grade' : 'Grade / View'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isEditingDetails && ReactDOM.createPortal(
                <div className="classic-modal-overlay">
                    <div className="classic-modal-content animate-fade-in relative">
                        <button onClick={() => setIsEditingDetails(false)} className="absolute top-4 right-4 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>

                        <div className="classic-header">
                            <h2>Edit Course Details</h2>
                        </div>

                        <form onSubmit={handleSaveDetails}>
                            <div>
                                <label className="classic-label">Description</label>
                                <textarea
                                    className="classic-input-field min-h-[100px] resize-none"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="classic-label">Difficulty Level</label>
                                <select
                                    className="classic-input-field"
                                    value={editForm.difficultyLevel}
                                    onChange={e => setEditForm({ ...editForm, difficultyLevel: e.target.value })}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="classic-label">Thumbnail URL</label>
                                <input
                                    className="classic-input-field font-mono text-xs"
                                    value={editForm.thumbnailUrl}
                                    onChange={e => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <button type="submit" className="classic-btn">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {isEditingLesson && editLessonForm && (
                <div className="classic-modal-overlay">
                    <div className="classic-modal-content animate-fade-in relative">
                        <button onClick={() => { setIsEditingLesson(false); setEditLessonForm(null); }} className="absolute top-4 right-4 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
                        <div className="flex items-center gap-4 mb-8 border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
                            <div className="p-3 rounded-xl shadow-lg" style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)' }}><Edit3 size={28} /></div>
                            <div><h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Lesson Editor</h2><p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Update Instructional Content</p></div>
                        </div>
                        <form onSubmit={handleSaveLesson} className="flex flex-col gap-6">
                            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Type size={14} /> Lesson Title</label><input className="premium-input" value={editLessonForm.title} onChange={e => setEditLessonForm({ ...editLessonForm, title: e.target.value })} required /></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Video size={14} /> Media Type</label><select className="premium-input appearance-none" value={editLessonForm.contentType} onChange={e => setEditLessonForm({ ...editLessonForm, contentType: e.target.value })}><option value="VIDEO">Video Stream</option><option value="PDF">PDF Resource</option><option value="DOC">Document File</option></select></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Clock size={14} /> Resource URL</label><input className="premium-input font-mono text-xs" style={{ color: 'var(--accent)' }} value={editLessonForm.contentUrl} onChange={e => setEditLessonForm({ ...editLessonForm, contentUrl: e.target.value })} required /></div>
                            <button type="submit" className="classic-btn" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', border: 'none' }}><Save size={18} style={{ display: 'inline', marginRight: '8px' }} /> Update Content</button>
                        </form>
                    </div>
                </div>
            )}

            {gradingSubmission && (
                <div className="classic-modal-overlay">
                    <div className="classic-modal-content">
                        <button onClick={() => setGradingSubmission(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>

                        <div className="classic-header">
                            <h2>
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Award size={24} /></div>
                                Grade Submission
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)', marginLeft: '3.5rem' }}>
                                <span className="text-white">{gradingSubmission.student?.fullName}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span>{gradingSubmission.assignment?.title}</span>
                            </p>
                        </div>

                        <div className="mb-8 p-1 rounded-2xl border" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-subtle)' }}>
                            <div className="flex items-center gap-4 p-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white mb-1">Attached Submission</h4>
                                    <p className="text-xs text-gray-400 font-mono truncate">
                                        {gradingSubmission.fileUrl || 'No file attached'}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                                        Submitted: {new Date(gradingSubmission.submissionDate).toLocaleString()}
                                    </p>
                                </div>
                                {gradingSubmission.fileUrl && (
                                    <a
                                        href={gradingSubmission.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-900/20"
                                    >
                                        View
                                    </a>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmitGrade} className="flex flex-col">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="classic-label">Grade (Points)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="classic-input-field font-mono text-lg font-bold"
                                            value={gradeForm.grade}
                                            onChange={e => setGradingSubmission({ ...gradingSubmission, grade: e.target.value }) || setGradeForm({ ...gradeForm, grade: e.target.value })}
                                            max={gradingSubmission.assignment?.maxPoints || 100}
                                            min="0"
                                            required
                                            placeholder="0"
                                            style={{ color: 'var(--primary)' }}
                                        />
                                        <span className="absolute right-4 top-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Max: {gradingSubmission.assignment?.maxPoints || 100} pts
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="classic-label">Feedback & Comments</label>
                                    <textarea
                                        className="classic-input-field min-h-[120px] resize-none"
                                        value={gradeForm.feedback}
                                        onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                        placeholder="Enter constructive feedback for the student..."
                                        style={{ lineHeight: '1.6' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="classic-btn flex items-center justify-center gap-2"
                                disabled={isSubmittingGrade}
                            >
                                {isSubmittingGrade ? (
                                    <span className="animate-pulse">Publishing Grade...</span>
                                ) : (
                                    <>
                                        <Award size={18} /> Publish Results
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCourseManage;
