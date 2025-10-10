

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { users, findUser, createUser } = require('./users');
const app = express();
// ...existing code...
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// In-memory pet records

// Middleware to check admin role
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'clinic_admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

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

// Admin dashboard stats (sample data)
app.get('/admin/dashboard', requireAdmin, (req, res) => {
  res.json({
    activePatients: pets.length,
    dosesAdministered: 42,
    dailyAppointments: 7,
    treatmentComplianceRate: '95%'
  });
});

// Staff management endpoints
// Edit user details
app.patch('/admin/staff/:id', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { fullName, email, phone, pets } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (pets !== undefined) user.pets = pets;
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    pets: user.pets
  });
});
app.get('/admin/staff', requireAdmin, (req, res) => {
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    fullName: u.fullName || '',
    email: u.email || '',
    phone: u.phone || '',
    pets: u.pets || []
  })));
});

app.post('/admin/staff', requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role required.' });
  }
  if (findUser(username)) {
    return res.status(409).json({ error: 'User already exists.' });
  }
    const { fullName, email, phone, pets } = req.body;
    const user = createUser(username, password, role, fullName, email, phone, pets);
    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      pets: user.pets
    });
});

// Register endpoint
app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role required.' });
  }
  if (findUser(username)) {
    return res.status(409).json({ error: 'User already exists.' });
  }
  const user = createUser(username, password, role);
  res.status(201).json({ id: user.id, username: user.username, role: user.role });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = findUser(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const valid = require('bcrypt').compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});
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

// Get current user from token
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Lipsă token.' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Return only safe user info
    res.json({ id: decoded.id, username: decoded.username, role: decoded.role });
  } catch {
    return res.status(401).json({ error: 'Token invalid.' });
  }
});