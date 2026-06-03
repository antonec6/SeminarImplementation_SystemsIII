import { useState } from "react";
import { Link, useNavigate } from "react-router"; 
import "./Login.css";


export default function Login({ setUser }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://88.200.63.148:30096/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Incorrect email or password.");
      }

      setUser(data.user); 
      
      navigate("/");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          
          {error && <p style={{ color: "#ff4d4d", fontSize: "0.9rem", margin: "0 0 15px 0", fontWeight: "600" }}>{error}</p>}

          <div className="input-group">
            <label htmlFor="email">E-mail:</label>
            <input 
              type="email" 
              id="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            Log in
          </button>

          <p className="auth-switch-text">
            You don't have an account? <Link to="/register">Click here</Link>
          </p>
          
        </form>
      </div>
    </main>
  );
}