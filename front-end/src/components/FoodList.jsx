import { useState, useEffect } from "react";

export default function FoodList({ listing, onClose }) {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  // State parameters holding review rows downloaded from the server tables
  const [providerReviews, setProviderReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Download ratings metadata from the server when a user focuses on a food card item
  useEffect(() => {
    if (!listing || !listing.user_id) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        // Target your single food-listing details API payload descriptor
        const response = await fetch(`http://88.200.63.148:30096/food-listings/${listing.id}`);
        const data = await response.json();
        
        // Safety check mapping: extract reviews array if attached by backend controller query
        if (response.ok && data.reviews) {
          setProviderReviews(data.reviews);
        } else {
          setProviderReviews([]);
        }
      } catch (err) {
        console.error("Error fetching provider historical ratings logs:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [listing]);

  if (!listing) return null;

  const handleOverlayClick = () => {
    setIsImageZoomed(false);
    onClose();
  };

  const handleCloseButton = () => {
    setIsImageZoomed(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleCloseButton}>&times;</button>
        
        <div className="modal-layout">
          {/* Modal Left Side: Clickable full image zoom panel */}
          <div className="modal-image-wrapper" onClick={() => setIsImageZoomed(!isImageZoomed)}>
            {listing.image_url ? (
              <img 
                src={listing.image_url} 
                alt={listing.title} 
                className={`modal-img ${isImageZoomed ? "zoomed" : ""}`} 
              />
            ) : (
              <div className="image-placeholder modal-placeholder">No Image</div>
            )}
            <p className="zoom-hint">{isImageZoomed ? "Click to shrink" : "Click image to see full view"}</p>
          </div>

          {/* Modal Right Side: Full textual description metadata */}
          <div className="modal-info" style={{ display: "flex", flexDirection: "column", maxHeight: "80vh", overflowY: "auto" }}>
            <h2>{listing.title}</h2>
            <p className="modal-author">Shared by: {listing.first_name || "Anonymous"}</p>
            <hr />
            <h4>Full Description:</h4>
            <p className="modal-full-description">{listing.description || "No description provided."}</p>
            
            <p><strong>Dietary Details:</strong> {listing.dietary_details || "Standard/None"}</p>
            <p><strong>Expiration Limit:</strong> {listing.expiration_date ? new Date(listing.expiration_date).toLocaleDateString() : "N/A"}</p>
            <p><strong>Units left:</strong> {listing.quantity}</p>

            {/* PUBLIC REVIEWS TRAILING FIELD SECTION */}
            <div className="modal-reviews-section" style={{ marginTop: "25px", borderTop: "1px solid #e2e8f0", paddingTop: "15px" }}>
              <h4 style={{ marginBottom: "12px", color: "#2b2d42" }}>Provider Community Reviews</h4>
              
              {loadingReviews ? (
                <p style={{ fontSize: "0.88rem", color: "#64748b" }}>Loading feedback records...</p>
              ) : providerReviews.length === 0 ? (
                <p style={{ fontSize: "0.88rem", color: "#64748b", fontStyle: "italic" }}>No reviews left for this kitchen provider yet.</p>
              ) : (
                <div className="reviews-scroller-box" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {providerReviews.map((review, idx) => (
                    <div key={idx} className="review-row-card" style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <div style={{ color: "#f59e0b", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "4px" }}>
                        {"★".repeat(review.score)}{"☆".repeat(5 - review.score)}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "#334155", fontStyle: review.comment ? "normal" : "italic" }}>
                        {review.comment ? `"${review.comment}"` : "No text comment written for this collection trade."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}