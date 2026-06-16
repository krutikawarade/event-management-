import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EVENT_SEED } from "../data/eventsSeed";
import { EVENT_CATALOG_OVERRIDES } from "../data/eventCatalogOverrides";
import { attachImages } from "../utils/eventImages";
import { apiBase, authHeader } from "../api/config";
import {
  createEvent,
  deleteEvent,
  fetchBookings,
  updateEventPlans as updateEventPlansApi,
} from "../api/userBookingApi";

const EventsContext = createContext(null);
const LOCAL_EVENTS_KEY = "eventify_events_local";

function readLocalEvents() {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalEvents(events) {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // ignore quota/storage failures
  }
}

function mergeApiAndLocalEvents(apiEvents, localEvents) {
  const localList = Array.isArray(localEvents) ? localEvents : [];
  const apiList = Array.isArray(apiEvents) ? apiEvents : [];
  const localById = new Map(localList.map((event) => [Number(event.id), event]));
  const merged = apiList.map((event) => {
    const local = localById.get(Number(event.id));
    if (!local) return event;
    return {
      ...event,
      customImage: local.customImage || null,
      plans: Array.isArray(local.plans) && local.plans.length > 0 ? local.plans : event.plans,
    };
  });
  const apiIds = new Set(apiList.map((event) => Number(event.id)));
  const localOnly = localList.filter((event) => !apiIds.has(Number(event.id)));
  return [...merged, ...localOnly];
}

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingApi, setUsingApi] = useState(false);
  const [soldTicketsByEvent, setSoldTicketsByEvent] = useState({});

  const refreshSoldTickets = useCallback(async () => {
    const base = apiBase();
    if (!base) {
      setSoldTicketsByEvent({});
      return;
    }

    try {
      const data = await fetchBookings();
      const soldMap = (Array.isArray(data) ? data : []).reduce((acc, booking) => {
        const eventId = Number(booking.eventId);
        if (!Number.isFinite(eventId)) return acc;
        const tickets = Number(booking.tickets) || 0;
        acc[eventId] = (acc[eventId] || 0) + tickets;
        return acc;
      }, {});
      setSoldTicketsByEvent(soldMap);
    } catch {
      setSoldTicketsByEvent({});
    }
  }, []);

  const refreshFromApi = useCallback(async () => {
    const base = apiBase();
    try {
      const res = await fetch(`${base}/api/events`);
      if (!res.ok) throw new Error("events fetch failed");
      const data = await res.json();
      const localEvents = readLocalEvents();
      const mergedEvents = mergeApiAndLocalEvents(data, localEvents);
      setEvents(attachImages(mergedEvents));
      writeLocalEvents(mergedEvents);
      setUsingApi(true);
    } catch {
      // Backend failed (or not reachable). Show local edits first, then seed data.
      const localEvents = readLocalEvents();
      setEvents(attachImages(localEvents && localEvents.length > 0 ? localEvents : EVENT_SEED));
      setUsingApi(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refreshFromApi();
  }, [refreshFromApi]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshFromApi();
      refreshSoldTickets();
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, [refreshFromApi, refreshSoldTickets]);

  useEffect(() => {
    refreshSoldTickets();
    const onChange = () => refreshSoldTickets();
    window.addEventListener("eventify-data-changed", onChange);
    return () => {
      window.removeEventListener("eventify-data-changed", onChange);
    };
  }, [refreshSoldTickets]);

  const withTicketStats = useCallback(
    (event) => {
      const override = EVENT_CATALOG_OVERRIDES[event.id] || {};
      const plans =
        Array.isArray(event.plans) && event.plans.length > 0
          ? event.plans
          : Array.isArray(override.packages)
            ? override.packages.map((pkg, idx) => ({
                tierName: pkg.tier,
                price: pkg.price,
                features: pkg.features,
                sortOrder: idx + 1,
              }))
            : [];
      const totalTickets = Number(event.totalTickets) || 0;
      const soldTickets = soldTicketsByEvent[event.id] || 0;
      return {
        ...event,
        plans,
        totalTickets,
        soldTickets,
        availableTickets: Math.max(totalTickets - soldTickets, 0),
      };
    },
    [soldTicketsByEvent]
  );

  const getByCategory = useCallback(
    (category) => {
      const normalized = (category || "").trim().toLowerCase();
      if (!normalized || normalized === "all") {
        return events.map(withTicketStats);
      }
      return events
        .filter((e) => (e.category || "").trim().toLowerCase() === normalized)
        .map(withTicketStats);
    },
    [events, withTicketStats]
  );

  const getById = useCallback(
    (id) => {
      const found = events.find((e) => e.id === Number(id));
      return found ? withTicketStats(found) : undefined;
    },
    [events, withTicketStats]
  );

  const updateEventMeta = useCallback(
    async (id, { category, subEvent, title, date, location, imageKey, totalTickets, customImage }) => {
      const base = apiBase();
      const token = localStorage.getItem("adminToken");

      if (base && token && token !== "local-dev-token") {
        const res = await fetch(`${base}/api/admin/events/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify({
            category,
            subEvent,
            title,
            date,
            location,
            imageKey,
            totalTickets,
            customImage,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setEvents((prev) => {
            const next = prev.map((e) => {
              if (e.id !== id) return e;
              const nextEvent = {
                ...e,
                category: updated.category,
                subEvent: updated.subEvent,
                title: updated.title,
                date: updated.date,
                location: updated.location,
                imageKey: updated.imageKey,
                totalTickets: Number(updated.totalTickets) || Number(e.totalTickets) || 0,
              };
              if (customImage !== undefined) {
                nextEvent.customImage = customImage || null;
              }
              return nextEvent;
            });
            writeLocalEvents(next);
            return attachImages(next);
          });
          return { ok: true };
        }
        const text = await res.text();
        return { ok: false, error: text || res.statusText };
      }

      setEvents((prev) => {
        const next = prev.map((e) =>
          e.id === id
            ? {
                ...e,
                category: category ?? e.category ?? "",
                subEvent: subEvent ?? e.subEvent ?? "",
                title: title ?? e.title ?? "",
                date: date ?? e.date ?? "",
                location: location ?? e.location ?? "",
                imageKey: imageKey ?? e.imageKey ?? "conference",
                totalTickets: Number(totalTickets) || Number(e.totalTickets) || 0,
                customImage: customImage !== undefined ? customImage || null : e.customImage,
              }
            : e
        );
        writeLocalEvents(next);
        return attachImages(next);
      });
      window.dispatchEvent(new Event("eventify-data-changed"));
      return { ok: true };
    },
    []
  );

  const addEvent = useCallback(async (payload) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return { ok: false, error: "Admin login required." };
    try {
      const created = await createEvent(payload, token);
      setEvents((prev) => {
        const next = [
          ...prev,
          {
            ...created,
            customImage: payload.customImage || null,
          },
        ];
        writeLocalEvents(next);
        return attachImages(next);
      });
      window.dispatchEvent(new Event("eventify-data-changed"));
      return { ok: true, eventId: created.id };
    } catch (err) {
      const localId = Date.now();
      const created = {
        id: localId,
        category: payload.category,
        subEvent: payload.subEvent,
        title: payload.title,
        date: payload.date,
        location: payload.location,
        imageKey: payload.imageKey || "conference",
        customImage: payload.customImage || null,
        totalTickets: Number(payload.totalTickets) || 0,
        plans: [],
      };
      setEvents((prev) => {
        const next = [...prev, created];
        writeLocalEvents(next);
        return attachImages(next);
      });
      window.dispatchEvent(new Event("eventify-data-changed"));
      return {
        ok: true,
        eventId: localId,
        warning: err?.message || "Saved locally (API unavailable).",
      };
    }
  }, []);

  const removeEvent = useCallback(async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return { ok: false, error: "Admin login required." };
    try {
      await deleteEvent(id, token);
      setEvents((prev) => {
        const next = prev.filter((event) => event.id !== id);
        writeLocalEvents(next);
        return next;
      });
      window.dispatchEvent(new Event("eventify-data-changed"));
      return { ok: true };
    } catch (err) {
      setEvents((prev) => {
        const next = prev.filter((event) => event.id !== id);
        writeLocalEvents(next);
        return next;
      });
      window.dispatchEvent(new Event("eventify-data-changed"));
      return { ok: true, warning: err?.message || "Deleted locally (API unavailable)." };
    }
  }, []);

  const updateEventPlans = useCallback(async (id, plans) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return { ok: false, error: "Admin login required." };
    try {
      const updated = await updateEventPlansApi(id, plans, token);
      setEvents((prev) => {
        const next = prev.map((event) => (event.id === id ? { ...event, ...updated } : event));
        writeLocalEvents(next);
        return attachImages(next);
      });
      window.dispatchEvent(new Event("eventify-data-changed"));
      return { ok: true };
    } catch (err) {
      setEvents((prev) => {
        const next = prev.map((event) =>
          event.id === id ? { ...event, plans: Array.isArray(plans) ? plans : [] } : event
        );
        writeLocalEvents(next);
        return attachImages(next);
      });
      window.dispatchEvent(new Event("eventify-data-changed"));
      return { ok: true, warning: err?.message || "Plans updated locally (API unavailable)." };
    }
  }, []);

  const value = useMemo(
    () => ({
      events,
      loading,
      usingApi,
      refreshEvents: refreshFromApi,
      getByCategory,
      getById,
      updateEventMeta,
      updateEventPlans,
      addEvent,
      removeEvent,
    }),
    [
      events,
      loading,
      usingApi,
      refreshFromApi,
      getByCategory,
      getById,
      updateEventMeta,
      updateEventPlans,
      addEvent,
      removeEvent,
    ]
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
