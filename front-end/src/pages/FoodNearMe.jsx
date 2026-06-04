import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import FoodList from "../components/FoodList";
import "./FoodNearMe.css";

export default function FoodNearMe({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedListing, setSelectedListing] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://88.200.63.148:30096/food-listings");
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Could not retrieve food listings from the server.");
        }

        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleRequestClick = async (e, listingId) => {
    e.stopPropagation();
    
    if (!user) {
      alert("You must be logged in to request food.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://88.200.63.148:30096/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,     
          food_listing_id: listingId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit your food request. It might already be claimed.");
      }

      alert("Food request submitted successfully! The owner will review it.");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMessageClick = (e, listing) => {
    e.stopPropagation();
    
    if (!listing || !listing.id) {
      alert("Error: Listing data is missing.");
      return;
    }
    
    const listingId = listing.id;
    const buyerId = user.id; // Your logged-in user context object
    const title = encodeURIComponent(listing.title || "Food Chat");
    const image = encodeURIComponent(listing.image_url || "");
    
    navigate(`/messages?listingId=${listingId}&buyerId=${buyerId}&title=${title}&image=${image}`);
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "No description provided.";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  if (loading) return <div className="loading">Loading available food...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  const itemsToDisplay = user 
    ? listings.filter(item => item.user_id !== user.id && item.status === 'available') 
    : listings.filter(item => item.status === 'available');

  return (
    <main className="food-page-container">
      <h1 className="page-title">Food Near Me</h1>

      <div className="listings-grid">
        {itemsToDisplay.length === 0 ? (
          <p>No food available at the moment. Check back later!</p>
        ) : (
          itemsToDisplay.map((item) => (
            <div key={item.id} className="food-card" onClick={() => setSelectedListing(item)}>
              
              {/* Left Column: Image Area */}
              <div className="card-image-container">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="card-img" />
                ) : (
                  <div className="image-placeholder">image</div>
                )}
              </div>

              {/* Right Column: Text content and dynamic actions */}
              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">{item.title || "Untitled"}</h3>
                  <div className="card-rating">
                    <span>⭐ {Number(item.user_rating_avg).toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <p className="card-posted-by">
                  Posted by: <span>{item.first_name ? `${item.first_name} ${item.last_name || ""}` : "Anonymous"}</span>
                </p>

                <p className="card-description-label">Description:</p>
                <p className="card-description">
                  {truncateText(item.description)}
                  {item.description && item.description.length > 80 && (
                    <span className="read-more-link"> Read more</span>
                  )}
                </p>
                
                {item.dietary_details && (
                  <p className="card-dietary">
                    <strong>Dietary Info:</strong> {item.dietary_details}
                  </p>
                )}

                {item.expiration_date && (
                  <p className="card-expiration">
                    <strong>Expires on:</strong> {new Date(item.expiration_date).toLocaleDateString()}
                  </p>
                )}
                
                <p className="card-quantity">Quantity available: {item.quantity}</p>

                {/* Actions container*/}
                <div className="card-actions">
                  {user ? (
                    <div className="logged-in-actions">
                      <div className="action-left">
                        <button onClick={(e) => handleMessageClick(e, item)} className="message-btn">
                          Message
                        </button>
                      </div>
                      <div className="action-right">
                        <button onClick={(e) => handleRequestClick(e, item.id)} className="request-btn">
                          Request
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); navigate("/login"); }} className="login-request-btn">
                      Log in to request
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Modular pop-up */}
      <FoodList 
        listing={selectedListing} 
        onClose={() => setSelectedListing(null)} 
      />
    </main>
  );
}