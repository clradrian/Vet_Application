require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const userModel = require('./userModel');
const petModel = require('./petModel');
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const expirationService = require('./expirationService');

const app = express();
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

// Get all pets for an owner
app.get('/api/pets/:owner_id', async (req, res) => {
  const owner_id = parseInt(req.params.owner_id);
  if (!owner_id) return res.status(400).json({ error: 'Owner ID required.' });
  const pets = await petModel.getPetsByOwner(owner_id);
  res.json(pets);
});

// Add a new pet
app.post('/api/pets', async (req, res) => {
  console.log('POST /api/pets body:', req.body);
  const { owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo } = req.body;
  if (!owner_id || !name || !species) {
    console.error('Missing required fields:', { owner_id, name, species });
    return res.status(400).json({ error: 'Owner, name, and species required.' });
  }
  try {
    const pet = await petModel.createPet({ owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo });
    res.status(201).json(pet);
  } catch (err) {
    console.error('DB error saving pet:', err);
    res.status(500).json({ error: 'Database error saving pet', details: err.message });
  }
});

// Delete a pet
app.delete('/api/pets/:id', async (req, res) => {
  const petId = parseInt(req.params.id);
  if (!petId) return res.status(400).json({ error: 'Pet ID required.' });
  
  try {
    const result = await petModel.deletePet(petId);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pet not found.' });
    }
    res.json({ message: 'Pet deleted successfully.' });
  } catch (err) {
    console.error('DB error deleting pet:', err);
    res.status(500).json({ error: 'Database error deleting pet', details: err.message });
  }
});

// Admin dashboard stats (sample data)
app.get('/admin/dashboard', requireAdmin, async (req, res) => {
  // TODO: Replace with a real DB query if needed
  res.json({
    activePatients: 0, // or use a DB query to count pets
    dosesAdministered: 42,
    dailyAppointments: 7,
    treatmentComplianceRate: '95%'
  });
});

// Staff management endpoints
// Edit user details
app.patch('/admin/staff/:id', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { fullName, email, phone } = req.body;
  // Update user details (add more fields as needed)
  const users = await userModel.getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  // You can add an updateUser function in userModel for real update
  res.json(user);
});

app.get('/admin/staff', requireAdmin, async (req, res) => {
  const users = await userModel.getAllUsers();
  res.json(users);
});

app.post('/admin/staff', requireAdmin, async (req, res) => {
  const { username, password, role, fullName, email, phone } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role required.' });
  }
  if (await userModel.findUser(username)) {
    return res.status(409).json({ error: 'User already exists.' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const user = await userModel.createUser({ username, password: hashed, role, fullName, email, phone });
  res.status(201).json(user);
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
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findUser(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});
// Simple pets endpoint for future integration

// Pet endpoints now use PostgreSQL

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

// Endpoint pentru testarea notificărilor de expirare (doar pentru admin)
app.post('/admin/test-notifications', requireAdmin, async (req, res) => {
  try {
    await expirationService.testNotifications();
    res.json({ 
      success: true, 
      message: 'Notification test completed. Check console for details.' 
    });
  } catch (error) {
    console.error('Error testing notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test notifications' 
    });
  }
});

// Programare automată pentru verificarea expirărilor
// Rulează în fiecare zi la ora 09:00
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled expiration check...');
  await expirationService.checkExpirations();
}, {
  timezone: "Europe/Bucharest"
});

// Pentru dezvoltare: verificare la fiecare 5 minute (comentează pentru producție)
// cron.schedule('*/5 * * * *', async () => {
//   console.log('Running development expiration check...');
//   await expirationService.checkExpirations();
// });

console.log('Email notification system initialized');
console.log('Scheduled daily expiration checks at 09:00 (Bucharest time)');