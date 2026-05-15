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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 w-full max-w-sm text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-10"></div>
        
        <div className="relative z-10">
          <div className="relative w-max mx-auto mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <img
              src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="profile"
              onClick={handleImageClick}
              className="relative w-36 h-36 rounded-full object-cover cursor-pointer border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
            />

            <button
              onClick={handleImageClick}
              className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white border-4 border-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-sm transition-colors duration-200"
              title="Change Profile Picture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
            {user.name}
          </h2>

          <p className="text-indigo-600 bg-indigo-50 rounded-full px-4 py-1.5 inline-block text-sm font-medium border border-indigo-100">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;