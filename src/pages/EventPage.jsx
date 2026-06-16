import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvents } from "../context/EventsContext";
import "./EventPage.css";

const EventPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { getByCategory, loading } = useEvents();

  const categoryLabel = category || "All";
  const events = getByCategory(category) || [];

  return (
    <div className="event-page">
      <header className="event-page-header">
        <p className="event-page-eyebrow">Browse</p>
        <h1>{categoryLabel} events</h1>
        <p className="event-page-sub">
          Choose from upcoming corporate experiences and book your seats.
        </p>
      </header>

      {loading ? (
        <p className="event-loading">Loading events…</p>
      ) : (
        <div className="event-container">
          {events.map((event) => (
            <article className="event-card" key={event.id}>
              <div className="event-card-image">
                {event.image ? (
                  <img src={event.image} alt={event.title} />
                ) : (
                  <div className="event-card-no-image">No image</div>
                )}
              </div>
              <div className="event-card-body">
                <h3>{event.title}</h3>
                {event.subEvent && (
                  <p className="event-card-meta">Sub-event: {event.subEvent}</p>
                )}
                <p className="event-card-meta">
                  {event.date} · {event.location}
                </p>
                <p className="event-card-meta">
                  Tickets: {event.availableTickets} available · {event.soldTickets} sold
                </p>
                {event.availableTickets === 0 && (
                  <p className="event-card-meta">Status: Sold out</p>
                )}
                <button
                  type="button"
                  className="event-card-btn"
                  onClick={() =>
                    navigate("/event-details", {
                      state: {
                        id: event.id,
                        title: event.title,
                        date: event.date,
                        location: event.location,
                        image: event.image,
                        category: event.category,
                      },
                    })
                  }
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPage;
