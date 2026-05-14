import React from "react";
import { useAuth } from "../../AuthContext";

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#dfe3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "50px 40px",
          borderRadius: "16px",
          width: "380px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "10px",
          }}
        >
          Cab Sharing
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "40px",
            fontSize: "16px",
          }}
        >
          Share rides easily and travel together.
        </p>

        <button
          onClick={login}
          style={{
            width: "100%",
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            transition: "0.2s",
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            style={{
              width: "22px",
              height: "22px",
            }}
          />

          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;