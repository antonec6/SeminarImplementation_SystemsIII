import logo from "../assets/logo.png";
import title from "../assets/title.png";
import "./AboutUs.css";

export default function AboutUs() {
  return (
    <main className="about-container">
      
      <section className="about-hero">
        
        {/* Logo + Slogan */}
        <div className="about-left">
          <img src={logo} alt="ReNourish Logo" className="about-logo" />
          <img src={title} alt="ReNourish Title" className="about-title" />
          <p className="about-slogan">— LESS WASTE, MORE IMPACT —</p>
        </div>

        {/* Description */}
        <div className="about-right">
          <h1 className="about-title">About Us</h1>
          <p className="about-text">
            Welcome to <strong>ReNourish</strong>, a platform born out of the necessity to change how we handle surplus food in our local communities. Our mission is simple yet powerful: to bridge the gap between people with excess food and neighbors who can make great use of it.
          </p>
          <p className="about-text">
            We believe that a sustainable future starts at home. By making it easy, safe, and quick to share meals and ingredients, we don't just reduce landfill waste, we also strengthen community bonds, one share at a time.
          </p>
        </div>

      </section>

      {/* Contact */}
      <section className="contact-section">
        <h2>Get in Touch</h2>
        <p>Have questions, feedback, or want to partner with us? Drop us a line!</p>
        
        <div className="contact-grid">
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <h3>Email</h3>
            <p>support@renourish.com</p>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <h3>Location</h3>
            <p>Koper, Slovenia</p>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📲</span>
            <h3>Phone</h3>
            <p>+34 722 18 06 03</p>
          </div>
        </div>
      </section>

    </main>
  );
}