import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import { createBooking } from "../api/userBookingApi";
import "./Booking.css";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const incomingEvent = location.state;
  const { getById } = useEvents();
  const { isUserLoggedIn, userProfile } = useAuth();
  const storeEvent = incomingEvent?.id != null ? getById(incomingEvent.id) : null;
  const event = useMemo(
    () => (incomingEvent?.id != null ? { ...storeEvent, ...incomingEvent } : incomingEvent),
    [incomingEvent, storeEvent]
  );
  const availableTickets = Number(event?.availableTickets ?? 0);
  const soldTickets = Number(event?.soldTickets ?? 0);
  const selectedPlan = event?.selectedPlan || null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tickets: "",
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const planPrice = Number(selectedPlan?.price) || 0;
  const requestedTickets = Number(formData.tickets);
  const totalAmount =
    Number.isInteger(requestedTickets) && requestedTickets > 0 ? requestedTickets * planPrice : 0;
  const canShowTotal = totalAmount > 0;

  useEffect(() => {
    if (!event?.title) {
      navigate("/", { replace: true });
    }
  }, [event, navigate]);

  useEffect(() => {
    if (!event?.title) return;
    if (!isUserLoggedIn) {
      navigate("/auth", {
        replace: true,
        state: {
          redirect: { to: "/booking", state: event },
          message: "Sign in or register to complete your booking.",
        },
      });
    }
  }, [event, isUserLoggedIn, navigate]);

  useEffect(() => {
    if (userProfile) {
      setFormData((f) => ({
        ...f,
        name: userProfile.name || f.name,
        email: userProfile.email || f.email,
      }));
    }
  }, [userProfile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let newErrors = {};
    const ticketsCount = Number(formData.tickets);

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit number";
    }

    if (!formData.tickets) {
      newErrors.tickets = "Enter number of tickets";
    } else if (!Number.isInteger(ticketsCount) || ticketsCount <= 0) {
      newErrors.tickets = "Tickets must be a positive number";
    } else if (ticketsCount > availableTickets) {
      newErrors.tickets = `Only ${availableTickets} ticket(s) are available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !event?.title) return;
    if (!selectedPlan?.tierName) {
      setSubmitError("Please select a plan before booking.");
      return;
    }
    if (!Number.isFinite(Number(event?.id))) {
      setSubmitError("Invalid event details. Please go back and select the event again.");
      return;
    }
    if (!event?.date || !event?.location) {
      setSubmitError("Event details are incomplete. Please try booking again.");
      return;
    }

    const generatedId =
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const bookingPayload = {
      id: generatedId,
      guestName: formData.name.trim(),
      guestEmail: formData.email.trim(),
      phone: formData.phone.trim(),
      tickets: Number(formData.tickets),
      eventId: Number(event.id),
      eventTitle: event.title,
      category: event.category,
      eventDate: event.date,
      eventLocation: event.location,
      planTier: selectedPlan?.tierName || "",
      planPrice: Number(selectedPlan?.price) || 0,
      accountEmail: userProfile?.email || formData.email.trim(),
      bookedAt: new Date().toISOString(),
    };

    try {
      await createBooking(bookingPayload);
      window.dispatchEvent(new Event("eventify-data-changed"));
      setDone(true);
    } catch (err) {
      setSubmitError(err?.message || "Booking failed. Try again.");
    }
  };

  if (!event?.title || !isUserLoggedIn) {
    return (
      <div className="booking-page">
        <p className="booking-loading">Redirecting…</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="booking-page">
        <div className="booking-container booking-success">
          <div className="success-icon" aria-hidden>
            ✓
          </div>
          <h2>Booking confirmed</h2>
          <p>
            You are booked for <strong>{event.title}</strong>. A confirmation has
            been recorded for your account.
          </p>
          <div className="booking-success-actions">
            <Link to="/my-bookings" className="booking-success-link">
              View my bookings
            </Link>
            <button type="button" onClick={() => navigate("/")}>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h2>Complete booking</h2>
        <p className="booking-lead">
          Signed in as <strong>{userProfile?.email}</strong>
        </p>

        <div className="event-info">
          <h3>{event.title}</h3>
          {selectedPlan && (
            <p>
              Plan: <strong>{selectedPlan.tierName}</strong> (
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(Number(selectedPlan.price) || 0)}
              )
            </p>
          )}
          <p>📅 {event.date}</p>
          <p>📍 {event.location}</p>
          <p>
            Seats: {availableTickets} available · {soldTickets} sold
          </p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <label className="booking-label">
            Full name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>
          {errors.name && <p className="error">{errors.name}</p>}

          <label className="booking-label">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          {errors.email && <p className="error">{errors.email}</p>}

          <label className="booking-label">
            Phone
            <input
              type="text"
              name="phone"
              placeholder="10-digit mobile"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
          {errors.phone && <p className="error">{errors.phone}</p>}

          <label className="booking-label">
            Tickets
            <input
              type="number"
              name="tickets"
              min="1"
              placeholder="How many?"
              value={formData.tickets}
              onChange={handleChange}
            />
          </label>
          {errors.tickets && <p className="error">{errors.tickets}</p>}
          {canShowTotal && (
            <p className="booking-total" aria-live="polite">
              Total amount:{" "}
              <strong>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(totalAmount)}
              </strong>
            </p>
          )}

          {submitError && <p className="error">{submitError}</p>}

          <button type="submit" className="booking-submit">
            Confirm booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
