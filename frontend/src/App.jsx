import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import StudentSignupPage from './pages/StudentSignupPage';
import StudentDashboard from './pages/StudentDashboard';
import CollegeAdminDashboard from './pages/CollegeAdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import InstructorApplicationPage from './pages/InstructorApplicationPage';
import PartnerApplicationPage from './pages/PartnerApplicationPage';
import CollegeAdminApplicationPage from './pages/CollegeAdminApplicationPage';
import ApplicationSuccessPage from './pages/ApplicationSuccessPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
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
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
