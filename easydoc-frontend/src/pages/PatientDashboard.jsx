import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBanner from "../components/NotificationBanner";

function PatientDashboard() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchAppointments = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/appointments", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      })
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchAppointments();
  }, [token]);

  // Handle Cancel Appointment Action
  const handleCancelAppointment = (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    setActionMessage("");
    setError("");

    fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to cancel appointment");
        return data;
      })
      .then(() => {
        setActionMessage(`Appointment #${appointmentId} has been cancelled.`);
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId ? { ...app, status: "Cancelled" } : app
          )
        );
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <span className="badge bg-success">Confirmed</span>;
      case "cancelled":
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  return (
    <div className="container my-4">
      {/* Top Banner Notification */}
      <NotificationBanner user={user} appointments={appointments} />

      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0 fs-5 fw-bold">📅 My Appointments</h4>
        </div>

        <div className="card-body p-4">
          {actionMessage && (
            <div className="alert alert-success py-2 small mb-3">
              ✅ {actionMessage}
            </div>
          )}
          {error && <div className="alert alert-danger py-2 small mb-3">⚠️ {error}</div>}
          {loading && <div className="text-muted">Loading appointments...</div>}

          {!loading && appointments.length === 0 && (
            <div className="text-center py-4 text-muted">
              <p className="mb-0">You have no booked appointments yet.</p>
            </div>
          )}

          {!loading && appointments.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle border">
                <thead className="table-light">
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-semibold">{item.doctor_name || "N/A"}</td>
                      <td>{item.specialty || "General"}</td>
                      <td>
                        {new Date(item.appointment_date).toLocaleDateString()}
                      </td>
                      <td>{item.appointment_time}</td>
                      <td className="small text-muted">
                        {item.notes || "No notes provided"}
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          disabled={item.status === "Cancelled"}
                          onClick={() => handleCancelAppointment(item.id)}
                        >
                          {item.status === "Cancelled" ? "Cancelled" : "Cancel"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;