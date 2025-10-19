import React, { useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Button, Alert, Divider } from '@mui/material';

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
    <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h5" align="center" color="primary" gutterBottom>
          Portal proprietar de animale
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>{pet.name} ({pet.species})</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" color="primary">Calendar viitor</Typography>
        <List>
          {pet.upcoming.length === 0 && <ListItem><ListItemText primary="Nu există evenimente viitoare." /></ListItem>}
          {pet.upcoming.map((ev, idx) => (
            <ListItem key={idx} divider>
              <ListItemText primary={`${ev.date}: ${ev.type} - ${ev.details}`} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" color="primary">Confirmare administrare acasă</Typography>
        <form onSubmit={handleConfirm} style={{ marginBottom: 12 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>Confirmă tratamentul acasă</Button>
        </form>
        {confirmation && <Alert severity="success" sx={{ mb: 2 }}>{confirmation}</Alert>}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" color="primary">Notificări</Typography>
        <List>
          <ListItem><ListItemText primary="Veți primi notificări prin email/SMS înainte de fiecare vaccinare sau tratament." /></ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" color="primary">Istoric medical</Typography>
        <List>
          {pet.medicalHistory.length === 0 && <ListItem><ListItemText primary="Nu există istoric medical." /></ListItem>}
          {pet.medicalHistory.map((mh, idx) => (
            <ListItem key={idx} divider>
              <ListItemText primary={`${mh.date}: ${mh.type} - ${mh.details}`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default PetOwnerDashboard;
