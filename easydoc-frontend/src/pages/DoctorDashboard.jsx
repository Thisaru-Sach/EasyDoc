import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBanner from "../components/NotificationBanner";

function DoctorDashboard() {
  const { token, user } = useAuth();
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

  // Handle Confirm / Cancel Actions
  const handleStatusChange = (appointmentId, newStatus) => {
    setActionMessage("");
    fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update status");
        return data;
      })
      .then((data) => {
        setActionMessage(`Appointment #${appointmentId} set to ${newStatus}`);
        // Local state update so table reflects change instantly
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId ? { ...app, status: newStatus } : app
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
      {/* Next Appointment Alert for Doctor */}
      <NotificationBanner user={user} appointments={appointments} />
      
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fs-5 fw-bold">📋 Manage Patient Bookings</h4>
          <span className="badge bg-info text-dark">
            Role: {user?.role?.toUpperCase()}
          </span>
        </div>

        <div className="card-body p-4">
          {actionMessage && (
            <div className="alert alert-success py-2 small mb-3">
              ✅ {actionMessage}
            </div>
          )}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {loading && <div className="text-muted">Loading schedule...</div>}

          {!loading && appointments.length === 0 && (
            <div className="text-center py-4 text-muted">
              <p className="mb-0">No appointment requests found.</p>
            </div>
          )}

          {!loading && appointments.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle border">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td className="fw-semibold">
                        {item.patient_name || item.patient_email || "Patient"}
                      </td>
                      <td>
                        {new Date(item.appointment_date).toLocaleDateString()}
                      </td>
                      <td>{item.appointment_time}</td>
                      <td className="small text-muted">
                        {item.notes || "None"}
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success"
                            disabled={item.status === "Confirmed"}
                            onClick={() =>
                              handleStatusChange(item.id, "Confirmed")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            disabled={item.status === "Cancelled"}
                            onClick={() =>
                              handleStatusChange(item.id, "Cancelled")
                            }
                          >
                            Decline
                          </button>
                        </div>
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

export default DoctorDashboard;