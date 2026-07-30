import React, { useState } from "react";
import Navbar from "./components/Navbar";
import DoctorList from "./components/DoctorList";

import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("doctors");

  if (!user) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      {/* Main Navigation Bar */}
      <div className="bg-white border-bottom py-2 shadow-sm">
        <div className="container d-flex gap-2">
          <button
            className={`btn btn-sm fw-semibold ${
              activeTab === "doctors" ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setActiveTab("doctors")}
          >
            🩺 Doctor Catalog
          </button>

          {/* Patient Navigation */}
          {user.role === "patient" && (
            <button
              className={`btn btn-sm fw-semibold ${
                activeTab === "appointments" ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              📅 My Appointments
            </button>
          )}

          {/* Doctor Navigation */}
          {user.role === "doctor" && (
            <button
              className={`btn btn-sm fw-semibold ${
                activeTab === "schedule" ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              📋 Patient Schedule
            </button>
          )}

          {/* Admin Navigation */}
          {user.role === "admin" && (
            <>
              <button
                className={`btn btn-sm fw-semibold ${
                  activeTab === "schedule" ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setActiveTab("schedule")}
              >
                📋 All Bookings
              </button>
              <button
                className={`btn btn-sm fw-semibold ${
                  activeTab === "admin" ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setActiveTab("admin")}
              >
                ⚙️ Admin Management
              </button>
            </>
          )}
        </div>
      </div>

      {/* Render Selected View */}
      {activeTab === "admin" && user.role === "admin" && <AdminPage />}
      {activeTab === "schedule" && (user.role === "doctor" || user.role === "admin") && (
        <DoctorDashboard />
      )}
      {activeTab === "appointments" && user.role === "patient" && (
        <PatientDashboard />
      )}
      {activeTab === "doctors" && <DoctorList />}
    </div>
  );
}

export default App;