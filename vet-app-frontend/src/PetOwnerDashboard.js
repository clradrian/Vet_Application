import React, { useState } from 'react';

function PetOwnerDashboard() {
  // Sample data for demonstration
  const [pet, setPet] = useState({
    name: 'Rex',
    species: 'Dog',
    medicalHistory: [
      { date: '2025-09-01', type: 'Vaccination', details: 'Rabies' },
      { date: '2025-08-15', type: 'Visit', details: 'Annual checkup' },
      { date: '2025-07-10', type: 'Weight', details: '22kg' }
    ],
    upcoming: [
      { date: '2025-10-15', type: 'Vaccination', details: 'Distemper' },
      { date: '2025-10-20', type: 'Appointment', details: 'Dental cleaning' }
    ]
  });
  const [confirmation, setConfirmation] = useState('');

  const handleConfirm = (e) => {
    e.preventDefault();
    setConfirmation('Thank you for confirming home administration!');
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Pet Owner Portal</h2>
      <h3>{pet.name} ({pet.species})</h3>
      <h4>Upcoming Calendar</h4>
      <ul>
        {pet.upcoming.map((item, idx) => (
          <li key={idx}>{item.date}: {item.type} - {item.details}</li>
        ))}
      </ul>
      <h4>Medical History</h4>
      <ul>
        {pet.medicalHistory.map((item, idx) => (
          <li key={idx}>{item.date}: {item.type} - {item.details}</li>
        ))}
      </ul>
      <h4>Home Administration Confirmation</h4>
      <form onSubmit={handleConfirm} style={{ marginBottom: 12 }}>
        <button type="submit">Confirm Home Treatment</button>
      </form>
      {confirmation && <div style={{ color: 'green' }}>{confirmation}</div>}
      <h4>Notifications</h4>
      <ul>
        <li>Email/SMS reminders will be sent before each vaccination or treatment.</li>
      </ul>
    </div>
  );
}

export default PetOwnerDashboard;
