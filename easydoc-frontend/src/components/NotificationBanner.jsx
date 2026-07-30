import React from "react";

function NotificationBanner({ user, appointments }) {
  if (!appointments || appointments.length === 0) return null;

  // 1. PATIENT NOTIFICATION LOGIC
  if (user?.role === "patient") {
    // Find latest updated appointment (Confirmed or Cancelled)
    const recentStatusChange = appointments.find(
      (app) => app.status === "Confirmed" || app.status === "Cancelled"
    );

    if (!recentStatusChange) return null;

    const isApproved = recentStatusChange.status === "Confirmed";

    return (
      <div
        className={`alert ${
          isApproved ? "alert-success" : "alert-warning"
        } alert-dismissible fade show d-flex align-items-center shadow-sm mb-4`}
        role="alert"
      >
        <span className="fs-5 me-2">{isApproved ? "🎉" : "⚠️"}</span>
        <div>
          <strong>Appointment Status Update:</strong> Your appointment with{" "}
          <strong>{recentStatusChange.doctor_name || "your doctor"}</strong> on{" "}
          <strong>
            {new Date(recentStatusChange.appointment_date).toLocaleDateString()}
          </strong>{" "}
          has been marked as{" "}
          <span
            className={`badge ${
              isApproved ? "bg-success" : "bg-danger"
            } text-uppercase ms-1`}
          >
            {recentStatusChange.status}
          </span>.
        </div>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    );
  }

  // 2. DOCTOR NOTIFICATION LOGIC
  if (user?.role === "doctor") {
    // Find the next upcoming confirmed or pending appointment
    const upcoming = appointments.find(
      (app) => app.status !== "Cancelled"
    );

    if (!upcoming) return null;

    return (
      <div
        className="alert alert-info alert-dismissible fade show d-flex align-items-center shadow-sm mb-4 border-info"
        role="alert"
      >
        <span className="fs-5 me-2">⏰</span>
        <div>
          <strong>Next Upcoming Appointment:</strong> Patient{" "}
          <strong>{upcoming.patient_name || upcoming.patient_email}</strong> is scheduled for{" "}
          <strong>
            {new Date(upcoming.appointment_date).toLocaleDateString()}
          </strong>{" "}
          at <strong>{upcoming.appointment_time}</strong>.
          <span className="badge bg-primary ms-2">{upcoming.status}</span>
        </div>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    );
  }

  return null;
}

export default NotificationBanner;