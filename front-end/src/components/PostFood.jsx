import { useState, useEffect } from "react";
import "./PostFood.css";

// FIX: Added 'editItem' and 'onSuccess' to props for handling updates
export default function PostFood({ isOpen, onClose, user, editItem = null, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dietary_details: "",
    quantity: 1,
    expiration_date: "",
    image_url: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync modal state whenever it opens or when editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // Mode: Edit - Pre-populate form with existing database records
        setFormData({
          title: editItem.title || "",
          description: editItem.description || "",
          dietary_details: editItem.dietary_details || "",
          quantity: editItem.quantity || 1,
          // Format SQL timestamp string safely into YYYY-MM-DD for the date input field
          expiration_date: editItem.expiration_date ? editItem.expiration_date.split("T")[0] : "",
          image_url: editItem.image_url || ""
        });
      } else {
        // Mode: Create - Reset state to initial empty structure
        setFormData({ title: "", description: "", dietary_details: "", quantity: 1, expiration_date: "", image_url: "" });
      }
    }
  }, [isOpen, editItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine target API endpoint and HTTP method dynamically based on context mode
      const url = editItem 
        ? `http://88.200.63.148:30096/food-listings/${editItem.id}`
        : "http://88.200.63.148:30096/food-listings";
        
      const method = editItem ? "PUT" : "POST";

      const payload = {
        title: formData.title,
        description: formData.description || null,
        dietary_details: formData.dietary_details || null,
        quantity: parseInt(formData.quantity, 10),
        expiration_date: formData.expiration_date,
        image_url: formData.image_url.trim() !== "" ? formData.image_url.trim() : null,
        user_id: user.id
      };

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || `Failed to ${editItem ? "update" : "post"} the food listing.`);
      }

      alert(editItem ? "Food listing updated successfully!" : "Food posted successfully!");
      
      if (onSuccess) onSuccess(); // Notify parent window to trigger UI refreshing pipeline
      onClose(); 
      
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Dynamic header title based on modal behavior context state */}
        <h2 className="post-modal-title">{editItem ? "Edit Food Listing" : "Create Post"}</h2>
        
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label>Title:</label>
            <input 
              type="text" name="title" required 
              value={formData.title} onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea 
              name="description" rows="3"
              value={formData.description} onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Dietary details:</label>
            <input 
              type="text" name="dietary_details" 
              value={formData.dietary_details} onChange={handleChange} 
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Quantity:</label>
              <input 
                type="number" name="quantity" min="1" required 
                value={formData.quantity} onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Expiration date:</label>
              <input 
                type="date" name="expiration_date" required 
                value={formData.expiration_date} onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL:</label>
            <input 
              type="url" name="image_url" placeholder="https://example.com/image.jpg"
              value={formData.image_url} onChange={handleChange} 
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="post-btn">
              {isSubmitting ? (editItem ? "Saving..." : "Posting...") : (editItem ? "Save Changes" : "Post")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}