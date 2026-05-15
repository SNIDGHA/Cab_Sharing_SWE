import { useAuth } from '../../AuthContext';
import { Outlet, Navigate } from 'react-router-dom';
import { PacmanLoader } from 'react-spinners';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader color="#6366f1" size={30} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
