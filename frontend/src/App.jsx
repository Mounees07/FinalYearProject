import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import HODDashboard from './pages/hod/HODDashboard';
import MentorshipManagement from './pages/hod/MentorshipManagement';
import MentorDashboard from './pages/mentor/MentorDashboard';
import Mentees from './pages/mentor/Mentees';
import StudentLeaves from './pages/student/StudentLeaves';
import MentorLeaves from './pages/mentor/MentorLeaves';
import ParentResponse from './pages/ParentResponse';
import MentorMeetings from './pages/mentor/MentorMeetings';
import StudentAttendance from './pages/student/StudentAttendance';
import MentorAttendance from './pages/mentor/MentorAttendance';
import HODScheduleUpload from './pages/hod/HODScheduleUpload';
import AcademicCalendar from './pages/AcademicCalendar';
import ScheduleView from './components/ScheduleView';
import StudentCourses from './pages/student/StudentCourses';
import StudentAssignments from './pages/student/StudentAssignments';
import TeacherCourseCatalog from './pages/teacher/TeacherCourseCatalog';
import TeacherGrading from './pages/teacher/TeacherGrading';
import HODCurriculum from './pages/hod/HODCurriculum';
import StudentCourseRegistration from './pages/student/StudentCourseRegistration';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!currentUser) return <Navigate to="/login" />;

  // If role-based protection is needed
  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Helper to determine the dashboard internal route based on role
const RoleBasedRedirect = () => {
  const { userData, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;

  // Redirect logic
  switch (userData?.role) {
    case 'STUDENT': return <Navigate to="/student/dashboard" replace />;
    case 'TEACHER': return <Navigate to="/teacher/dashboard" replace />;
    case 'MENTOR': return <Navigate to="/mentor/dashboard" replace />;
    case 'HOD': return <Navigate to="/hod/dashboard" replace />;
    case 'PRINCIPAL': return <Navigate to="/principal/dashboard" replace />;
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
    default: return <DashboardOverview />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/parent-response/:token" element={<ParentResponse />} />

          <Route path="/" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route index element={<RoleBasedRedirect />} />
            <Route path="dashboard" element={<RoleBasedRedirect />} />

            {/* Student Routes */}
            <Route path="student/dashboard" element={<DashboardOverview />} />
            <Route path="student/courses" element={<StudentCourses />} />
            <Route path="student/course-registration" element={<StudentCourseRegistration />} />
            <Route path="student/assignments" element={<StudentAssignments />} />
            <Route path="student/leaves" element={<StudentLeaves />} />
            <Route path="attendance" element={<StudentAttendance />} />

            {/* Teacher Routes */}
            <Route path="teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="teacher/marking-attendance" element={<div>Attendance Marker</div>} />
            <Route path="manage-courses" element={<TeacherCourseCatalog />} />
            <Route path="grading" element={<TeacherGrading />} />
            <Route path="study-materials" element={<div>Study Materials Repository</div>} />

            {/* Mentor Routes */}
            <Route path="mentor/dashboard" element={<MentorDashboard />} />
            <Route path="mentees" element={<Mentees />} />
            <Route path="mentor/leaves" element={<MentorLeaves />} />
            <Route path="mentor/attendance" element={<MentorAttendance />} />
            <Route path="performance-reports" element={<div>Mentee Performance Analytics (Coming Soon)</div>} />
            <Route path="meetings" element={<MentorMeetings />} />

            {/* HOD Routes */}
            <Route path="hod/dashboard" element={<HODDashboard />} />
            <Route path="mentorship-management" element={<MentorshipManagement />} />
            <Route path="hod/schedule-upload" element={<HODScheduleUpload />} />
            <Route path="curriculum" element={<HODCurriculum />} />

            {/* Shared Routes */}
            <Route path="schedule" element={<ScheduleView />} />
            <Route path="academic-calendar" element={<AcademicCalendar />} />
            <Route path="announcements" element={<div>Announcements Page</div>} />

            {/* Principal Routes */}
            <Route path="principal/dashboard" element={<div>Institutional Insights</div>} />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<div>System Administration</div>} />
            <Route path="admin/users" element={<div>User Management</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
