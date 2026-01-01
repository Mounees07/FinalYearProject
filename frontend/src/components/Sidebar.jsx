import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    ClipboardList,
    UserCheck,
    Bell,
    Settings,
    LogOut,
    GraduationCap,
    Users,
    FileText,
    ShieldCheck,
    TrendingUp,
    Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { userData, logout } = useAuth();

    const studentLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { to: '/student/courses', icon: <BookOpen size={20} />, label: 'My Courses' },
        { to: '/student/course-registration', icon: <Plus size={20} />, label: 'Choose Faculty' },
        { to: '/schedule', icon: <Calendar size={20} />, label: 'Schedule' },
        { to: '/student/assignments', icon: <ClipboardList size={20} />, label: 'Assignments' },
        { to: '/student/leaves', icon: <FileText size={20} />, label: 'Leave Status' }, // Added
        { to: '/attendance', icon: <UserCheck size={20} />, label: 'Attendance' },
        { to: '/results', icon: <GraduationCap size={20} />, label: 'Results' },
        { to: '/academic-calendar', icon: <Calendar size={20} />, label: 'Academic Calendar' },
    ];

    const teacherLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { to: '/manage-courses', icon: <BookOpen size={20} />, label: 'My Classes' },
        { to: '/marking-attendance', icon: <UserCheck size={20} />, label: 'Attendance' },
        { to: '/grading', icon: <ClipboardList size={20} />, label: 'Grading' },
        { to: '/study-materials', icon: <FileText size={20} />, label: 'Materials' },
        { to: '/schedule', icon: <Calendar size={20} />, label: 'Schedule' },
    ];

    const mentorLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { to: '/mentees', icon: <Users size={20} />, label: 'My Mentees' },
        { to: '/mentor/leaves', icon: <ClipboardList size={20} />, label: 'Leave Approvals' }, // Added
        { to: '/mentor/attendance', icon: <UserCheck size={20} />, label: 'Mentee Attendance' }, // Added
        { to: '/performance-reports', icon: <TrendingUp size={20} />, label: 'Performance' },
        { to: '/meetings', icon: <Calendar size={20} />, label: 'Meetings' },
        { to: '/manage-courses', icon: <BookOpen size={20} />, label: 'My Courses' },
        { to: '/schedule', icon: <Calendar size={20} />, label: 'Schedule' },
    ];

    const hodLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Department' },
        { to: '/mentorship-management', icon: <UserCheck size={20} />, label: 'Mentorship' },
        { to: '/faculty-management', icon: <Users size={20} />, label: 'Faculty' },
        { to: '/curriculum', icon: <BookOpen size={20} />, label: 'Curriculum' },
        { to: '/department-analytics', icon: <TrendingUp size={20} />, label: 'Analytics' },
        { to: '/hod/schedule-upload', icon: <Calendar size={20} />, label: 'Manage Schedule' },
        { to: '/schedule', icon: <Calendar size={20} />, label: 'View Schedule' },
        { to: '/announcements', icon: <Bell size={20} />, label: 'Notices' },
    ];

    const principalLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Institution' },
        { to: '/hr-management', icon: <Users size={20} />, label: 'HR Management' },
        { to: '/campus-analytics', icon: <TrendingUp size={20} />, label: 'Campus Broad' },
        { to: '/compliance', icon: <ShieldCheck size={20} />, label: 'Compliance' },
        { to: '/executive-reports', icon: <FileText size={20} />, label: 'Reports' },
    ];

    const adminLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Admin Panel' },
        { to: '/users', icon: <Users size={20} />, label: 'User Management' },
        { to: '/system-config', icon: <Settings size={20} />, label: 'Configuration' },
        { to: '/logs', icon: <FileText size={20} />, label: 'System Logs' },
    ];

    const getLinksByRole = (role) => {
        switch (role) {
            case 'STUDENT': return studentLinks;
            case 'TEACHER': return teacherLinks;
            case 'MENTOR': return mentorLinks;
            case 'HOD': return hodLinks;
            case 'PRINCIPAL': return principalLinks;
            case 'ADMIN': return adminLinks;
            default: return studentLinks;
        }
    };

    const links = getLinksByRole(userData?.role);

    return (
        <aside className="sidebar glass-card">
            <div className="sidebar-header">
                <div className="logo-container">
                    <GraduationCap className="logo-icon" />
                    <span className="logo-text">AcaSync</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to || link.label}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="nav-link logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
