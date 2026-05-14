import { useAuth } from '../../AuthContext';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/authenticate" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
