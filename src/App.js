import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { EventsProvider } from "./context/EventsContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EventPage from "./pages/EventPage";
import EventDetails from "./pages/EventDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import ProtectedUserRoute from "./components/ProtectedUserRoute";

function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <Router>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/events/:category" element={<EventPage />} />
            <Route path="/event-details" element={<EventDetails />} />
            <Route path="/booking" element={<Booking />} />
            <Route
              path="/my-bookings"
              element={
                <ProtectedUserRoute>
                  <MyBookings />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </EventsProvider>
    </AuthProvider>
  );
}

export default App;
