import { useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import PostFood from "../components/PostFood";
import "./Profile.css";

export default function Profile({ user, setUser}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [myReviews, setMyReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false); 

  const [localRatingAvg, setLocalRatingAvg] = useState(user?.rating_avg || 0);

  useEffect(() => {
    const actualUserId = user?.id;
    if (!actualUserId) return;

    const fetchMyReviews = async () => {
      try {
        const response = await fetch(`http://88.200.63.148:30096/ratings/user/${actualUserId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched reviews for user:", data);
          setMyReviews(data);

          if (data.length > 0) {
            const totalScore = data.reduce((sum, r) => sum + r.score, 0);
            const newAvg = totalScore / data.length;
            
            setLocalRatingAvg(newAvg);
            
            if (user?.rating_avg !== newAvg) {
              setUser(prev => {
                if (!prev) return prev;
                return { ...prev, rating_avg: newAvg };
              });
            }
          }
        }
      } catch (error) {
        console.error("Error de conexión con el backend:", error);
      }
    };

    fetchMyReviews();
  }, [user?.id]);

  const handleLogOut = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("shared_plate_user");
      setUser(null);
      alert("Logged out successfully.");
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone."
    );
    
    if (confirmed) {
      try {
        await fetch(`http://88.200.63.148:30096/users/${user.id}`, { method: 'DELETE' });
        alert("Account deleted successfully.");
        setUser(null);
        navigate("/login");
      } catch (error) {
        alert("Could not delete the account. Please try again later.");
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar_url: imageUrl }));
    }
  };

  const triggerFileInput = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    avatar_url: user?.avatar_url || null 
  });

  const handleSaveProfile = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      alert("All fields are required to update your profile.");
      return;
    }

    try {
      const response = await fetch(`http://88.200.63.148:30096/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update profile settings.");
      }

      setUser({
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        avatar_url: formData.avatar_url
      });

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(`Error updating profile: ${error.message}`);
    }
  };

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
        
        {/* LEFT COLUMN: USER PERSONAL INFO CARD */}
        <section className="profile-info-card">
          <div className="avatar-container">
            <div 
              className={`profile-avatar ${isEditing ? "editable" : ""}`}
              onClick={triggerFileInput}
            >
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Profile" className="avatar-img" />
              ) : (
                formData.first_name ? formData.first_name.charAt(0).toUpperCase() : "U"
              )}
              {isEditing && (
                <div className="avatar-overlay">
                  <span>Change</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              style={{ display: "none" }}
            />

            <div className="profile-avg-rating">
              <button 
                type="button"
                className="view-reviews-trigger-btn"
                onClick={() => setShowReviewsModal(true)}
                title="Click to view history reviews"
              >
                ⭐ ({Number(localRatingAvg || user.rating_avg || 0).toFixed(1)} / 5.0)
              </button>
            </div>
          </div>

          <div className="user-details-fields">
            <div className="detail-field">
              <label>First name:</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="profile-edit-input"
                />
              ) : (
                <p>{user.first_name || "Not provided"}</p>
              )}
            </div>
            
            <div className="detail-field">
              <label>Last name:</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="profile-edit-input"
                />
              ) : (
                <p>{user.last_name || "Not provided"}</p>
              )}
            </div>

            <div className="detail-field">
              <label>E-mail:</label>
              {isEditing ? (
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="profile-edit-input"
                />
              ) : (
                <p>{user.email || "Not provided"}</p>
              )}
            </div>
          </div>

          <div className="profile-card-actions">
            {isEditing ? (
              <>
                <button onClick={handleSaveProfile} className="profile-save-btn">
                  Save
                </button>
                <button 
                  onClick={() => { 
                    setIsEditing(false); 
                    setFormData({ first_name: user.first_name, last_name: user.last_name, email: user.email, avatar_url: user.avatar_url }); 
                  }} 
                  className="profile-cancel-btn"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="profile-edit-btn">
                  Edit Profile
                </button>
                <button onClick={handleLogOut} className="profile-logout-btn">
                  Log Out
                </button>
              </>
            )}
          </div>

          {!isEditing && (
            <button onClick={handleDeleteAccount} className="profile-delete-btn">
              Delete Account
            </button>
          )}
        </section>

        {/* RIGHT COLUMN: DASHBOARD NAVIGATION BUTTONS */}
        <section className="profile-dashboard-actions">
          <div className="nav-button-container">
            <button onClick={() => setIsModalOpen(true)} className="dashboard-main-btn post-btn">
              Post Food
            </button>
          </div>
          <div className="nav-button-container">
            <button onClick={() => navigate("/my-food")} className="dashboard-main-btn">
              My Food
            </button>
          </div>

          <div className="nav-button-container">
            <button onClick={() => navigate("/my-requests")} className="dashboard-main-btn">
              My Requests
            </button>
          </div>
        </section>

      </div>

      {/* REVIEWS */}
      {showReviewsModal && (
        <div className="reviews-modal-overlay" onClick={() => setShowReviewsModal(false)}>
          <div className="reviews-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="reviews-modal-header">
              <h3>My Reviews ({myReviews.length})</h3>
              <button className="close-modal-x" onClick={() => setShowReviewsModal(false)}>×</button>
            </div>
            <div className="reviews-modal-body">
              {myReviews.length === 0 ? (
                <p className="no-reviews-modal-text">You haven't received any reviews yet.</p>
              ) : (
                <div className="modal-reviews-scroll-list">
                  {myReviews.map((review, idx) => (
                    <div key={idx} className="modal-review-card-item">
                      <div className="modal-review-stars">
                        {"★".repeat(review.score)}{"☆".repeat(5 - review.score)}
                      </div>
                      {review.comment && <p className="modal-review-comment">"{review.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PostFood 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={user}
      />
    </main>
  );
}