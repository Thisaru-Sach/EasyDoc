import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Set this to your Express server's exact base URL
const API_BASE_URL = 'http://localhost:5000';

function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'doctor',
  });
  const [formError, setFormError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      }
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!res.ok) throw new Error(data.error || 'Failed to load directory');
          return data;
        } catch (e) {
          // If HTML is returned instead of JSON, catch it here cleanly
          throw new Error(`Server returned HTML instead of JSON. Check if backend port matches ${API_BASE_URL}`);
        }
      })
      .then((data) => {
        setUsers(data);
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      }),
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!res.ok) throw new Error(data.error || 'Failed to create user');
          return data;
        } catch (e) {
          throw new Error('Server route not found or returned invalid JSON.');
        }
      })
      .then((data) => {
        setSuccessMsg(`Account created for ${data.user.full_name} (${data.user.role.toUpperCase()})`);
        setFormData({ fullName: '', email: '', password: '', role: 'doctor' });
        fetchUsers();
      })
      .catch((err) => {
        setFormError(err.message);
      });
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
          <h4 className="mb-0 fs-5 fw-bold">⚙️ Admin Control Panel</h4>
          <span className="badge bg-danger">Admin Privileges Active</span>
        </div>

        <div className="card-body p-4">
          <h5 className="fw-semibold mb-3">Provision Staff Account (Doctor / Admin)</h5>

          {successMsg && <div className="alert alert-success py-2 small mb-3">✅ {successMsg}</div>}
          {formError && <div className="alert alert-danger py-2 small mb-3">⚠️ {formError}</div>}

          <form onSubmit={handleCreateUser} className="row g-3 align-items-end mb-4">
            <div className="col-md-3">
              <label className="form-label text-secondary small fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Dr. Samantha Silva"
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label text-secondary small fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="doctor@easydoc.com"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label text-secondary small fw-semibold">Temp Password</label>
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
            <div className="col-md-2">
              <label className="form-label text-secondary small fw-semibold">Role</label>
              <select
                className="form-select"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100 fw-semibold">
                + Provision Account
              </button>
            </div>
          </form>

          <hr className="my-4" />

          {/* User Directory Table */}
          <h5 className="fw-semibold mb-3">System Accounts Directory</h5>
          {loading && <div className="text-muted">Loading user directory...</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-hover align-middle border">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td className="fw-semibold">{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'bg-danger'
                              : u.role === 'doctor'
                              ? 'bg-info text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(u.created_at).toLocaleDateString()}
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

export default AdminPage;