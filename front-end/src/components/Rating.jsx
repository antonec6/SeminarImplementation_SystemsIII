import { useState } from "react";
import "./Rating.css";

export default function Rating({ request, user, onClose, onSuccess }) {
  const [ratingScore, setRatingScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (ratingScore === 0) {
      alert("Please select a score using the stars before submitting.");
      return;
    }

    // Seguridad: Si 'owner_id' no viene adjunto, usamos el 'user_id' asociado a la publicación original
    const targetUserId = request.owner_id || request.food_user_id;

    try {
      const response = await fetch("http://88.200.63.148:30096/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: ratingScore,
          comment: ratingComment.trim() || null,
          food_listing_id: request.food_listing_id,
          from_user_id: user.id,
          to_user_id: targetUserId 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        alert("Thank you for your feedback!");
        onSuccess(request.id); // Notifica al padre (MyRequests) para marcar como "Rated ✓"
        onClose();            // Cierra el modal de inmediato
      } else {
        alert(data.message || "Error submitting feedback.");
      }
    } catch (err) {
      console.error("Error writing rating transaction logs:", err);
      alert("Network error. Could not save your review.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose}>&times;</button>
        
        <h3>Rate your experience</h3>
        <p className="modal-subtitle">
          How was the collection process for <strong>{request.title || "this food item"}</strong>?
        </p>
        
        <form onSubmit={handleRateSubmit} className="modal-form">
          
          <div className="modal-stars-section">
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((index) => {
                const isFilled = hoverScore > 0 ? index <= hoverScore : index <= ratingScore;
                return (
                  <span
                    key={index}
                    className={`modal-star-token ${isFilled ? "filled" : "empty"}`}
                    onMouseEnter={() => setHoverScore(index)}
                    onMouseLeave={() => setHoverScore(0)}
                    onClick={() => setRatingScore(index)}
                    style={{ cursor: "pointer", fontSize: "2rem", color: isFilled ? "#ffb703" : "#e0e0e0" }}
                  >
                    ★
                  </span>
                );
              })}
            </div>
            <span className="score-hint">
              {ratingScore > 0 ? `${ratingScore} / 5 Stars` : "Select stars"}
            </span>
          </div>

          <div className="modal-input-group">
            <label htmlFor="modal-comment">Leave a public comment (optional):</label>
            <textarea
              id="modal-comment"
              rows={4}
              placeholder="Share details about the food quality, punctuality or kindness..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Submit Review</button>
          </div>
        </form>
      </div>
    </div>
  );
}