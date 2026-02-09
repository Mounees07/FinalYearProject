import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Play,
    FileText,
    Clock,
    User,
    Shield,
    CheckCircle,
    Lock,
    Award,
    X,
    HelpCircle,
    ArrowRight
} from 'lucide-react';
import api from '../../utils/api';
import './StudentCourseDetails.css';

const StudentCourseDetails = () => {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [section, setSection] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Progress State
    const [completedLessonIds, setCompletedLessonIds] = useState(() => {
        const saved = localStorage.getItem(`completed_lessons_${sectionId}`);
        return saved ? JSON.parse(saved) : [];
    });

    // Quiz State
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sectionRes = await api.get(`/courses/sections/${sectionId}`);
                setSection(sectionRes.data);

                if (sectionRes.data?.course?.id) {
                    const lessonsRes = await api.get(`/courses/${sectionRes.data.course.id}/lessons`);
                    setLessons(lessonsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch course details", error);
            } finally {
                setLoading(false);
            }
        };

        if (sectionId) fetchData();
    }, [sectionId]);

    const uniqueLessons = lessons.filter((lesson, index, self) =>
        index === self.findIndex((t) => (
            t.title === lesson.title && t.contentUrl === lesson.contentUrl
        ))
    );

    const toggleCompletion = (id) => {
        setCompletedLessonIds(prev => {
            const newSet = prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id];
            localStorage.setItem(`completed_lessons_${sectionId}`, JSON.stringify(newSet));
            return newSet;
        });
    };

    const allCompleted = uniqueLessons.length > 0 && uniqueLessons.every(l => completedLessonIds.includes(l.id));

    const handleStartQuiz = async () => {
        try {
            const res = await api.get(`/courses/${section.course.id}/quizzes`);
            if (res.data && res.data.length > 0) {
                setQuizzes(res.data);
                setActiveQuiz(res.data[0]);
                setShowQuizModal(true);
                setQuizResult(null);
                setUserAnswers({});
            } else {
                alert("No quizzes are currently available for this course.");
            }
        } catch (e) {
            console.error("Failed to fetch quizzes", e);
            alert("System error fetching quizzes.");
        }
    };

    const handleAnswerChange = (questionId, option) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleSubmitQuiz = () => {
        if (!activeQuiz) return;
        let score = 0;
        activeQuiz.questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswer) {
                score++;
            }
        });
        setQuizResult({
            score,
            total: activeQuiz.questions.length,
            percentage: Math.round((score / activeQuiz.questions.length) * 100)
        });
    };

    if (loading) return (
        <div className="course-details-container flex items-center justify-center">
            <div className="animate-pulse text-indigo-500 font-bold tracking-widest text-xs uppercase">Loading Curriculum...</div>
        </div>
    );

    if (!section) return (
        <div className="course-details-container flex flex-col items-center justify-center text-center">
            <Shield size={48} className="text-red-500/50 mb-6" />
            <h2 className="text-2xl font-black mb-4 uppercase">Course Not Found</h2>
            <button onClick={() => navigate('/student/courses')} className="btn-view-material">
                Return to Courses
            </button>
        </div>
    );

    return (
        <div className="course-details-container">
            {/* Nav */}
            <button onClick={() => navigate('/student/courses')} className="back-nav-btn">
                <ArrowLeft size={16} /> Back to My Courses
            </button>

            {/* Banner */}
            <div className="details-banner">
                <div className="banner-glow"></div>
                <h1 className="course-title-large">{section.course?.name}</h1>
                <div className="course-meta-row">
                    <div className="meta-pill">
                        <User size={14} className="text-indigo-400" />
                        <span>{section.faculty?.fullName}</span>
                    </div>
                    <div className="meta-pill">
                        <Clock size={14} className="text-purple-400" />
                        <span>Semester {section.semester}</span>
                    </div>
                    <div className="meta-pill highlight">
                        <span>{section.course?.code}</span>
                    </div>
                    <div className="meta-pill">
                        <span>{section.course?.credits} Credits</span>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="modules-header">
                <BookOpen size={20} className="text-indigo-500" />
                <h2>Learning Modules</h2>
                <div className="ml-auto text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {completedLessonIds.length} / {uniqueLessons.length} Completed
                </div>
            </div>

            <div className="modules-grid mb-20">
                {uniqueLessons.length === 0 ? (
                    <div className="empty-modules">
                        <BookOpen size={32} className="mx-auto mb-4 text-gray-700" />
                        <p className="text-sm font-bold uppercase tracking-wider">No learning modules published yet</p>
                    </div>
                ) : (
                    uniqueLessons.map((lesson, idx) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        return (
                            <div key={lesson.id} className={`module-card group ${isCompleted ? 'border-green-500/30 bg-green-900/5' : ''}`}>
                                <div className="module-left">
                                    <button
                                        onClick={() => toggleCompletion(lesson.id)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/5 text-gray-600 hover:bg-white/10'}`}
                                    >
                                        {isCompleted ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-50" />}
                                    </button>

                                    <div className="module-info">
                                        <h3 className={isCompleted ? 'text-gray-400 decoration-slice' : ''}>{lesson.title}</h3>
                                        <div className="flex gap-2">
                                            <span className="module-type">{lesson.contentType}</span>
                                            {lesson.description && <span className="text-xs text-gray-500 flex items-center line-clamp-1 max-w-md">{lesson.description}</span>}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => lesson.contentUrl && window.open(lesson.contentUrl, '_blank')}
                                    className="btn-view-material"
                                >
                                    {lesson.contentType === 'VIDEO' ? <Play size={14} /> : <FileText size={14} />}
                                    <span>Access Content</span>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* PREMIUM Quiz Section */}
            <div className="max-w-7xl mx-auto mb-24 lg:px-8">
                <div className={`
                    relative overflow-hidden rounded-3xl border p-10 transition-all duration-500
                    ${allCompleted
                        ? 'bg-[#0f0f13] border-indigo-500/30 shadow-[0_0_50px_-10px_rgba(99,102,241,0.2)]'
                        : 'bg-black/40 border-white/5'}
                `}>
                    {/* Background Effects */}
                    <div className={`absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-1000 ${allCompleted ? 'opacity-100' : 'opacity-0'}`} />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                        {/* Left: Icon & Text */}
                        <div className="flex items-center gap-8 w-full md:w-auto">
                            <div className={`
                                w-24 h-24 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500
                                ${allCompleted
                                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] rotate-0 scale-100'
                                    : 'bg-white/5 text-gray-600 rotate-6 scale-95'}
                            `}>
                                {allCompleted ? <Award size={48} /> : <Lock size={48} />}
                            </div>

                            <div className="flex flex-col">
                                <span className={`text-xs font-bold uppercase tracking-[0.3em] mb-3 ${allCompleted ? 'text-indigo-400' : 'text-gray-600'}`}>
                                    {allCompleted ? 'Validation Unlocked' : 'Module Locked'}
                                </span>
                                <h2 className={`text-4xl font-black uppercase tracking-tighter mb-2 ${allCompleted ? 'text-white' : 'text-gray-600'}`}>
                                    Final Assessment
                                </h2>
                                <p className="text-gray-400 text-sm font-medium max-w-lg leading-relaxed">
                                    {allCompleted
                                        ? "Congratulations! You have successfully mastered the curriculum. You may now proceed to the final verification test."
                                        : `To access the certification quiz, you must complete all ${uniqueLessons.length} learning modules above.`}
                                </p>
                            </div>
                        </div>

                        {/* Right: Button */}
                        <button
                            onClick={handleStartQuiz}
                            disabled={!allCompleted || !section.testsEnabled}
                            className={`
                                group relative shrink-0 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-4 overflow-hidden
                                ${allCompleted && section.testsEnabled
                                    ? 'bg-white text-black hover:bg-indigo-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer'
                                    : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'}
                            `}
                        >
                            {allCompleted && section.testsEnabled ? (
                                <>
                                    <span className="relative z-10">Start Attempt</span>
                                    <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                </>
                            ) : (
                                <>
                                    <span>{allCompleted && !section.testsEnabled ? 'Not Enabled' : 'Restricted'}</span>
                                    <Lock size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quiz Modal */}
            {showQuizModal && activeQuiz && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
                    <div className="glass-card max-w-4xl w-full max-h-[90vh] flex flex-col animate-fade-in border border-indigo-500/20 shadow-[0_0_100px_-20px_rgba(99,102,241,0.3)] rounded-3xl overflow-hidden">
                        {/* Header */}
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-900/20 to-black/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{activeQuiz.title}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Assessment Session • {activeQuiz.questions.length} Questions</p>
                                </div>
                            </div>
                            <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-[#050507]">
                            {!quizResult ? (
                                <div className="space-y-10 max-w-3xl mx-auto">
                                    {activeQuiz.questions.map((q, idx) => (
                                        <div key={q.id} className="quiz-question group">
                                            <div className="flex gap-6">
                                                <div className="text-indigo-500/30 font-black text-4xl leading-none select-none group-hover:text-indigo-500 transition-colors">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <div className="flex-1 pt-2">
                                                    <p className="text-xl font-bold text-gray-200 mb-6 leading-relaxed">{q.questionText}</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {q.options && q.options.split(',').map((opt, optIdx) => (
                                                            <label key={optIdx} className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${userAnswers[q.id] === opt.trim() ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' : 'bg-[#121214] border-white/5 hover:border-white/10 text-gray-400'}`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${q.id}`}
                                                                    value={opt.trim()}
                                                                    checked={userAnswers[q.id] === opt.trim()}
                                                                    onChange={() => handleAnswerChange(q.id, opt.trim())}
                                                                    className="hidden"
                                                                />
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${userAnswers[q.id] === opt.trim() ? 'border-white' : 'border-gray-600'}`}>
                                                                    {userAnswers[q.id] === opt.trim() && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                                </div>
                                                                <span className="text-sm font-bold tracking-wide">{opt.trim()}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                    <div className="mb-8 p-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_100px_rgba(99,102,241,0.5)] animate-fade-in-up">
                                        <Award size={80} className="text-white" />
                                    </div>
                                    <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">Assessment Complete</h2>
                                    <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8 tracking-tighter">
                                        {quizResult.score}<span className="text-4xl text-gray-600 px-4">/</span>{quizResult.total}
                                    </div>
                                    <div className="w-64 h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                            style={{ width: `${quizResult.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-gray-400 font-medium max-w-md mx-auto leading-relaxed text-lg">
                                        You have successfully validated your knowledge for this course module.
                                        {quizResult.percentage >= 70 ? ' Outstanding performance!' : ' Review the materials and try again.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/10 bg-[#0a0a0c] flex justify-end">
                            {!quizResult ? (
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="btn-primary !px-10 !py-4"
                                    disabled={Object.keys(userAnswers).length !== activeQuiz.questions.length}
                                >
                                    Submit Answers
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowQuizModal(false)}
                                    className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
                                >
                                    Close Assessment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCourseDetails;
