import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile)) {
    console.log(`ProtectedRoute: Loading state [loading=${loading}, user=${!!user}, profile=${!!profile}]`);
    return (
      <div className="min-h-screen bg-[#0D0E12] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c3f400] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute mt-20 text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
          Securing Session...
        </div>
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if profile exists
  if (!profile || !profile.role) {
    // If we have a user but no profile after loading, something is wrong or they are partially registered.
    if (location.pathname === '/') return children;
    return <Navigate to="/" replace />;
  }

  // Exact Match Authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(profile.role)) {
      console.warn(`Unauthorized access attempt. User role '${profile.role}' is not in allowed roles: [${allowedRoles.join(', ')}]`);
      
      // Fallback redirection based on their actual role - Using New Paths
      const dashboardRoutes = {
        student: '/student/dashboard',
        instructor: '/instructor/dashboard',
        college_admin: '/dashboard/college',
        partner: '/dashboard/partner',
        super_admin: '/dashboard/admin'
      };
      
      const target = dashboardRoutes[profile.role] || '/';
      return <Navigate to={target} replace />;
    }
  }


  return children;
};

export default ProtectedRoute;
