import { Link } from 'react-router';

export default function Menu() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo"></span>
        <span className="brand-name">ReNourish</span>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/food-near-me">Food near me</Link>
        <Link to="/about">About us</Link>
        <Link to="/login" className="login-btn">Login</Link>
      </div>
    </nav>
  );
}