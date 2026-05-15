import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const LoginButton = () => {
  const { isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <button
      id="navbar-login-btn"
      onClick={() => navigate('/login')}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-md transition duration-200 disabled:opacity-60"
    >
      {isLoading ? 'Loading...' : 'Log In'}
    </button>
  );
};

export default LoginButton;