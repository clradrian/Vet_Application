import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

function AdminDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: Implement admin dashboard endpoint
    setStats({
      totalPets: 0,
      totalUsers: 0,
      recentActivity: []
    });
  }, [token]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;

  return (
    <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h5" align="center" color="primary" gutterBottom>
          Panou administrare clinică
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary={`Pacienți activi: ${stats.activePatients}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`Doze administrate: ${stats.dosesAdministered}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`Programări zilnice: ${stats.dailyAppointments}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`Rată de conformitate tratament: ${stats.treatmentComplianceRate}`} />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
