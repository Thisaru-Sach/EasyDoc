import React, { useState, useEffect } from 'react';

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    status: 'Available'
  });

  // Modal validation error state (Replaces alert)
  const [formError, setFormError] = useState('');

  // Fetch doctors on mount
  const fetchDoctors = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/doctors')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load data');
        return res.json();
      })
      .then(data => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing again
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Works now because this is on the <form>!

    const sanitizedName = formData.name.trim();
    const sanitizedSpecialty = formData.specialty.trim();

    // Inline Validation check
    if (!sanitizedName || !sanitizedSpecialty) {
      setFormError('Please fill out all required fields.');
      return; // Stops execution and keeps modal open!
    }

    fetch('http://localhost:5000/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sanitizedName,
        specialty: sanitizedSpecialty,
        status: formData.status
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Error saving doctor');
        return res.json();
      })
      .then(newDoc => {
        setDoctors(prev => [newDoc, ...prev]);
        setFormData({ name: '', specialty: '', status: 'Available' });
        setFormError('');

        // Close modal programmatically via Bootstrap JS API
        const modalElement = document.getElementById('addDoctorModal');
        const modalInstance = window.bootstrap?.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      })
      .catch(err => {
        setFormError('Failed to connect to backend server.');
        console.error('POST Error:', err);
      });
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Find a Doctor</h2>
        <button 
          className="btn btn-success fw-semibold"
          data-bs-toggle="modal" 
          data-bs-target="#addDoctorModal"
        >
          + Add New Doctor
        </button>
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
        {!loading && filteredDoctors.map(doctor => (
          <div className="col-md-4" key={doctor.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{doctor.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{doctor.specialty}</h6>
                <span className={`badge ${doctor.status === 'Available' ? 'bg-success' : 'bg-secondary'}`}>
                  {doctor.status}
                </span>
              </div>
              <div className="card-footer bg-white border-0 text-end">
                <button 
                  className="btn btn-primary btn-sm" 
                  disabled={doctor.status !== 'Available'}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Adding Doctor */}
      <div className="modal fade" id="addDoctorModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Register New Doctor</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            {/* Form submission handler moved here */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                
                {/* Inline Error Box inside Modal */}
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
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                {/* Removed data-bs-dismiss="modal" so it doesn't force-close on bad submit */}
                <button type="submit" className="btn btn-primary">Save Doctor</button>
              </div>
            </form>

          </div>
        </div>
      </div>

    </div>
  );
}

export default DoctorList;