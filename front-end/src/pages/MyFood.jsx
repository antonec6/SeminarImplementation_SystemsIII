import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import FoodList from "../components/FoodList";
import PostFood from "../components/PostFood";
import "./MyFood.css";

export default function MyFood({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [hiddenListings, setHiddenListings] = useState(() => {
    const saved = localStorage.getItem(`hidden_listings_${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedListing, setSelectedListing] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null); 
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const response = await fetch("http://88.200.63.148:30096/food-listings");
      const data = await response.json();
      if (!response.ok) throw new Error("Could not retrieve your food listings with request details.");
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchListings();
  }, [user]);

  const handleHideListing = (e, listingId) => {
    e.stopPropagation(); 
    const updatedHidden = [...hiddenListings, listingId];
    setHiddenListings(updatedHidden);
    localStorage.setItem(`hidden_listings_${user.id}`, JSON.stringify(updatedHidden));
  };

  const handleDeleteClick = async (e, listingId) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this listing? This will also remove any related requests.");
    if (confirmed) {
      try {
        const response = await fetch(`http://88.200.63.148:30096/food-listings/${listingId}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok || data.success === false) throw new Error(data.message || "Failed to delete the listing.");
        setListings((prev) => prev.filter((item) => item.id !== listingId));
        alert("Listing deleted successfully.");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEditClick = (e, item) => {
    e.stopPropagation();
    setItemToEdit(item);
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "No description provided.";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleToggleChatsMenu = async (e, listingId) => {
    e.stopPropagation();
    if (activeDropdownId === listingId) {
      setActiveDropdownId(null);
      return;
    }
    try {
      const response = await fetch(`http://88.200.63.148:30096/food-listings/${listingId}/chats`);
      if (response.ok) {
        const data = await response.json();
        setActiveChats(data);
        setActiveDropdownId(listingId);
      }
    } catch (err) {
      console.error("Error running chat logs menu fetching processing:", err);
    }
  };

  const handleOpenPrivateChat = (e, listing, chatInfo) => {
    e.stopPropagation();
    const listingId = listing.id;
    const buyerId = chatInfo.buyer_id;
    const title = encodeURIComponent(`${listing.title} - Chat with ${chatInfo.first_name}`);
    const image = encodeURIComponent(listing.image_url || "");
    navigate(`/messages?listingId=${listingId}&buyerId=${buyerId}&title=${title}&image=${image}`);
  };

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

  const myItems = listings.filter((item) => item.user_id === user.id && !hiddenListings.includes(item.id));

  const handleAcceptRequest = async (e, item) => {
    e.stopPropagation();
    if (!item.request_id) {
      alert(`Error: request_id is missing or undefined!`);
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
      const response = await fetch(`http://88.200.63.148:30096/requests/${item.request_id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_listing_id: item.id }) 
      });
      if (!response.ok) throw new Error("Could not reject the claim.");
      setListings(prev => prev.map(el => el.id === item.id ? { ...el, status: "available", request_id: null } : el));
      alert("Request rejected. The food item is listed as available again.");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteRequest = async (e, item) => {
    e.stopPropagation(); 
    if (!item.request_id) {
      alert("Error: Missing target request reference metadata link.");
      return;
    }
    const confirmed = window.confirm("Confirm handover? This marks the food as successfully collected by the requester.");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://88.200.63.148:30096/requests/${item.request_id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_listing_id: item.id }) 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Could not execute the transaction completion.");
      }
      setListings(prev => prev.map(el => el.id === item.id ? { ...el, status: "completed" } : el));
      alert("Transaction successfully archived. The requester can now leave a profile review!");
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
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
            <div key={item.id} className="myfood-card" onClick={() => setSelectedListing(item)}>
              
              {item.status === "completed" && (
                <button 
                  onClick={(e) => handleHideListing(e, item.id)}
                  className="dismiss-btn"
                  title="Dismiss from view"
                >
                  ✕
                </button>
              )}

              <div className="card-image-container">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="card-img" />
                ) : (
                  <div className="image-placeholder">image</div>
                )}
              </div>

              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">
                    {item.title || "Untitled"}
                  </h3>
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

                <div className="myfood-meta-row">
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  {item.expiration_date && (
                    <p><strong>Expires:</strong> {new Date(item.expiration_date).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="active-chats-wrapper">
                  <button 
                    onClick={(e) => handleToggleChatsMenu(e, item.id)} 
                    className="view-chats-btn"
                  >
                    View Active Chats
                  </button>
                </div>

                {activeDropdownId === item.id && (
                  <div className="chats-dropdown-container" onClick={(e) => e.stopPropagation()}>
                    <p className="dropdown-title">Active Chat Channels:</p>
                    {activeChats.length === 0 ? (
                      <p className="no-chats-text">No chat history found for this item yet.</p>
                    ) : (
                      <div className="chats-list">
                        {activeChats.map((chat) => (
                          <div 
                            key={chat.buyer_id} 
                            onClick={(e) => handleOpenPrivateChat(e, item, chat)}
                            className="chat-channel-row"
                          >
                            <span className="chat-user-name">👤 {chat.first_name} {chat.last_name}</span>
                            <span className="open-chat-trigger">Open Chat &rarr;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="myfood-actions">
                  {item.status === "requested" && (
                    <>
                      <button onClick={(e) => handleAcceptRequest(e, item)} className="myfood-accept-btn">Accept</button>
                      <button onClick={(e) => handleRejectRequest(e, item)} className="myfood-reject-btn">Reject</button>
                    </>
                  )}

                  {item.status === "reserved" && (
                    <button onClick={(e) => handleCompleteRequest(e, item)} className="myfood-complete-btn">
                      Mark as Collected
                    </button>
                  )}

                  {item.status === "completed" && (
                    <span className="completed-handover-badge">
                      Handed Over ✓
                    </span>
                  )}

                  {(item.status === "available" || !item.status) && (
                    <>
                      <button onClick={(e) => handleEditClick(e, item)} className="myfood-edit-btn">Edit</button>
                      <button onClick={(e) => handleDeleteClick(e, item.id)} className="myfood-delete-btn">Remove Post</button>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      <FoodList listing={selectedListing} onClose={() => setSelectedListing(null)} />

      {itemToEdit && (
        <PostFood 
          isOpen={itemToEdit !== null}
          user={user}
          editItem={itemToEdit}
          onClose={() => setItemToEdit(null)}
          onSuccess={() => { fetchListings(); }}
        />
      )}
    </main>
  );
}