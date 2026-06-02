import { Link } from "react-router";
import "./Login.css";

export default function Login() {
  return (
    <main className="auth-container">
      <div className="auth-card">
        <form className="auth-form">
          
          <div className="input-group">
            <label htmlFor="email">email:</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">password:</label>
            <input type="password" id="password" name="password" required />
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