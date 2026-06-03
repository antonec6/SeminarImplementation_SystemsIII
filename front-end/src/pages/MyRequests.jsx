import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./MyRequests.css";

export default function MyRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  // Fetch all requests from the backend server
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://88.200.63.148:30096/requests");
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Could not retrieve your food requests.");
        }

        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRequests();
    }
  }, [user]);

  // Guard clause: Direct unauthorized visitors away
  if (!user) {
    return (
      <div className="myrequests-error-container">
        <p>Please log in to view your submitted requests.</p>
        <button onClick={() => navigate("/login")} className="login-redirect-btn">Go to Login</button>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading your requests...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  // CRITICAL FILTER: Only show requests submitted BY the logged-in user
  const myRequests = requests.filter((req) => req.user_id === user.id);

  return (
    <main className="myrequests-page-container">
      <div className="myrequests-header">
        <button onClick={() => navigate("/profile")} className="back-profile-btn">
          &larr; Back to Profile
        </button>
        <h1 className="page-title">My Requests</h1>
      </div>

      <div className="requests-grid">
        {myRequests.length === 0 ? (
          <div className="no-requests-box">
            <p>You haven't requested any food items yet.</p>
            <button onClick={() => navigate("/food-near-me")} className="explore-now-btn">
              Browse Food Near Me
            </button>
          </div>
        ) : (
          myRequests.map((request) => (
            <div key={request.id} className="request-card">
              
              {/* Left Column: Food Thumb Picture placeholder or source url */}
              <div className="request-image-container">
                {request.image_url ? (
                  <img src={request.image_url} alt={request.title} className="request-img" />
                ) : (
                  <div className="request-image-placeholder">image</div>
                )}
              </div>

              {/* Right Column: Tracking core info and status parameters */}
              <div className="request-content">
                <div className="request-card-header">
                  <h3 className="request-title">{request.title || "Food Item"}</h3>
                  
                  {/* Dynamic request status badge mapped directly to database enum */}
                  <span className={`request-status status-${(request.status || "pending").toLowerCase()}`}>
                    {request.status || "Pending"}
                  </span>
                </div>

                <div className="request-details-box">
                  <p><strong>Requested on:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                  <p className="request-info-text">
                    The kitchen provider is processing your order. You can contact them through chat if accepted!
                  </p>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </main>
  );
}