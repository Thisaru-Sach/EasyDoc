import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function DoctorList() {
  const { user, token } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Doctor Form State (Admin)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    status: "Available",
  });
  const [formError, setFormError] = useState("");

  // Booking Form State (Patient)
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    notes: "",
  });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  // Fetch doctors on mount
  const fetchDoctors = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/doctors")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Handle inputs for Adding Doctor
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  // Submit Handler: Add Doctor
  const handleSubmit = (e) => {
    e.preventDefault();

    const sanitizedName = formData.name.trim();
    const sanitizedSpecialty = formData.specialty.trim();

    if (!sanitizedName || !sanitizedSpecialty) {
      setFormError("Please fill out all required fields.");
      return;
    }

    fetch("http://localhost:5000/api/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: sanitizedName,
        specialty: sanitizedSpecialty,
        status: formData.status,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.status === 401) throw new Error("Please log in to add a doctor.");
        if (res.status === 403) throw new Error("Only admins are allowed to add doctors!");
        if (!res.ok) throw new Error(data.error || "Error saving doctor");

        return data;
      })
      .then((newDoc) => {
        setDoctors((prev) => [newDoc, ...prev]);
        setFormData({ name: "", specialty: "", status: "Available" });
        setFormError("");

        const modalElement = document.getElementById("addDoctorModal");
        const modalInstance = window.bootstrap?.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
      })
      .catch((err) => {
        setFormError(err.message || "Failed to connect to backend server.");
        console.error("POST Error:", err);
      });
  };

  // Handle inputs for Booking Appointment
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    if (bookingError) setBookingError("");
  };

  // Open Booking Modal for a Specific Doctor
  const openBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingData({ date: "", time: "", notes: "" });
    setBookingError("");
    setBookingSuccess("");
  };

  // Submit Handler: Book Appointment
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!bookingData.date || !bookingData.time) {
      setBookingError("Please select both a date and time slot.");
      return;
    }

    fetch("http://localhost:5000/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        doctor_id: selectedDoctor.id,
        appointment_date: bookingData.date,
        appointment_time: bookingData.time,
        notes: bookingData.notes,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.status === 401) throw new Error("Please log in to book an appointment.");
        if (!res.ok) throw new Error(data.error || "Failed to book appointment.");

        return data;
      })
      .then(() => {
        setBookingSuccess("Appointment booked successfully!");
        setBookingError("");

        // Close modal after a short delay
        setTimeout(() => {
          const modalElement = document.getElementById("bookModal");
          const modalInstance = window.bootstrap?.Modal.getInstance(modalElement);
          if (modalInstance) modalInstance.hide();
          setBookingSuccess("");
        }, 1500);
      })
      .catch((err) => {
        setBookingError(err.message || "Failed to connect to server.");
      });
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Find a Doctor</h2>
        {user?.role === "admin" && (
          <button
            className="btn btn-success fw-semibold"
            data-bs-toggle="modal"
            data-bs-target="#addDoctorModal"
          >
            + Add New Doctor
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by specialty (e.g. Cardiology)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading & Error Indicators */}
      {loading && <div className="alert alert-info">Loading doctors...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Doctor Cards */}
      <div className="row g-3">
        {!loading &&
          filteredDoctors.map((doctor) => (
            <div className="col-md-4" key={doctor.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{doctor.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {doctor.specialty}
                  </h6>
                  <span
                    className={`badge ${
                      doctor.status === "Available" ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {doctor.status}
                  </span>
                </div>
                <div className="card-footer bg-white border-0 text-end">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={doctor.status !== "Available"}
                    data-bs-toggle="modal"
                    data-bs-target="#bookModal"
                    onClick={() => openBookingModal(doctor)}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal for Adding Doctor (Admin) */}
      <div
        className="modal fade"
        id="addDoctorModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Register New Doctor</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-warning py-2 mb-3 small" role="alert">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Doctor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Kasun Silva"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Specialty</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g. Neurology"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Availability Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Available">Available</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal for Booking Appointment (Patient) */}
      <div className="modal fade" id="bookModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Book Appointment {selectedDoctor ? `with ${selectedDoctor.name}` : ""}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="modal-body">
                {bookingError && (
                  <div className="alert alert-danger py-2 mb-3 small">
                    ⚠️ {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div className="alert alert-success py-2 mb-3 small">
                    ✅ {bookingSuccess}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Appointment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={bookingData.date}
                    required
                    onChange={handleBookingChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Time Slot</label>
                  <input
                    type="time"
                    className="form-control"
                    name="time"
                    value={bookingData.time}
                    required
                    onChange={handleBookingChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Reason / Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={bookingData.notes}
                    rows="3"
                    placeholder="Describe symptoms or reason for visit..."
                    onChange={handleBookingChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorList;