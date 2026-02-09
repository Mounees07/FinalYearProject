import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
// Signup removed
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
import StudentCourseDetails from './pages/student/StudentCourseDetails';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentExamSeating from './pages/student/StudentExamSeating';
import TeacherCourseCatalog from './pages/teacher/TeacherCourseCatalog';
import TeacherCourseManage from './pages/teacher/TeacherCourseManage';
import TeacherStudentList from './pages/teacher/TeacherStudentList';
import TeacherGrading from './pages/teacher/TeacherGrading';
import HODCurriculum from './pages/hod/HODCurriculum';
import HODFaculty from './pages/hod/HODFaculty';
import HODAnalytics from './pages/hod/HODAnalytics';
import StudentCourseRegistration from './pages/student/StudentCourseRegistration';
import TeacherQuestionManager from './pages/teacher/TeacherQuestionManager';
import COEDashboard from './pages/coe/COEDashboard';
import COEExamSchedule from './pages/coe/COEExamSchedule';
import COEResultPublish from './pages/coe/COEResultPublish';
import COEVenues from './pages/coe/COEVenues';
import COESeatingAllocation from './pages/coe/COESeatingAllocation';
import StudentResults from './pages/student/StudentResults';
import HODMeetings from './pages/hod/HODMeetings';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminCourseManagement from './pages/admin/AdminCourseManagement';
import AdminDataReports from './pages/admin/AdminDataReports';
import AdminSettings from './pages/admin/AdminSettings';
import GateStudentEntry from './pages/gate/GateStudentEntry';
import GateDashboard from './pages/gate/GateDashboard';
import VisitorLog from './pages/gate/VisitorLog';
import './App.css';

// ... existing code ...

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
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  // If user is logged in but userData hasn't loaded yet, wait.
  // This prevents defaulting to Student Dashboard prematurely.
  if (currentUser && !userData) {
    return <div className="loading-screen">Fetching Profile...</div>;
  }

  // Redirect logic
  switch (userData?.role) {
    case 'STUDENT': return <Navigate to="/student/dashboard" replace />;
    case 'TEACHER': return <Navigate to="/teacher/dashboard" replace />;
    case 'MENTOR': return <Navigate to="/mentor/dashboard" replace />;
    case 'HOD': return <Navigate to="/hod/dashboard" replace />;
    case 'PRINCIPAL': return <Navigate to="/principal/dashboard" replace />;
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
    case 'COE': return <Navigate to="/coe/dashboard" replace />;
    case 'GATE_SECURITY': return <Navigate to="/gate/dashboard" replace />;
    default: return <DashboardOverview />;
  }
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Signup route removed */}
            <Route path="/parent-response/:token" element={<ParentResponse />} />
            <Route
              path="/teacher/courses/:sectionId"
              element={
                <PrivateRoute allowedRoles={['TEACHER', 'MENTOR', 'ADMIN']}>
                  <DashboardLayout>
                    <TeacherCourseManage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/courses/:sectionId/questions"
              element={
                <PrivateRoute allowedRoles={['TEACHER', 'MENTOR', 'ADMIN']}>
                  <DashboardLayout>
                    <TeacherQuestionManager />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

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
              <Route path="student/courses/:sectionId" element={<StudentCourseDetails />} />
              <Route path="student/course-registration" element={<StudentCourseRegistration />} />
              <Route path="student/assignments" element={<StudentAssignments />} />
              <Route path="student/exam-seating" element={<StudentExamSeating />} />
              <Route path="student/leaves" element={<StudentLeaves />} />
              <Route path="attendance" element={<StudentAttendance />} />

              {/* Teacher Routes */}
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/marking-attendance" element={<div>Attendance Marker</div>} />
              <Route path="teacher/courses" element={<TeacherCourseCatalog />} />
              <Route path="teacher/courses/:sectionId/manage" element={<TeacherCourseManage />} />
              <Route path="teacher/courses/:sectionId/students" element={<TeacherStudentList />} />
              <Route path="grading" element={<TeacherGrading />} />
              <Route path="study-materials" element={<div>Study Materials Repository</div>} />

              {/* Mentor Routes */}
              <Route path="mentor/dashboard" element={<MentorDashboard />} />
              <Route path="mentees" element={<Mentees />} />
              <Route path="mentor/leaves" element={<MentorLeaves />} />
              <Route path="mentor/attendance" element={<MentorAttendance />} />
              <Route path="performance-reports" element={<div>Mentee Performance Analytics (Coming Soon)</div>} />
              <Route path="meetings" element={<MentorMeetings />} />

              <Route path="hod/dashboard" element={<HODDashboard />} />
              <Route path="mentorship-management" element={<MentorshipManagement />} />
              <Route path="faculty-management" element={<HODFaculty />} />
              <Route path="hod/schedule-upload" element={<HODScheduleUpload />} />
              <Route path="hod/meetings" element={<HODMeetings />} />
              <Route path="curriculum" element={<HODCurriculum />} />
              <Route path="department-analytics" element={<HODAnalytics />} />

              {/* Shared Routes */}
              <Route path="schedule" element={<ScheduleView />} />
              <Route path="academic-calendar" element={<AcademicCalendar />} />
              <Route path="announcements" element={<div>Announcements Page</div>} />

              {/* Principal Routes */}
              <Route path="principal/dashboard" element={<div>Institutional Insights</div>} />

              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/courses" element={<AdminCourseManagement />} />
              <Route path="admin/reports" element={<AdminDataReports />} />
              <Route path="admin/settings" element={<AdminSettings />} />

              {/* COE Routes */}
              <Route path="coe/dashboard" element={<COEDashboard />} />
              <Route path="coe/schedule-exams" element={<COEExamSchedule />} />
              <Route path="coe/publish-results" element={<COEResultPublish />} />
              <Route path="coe/venues" element={<COEVenues />} />
              <Route path="coe/seating-allocation" element={<COESeatingAllocation />} />
              <Route path="student/results" element={<StudentResults />} />

              {/* Gate Security Routes */}
              <Route path="gate/dashboard" element={<GateDashboard />} />
              <Route path="gate/visitor-log" element={<VisitorLog />} />
              <Route path="gate/student-entry" element={<GateStudentEntry />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
