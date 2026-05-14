import React, { useRef, useState } from "react";
import { useAuth } from "../../AuthContext";
import axios from "axios";

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [profileImage, setProfileImage] = useState(
    user?.profilePic || ""
  );

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);

    try {
      await axios.put("http://localhost:3001/profiles/profile-pic", {
        email: user.email,
        profilePic: imageUrl,
      });

      console.log("Profile picture saved");
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Please sign in</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#dfe3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "350px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "fit-content",
            margin: "auto",
          }}
        >
          <img
            src={
              profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            onClick={handleImageClick}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
              border: "3px solid #2563eb",
            }}
          />

          {/* Pen Button */}
          <button
            onClick={handleImageClick}
            style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ✎
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>

        <h2 style={{ marginTop: "20px" }}>
          {user.name}
        </h2>

        <p style={{ color: "gray" }}>
          {user.email}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;