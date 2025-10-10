require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Simple pets endpoint for future integration

// In-memory pet records
let pets = [];

// Get all pets
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

// Add a new pet
app.post('/api/pets', (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required.' });
  }
  const pet = { id: pets.length + 1, name, type };
  pets.push(pet);
  res.status(201).json(pet);
});

app.get('/', (req, res) => {
  res.send('Vet App Backend is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
