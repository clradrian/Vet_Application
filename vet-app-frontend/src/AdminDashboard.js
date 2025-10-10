import React, { useEffect, useState } from 'react';

function AdminDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setError('Failed to fetch dashboard stats'));
  }, [token]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!stats) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2>Clinic Dashboard</h2>
      <ul>
        <li>Active Patients: {stats.activePatients}</li>
        <li>Doses Administered: {stats.dosesAdministered}</li>
        <li>Daily Appointments: {stats.dailyAppointments}</li>
        <li>Treatment Compliance Rate: {stats.treatmentComplianceRate}</li>
      </ul>
    </div>
  );
}

export default AdminDashboard;
