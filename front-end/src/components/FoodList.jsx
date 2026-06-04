import { useState, useEffect } from "react";
import "./FoodList.css";

export default function FoodList({ listing, onClose }) {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [providerReviews, setProviderReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!listing || !listing.user_id) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await fetch(`http://88.200.63.148:30096/ratings/user/${listing.user_id}`);
        const data = await response.json();
        
        if (response.ok && data) {
          setProviderReviews(Array.isArray(data) ? data : data.reviews || []);
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
          {/*Clickable full image zoom panel */}
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

          {/*Full textual description */}
          <div className="modal-info">
            <h2>{listing.title}</h2>
            <p className="modal-author">Shared by: {listing.first_name || "Anonymous"}</p>
            <hr />
            <h4>Full Description:</h4>
            <p className="modal-full-description">{listing.description || "No description provided."}</p>
            
            <div className="modal-meta-details">
              <p><strong>Dietary Details:</strong> {listing.dietary_details || "Standard/None"}</p>
              <p><strong>Expiration Limit:</strong> {listing.expiration_date ? new Date(listing.expiration_date).toLocaleDateString() : "N/A"}</p>
              <p><strong>Units left:</strong> {listing.quantity}</p>
            </div>

            {/* PUBLIC REVIEWS SECTION */}
            <div className="modal-reviews-section">
              <h4 className="reviews-section-title">Provider Community Reviews</h4>
              
              {loadingReviews ? (
                <p className="reviews-loading-text">Loading feedback records...</p>
              ) : providerReviews.length === 0 ? (
                <p className="reviews-empty-text">No reviews left for this kitchen provider yet.</p>
              ) : (
                <div className="reviews-scroller-box">
                  {providerReviews.map((review, idx) => (
                    <div key={idx} className="review-row-card">
                      <div className="review-stars">
                        {"★".repeat(review.score)}{"☆".repeat(5 - review.score)}
                      </div>
                      <p className={`review-comment-text ${review.comment ? "" : "empty-comment"}`}>
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