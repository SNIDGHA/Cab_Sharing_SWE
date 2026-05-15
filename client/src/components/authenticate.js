import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Authenticate = () => {
  const [status, setStatus] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check if the backend sent a token in the URL (?token=...)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      // Save the token to localStorage
      localStorage.setItem("authToken", urlToken);
      // Clean the token from the URL
      window.history.replaceState({}, document.title, "/authenticate");
      setStatus("Logged in! Redirecting...");
      navigate("/profile");
      return;
    }

    // 2. If no token in URL, check if already logged in via localStorage
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setStatus("Already logged in! Redirecting...");
      navigate("/profile");
      return;
    }

    // 3. Not logged in
    setStatus("Not authenticated");
  }, [navigate]);

  return (
    <div>
      <p>{status}</p>
      <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/auth/google`}>
        Login with Google
      </a>
    </div>
  );
};

export default Authenticate;
