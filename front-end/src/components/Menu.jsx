import { NavLink } from 'react-router';
import logo from '../assets/logo.png';
import title from '../assets/title.png';
import './Menu.css';

export default function Menu({user, setUser}) {

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img className="logo" src={logo} alt="ReNourish" />
        <img className="brand-title" src={title} alt="ReNourish"/>
      </div>

      <div className="navbar-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/food-near-me">Food Near Me</NavLink>
        <NavLink to="/aboutus">About Us</NavLink>
        {user ? (
          <div className="nav-profile-container">
            <NavLink to="/profile">Profile</NavLink>
          </div>
        ) : (
          <NavLink to="/login">Log In</NavLink>
        )}
      </div>
    </nav>
  );
}