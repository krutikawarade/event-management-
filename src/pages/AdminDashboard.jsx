import React, { useCallback, useEffect, useState } from "react";
import { useEvents } from "../context/EventsContext";
import { fetchBookings, fetchUsers } from "../api/userBookingApi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const {
    events,
    loading,
    updateEventMeta,
    updateEventPlans,
    addEvent,
    removeEvent,
    getById
  } = useEvents();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    category: "",
    subEvent: "",
    title: "",
    date: "",
    location: "",
    imageKey: "conference",
    totalTickets: 0,
  });
  const [newEvent, setNewEvent] = useState({
    category: "Corporate",
    subEvent: "",
    title: "",
    date: "",
    location: "",
    imageKey: "",
    customImage: null,
    totalTickets: 0,
  });
  const [message, setMessage] = useState(null);
  const [tab, setTab] = useState("events");
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [planEditorEventId, setPlanEditorEventId] = useState(null);
  const [planDrafts, setPlanDrafts] = useState([]);
  const [newPlanDrafts, setNewPlanDrafts] = useState([]);

  const refreshDirectory = useCallback(() => {
    Promise.all([fetchUsers(), fetchBookings()])
      .then(([usersData, bookingsData]) => {
        setUsers(Array.isArray(usersData) ? usersData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      })
      .catch(() => {
        setUsers([]);
        setBookings([]);
      });
  }, []);

  useEffect(() => {
    refreshDirectory();
    const onChange = () => refreshDirectory();
    window.addEventListener("eventify-data-changed", onChange);
    return () => {
      window.removeEventListener("eventify-data-changed", onChange);
    };
  }, [refreshDirectory]);

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setDraft({
      category: ev.category || "",
      subEvent: ev.subEvent || "",
      title: ev.title,
      date: ev.date,
      location: ev.location,
      imageKey: ev.imageKey || "conference",
      totalTickets: Number(ev.totalTickets) || 0,
    });
    setMessage(null);
  };

  const save = async (id) => {
    const res = await updateEventMeta(id, {
      category: draft.category ?? "",
      subEvent: draft.subEvent ?? "",
      title: draft.title.trim(),
      date: draft.date.trim(),
      location: draft.location.trim(),
      imageKey: draft.imageKey?.trim() || "conference",
      totalTickets: Number(draft.totalTickets) || 0,
    });
    if (res.ok) {
      setEditingId(null);
      setMessage({ type: "ok", text: "Event updated." });
    } else {
      setMessage({ type: "err", text: res.error || "Update failed." });
    }
  };

  const create = async () => {
    const createPlansPayload = newPlanDrafts
      .map((p, idx) => ({
        tierName: (p.tierName || "").trim(),
        price: Number(p.price) || 0,
        sortOrder: Number(p.sortOrder) || idx + 1,
        features: (p.featuresText || "")
          .split(/\r?\n/)
          .map((f) => f.trim())
          .filter(Boolean),
      }))
      .filter((p) => p.tierName);

    const res = await addEvent({
      category: newEvent.category.trim() || "Corporate",
      subEvent: newEvent.subEvent.trim(),
      title: newEvent.title.trim(),
      date: newEvent.date.trim(),
      location: newEvent.location.trim(),
      imageKey: newEvent.imageKey || "",
      customImage: newEvent.customImage || null,
      totalTickets: Number(newEvent.totalTickets) || 0,
    });
    if (res.ok) {
      if (res.eventId && createPlansPayload.length > 0) {
        await updateEventPlans(res.eventId, createPlansPayload);
      }
      setNewEvent({
        category: "Corporate",
        subEvent: "",
        title: "",
        date: "",
        location: "",
        imageKey: "",
        customImage: null,
        totalTickets: 0,
      });
      setNewPlanDrafts([]);
      setMessage({ type: "ok", text: "Event created." });
    } else {
      setMessage({ type: "err", text: res.error || "Create failed." });
    }
  };

  const remove = async (id) => {
    const res = await removeEvent(id);
    if (res.ok) {
      setMessage({ type: "ok", text: "Event deleted." });
    } else {
      setMessage({ type: "err", text: res.error || "Delete failed." });
    }
  };

  const removeImage = async (ev) => {
    const res = await updateEventMeta(ev.id, {
      category: ev.category ?? "",
      subEvent: ev.subEvent ?? "",
      title: ev.title ?? "",
      date: ev.date ?? "",
      location: ev.location ?? "",
      imageKey: "",
      customImage: "",
      totalTickets: Number(ev.totalTickets) || 0,
    });
    if (res.ok) {
      setMessage({ type: "ok", text: "Event image reset." });
    } else {
      setMessage({ type: "err", text: res.error || "Image reset failed." });
    }
  };

  const startPlanEdit = (ev) => {
    const latest = getById(ev.id) || ev;
    const plans = Array.isArray(latest.plans) ? latest.plans : [];
    setPlanEditorEventId(ev.id);
    setPlanDrafts(
      plans.map((p, idx) => ({
        tierName: p.tierName || "",
        price: Number(p.price) || 0,
        sortOrder: Number(p.sortOrder) || idx + 1,
        featuresText: Array.isArray(p.features) ? p.features.join("\n") : "",
      }))
    );
  };

  const addPlanDraft = () => {
    setPlanDrafts((prev) => [
      ...prev,
      { tierName: "", price: 0, sortOrder: prev.length + 1, featuresText: "" },
    ]);
  };

  const removePlanDraft = (idx) => {
    setPlanDrafts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePlanDraft = (idx, key, value) => {
    setPlanDrafts((prev) =>
      prev.map((plan, i) => (i === idx ? { ...plan, [key]: value } : plan))
    );
  };

  const savePlans = async () => {
    if (!planEditorEventId) return;
    const payload = planDrafts.map((p, idx) => ({
      tierName: p.tierName.trim(),
      price: Number(p.price) || 0,
      sortOrder: Number(p.sortOrder) || idx + 1,
      features: p.featuresText
        .split(/\r?\n/)
        .map((f) => f.trim())
        .filter(Boolean),
    }));
    const res = await updateEventPlans(planEditorEventId, payload);
    if (res.ok) {
      setMessage({ type: "ok", text: "Plans updated." });
      setPlanEditorEventId(null);
      setPlanDrafts([]);
    } else {
      setMessage({ type: "err", text: res.error || "Plan update failed." });
    }
  };

  const addNewPlanDraft = () => {
    setNewPlanDrafts((prev) => [
      ...prev,
      { tierName: "", price: 0, sortOrder: prev.length + 1, featuresText: "" },
    ]);
  };

  const removeNewPlanDraft = (idx) => {
    setNewPlanDrafts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateNewPlanDraft = (idx, key, value) => {
    setNewPlanDrafts((prev) =>
      prev.map((plan, i) => (i === idx ? { ...plan, [key]: value } : plan))
    );
  };

  const readImageAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Image read failed"));
      reader.readAsDataURL(file);
    });

  const uploadImageForEvent = async (ev, file) => {
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      const res = await updateEventMeta(ev.id, {
        category: ev.category ?? "",
        subEvent: ev.subEvent ?? "",
        title: ev.title ?? "",
        date: ev.date ?? "",
        location: ev.location ?? "",
        imageKey: ev.imageKey ?? "conference",
        customImage: dataUrl,
        totalTickets: Number(ev.totalTickets) || 0,
      });
      if (res.ok) {
        setMessage({ type: "ok", text: "Image uploaded." });
      } else {
        setMessage({ type: "err", text: res.error || "Image upload failed." });
      }
    } catch {
      setMessage({ type: "err", text: "Image upload failed." });
    }
  };

  const uploadImageForNewEvent = async (file) => {
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      setNewEvent((prev) => ({ ...prev, customImage: dataUrl }));
      setMessage({ type: "ok", text: "Image selected for new event." });
    } catch {
      setMessage({ type: "err", text: "Could not read selected image." });
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <h1>Admin</h1>
          {/* <p className="admin-sub">
            Manage events, registered users, and bookings. Only admins can edit
            dates, locations, and seat limits.
            {usingApi
              ? " Event edits sync to the server."
              : " Event API unavailable (no server sync)."}
          </p> */}
        </div>
        {/* <button type="button" className="admin-btn ghost" onClick={refreshEvents}>
          Refresh from DB
        </button>  */}
      </header>

      {message && (
        <div className={`admin-banner ${message.type}`}>{message.text}</div>
      )}

      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "events"}
          className={tab === "events" ? "active" : ""}
          onClick={() => setTab("events")}
        >
          Events
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "users"}
          className={tab === "users" ? "active" : ""}
          onClick={() => setTab("users")}
        >
          Users ({users.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "bookings"}
          className={tab === "bookings" ? "active" : ""}
          onClick={() => setTab("bookings")}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {tab === "events" && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Event</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Total Seats</th>
                  <th>Image</th>
                  <th>Plans</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input
                      className="admin-input"
                      value={newEvent.category}
                      onChange={(e) =>
                        setNewEvent((prev) => ({ ...prev, category: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={newEvent.subEvent}
                      onChange={(e) =>
                        setNewEvent((prev) => ({ ...prev, subEvent: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent((prev) => ({ ...prev, location: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      value={newEvent.totalTickets}
                      onChange={(e) =>
                        setNewEvent((prev) => ({ ...prev, totalTickets: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <div className="admin-actions">
                      <label className="admin-btn ghost admin-upload-btn">
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => uploadImageForNewEvent(e.target.files?.[0])}
                        />
                      </label>
                      {newEvent.customImage && (
                        <button
                          type="button"
                          className="admin-btn ghost"
                          onClick={() =>
                            setNewEvent((prev) => ({
                              ...prev,
                              imageKey: "",
                              customImage: "",
                            }))
                          }
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <button type="button" className="admin-btn ghost" onClick={addNewPlanDraft}>
                      Add plan ({newPlanDrafts.length})
                    </button>
                  </td>
                  <td className="admin-actions">
                    <button type="button" className="admin-btn primary" onClick={create}>
                      Add event
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="admin-plans-editor">
            <h3>Plans for new event</h3>
            {newPlanDrafts.length === 0 ? (
              <p className="admin-muted">No plans added yet.</p>
            ) : (
              newPlanDrafts.map((plan, idx) => (
                <div className="admin-plan-row" key={`new-${idx}`}>
                  <input
                    className="admin-input"
                    placeholder="Tier name"
                    value={plan.tierName}
                    onChange={(e) => updateNewPlanDraft(idx, "tierName", e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={plan.price}
                    onChange={(e) => updateNewPlanDraft(idx, "price", e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    min="1"
                    placeholder="Order"
                    value={plan.sortOrder}
                    onChange={(e) => updateNewPlanDraft(idx, "sortOrder", e.target.value)}
                  />
                  <textarea
                    className="admin-input admin-plan-features"
                    placeholder="One feature per line"
                    value={plan.featuresText}
                    onChange={(e) => updateNewPlanDraft(idx, "featuresText", e.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-btn ghost"
                    onClick={() => removeNewPlanDraft(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
            <div className="admin-plan-actions">
              <button type="button" className="admin-btn ghost" onClick={addNewPlanDraft}>
                Add plan
              </button>
            </div>
          </div>
          {loading ? (
            <p className="admin-muted">Loading events…</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Sub-event</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Total Seats</th>
                    <th>Sold</th>
                    <th>Available</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => {
                    const withStats = getById(ev.id) || ev;
                    return (
                    <tr key={ev.id}>
                      <td>{withStats.id}</td>
                      <td>
                        {editingId === ev.id ? (
                          <input
                            className="admin-input"
                            value={draft.category}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, category: e.target.value }))
                            }
                          />
                        ) : (
                          withStats.category
                        )}
                      </td>
                      <td>
                        {editingId === ev.id ? (
                          <input
                            className="admin-input"
                            value={draft.subEvent}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, subEvent: e.target.value }))
                            }
                          />
                        ) : (
                          withStats.subEvent || "—"
                        )}
                      </td>
                      <td>
                        {editingId === ev.id ? (
                          <input
                            className="admin-input"
                            value={draft.title}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, title: e.target.value }))
                            }
                          />
                        ) : (
                          withStats.title
                        )}
                      </td>
                      <td>
                        {editingId === ev.id ? (
                          <input
                            className="admin-input"
                            value={draft.date}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, date: e.target.value }))
                            }
                          />
                        ) : (
                          ev.date
                        )}
                      </td>
                      <td>
                        {editingId === ev.id ? (
                          <input
                            className="admin-input"
                            value={draft.location}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                location: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          ev.location
                        )}
                      </td>
                      <td>
                        {editingId === ev.id ? (
                          <input
                            className="admin-input"
                            type="number"
                            min="0"
                            value={draft.totalTickets}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                totalTickets: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          withStats.totalTickets
                        )}
                      </td>
                      <td>{withStats.soldTickets ?? 0}</td>
                      <td>{withStats.availableTickets ?? withStats.totalTickets ?? 0}</td>
                      <td className="admin-actions">
                        {editingId === ev.id ? (
                          <>
                            <button
                              type="button"
                              className="admin-btn primary"
                              onClick={() => save(ev.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="admin-btn ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn primary"
                            onClick={() => startEdit(ev)}
                          >
                            Edit event
                          </button>
                        )}
                        {editingId !== ev.id && (
                          <label className="admin-btn ghost admin-upload-btn">
                            Upload image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => uploadImageForEvent(withStats, e.target.files?.[0])}
                            />
                          </label>
                        )}
                        {editingId !== ev.id && (
                          <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() => removeImage(withStats)}
                          >
                            Remove image
                          </button>
                        )}
                        {editingId !== ev.id && (
                          <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() => startPlanEdit(ev)}
                          >
                            Edit plans
                          </button>
                        )}
                        {editingId !== ev.id && (
                          <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() => remove(ev.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
          {planEditorEventId && (
            <div className="admin-plans-editor">
              <h3>
                Edit plans for {getById(planEditorEventId)?.title || `Event #${planEditorEventId}`}
              </h3>
              {planDrafts.map((plan, idx) => (
                <div className="admin-plan-row" key={`${plan.tierName}-${idx}`}>
                  <input
                    className="admin-input"
                    placeholder="Tier name"
                    value={plan.tierName}
                    onChange={(e) => updatePlanDraft(idx, "tierName", e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={plan.price}
                    onChange={(e) => updatePlanDraft(idx, "price", e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    min="1"
                    placeholder="Order"
                    value={plan.sortOrder}
                    onChange={(e) => updatePlanDraft(idx, "sortOrder", e.target.value)}
                  />
                  <textarea
                    className="admin-input admin-plan-features"
                    placeholder="One feature per line"
                    value={plan.featuresText}
                    onChange={(e) => updatePlanDraft(idx, "featuresText", e.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-btn ghost"
                    onClick={() => removePlanDraft(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="admin-plan-actions">
                <button type="button" className="admin-btn ghost" onClick={addPlanDraft}>
                  Add plan
                </button>
                <button type="button" className="admin-btn primary" onClick={savePlans}>
                  Save plans
                </button>
                <button
                  type="button"
                  className="admin-btn ghost"
                  onClick={() => {
                    setPlanEditorEventId(null);
                    setPlanDrafts([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "users" && (
        <div className="admin-table-wrap">
          {users.length === 0 ? (
            <p className="admin-empty">
              No registered users yet. Users appear after they create an account
              from Login / Register.
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="admin-muted-cell">
                      {u.registeredAt
                        ? new Date(u.registeredAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div className="admin-table-wrap">
          {bookings.length === 0 ? (
            <p className="admin-empty">
              No bookings yet. Completed bookings from attendees show up here.
            </p>
          ) : (
            <table className="admin-table admin-table-bookings">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Plan</th>
                  <th>Guest</th>
                  <th>Email</th>
                  <th>Tickets</th>
                  <th>Booked</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="cell-strong">{b.eventTitle}</div>
                      <div className="cell-sub">
                        {b.eventDate} · {b.eventLocation}
                      </div>
                    </td>
                    <td>{b.planTier || "—"}</td>
                    <td>{b.guestName}</td>
                    <td>{b.guestEmail}</td>
                    <td>{b.tickets}</td>
                    <td className="admin-muted-cell">
                      {b.bookedAt
                        ? new Date(b.bookedAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
