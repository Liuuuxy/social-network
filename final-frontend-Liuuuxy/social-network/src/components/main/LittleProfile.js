import React from "react";
import Avatar from "@mui/material/Avatar";
import "./LittleProfile.css";

function LittleProfile({ userName, status, avatarUrl }) {
  return (
    <div className="little-profile-container">
      <Avatar
        className="mb-2 profile-image"
        style={{
          width: "80px",
          height: "80px",
          fontSize: "1.5rem",
        }}
        src={avatarUrl} // Use avatarUrl here
        alt={userName} // Provide userName as alt text
      />
      <div className="profile-details">
        <div className="profile-name">{userName}</div>
        <div className="profile-status">{status}</div>
      </div>
    </div>
  );
}

export default LittleProfile;
