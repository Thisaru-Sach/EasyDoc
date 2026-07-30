import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('easydoc_token') || '');
  const [loading, setLoading] = useState(true);

  // Load saved user session on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('easydoc_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setLoading(false);
  }, [token]);

  // Handle Login
  const login = async (email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    // Store in State & LocalStorage
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('easydoc_token', data.token);
    localStorage.setItem('easydoc_user', JSON.stringify(data.user));

    return data.user;
  };

  // Handle Register
  const register = async (fullName, email, password, role = 'patient') => {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password, role })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    // Store in State & LocalStorage
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('easydoc_token', data.token);
    localStorage.setItem('easydoc_user', JSON.stringify(data.user));

    return data.user;
  };

  // Handle Logout
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('easydoc_token');
    localStorage.removeItem('easydoc_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook for easy access
export const useAuth = () => useContext(AuthContext);