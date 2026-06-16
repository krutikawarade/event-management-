import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchBookings } from "../api/userBookingApi";
import "./MyBookings.css";

const MyBookings = () => {
  const { userProfile } = useAuth();
  const [bookings, setBookings] = useState([]);

  const refresh = useCallback(() => {
    if (!userProfile?.email) {
      setBookings([]);
      return;
    }
    fetchBookings(userProfile.email)
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]));
  }, [userProfile?.email]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("eventify-data-changed", onChange);
    return () => {
      window.removeEventListener("eventify-data-changed", onChange);
    };
  }, [refresh]);

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-inner">
        <header className="my-bookings-header">
          <h1>My bookings</h1>
          <p className="my-bookings-lead">
            Signed in as <strong>{userProfile?.email}</strong>
          </p>
        </header>

        {bookings.length === 0 ? (
          <div className="my-bookings-empty">
            <p>You do not have any bookings yet.</p>
            <Link to="/" className="my-bookings-cta">
              Browse events
            </Link>
          </div>
        ) : (
          <ul className="my-bookings-list">
            {bookings.map((b) => (
              <li key={b.id} className="my-bookings-card">
                <div className="my-bookings-card-main">
                  <h2>{b.eventTitle}</h2>
                  <p className="my-bookings-meta">
                    {b.category && <span>{b.category}</span>}
                    {b.category && " · "}
                    {b.planTier && <span>{b.planTier}</span>}
                    {b.planTier && " · "}
                    {b.tickets} ticket{b.tickets !== 1 ? "s" : ""}
                  </p>
                  <p className="my-bookings-detail">
                    <span className="muted">When</span> {b.eventDate}
                  </p>
                  <p className="my-bookings-detail">
                    <span className="muted">Where</span> {b.eventLocation}
                  </p>
                </div>
                <div className="my-bookings-card-aside">
                  <p className="my-bookings-booked">
                    Booked{" "}
                    {b.bookedAt
                      ? new Date(b.bookedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
