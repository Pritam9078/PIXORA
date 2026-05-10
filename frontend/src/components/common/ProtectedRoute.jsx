import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0E12] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c3f400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if profile exists
  if (!profile || !profile.role) {
    // If we have a user but no profile, they might be new. 
    // Redirect to home where they can see their status or sign up.
    if (location.pathname === '/') return children;
    return <Navigate to="/" replace />;
  }

  // Exact Match Authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(profile.role)) {
      console.warn(`Unauthorized access attempt. User role '${profile.role}' is not in allowed roles: [${allowedRoles.join(', ')}]`);
      
      // Fallback redirection based on their actual role
      const dashboardRoutes = {
        student: '/dashboard/student',
        instructor: '/dashboard/instructor',
        college_admin: '/dashboard/college',
        partner: '/dashboard/partner',
        super_admin: '/dashboard/admin'
      };
      
      return <Navigate to={dashboardRoutes[profile.role] || '/login'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
