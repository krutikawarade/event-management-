import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section
        className="home-hero"
        style={{
          backgroundImage: "url('/bg.jpg')",
        }}
      >
        <div className="home-hero-overlay" />
        <div className="home-hero-glow home-hero-glow-one" />
        <div className="home-hero-glow home-hero-glow-two" />
        <div className="home-hero-inner">
         
          <p className="home-eyebrow">Plan less, experience more</p>
          <h1>
            Modern Corporate Events,
            <br />
            <span className="home-gradient">Built For Teams.</span>
          </h1>
          <p className="home-tagline">
            Discover premium corporate events and book events with real-time
            availability.
          </p>
          <div className="home-hero-actions">
            <button
              type="button"
              className="home-btn primary"
              onClick={() => navigate("/events/Corporate")}
            >
              Explore events
            </button>
            <button
              type="button"
              className="home-btn ghost"
              onClick={() => navigate("/auth")}
            >
              Sign in to book
            </button>
          </div>
        </div>
      </section>

      <section className="home-categories">
        <div className="home-categories-inner">
          <h2>Corporate Events</h2>
          

          <div className="card-container">
            <article className="card">
              <div className="icon" aria-hidden>
              </div>
              <h3>Events</h3>
              <p>Conferences, summits, meetups, outings and professional networking events.</p>
              <button type="button" onClick={() => navigate("/events/Corporate")}>
                Browse Events
              </button>
            </article>

            <article className="card card-feature">
              <h3>Why Teams use this</h3>
              <ul className="feature-list">
                <li>Easy event discovery for corporate audiences</li>
                <li>Live sold/available seat tracking</li>
                <li>Admin controls for seat limits and schedules</li>
              </ul>
            </article> 
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
