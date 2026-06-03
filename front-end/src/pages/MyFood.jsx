import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import FoodList from "../components/FoodList";
import PostFood from "../components/PostFood";
import "./MyFood.css";

export default function MyFood({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for the modular pop-up detail view
  const [selectedListing, setSelectedListing] = useState(null);
  
  const navigate = useNavigate();

const fetchListings = async () => {
    try {
      const response = await fetch("http://88.200.63.148:30096/food-listings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Could not retrieve your food listings.");
      }

      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. EL EFFECT QUEDA SÚPER LIMPIO: Solo la ejecuta al montar la página
  useEffect(() => {
    fetchListings();
  }, []);

  // Action to delete a listing with a confirmation dialog
const handleDeleteClick = async (e, listingId) => {
    e.stopPropagation(); // Prevents opening the modal pop-up
    const confirmed = window.confirm("Are you sure you want to delete this listing? This will also remove any related requests.");
    
    if (confirmed) {
      try {
        const response = await fetch(`http://88.200.63.148:30096/food-listings/${listingId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        // FIX: Verify via our unified data.success parameter rule
        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Failed to delete the listing.");
        }

        // Optimistically remove the deleted listing from the local state
        setListings((prev) => prev.filter((item) => item.id !== listingId));
        alert("Listing deleted successfully.");
      } catch (err) {
        alert(err.message);
      }
    }
  };

    const [itemToEdit, setItemToEdit] = useState(null); 

    // 2. Modifica la función del botón
    const handleEditClick = (e, item) => {
    e.stopPropagation(); // Evita que se abra el modal de vista detallada
    setItemToEdit(item);  // Guardamos el objeto completo para pasárselo al modal de edición
    };

  // Truncate logic for descriptions
  const truncateText = (text, maxLength = 80) => {
    if (!text) return "No description provided.";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Guard clause: If no user is logged in
  if (!user) {
    return (
      <div className="myfood-error-container">
        <p>Please log in to manage your food listings.</p>
        <button onClick={() => navigate("/login")} className="login-redirect-btn">Go to Login</button>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading your listings...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  // CRITICAL FILTER: Only display listings that belong to the logged-in user
  const myItems = listings.filter((item) => item.user_id === user.id);


const handleAcceptRequest = async (e, item) => {
    e.stopPropagation();
    
    // Logging data structure to inspect what fields are returned by the server
    console.log("Inspecting item object data on click:", item);

    if (!item.request_id) {
      alert(`Error: request_id is missing or undefined! Value: ${item.request_id}`);
      return;
    }

    try {
      const response = await fetch(`http://88.200.63.148:30096/requests/${item.request_id}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_listing_id: item.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Could not accept the claim.");
      }
      
      setListings(prev => prev.map(el => el.id === item.id ? { ...el, status: "reserved" } : el));
      alert("You have accepted the request! Get in touch via chat.");
    } catch (err) {
      alert(`Request failed: ${err.message}`);
    }
  };

  const handleRejectRequest = async (e, item) => {
    e.stopPropagation();

    if (!item.request_id) {
      alert("Error: Request ID not found for this listing.");
      return;
    }

    try {
      // Hit the real backend patch endpoint to reject and release the post
      const response = await fetch(`http://88.200.63.148:30096/requests/${item.request_id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_listing_id: item.id }) // Pass listing ID to release it
      });

      if (!response.ok) throw new Error("Could not reject the claim.");

      // Reset state back to available so buttons swap back seamlessly
      setListings(prev => prev.map(el => el.id === item.id ? { ...el, status: "available", request_id: null } : el));
      alert("Request rejected. The food item is listed as available again.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <main className="myfood-page-container">
      <div className="myfood-header">
        <button onClick={() => navigate("/profile")} className="back-profile-btn">
          &larr; Back to Profile
        </button>
        <h1 className="page-title">My Food Listings</h1>
      </div>

      <div className="listings-grid">
        {myItems.length === 0 ? (
          <div className="no-listings-box">
            <p>You haven't posted any food yet.</p>
            <button onClick={() => navigate("/profile")} className="post-now-btn">Post Food Now</button>
          </div>
        ) : (
          myItems.map((item) => (
            /* FIX: Cleaned classnames to prevent style-bleed or overlap interference */
            <div key={item.id} className="myfood-card" onClick={() => setSelectedListing(item)}>
              
              {/* Left Side: Image Container */}
              <div className="card-image-container">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="card-img" />
                ) : (
                  <div className="image-placeholder">image</div>
                )}
              </div>

              {/* Right Side: Card Core Content Info */}
              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">{item.title || "Untitled"}</h3>
                  <span className={`myfood-status status-${(item.status || "available").toLowerCase()}`}>
                    {item.status || "Available"}
                </span>
                </div>

                <p className="card-description-label">Description:</p>
                <p className="card-description">
                  {truncateText(item.description)}
                  {item.description && item.description.length > 80 && (
                    <span className="read-more-link"> Preview full post</span>
                  )}
                </p>

                {/* Unified layout meta details layout banner wrapper */}
                <div className="myfood-meta-row">
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  {item.expiration_date && (
                    <p><strong>Expires:</strong> {new Date(item.expiration_date).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Management actions panel aligned perfectly at the baseline border layout */}
                {/* Render dynamic action flows based on the current live state of the listing */}
                <div className="myfood-actions">
                    {item.status === "requested" ? (
                    <>
                        {/* FIX: Pass the complete item object into the handlers */}
                        <button onClick={(e) => handleAcceptRequest(e, item)} className="myfood-accept-btn">
                        Accept Claim
                        </button>
                        <button onClick={(e) => handleRejectRequest(e, item)} className="myfood-reject-btn">
                        Reject
                        </button>
                    </>
                    ) : (
                    <>
                        <button onClick={(e) => handleEditClick(e, item)} className="myfood-edit-btn">
                        Edit
                        </button>
                        <button onClick={(e) => handleDeleteClick(e, item.id)} className="myfood-delete-btn">
                        Remove Post
                        </button>
                    </>
                    )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Reuse the modular pop-up view component structure */}
      <FoodList 
        listing={selectedListing} 
        onClose={() => setSelectedListing(null)} 
      />
        {itemToEdit && (
    <PostFood 
        isOpen={itemToEdit !== null}
        user={user}
        editItem={itemToEdit}
        onClose={() => setItemToEdit(null)}
        onSuccess={() => {
            fetchListings(); 
        }}
    />
    )}
    </main>
  );
}