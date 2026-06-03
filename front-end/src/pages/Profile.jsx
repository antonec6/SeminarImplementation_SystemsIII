import { useNavigate } from "react-router";
import "./Profile.css"; // Optional: if you want to style this page separately

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();

  // Handles logging out the user
  const handleLogOut = () => {
    setUser(null); // Clear global user state
    navigate("/"); // Redirect to home page
  };

  // Handles deleting the user account
  const handleDeleteAccount = async () => {
    // Basic confirmation dialog before doing anything destructive
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    
    if (!confirmed) return;

    try {
      // Sending DELETE request to your backend using the logged-in user's ID
      const response = await fetch(`http://88.200.63.148:30096/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Could not delete the account.");
      }

      alert("Your account has been successfully deleted.");
      setUser(null); // Log out the user since the account no longer exists
      navigate("/"); // Send them back to the home page

    } catch (error) {
      alert(error.message);
    }
  };

  // Defensive check: if someone tries to access /profile without being logged in
  if (!user) {
    return (
      <main style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>Please log in to view your profile.</p>
      </main>
    );
  }

  return (
    <main className="profile-container">
      <div className="profile-card">
        <h2>Welcome, {user.first_name}!</h2>
        <p className="profile-email">Email: {user.email}</p>
        <p className="profile-role">Account Type: {user.role}</p>

        <div className="profile-actions">
          {/* Log Out Button */}
          <button onClick={handleLogOut} className="logout-btn">
            Log Out
          </button>

          {/* Delete Account Button */}
          <button onClick={handleDeleteAccount} className="delete-btn">
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}