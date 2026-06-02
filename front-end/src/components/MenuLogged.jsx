import { NavLink } from 'react-router';
import logo from '../assets/logo.png';
import title from '../assets/title.png';

export default function Menu() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img className="logo" src={logo} alt="ReNourish" />
        <img className="brand-title" src={title} alt="ReNourish"/>
      </div>

      <div className="navbar-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/food-near-me">Food near me</NavLink>
        <NavLink to="/aboutus">About us</NavLink>
        <NavLink to="/profile" className="login-btn">Profile</NavLink>
      </div>
    </nav>
  );
}