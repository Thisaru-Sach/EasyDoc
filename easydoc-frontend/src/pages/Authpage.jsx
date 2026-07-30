import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

function AuthPage() {
  const { login, register } = useAuth();

  // false = Register, true = Sign In
  const [isSignIn, setIsSignIn] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleToggle = (signInState) => {
    setIsSignIn(signInState);
    setError("");
    setFormData({ fullName: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignIn) {
        await login(formData.email.trim(), formData.password);
      } else {
        if (!formData.fullName.trim()) {
          throw new Error("Full name is required.");
        }
        await register(
          formData.fullName.trim(),
          formData.email.trim(),
          formData.password,
          "patient",
        );
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card shadow-lg border-0 overflow-hidden w-100"
        style={{ maxWidth: "900px", borderRadius: "16px" }}
      >
        {/* Top Toggle Switch Bar */}
        <div className="bg-light p-3 border-bottom d-flex justify-content-center gap-2">
          <button
            type="button"
            className={`btn btn-sm px-4 fw-semibold ${!isSignIn ? "btn-primary shadow-sm" : "btn-outline-secondary"}`}
            onClick={() => handleToggle(false)}
          >
            Register Patient
          </button>
          <button
            type="button"
            className={`btn btn-sm px-4 fw-semibold ${isSignIn ? "btn-primary shadow-sm" : "btn-outline-secondary"}`}
            onClick={() => handleToggle(true)}
          >
            Sign In
          </button>
        </div>

        {/* Dual Panel Layout */}
        <div
          className="row g-0 position-relative"
          style={{ minHeight: "480px" }}
        >
          {/* LEFT SIDE PANEL */}
          <div
            className={`col-md-6 d-flex flex-column justify-content-center p-5 transition-all ${
              isSignIn
                ? "order-md-1 bg-white"
                : "order-md-1 bg-primary text-white"
            }`}
            style={{ transition: "all 0.5s ease-in-out" }}
          >
            {!isSignIn ? (
              <div>
                <h2 className="fw-bold mb-3">Welcome to EasyDoc 🏥</h2>
                <p className="lead fs-6 mb-4">
                  Create your patient account to easily search specialists, book
                  appointments, and manage your health records.
                </p>
                <div className="p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-25">
                  <small>✓ Quick Doctor Search</small>
                  <br />
                  <small>✓ Instant Appointment Booking</small>
                  <br />
                  <small>✓ Secure Patient Portal</small>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="fw-bold mb-3 text-dark">Sign In</h3>
                {error && (
                  <div className="alert alert-danger py-2 small mb-3">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      data-bs-toggle="modal"
                      data-bs-target="#forgotPasswordModal"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT SIDE PANEL */}
          <div
            className={`col-md-6 d-flex flex-column justify-content-center p-5 transition-all ${
              isSignIn
                ? "order-md-2 bg-primary text-white"
                : "order-md-2 bg-white text-dark"
            }`}
            style={{ transition: "all 0.5s ease-in-out" }}
          >
            {!isSignIn ? (
              <div>
                <h3 className="fw-bold mb-3 text-dark">Patient Registration</h3>
                {error && (
                  <div className="alert alert-danger py-2 small mb-3">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Kasun Perera"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register as Patient"}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="fw-bold mb-3">Welcome Back! 👋</h2>
                <p className="lead fs-6 mb-4">
                  Sign in with your email and password to access your EasyDoc
                  portal.
                </p>
                <div className="p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-25">
                  <small>
                    💡 Doctors & Admins: Use your credentials assigned by
                    hospital management to sign in here.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RENDER MODAL OUTSIDE OF ANY FORM TAGS */}
      <ForgotPasswordModal
        defaultEmail={formData.email}
        onSuccess={(updatedEmail) =>
          setFormData((prev) => ({ ...prev, email: updatedEmail }))
        }
      />
    </div>
  );
}

export default AuthPage;