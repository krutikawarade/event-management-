import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import "./EventDetails.css";

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getById } = useEvents();
  const { isUserLoggedIn } = useAuth();

  const fromState = location.state;
  const fromStore = fromState?.id != null ? getById(fromState.id) : null;
  const event =
    fromState &&
    (fromState.id == null
      ? fromState
      : {
          ...fromState,
          ...fromStore,
        });

  const eventPlans = useMemo(
    () => (Array.isArray(event?.plans) ? event.plans.filter((p) => p?.tierName) : []),
    [event?.plans]
  );
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const selectedPlan = eventPlans[selectedPlanIndex] || null;

  useEffect(() => {
    if (event?.id != null) {
      setSelectedPlanIndex(0);
    }
  }, [event?.id]);

  if (!event) {
    return (
      <div className="empty-state">
        <h2>No event selected</h2>
        <p>Browse categories from the home page to pick an event.</p>
        <button type="button" onClick={() => navigate("/")}>
          Go home
        </button>
      </div>
    );
  }

  const bookingPayload = {
    id: event.id,
    title: event.title,
    category: event.category,
    date: event.date,
    location: event.location,
    image: event.image,
    totalTickets: event.totalTickets,
    soldTickets: event.soldTickets,
    availableTickets: event.availableTickets,
    selectedPlan,
  };

  const handleBook = () => {
    if (isUserLoggedIn) {
      navigate("/booking", { state: bookingPayload });
      return;
    }
    navigate("/auth", {
      state: {
        redirect: { to: "/booking", state: bookingPayload },
        message: "Sign in or create an account to book this event.",
      },
    });
  };

  return (
    <div className="details-page">
      <div className="details-card">
        <div className="details-top">
          <div className="details-media">
            {event.image ? (
              <img src={event.image} alt={event.title} />
            ) : (
              <div className="details-no-image">No image</div>
            )}
          </div>

          <div className="details-content">
            <p className="details-category">{event.category}</p>
            <h1>{event.title}</h1>
            <ul className="details-meta">
              <li>
                <span className="meta-icon" aria-hidden>
                  📅
                </span>
                <span>{event.date}</span>
              </li>
              <li>
                <span className="meta-icon" aria-hidden>
                  📍
                </span>
                <span>{event.location}</span>
              </li>
            </ul>

            <p className="desc">
              Join us for an unforgettable experience. Secure your spot — limited
              capacity and curated for our Eventify community.
            </p>
            <p className="desc">
              Ticket status: {event.availableTickets} available and {event.soldTickets} sold.
            </p>
          </div>
        </div>

        {eventPlans.length > 0 && (
          <section className="details-packages" aria-label="Event packages">
            <h2>Packages</h2>
            <div className="details-packages-grid">
              {eventPlans.map((pkg, idx) => (
                <article
                  className={`details-package-card ${
                    idx === selectedPlanIndex ? "selected" : ""
                  }`}
                  key={`${pkg.tierName}-${idx}`}
                >
                  <div className="details-package-head">
                    <h3>{pkg.tierName}</h3>
                    <p className="details-package-price">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(Number(pkg.price) || 0)}
                    </p>
                  </div>
                  <ul className="details-package-features">
                    {(pkg.features || []).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="details-plan-select-btn"
                    onClick={() => setSelectedPlanIndex(idx)}
                  >
                    {idx === selectedPlanIndex ? "Selected" : "Select plan"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="details-actions">
          <button
            type="button"
            className="details-cta"
            onClick={handleBook}
            disabled={event.availableTickets === 0 || (eventPlans.length > 0 && !selectedPlan)}
          >
            {event.availableTickets === 0
              ? "Sold out"
              : eventPlans.length > 0 && !selectedPlan
                ? "Select a plan"
                : "Book now"}
          </button>
          {!isUserLoggedIn && (
            <p className="details-login-note">
              You will be asked to sign in or register before confirming your
              booking.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
