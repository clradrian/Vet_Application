const express = require('express');
const cors = require('cors');
const { sendEmailNotification } = require('./emailService');
const { startExpirationMonitoring } = require('./expirationService');

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Start expiration monitoring service
startExpirationMonitoring();

// API Endpoints

// Send email notification
app.post('/api/send-notification', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, and text/html' 
      });
    }

    const result = await sendEmailNotification({ to, subject, text, html });
    res.json({ 
      message: 'Email sent successfully', 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

// Send expiration notifications manually
app.post('/api/check-expirations', async (req, res) => {
  try {
    // This endpoint allows manual triggering of expiration checks
    const expirationService = require('./expirationService');
    await expirationService.checkExpirations();
    res.json({ message: 'Expiration check completed' });
  } catch (error) {
    console.error('Expiration check error:', error);
    res.status(500).json({ 
      error: 'Failed to check expirations', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'notification-service',
    timestamp: new Date().toISOString() 
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🔔 Notification service running on port ${port}`);
});

module.exports = app;