import { Link } from "react-router";
import "./Home.css";

export default function Home() {
  return (
    <main className="home-container">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">A community-driven food sharing platform</h1>
        <p className="hero-subtitle">
          Connecting neighbors to share surplus food, support one another, and reduce waste.
        </p>
        <Link to="/food-near-me" className="cta-button">
          Explore Food Near Me
        </Link>
      </section>

      {/* 2. Why use ReNourish */}
      <section className="info-section">
        <h2 className="section-title">Why use ReNourish?</h2>
        <div className="info-grid">
          <article className="info-card">
            <h3>Form a Connection</h3>
            <p>Get in touch with people nearby who have extra meals, ingredients, or cooking supplies to share.</p>
          </article>

          <article className="info-card">
            <h3>Save the Planet</h3>
            <p>Every listing you claim or share means less food ends up rotting in landfills, reducing carbon footprint.</p>
          </article>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="info-section">
        <h2 className="section-title">How it works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Find Food</h3>
            <p>Explore listings near you posted by neighbors or local businesses.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Send a Message</h3>
            <p>Coordinate a safe and quick pickup location through our chat.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Share & Enjoy</h3>
            <p>Collect your food, reduce waste, and enjoy a fresh meal!</p>
          </div>
        </div>
      </section>

      {/*4. Impact Statistics */}
      <section className="impact-section">
        <h2 className="section-title-alt">Our Community Impact</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">1,240+</span>
            <span className="stat-label">Meals Shared</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">450 kg</span>
            <span className="stat-label">Food Waste Prevented</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">800+</span>
            <span className="stat-label">Active Neighbors</span>
          </div>
        </div>
      </section>
    </main>
  );
}