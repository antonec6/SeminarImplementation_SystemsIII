import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "./Register.css";

export default function Register() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://88.200.63.148:30096/users/register", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          email: email, 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Account created successfully!");
      navigate("/login"); // Te manda al login al terminar

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="reg-container">
      <div className="reg-card">
        <form className="reg-form" onSubmit={handleSubmit}>
          
          {error && <p style={{ color: "#ff4d4d", fontSize: "0.9rem", margin: "0 0 15px 0", fontWeight: "600" }}>{error}</p>}
          
          {/* First Name */}
          <div className="input-group">
            <label htmlFor="firstName">First Name:</label>
            <input 
              type="text" 
              id="firstName" 
              required 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="input-group">
            <label htmlFor="lastName">Last Name:</label>
            <input 
              type="text" 
              id="lastName" 
              required 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* E-mail */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm password:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="reg-submit-btn">
            Create account
          </button>

          <p className="reg-switch-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
          
        </form>
      </div>
    </main>
  );
}