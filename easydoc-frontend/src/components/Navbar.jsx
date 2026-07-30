import React from "react";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <a className="navbar-brand fw-bold fs-4" href="#">
          🏥 EasyDoc
        </a>

        <div className="d-flex align-items-center gap-3">
          {/* Inside Navbar.jsx where user profile / logout items are rendered */}
          {user && (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#changePasswordModal"
              >
                ⚙️ Profile
              </button>
              <button onClick={logout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </div>
          )}
          {/* Render Modal Component outside interactive elements */}
          <ChangePasswordModal />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
