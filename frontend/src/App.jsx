import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentSignupPage from './pages/StudentSignupPage';
import StudentDashboard from './pages/StudentDashboard';
import CollegeAdminDashboard from './pages/CollegeAdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import InstructorApplicationPage from './pages/InstructorApplicationPage';
import PartnerApplicationPage from './pages/PartnerApplicationPage';
import CollegeAdminApplicationPage from './pages/CollegeAdminApplicationPage';
import ApplicationSuccessPage from './pages/ApplicationSuccessPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CollegeManagement from './pages/admin/CollegeManagement';
import CourseManagement from './pages/admin/CourseManagement';
import MediaManager from './pages/admin/MediaManager';
import SecurityAuth from './pages/admin/SecurityAuth';
import PlatformSettings from './pages/admin/PlatformSettings';
import Analytics from './pages/admin/Analytics';
import Students from './pages/admin/Students';
import Instructors from './pages/admin/Instructors';
import Partners from './pages/admin/Partners';
import Assignments from './pages/admin/Assignments';
import Quizzes from './pages/admin/Quizzes';
import Certificates from './pages/admin/Certificates';
import Payments from './pages/admin/Payments';
import AuditLogs from './pages/admin/AuditLogs';
import Notifications from './pages/admin/Notifications';
import Support from './pages/admin/Support';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup/student" element={<StudentSignupPage />} />
        <Route path="/application/instructor" element={<InstructorApplicationPage />} />
        <Route path="/application/partner" element={<PartnerApplicationPage />} />
        <Route path="/application/college" element={<CollegeAdminApplicationPage />} />
        <Route path="/application/success" element={<ApplicationSuccessPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard/student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/college" 
          element={
            <ProtectedRoute allowedRoles={['college_admin']}>
              <CollegeAdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/instructor" 
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/partner" 
          element={
            <ProtectedRoute allowedRoles={['partner']}>
              <PartnerDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/colleges" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <CollegeManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/courses" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <CourseManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/media" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <MediaManager />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/security" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SecurityAuth />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <PlatformSettings />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/students" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Students />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/instructors" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Instructors />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/partners" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Partners />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/assignments" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Assignments />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/quizzes" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Quizzes />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/certificates" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Certificates />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/payments" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Payments />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/audit-logs" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AuditLogs />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/notifications" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Notifications />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/support" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Support />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
