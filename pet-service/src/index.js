require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const petModel = require('./models/petModel');

const app = express();
const PORT = process.env.PORT || 3002;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'pet-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// Authentication middleware - validates token with user service
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    // Verify token with user service
    const response = await axios.get(`${USER_SERVICE_URL}/auth/me`, {
      headers: { Authorization: authHeader }
    });

    req.user = response.data;
    next();
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication service unavailable' });
  }
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'clinic_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Routes

// Get pets by owner
app.get('/pets/owner/:ownerId', authenticateToken, async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Check if user can access these pets (own pets or admin)
    if (req.user.role !== 'clinic_admin' && req.user.id !== parseInt(ownerId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pets = await petModel.getPetsByOwner(ownerId);
    res.json(pets);
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create pet
app.post('/pets', authenticateToken, async (req, res) => {
  try {
    const petData = req.body;
    
    // Check if user can create pets for this owner
    if (req.user.role !== 'clinic_admin' && req.user.id !== parseInt(petData.owner_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newPet = await petModel.createPet(petData);
    res.status(201).json(newPet);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pet
app.put('/pets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get pet to check ownership
    const pet = await petModel.getPetById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check permissions
    if (req.user.role !== 'clinic_admin' && req.user.id !== pet.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedPet = await petModel.updatePet(id, updates);
    res.json(updatedPet);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete pet (admin only)
app.delete('/pets/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await petModel.deletePet(id);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add vaccine
app.post('/pets/:id/vaccines', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const vaccineData = { ...req.body, pet_id: id };

    // Check pet ownership
    const pet = await petModel.getPetById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (req.user.role !== 'clinic_admin' && req.user.id !== pet.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const vaccine = await petModel.addVaccine(vaccineData);
    res.status(201).json(vaccine);
  } catch (error) {
    console.error('Add vaccine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add deworming
app.post('/pets/:id/dewormings', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const dewormingData = { ...req.body, pet_id: id };

    // Check pet ownership
    const pet = await petModel.getPetById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (req.user.role !== 'clinic_admin' && req.user.id !== pet.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deworming = await petModel.addDeworming(dewormingData);
    res.status(201).json(deworming);
  } catch (error) {
    console.error('Add deworming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add schedule
app.post('/pets/:id/schedules', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const scheduleData = { ...req.body, pet_id: id };

    // Check pet ownership
    const pet = await petModel.getPetById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (req.user.role !== 'clinic_admin' && req.user.id !== pet.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const schedule = await petModel.addSchedule(scheduleData);
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Add schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'pet-service',
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`Pet service running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});