import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentSignupPage from './pages/StudentSignupPage';
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import MyCourses from './pages/student/MyCourses';
import CoursePlayer from './pages/student/CoursePlayer';
import Leaderboard from './pages/student/Leaderboard';
import BlockchainHub from './pages/student/BlockchainHub';
import GameDevHub from './pages/student/GameDevHub';
import CareerHub from './pages/student/CareerHub';
import StudentAssignments from './pages/student/Assignments';
import StudentQuizzes from './pages/student/Quizzes';
import Community from './pages/student/Community';
import LiveClasses from './pages/student/LiveClasses';
import Settings from './pages/student/Settings';
import CourseDiscovery from './pages/student/CourseDiscovery';
import EnrollNow from './pages/student/EnrollNow';
import DocumentVerification from './pages/student/DocumentVerification';
import Checkout from './pages/student/Checkout';
import { StudentThemeProvider } from './context/StudentThemeContext';
import CollegeAdminDashboard from './pages/CollegeAdminDashboard';

import DashboardRedirect from './pages/DashboardRedirect';
import PublicCatalogPage from './pages/PublicCatalogPage';
import PublicResourcesPage from './pages/PublicResourcesPage';
import PublicCommunityPage from './pages/PublicCommunityPage';

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
import AdminAssignments from './pages/admin/Assignments';
import AdminQuizzes from './pages/admin/Quizzes';
import Certificates from './pages/admin/Certificates';
import Payments from './pages/admin/Payments';
import AuditLogs from './pages/admin/AuditLogs';
import Notifications from './pages/admin/Notifications';
import Support from './pages/admin/Support';
import Applications from './pages/admin/Applications';
import Verification from './pages/admin/Verification';
import Enrollment from './pages/admin/Enrollment';
import Mentors from './pages/admin/Mentors';
import AdminSettings from './pages/admin/Settings';
import AdminCommunity from './pages/admin/Community';
import AdminLiveClasses from './pages/admin/LiveClasses';
import NFTCertificates from './pages/admin/NFTCertificates';
import AdminCareerHub from './pages/admin/CareerHub';
import ContentModeration from './pages/admin/ContentModeration';
import SystemControl from './pages/admin/SystemControl';
import InstructorLayout from './layouts/InstructorLayout';
import InstructorDashboardPage from './pages/instructor/Dashboard';
import InstructorMyCourses from './pages/instructor/MyCourses';
import InstructorCourseBuilder from './pages/instructor/CourseBuilder';
import InstructorContentLibrary from './pages/instructor/ContentLibrary';
import InstructorAssignments from './pages/instructor/Assignments';
import InstructorQuizzes from './pages/instructor/Quizzes';
import InstructorStudents from './pages/instructor/Students';
import InstructorAnalytics from './pages/instructor/Analytics';
import InstructorLiveClasses from './pages/instructor/LiveClasses';
import InstructorCommunity from './pages/instructor/Community';
import InstructorNotifications from './pages/instructor/Notifications';
import InstructorEarnings from './pages/instructor/Earnings';
import InstructorSettings from './pages/instructor/Settings';

import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1B23',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '12px',
            fontFamily: 'Outfit, sans-serif',
            borderRadius: '16px',
            padding: '12px 24px',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<PublicCatalogPage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/resources" element={<PublicResourcesPage />} />
        <Route path="/community" element={<PublicCommunityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup/student" element={<StudentSignupPage />} />
        <Route path="/application/instructor" element={<InstructorApplicationPage />} />
        <Route path="/application/partner" element={<PartnerApplicationPage />} />
        <Route path="/application/college" element={<CollegeAdminApplicationPage />} />
        <Route path="/application/success" element={<ApplicationSuccessPage />} />
        
        {/* Protected Routes */}
        {/* Student Ecosystem Routes */}
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentThemeProvider>
                <Routes>
                  <Route element={<StudentLayout />}>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="enroll-now" element={<EnrollNow />} />
                    <Route path="document-verification" element={<DocumentVerification />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="courses" element={<CourseDiscovery />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route path="course/:courseId" element={<CoursePlayer />} />
                    <Route path="assignments" element={<StudentAssignments />} />
                    <Route path="quizzes" element={<StudentQuizzes />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="web3-hub" element={<BlockchainHub />} />
                    <Route path="game-hub" element={<GameDevHub />} />
                    <Route path="career" element={<CareerHub />} />
                    <Route path="community" element={<Community />} />
                    <Route path="live" element={<LiveClasses />} />
                    <Route path="settings" element={<Settings />} />
                    {/* Redirect from base student path to dashboard */}
                    <Route index element={<Navigate to="dashboard" replace />} />
                  </Route>
                </Routes>
              </StudentThemeProvider>
            </ProtectedRoute>
          } 
        />

        {/* Legacy student redirect */}
        <Route path="/dashboard/student" element={<Navigate to="/student/dashboard" replace />} />

        <Route 
          path="/dashboard/college" 
          element={
            <ProtectedRoute allowedRoles={['college_admin']}>
              <CollegeAdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Instructor Ecosystem Routes */}
        <Route 
          path="/instructor/*" 
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <Routes>
                <Route element={<InstructorLayout />}>
                  <Route path="dashboard" element={<InstructorDashboardPage />} />
                  <Route path="courses" element={<InstructorMyCourses />} />
                  <Route path="builder" element={<InstructorCourseBuilder />} />
                  <Route path="library" element={<InstructorContentLibrary />} />
                  <Route path="assignments" element={<InstructorAssignments />} />
                  <Route path="quizzes" element={<InstructorQuizzes />} />
                  <Route path="students" element={<InstructorStudents />} />
                  <Route path="analytics" element={<InstructorAnalytics />} />
                  <Route path="live" element={<InstructorLiveClasses />} />
                  <Route path="community" element={<InstructorCommunity />} />
                  <Route path="notifications" element={<InstructorNotifications />} />
                  <Route path="earnings" element={<InstructorEarnings />} />
                  <Route path="settings" element={<InstructorSettings />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Legacy instructor redirect */}
        <Route path="/dashboard/instructor" element={<Navigate to="/instructor/dashboard" replace />} />

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
          path="/admin/applications" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Applications />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/verification" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Verification />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/enrollment" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Enrollment />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/mentors" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Mentors />
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
              <AdminSettings />
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
              <AdminAssignments />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/quizzes" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminQuizzes />
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

        <Route 
          path="/admin/community" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminCommunity />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/live-classes" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminLiveClasses />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/nft-certificates" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <NFTCertificates />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/career-hub" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminCareerHub />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/moderation" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <ContentModeration />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/system-control" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SystemControl />
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
