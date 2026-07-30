import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function ChangePasswordModal() {
  const { token, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    fetch("http://localhost:5000/api/auth/change-password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update password");
        return data;
      })
      .then(() => {
        setLoading(false);
        setSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => {
          setSuccess("");
          const modalElem = document.getElementById("changePasswordModal");
          const modalInstance = window.bootstrap?.Modal.getInstance(modalElem);
          if (modalInstance) modalInstance.hide();
        }, 1500);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  };

  return (
    <div className="modal fade" id="changePasswordModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">👤 Account Security</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="mb-3 p-2 bg-light rounded border">
              <small className="text-muted d-block"><strong>Logged in as:</strong> {user?.full_name}</small>
              <small className="text-muted d-block"><strong>Email:</strong> {user?.email}</small>
              <small className="text-muted d-block"><strong>Role:</strong> <span className="text-capitalize">{user?.role}</span></small>
            </div>

            {error && <div className="alert alert-danger small py-2">{error}</div>}
            {success && <div className="alert alert-success small py-2">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;