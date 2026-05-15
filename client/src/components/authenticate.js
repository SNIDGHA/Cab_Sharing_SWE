import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Authenticate = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session on page load
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/session`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          // Redirect to profile page after authentication
          navigate('/profile');
        }
      })
      .catch(() => setUser(null));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/logout`, {
      method: "GET",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.name}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/auth/google`}>Login with Google</a>
      )}
    </div>
  );
};

export default Authenticate;
