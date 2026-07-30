import React, { useState } from 'react';

function Navbar() {
  // Simulating authentication state: null = logged out, object = logged in user
  const [user, setUser] = useState(null); 

  // Quick toggle helper for testing
  const toggleAuth = () => {
    if (user) {
      setUser(null);
    } else {
      setUser({ name: "Dr. Perera", role: "doctor" });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow-sm">
      <a className="navbar-brand fw-bold" href="#">EasyDoc</a>
      
      <button 
        className="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item"><a className="nav-link active" href="#">Home</a></li>
          <li className="nav-item"><a className="nav-link" href="#">Find Doctors</a></li>
          <li className="nav-item"><a className="nav-link" href="#">Book Appointment</a></li>
        </ul>

        {/* Dynamic Auth Section */}
        <div className="d-flex align-items-center gap-2">
          {user ? (
            <>
              <span className="text-white me-2">Welcome, {user.name}</span>
              <button className="btn btn-outline-light btn-sm" onClick={toggleAuth}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-light text-primary btn-sm fw-semibold me-2">Login</button>
              <button className="btn btn-warning btn-sm fw-semibold">Register</button>
              {/* Dev button to test state switch */}
              <button className="btn btn-sm btn-dark ms-3" onClick={toggleAuth}>
                (Simulate Login)
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;