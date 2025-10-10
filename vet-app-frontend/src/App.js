import PetOwnerDashboard from './PetOwnerDashboard';
import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StaffManager from './StaffManager';

function App() {
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', role: '' });
  const [showRegister, setShowRegister] = useState(false);

  // Fetch pets from backend
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4000/api/pets', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(() => setError('Failed to fetch pets'));
  }, [token]);

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!petName || !petType) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: petName, type: petType })
      });
      if (!res.ok) throw new Error('Failed to add pet');
      const newPet = await res.json();
      setPets([...pets, newPet]);
      setPetName('');
      setPetType('');
    } catch {
      setError('Failed to add pet');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setShowRegister(false);
      setLoginForm({ username: registerForm.username, password: registerForm.password });
      setRegisterForm({ username: '', password: '', role: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Vet App Dashboard</h1>
      {!token ? (
        <div>
          <form onSubmit={handleLogin} style={{ marginBottom: 24 }}>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
              style={{ marginRight: 8 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              style={{ marginRight: 8 }}
            />
            <button type="submit">Login</button>
          </form>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 12 }}>
            Logged in as <b>{user ? user.username : 'User'}</b> ({user ? user.role : ''})
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
          </div>
          {user && user.role === 'clinic_admin' ? (
            <>
              <AdminDashboard token={token} />
              <StaffManager token={token} />
            </>
          ) : user && user.role === 'pet_owner' ? (
            <PetOwnerDashboard />
          ) : (
            <>
              <form onSubmit={handleAddPet} style={{ marginBottom: 24 }}>
                <input
                  type="text"
                  placeholder="Pet Name"
                  value={petName}
                  onChange={e => setPetName(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <input
                  type="text"
                  placeholder="Pet Type"
                  value={petType}
                  onChange={e => setPetType(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type="submit" disabled={loading}>Add Pet</button>
              </form>
              {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
              <h2>Pet List</h2>
              <ul>
                {pets.length === 0 && <li>No pets added yet.</li>}
                {pets.map((pet) => (
                  <li key={pet.id}>{pet.name} ({pet.type})</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
