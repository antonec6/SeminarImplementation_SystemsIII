import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Rating from "../components/Rating"; // Standard unified rating pop-up modal view reference
import "./MyRequests.css";

export default function MyRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State elements to control the operational parameters of the review modal portal
  const [activeRequestToRate, setActiveRequestToRate] = useState(null);
  const [ratedRequests, setRatedRequests] = useState({});
  
  const navigate = useNavigate();

  // Fetch all user requested listing transactions from backend infrastructure
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

  // Guard clause: Evict unauthenticated visitors securely
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

  // Render filter constraints mapping entries submitted strictly by current user context
  const myRequests = requests.filter((req) => req.user_id === user.id);

  // Secure cross-navigation channel redirecting the users to the message center platform
  const handleMessageClick = (e, request) => {
    e.stopPropagation(); 
    
    if (!request || !request.food_listing_id || !request.user_id) {
      alert("Error: Core listing or requester parameters are missing.");
      return;
    }
    
    const listingId = request.food_listing_id;
    const buyerId = request.user_id; // The user who submitted this specific food request
    const title = encodeURIComponent(request.title || "Private Food Chat");
    const image = encodeURIComponent(request.image_url || ""); 
    
    // Inject both tracking properties into the query navigation string safely
    navigate(`/messages?listingId=${listingId}&buyerId=${buyerId}&title=${title}&image=${image}`);
  };

  // Local sync handler keeping states active upon successful submission payloads
  const handleRatingSuccess = (requestId) => {
    setRatedRequests(prev => ({ ...prev, [requestId]: true }));
  };

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
          myRequests.map((request) => {
            // RELATIONAL RULES: Verification states checking database transaction status parameters
            const isRejected = (request.status || "").toLowerCase() === "rejected";
            const isCollected = (request.food_status || "").toLowerCase() === "completed" && !isRejected;
            
            // LOCK OUT RULES: Block ratings duplicate attempts if local or remote states flag it as rated
            const alreadyRated = ratedRequests[request.id] || request.already_rated === 1;

            return (
              <div key={request.id} className="request-card">
                
                {/* Left Column: Image Thumbs Renderer */}
                <div className="request-image-container">
                  {request.image_url ? (
                    <img src={request.image_url} alt={request.title} className="request-img" />
                  ) : (
                    <div className="request-image-placeholder">image</div>
                  )}
                </div>

                {/* Right Column: Unified structural layout wrapping texts and triggers together */}
                <div className="request-content">
                  <div className="request-card-header">
                    <h3 className="request-title">{request.title || "Food Item"}</h3>
                    
                    {/* Floating contextual viewport interface mapping buttons right aligned */}
                    <div className="status-actions-wrapper">
                      {/* Only allow messaging operations if the item is not rejected or archived */}
                      {!isRejected && !isCollected && (
                        <button 
                          onClick={(e) => handleMessageClick(e, request)} 
                          className="message-btn"
                        >
                          Message
                        </button>
                      )}

                      {/* Display interactive feedback submission link if handover process is archived */}
                      {isCollected && (
                        <div className="rating-container">
                          {alreadyRated ? (
                            <span className="rating-done-text">Rated ✓</span>
                          ) : (
                            <button 
                              onClick={() => setActiveRequestToRate(request)}
                              className="rate-action-btn"
                            >
                              Rate
                            </button>
                          )}
                        </div>
                      )}

                      {/* Explicit state tokens reflecting live backend status variables */}
                      <span className={`request-status status-${isRejected ? "rejected" : isCollected ? "completed" : (request.status || "pending").toLowerCase()}`}>
                        {isRejected ? "Rejected" : isCollected ? "Collected" : (request.status || "Pending")}
                      </span>
                    </div>
                  </div>

                  <div className="request-details-box">
                    <p><strong>Requested on:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                    <p className="request-info-text">
                      {isRejected 
                        ? "This request was declined by the food provider. Feel free to browse alternative listings!" 
                        : isCollected 
                          ? "This order has been collected successfully! Thank you for reducing food waste."
                          : "The kitchen provider is processing your order. You can contact them through chat if accepted!"}
                    </p>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Structured review overlay portal layer injection */}
      {activeRequestToRate && (
        <Rating
          request={activeRequestToRate}
          user={user}
          onClose={() => setActiveRequestToRate(null)}
          onSuccess={() => handleRatingSuccess(activeRequestToRate.id)}
        />
      )}
    </main>
  );
}