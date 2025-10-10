import React, { useEffect, useState } from 'react';
// ...existing code...
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Card, CardContent, Typography, TextField, Button, Box, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';

function StaffManager({ token, proprietariOnly }) {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [showPetForm, setShowPetForm] = useState(false);
  const [petForm, setPetForm] = useState({
    name: '',
    species: '',
    breed: '',
    sex: '',
    birthDate: '',
    color: '',
    microchipId: '',
    tagNumber: '',
    sterilized: '',
    photo: null
  });
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [staffForm, setStaffForm] = useState({ username: '', password: '', role: 'vet', fullName: '', email: '', phone: '', specialization: '' });
  const [ownerForm, setOwnerForm] = useState({ username: '', password: '', role: 'pet_owner', fullName: '', email: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/admin/staff', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setError('Failed to fetch staff'));
  }, [token]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add staff');
      setUsers([...users, data]);
      setStaffForm({ username: '', password: '', role: 'vet' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(ownerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add pet owner');
      setUsers([...users, data]);
      setOwnerForm({ username: '', password: '', role: 'pet_owner' });
      setShowOwnerForm(false); // Închide formularul după salvare
    } catch (err) {
      setError(err.message);
    }
  };

  const staffList = users.filter(u => u.role !== 'pet_owner');
  const ownerList = users.filter(u => u.role === 'pet_owner');

  if (proprietariOnly) {
    // Show only proprietari management
    return (
      <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h5" align="center" color="primary" gutterBottom>
            Administrare proprietari
          </Typography>
          <Box sx={{ mb: 2 }}>
            {!showOwnerForm && (
              <Button variant="contained" color="primary" onClick={() => setShowOwnerForm(true)}>
                Adaugă proprietar
              </Button>
            )}
            {showOwnerForm && (
              <Box component="form" onSubmit={handleAddOwner} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField label="Nume utilizator" variant="outlined" value={ownerForm.username} onChange={e => setOwnerForm(f => ({ ...f, username: e.target.value }))} fullWidth />
                <TextField label="Parolă" type="password" variant="outlined" value={ownerForm.password} onChange={e => setOwnerForm(f => ({ ...f, password: e.target.value }))} fullWidth />
                <TextField label="Nume complet" variant="outlined" value={ownerForm.fullName} onChange={e => setOwnerForm(f => ({ ...f, fullName: e.target.value }))} fullWidth />
                <TextField label="Email" variant="outlined" value={ownerForm.email} onChange={e => setOwnerForm(f => ({ ...f, email: e.target.value }))} fullWidth />
                <TextField label="Telefon" variant="outlined" value={ownerForm.phone} onChange={e => setOwnerForm(f => ({ ...f, phone: e.target.value }))} fullWidth />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button type="submit" variant="contained" color="primary">Salvează</Button>
                  <Button variant="outlined" color="secondary" onClick={() => setShowOwnerForm(false)}>Anulează</Button>
                  <Button variant="outlined" color="primary" onClick={() => setShowPetForm(true)}>Adaugă animal de companie</Button>
                </Box>
                {showPetForm && (
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Typography variant="subtitle1" color="primary">Date animal de companie</Typography>
                    <TextField label="Nume" variant="outlined" value={petForm.name} onChange={e => setPetForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                    <TextField label="Specie" variant="outlined" value={petForm.species} onChange={e => setPetForm(f => ({ ...f, species: e.target.value }))} fullWidth />
                    <TextField label="Rasă" variant="outlined" value={petForm.breed} onChange={e => setPetForm(f => ({ ...f, breed: e.target.value }))} fullWidth />
                    <TextField select label="Sex" value={petForm.sex} onChange={e => setPetForm(f => ({ ...f, sex: e.target.value }))} SelectProps={{ native: true }} fullWidth>
                      <option value="">Selectează</option>
                      <option value="mascul">Mascul</option>
                      <option value="femela">Femelă</option>
                    </TextField>
                    <TextField label="Data nașterii / Vârstă estimată" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={petForm.birthDate} onChange={e => setPetForm(f => ({ ...f, birthDate: e.target.value }))} fullWidth />
                    <TextField label="Culoare / semne distinctive" variant="outlined" value={petForm.color} onChange={e => setPetForm(f => ({ ...f, color: e.target.value }))} fullWidth />
                    <TextField label="Microcip" variant="outlined" value={petForm.microchipId} onChange={e => setPetForm(f => ({ ...f, microchipId: e.target.value }))} fullWidth />
                    <TextField label="Număr medalion" variant="outlined" value={petForm.tagNumber} onChange={e => setPetForm(f => ({ ...f, tagNumber: e.target.value }))} fullWidth />
                    <TextField select label="Sterilizat" value={petForm.sterilized} onChange={e => setPetForm(f => ({ ...f, sterilized: e.target.value }))} SelectProps={{ native: true }} fullWidth>
                      <option value="">Selectează</option>
                      <option value="da">Da</option>
                      <option value="nu">Nu</option>
                    </TextField>
                    <Button variant="outlined" component="label">
                      Încarcă poză
                      <input type="file" accept="image/*" hidden onChange={e => setPetForm(f => ({ ...f, photo: e.target.files[0] }))} />
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="contained" color="primary" onClick={() => { setShowPetForm(false); }}>Salvează animal</Button>
                      <Button variant="outlined" color="secondary" onClick={() => setShowPetForm(false)}>Anulează</Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Listă proprietari de animale</Typography>
          <List>
            {ownerList.length === 0 && <ListItem><ListItemText primary="Nu există proprietari adăugați." /></ListItem>}
            {ownerList.map((o) => {
              // Exemplu: presupunem că fiecare proprietar are un array o.pets cu animale de companie
              const petNames = o.pets && o.pets.length > 0 ? o.pets.map(p => p.name).join(', ') : 'Fără animale';
              return (
                <ListItem key={o.id} divider button onClick={() => setSelectedOwner(o)} sx={{ cursor: 'pointer' }}>
                  <ListItemText
                    primary={
                      <>
                        <b>{o.username}</b>
                        {o.fullName && <> &mdash; {o.fullName}</>}
                        {o.phone && <> &mdash; {o.phone}</>}
                        {petNames && <> &mdash; <span style={{ color: '#1976d2' }}>{petNames}</span></>}
                      </>
                    }
                    secondary={
                      <>
                        {o.email && <span><b>Email:</b> {o.email}</span>}
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
          {selectedOwner && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid #1976d2', borderRadius: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" color="primary" gutterBottom>Detalii proprietar</Typography>
              <TextField label="Nume utilizator" value={selectedOwner.username || ''} fullWidth margin="normal" InputProps={{ readOnly: true }} />
              <TextField label="Nume complet" value={selectedOwner.fullName || ''} fullWidth margin="normal" InputProps={{ readOnly: true }} />
              <TextField label="Email" value={selectedOwner.email || ''} fullWidth margin="normal" InputProps={{ readOnly: true }} />
              <TextField label="Telefon" value={selectedOwner.phone || ''} fullWidth margin="normal" InputProps={{ readOnly: true }} />
              {/* Animale de companie */}
              {selectedOwner.pets && selectedOwner.pets.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" color="primary">Animale de companie:</Typography>
                  {selectedOwner.pets.map((pet, idx) => (
                    <Box key={idx} sx={{ mb: 1, pl: 2 }}>
                      <Typography variant="body2"><b>Nume:</b> {pet.name}</Typography>
                      <Typography variant="body2"><b>Specie:</b> {pet.species}</Typography>
                      <Typography variant="body2"><b>Rasă:</b> {pet.breed}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={() => setSelectedOwner(null)}>Închide</Button>
              </Box>
            </Box>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>
    );
  }
  // Default: show only personal management
  return (
    <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h5" align="center" color="primary" gutterBottom>
          Administrare personal
        </Typography>
        <Box sx={{ mb: 2 }}>
          {!showStaffForm && (
            <Button variant="contained" color="primary" onClick={() => setShowStaffForm(true)}>
              Adaugă personal
            </Button>
          )}
          {showStaffForm && (
            <Box component="form" onSubmit={handleAddStaff} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField label="Nume utilizator" variant="outlined" value={staffForm.username} onChange={e => setStaffForm(f => ({ ...f, username: e.target.value }))} fullWidth />
              <TextField label="Parolă" type="password" variant="outlined" value={staffForm.password} onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))} fullWidth />
              <TextField label="Nume complet" variant="outlined" value={staffForm.fullName} onChange={e => setStaffForm(f => ({ ...f, fullName: e.target.value }))} fullWidth />
              <TextField label="Email" variant="outlined" value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} fullWidth />
              <TextField label="Telefon" variant="outlined" value={staffForm.phone} onChange={e => setStaffForm(f => ({ ...f, phone: e.target.value }))} fullWidth />
              <TextField label="Specializare" variant="outlined" value={staffForm.specialization} onChange={e => setStaffForm(f => ({ ...f, specialization: e.target.value }))} fullWidth />
              <TextField select label="Rol personal" value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))} SelectProps={{ native: true }} fullWidth>
                <option value="clinic_admin">Administrator clinică</option>
                <option value="vet">Medic veterinar</option>
                <option value="assistant">Asistent</option>
              </TextField>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" color="primary">Salvează</Button>
                <Button variant="outlined" color="secondary" onClick={() => setShowStaffForm(false)}>Anulează</Button>
              </Box>
            </Box>
          )}
        </Box>
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Listă personal</Typography>
        <List>
          {staffList.length === 0 && <ListItem><ListItemText primary="Nu există personal adăugat." /></ListItem>}
          {staffList.map((s) => (
            <ListItem key={s.id} divider>
              <ListItemText
                primary={`${s.username} (${s.role})`}
                secondary={
                  <>
                    {s.fullName && <span><b>Nume complet:</b> {s.fullName}<br /></span>}
                    {s.email && <span><b>Email:</b> {s.email}<br /></span>}
                    {s.phone && <span><b>Telefon:</b> {s.phone}<br /></span>}
                    {s.specialization && <span><b>Specializare:</b> {s.specialization}</span>}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </CardContent>
    </Card>
  );
}

export default StaffManager;
