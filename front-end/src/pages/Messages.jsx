import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import "./Messages.css";

export default function Messages({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const listingTitle = searchParams.get("title") || "Food Chat";
  const listingImage = searchParams.get("image") || null;

  const queryParams = new URLSearchParams(window.location.search);
  const listingId = queryParams.get("listingId");
  const buyerId = queryParams.get("buyerId");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 1. Unified function to fetch chat messages with custom bilateral privacy variables
  const fetchChatLogs = async () => {
    if (!listingId || !buyerId) return;
    try {
      const response = await fetch(`http://88.200.63.148:30096/messages?listingId=${listingId}&buyerId=${buyerId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading secure private chat records:", err);
    }
  };

  // 2. Initial load effect combined with a passive poll cycle to check for new external answers
  useEffect(() => {
    fetchChatLogs();

    // Set up a structural live updates interval pooling data every 3 seconds
    const chatIntervalId = setInterval(() => {
      fetchChatLogs();
    }, 3000);

    // Wipe down interval loops when the user shifts away or closes down this screen viewport
    return () => clearInterval(chatIntervalId);
  }, [listingId, buyerId]);

  // 3. Dispatch a new messaging row string execution
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch("http://88.200.63.148:30096/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim(),
          user_id: user.id,
          food_listing_id: listingId
        }),
      });

      if (response.ok) {
        setNewMessage("");
        // FIX: Re-fetch logs passing the proper parameters instantly to refresh state data arrays
        fetchChatLogs(); 
      }
    } catch (err) {
      alert("Failed to submit connection log.");
    }
  };

  if (!user) return <div className="chat-fallback"><p>Please log in to use the chat network interface.</p></div>;

  return (
    <main className="chat-web-container-single">
      
      {/* HEADER: Integrated Back Button, Avatar and Title into a single web row layout */}
      <div className="chat-header-single">
        <button onClick={() => navigate(-1)} className="header-back-btn">
          &larr; Back to Platform
        </button>
        
        <div className="header-divider-pipe"></div>

        <div className="header-avatar-box">
          {listingImage ? (
            <img src={listingImage} alt="mini-avatar" className="header-mini-avatar" />
          ) : (
            <div className="header-mini-placeholder">🍎</div>
          )}
        </div>
        
        <h2>{listingTitle}</h2>
      </div>

      {/* MESSAGES HISTORY CONTAINER */}
      <div className="chat-box">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <p>No messages exchanged yet. Break the ice to coordinate pickup details!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.user_id === user.id;
            return (
              <div key={msg.id || msg.sent_at} className={`message-row ${isMine ? "mine" : "others"}`}>
                <div className="message-bubble">
                  <span className="sender-name">{msg.first_name}</span>
                  <p className="message-content">{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER INPUT BAR */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          placeholder="Write an internal coordination message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-btn" aria-label="Send Message">&#9650;</button>
      </form>

    </main>
  );
}