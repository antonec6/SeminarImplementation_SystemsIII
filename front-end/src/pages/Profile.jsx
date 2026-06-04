import { useNavigate } from "react-router";
import { useState } from "react";
import PostFood from "../components/PostFood";
import "./Profile.css";
import MyFood from "./MyFood";

export default function Profile({ user, onLogOut }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to handle logging out smoothly
  const handleLogOut = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // If you pass a logout handler from App.jsx, trigger it here:
      if (onLogOut) onLogOut();
      alert("Logged out successfully.");
      navigate("/login");
    }
  };

  // Function to handle the critical account deletion request
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone."
    );
    
    if (confirmed) {
      try {
        // Example structure for your eventual backend integration
        await fetch(`http://88.200.63.148:30096/users/${user.id}`, { method: 'DELETE' });
        alert("Account deleted successfully.");
        if (onLogOut) onLogOut();
        navigate("/login");
      } catch (error) {
        alert("Could not delete the account. Please try again later.");
      }
    }
  };

  // Guard clause: If no user is logged in, redirect them or show a warning
  if (!user) {
    return (
      <div className="profile-error-container">
        <p>Please log in to view your profile settings.</p>
        <button onClick={() => navigate("/login")} className="login-redirect-btn">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <main className="profile-page-container">
      <div className="profile-layout">
        
        {/* =========================================================
           LEFT COLUMN: USER PERSONAL INFO CARD
           ========================================================= */}
        <section className="profile-info-card">
          <div className="avatar-container">
            <div className="profile-avatar">
              {user.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="profile-avg-rating ">
                <span className="numeric-avg"> ({Number(user.rating_avg).toFixed(1)} / 5)</span>
            </div>
          </div>

          <div className="user-details-fields">
            <div className="detail-field">
              <label>First name:</label>
              <p>{user.first_name || "Not provided"}</p>
            </div>
            <div className="detail-field">
              <label>Last name:</label>
              <p>{user.last_name || "Not provided"}</p>
            </div>
            <div className="detail-field">
              <label>E-mail:</label>
              <p>{user.email || "Not provided"}</p>
            </div>
          </div>

          <div className="profile-card-actions">
            <button onClick={() => alert("Edit profile clicked")} className="profile-edit-btn">
              Edit
            </button>
            <button onClick={handleLogOut} className="profile-logout-btn">
              Log Out
            </button>
          </div>

          {/* Destructive critical option kept isolated at the baseline */}
          <button onClick={handleDeleteAccount} className="profile-delete-btn">
            Delete Account
          </button>
        </section>

        {/* =========================================================
           RIGHT COLUMN: DASHBOARD NAVIGATION BUTTONS
           ========================================================= */}
        <section className="profile-dashboard-actions">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="dashboard-main-btn post-btn"
          >
            Post Food
          </button>

          <button 
            onClick={() => navigate("/my-food")} // Change from alert to navigate
            className="dashboard-main-btn"
          >
            My Food
          </button>

          <button 
            onClick={() => navigate("/my-requests")} // Change from alert to navigate
            className="dashboard-main-btn"
          >
            My Requests
          </button>

        </section>

      </div>

      <PostFood 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={user}
      />
    </main>
  );
}