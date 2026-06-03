import { useState } from "react";

export default function FoodList({ listing, onClose }) {
  // Localized state specifically for handling the image zoom inside the modal
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // If there is no listing selected, do not render the overlay structure
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
          <div className="modal-info">
            <h2>{listing.title}</h2>
            <p className="modal-author">Shared by: {listing.first_name || "Anonymous"}</p>
            <hr />
            <h4>Full Description:</h4>
            <p className="modal-full-description">{listing.description || "No description provided."}</p>
            
            <p><strong>Dietary Details:</strong> {listing.dietary_details || "Standard/None"}</p>
            <p><strong>Expiration Limit:</strong> {listing.expiration_date ? new Date(listing.expiration_date).toLocaleDateString() : "N/A"}</p>
            <p><strong>Units left:</strong> {listing.quantity}</p>
          </div>
        </div>
      </div>
    </div>
  );
}