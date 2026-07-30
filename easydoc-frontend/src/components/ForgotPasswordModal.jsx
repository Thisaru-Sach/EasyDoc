import React, { useState } from "react";

function ForgotPasswordModal({ defaultEmail, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset Password
  const [email, setEmail] = useState(defaultEmail || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleRequestOTP = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) throw new Error(data.error);
        setSuccess("OTP sent to your email! It expires in 5 minutes.");
        setStep(2);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || "Failed to request OTP.");
      });
  };

  // Step 2: Verify OTP & Change Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Reset failed");
        return data;
      })
      .then(() => {
        setLoading(false);
        setSuccess("Password changed successfully! Closing...");
        setTimeout(() => {
          // Close modal and pass updated email back to login form
          const modalElem = document.getElementById("forgotPasswordModal");
          const modalInstance = window.bootstrap?.Modal.getInstance(modalElem);
          if (modalInstance) modalInstance.hide();
          if (onSuccess) onSuccess(email);
        }, 1500);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  };

  return (
    <div
      className="modal fade"
      id="forgotPasswordModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {step === 1 ? "🔑 Forgot Password" : "🔒 Verify OTP & New Password"}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger small py-2">{error}</div>}
            {success && <div className="alert alert-success small py-2">{success}</div>}

            {step === 1 ? (
              <form onSubmit={handleRequestOTP}>
                <p className="small text-muted mb-3">
                  Enter your account email. We'll send a 6-digit OTP code valid for 5 minutes.
                </p>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send Reset OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label className="form-label">6-Digit OTP Code</label>
                  <input
                    type="text"
                    className="form-control text-center fs-5 fw-bold"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50"
                    onClick={() => setStep(1)}
                  >
                    Resend OTP
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success w-50"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;