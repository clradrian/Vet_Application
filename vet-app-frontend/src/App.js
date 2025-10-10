import React, { useState, useEffect } from 'react';

function App() {
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch pets from backend
  useEffect(() => {
    fetch('http://localhost:4000/api/pets')
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(() => setError('Failed to fetch pets'));
  }, []);

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!petName || !petType) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    </div>
  );
}

export default App;
