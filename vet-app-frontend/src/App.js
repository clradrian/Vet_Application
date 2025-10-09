import React, { useState } from 'react';

function App() {
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');

  const handleAddPet = (e) => {
    e.preventDefault();
    if (!petName || !petType) return;
    setPets([...pets, { name: petName, type: petType }]);
    setPetName('');
    setPetType('');
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Vet App Dashboard</h1>
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
        <button type="submit">Add Pet</button>
      </form>
      <h2>Pet List</h2>
      <ul>
        {pets.length === 0 && <li>No pets added yet.</li>}
        {pets.map((pet, idx) => (
          <li key={idx}>{pet.name} ({pet.type})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
