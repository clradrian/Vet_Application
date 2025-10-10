import React, { useEffect, useState } from 'react';

function StaffManager({ token }) {
  const [users, setUsers] = useState([]);
  const [staffForm, setStaffForm] = useState({ username: '', password: '', role: 'vet' });
  const [ownerForm, setOwnerForm] = useState({ username: '', password: '', role: 'pet_owner' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/admin/staff', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setError('Failed to fetch staff'));
  }, [token]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add staff');
      setUsers([...users, data]);
      setStaffForm({ username: '', password: '', role: 'vet' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(ownerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add pet owner');
      setUsers([...users, data]);
      setOwnerForm({ username: '', password: '', role: 'pet_owner' });
    } catch (err) {
      setError(err.message);
    }
  };

  const staffList = users.filter(u => u.role !== 'pet_owner');
  const ownerList = users.filter(u => u.role === 'pet_owner');

  return (
    <div>
      <h2>Staff Management</h2>
      <form onSubmit={handleAddStaff} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Username"
          value={staffForm.username}
          onChange={e => setStaffForm(f => ({ ...f, username: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={staffForm.password}
          onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <select
          value={staffForm.role}
          onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))}
          style={{ marginRight: 8 }}
        >
          <option value="clinic_admin">Clinic Administrator</option>
          <option value="vet">Vet</option>
          <option value="assistant">Assistant</option>
        </select>
        <button type="submit">Add Staff</button>
      </form>
      <h3>Staff List</h3>
      <ul>
        {staffList.length === 0 && <li>No staff added yet.</li>}
        {staffList.map((s) => (
          <li key={s.id}>{s.username} ({s.role})</li>
        ))}
      </ul>
      <hr />
      <h2>Pet Owner Management</h2>
      <form onSubmit={handleAddOwner} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Username"
          value={ownerForm.username}
          onChange={e => setOwnerForm(f => ({ ...f, username: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={ownerForm.password}
          onChange={e => setOwnerForm(f => ({ ...f, password: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Add Pet Owner</button>
      </form>
      <h3>Pet Owner List</h3>
      <ul>
        {ownerList.length === 0 && <li>No pet owners added yet.</li>}
        {ownerList.map((o) => (
          <li key={o.id}>{o.username} ({o.role})</li>
        ))}
      </ul>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
    </div>
  );
}

export default StaffManager;
