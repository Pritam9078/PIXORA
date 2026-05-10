import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role-based check is needed
  // This assumes metadata or a separate profile table has the role
  const userRole = user.user_metadata?.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/role-selection" replace />;
  }

  return children;
};

export default ProtectedRoute;
