  import React, { useEffect, useState } from 'react';
  import { Card, CardContent, Typography, TextField, Button, Box, List, ListItem, ListItemText, Alert } from '@mui/material';

  function StaffManager({ token, proprietariOnly }) {
  // State pentru afisare istoric deparazitare/vaccinuri
  const [showInternalHistory, setShowInternalHistory] = useState(false);
    const [showExternalHistory, setShowExternalHistory] = useState(false);
    const [showVaccinesHistory, setShowVaccinesHistory] = useState(false);
  // State pentru editare detalii avansate
  const [editAdvancedMode, setEditAdvancedMode] = useState(false);
  const [advancedForm, setAdvancedForm] = useState({ sterilizationDate: '', vaccines: [], dewormingInternal: [], dewormingExternal: [] });
    // State pentru animal selectat
    const [selectedPet, setSelectedPet] = useState(null);
  // State pentru confirmare ștergere animal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // State pentru editare animal
  const [editPetMode, setEditPetMode] = useState(false);
    const [editPetForm, setEditPetForm] = useState({
      name: '', species: '', breed: '', sex: '', birthDate: '', color: '', microchipId: '', tagNumber: '', sterilized: '',
      sterilizationDate: '', vaccines: [], dewormingInternal: [], dewormingExternal: []
    });
    // State pentru detalii avansate animal
    const [showAdvancedPetDetails, setShowAdvancedPetDetails] = useState(false);
  // State comun
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // State pentru personal
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
    const [staffForm, setStaffForm] = useState({ username: '', password: '', role: 'vet', fullName: '', email: '', phone: '', specialization: '', address: '' });

  // State pentru proprietari
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [ownerForm, setOwnerForm] = useState({ username: '', password: '', role: 'pet_owner', fullName: '', email: '', phone: '' });
  const [showPetForm, setShowPetForm] = useState(false);
  const [petForm, setPetForm] = useState({ name: '', species: '', breed: '', sex: '', birthDate: '', color: '', microchipId: '', tagNumber: '', sterilized: '', photo: null });
  const [successOwner, setSuccessOwner] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/admin/staff', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setError('Failed to fetch staff'));
  }, [token]);

  // Adăugare/editare personal
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let res, data;
      if (editingStaff) {
        res = await fetch(`http://localhost:4000/admin/staff/${editingStaff.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(staffForm)
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to edit staff');
        setUsers(users.map(u => u.id === data.id ? data : u));
        setEditingStaff(data);
      } else {
        res = await fetch('http://localhost:4000/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(staffForm)
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add staff');
        setUsers([...users, data]);
        setEditingStaff(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Adăugare/editare proprietar
  const handleAddOwner = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessOwner('');
    try {
      let res, data;
      if (editingOwner) {
        res = await fetch(`http://localhost:4000/admin/staff/${editingOwner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(ownerForm)
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to edit owner');
        setUsers(users.map(u => u.id === data.id ? data : u));
        setEditingOwner(null);
        setShowOwnerForm(false);
        setSuccessOwner('Datele proprietarului au fost salvate cu succes!');
      } else {
        res = await fetch('http://localhost:4000/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(ownerForm)
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add owner');
        setUsers([...users, data]);
        setEditingOwner(null);
        setShowOwnerForm(false);
        setSuccessOwner('Proprietarul a fost adăugat cu succes!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const staffList = users.filter(u => u.role !== 'pet_owner');
  const ownerList = users.filter(u => u.role === 'pet_owner');

  if (proprietariOnly) {
    // Administrare proprietari
    return (
      <Box>
        <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h5" align="center" color="primary" gutterBottom>Administrare proprietari</Typography>
            <Box sx={{ mb: 2 }}>
              {!showOwnerForm && (
                <Button variant="contained" color="primary" onClick={() => {
                  setShowOwnerForm(true);
                  setEditingOwner(null);
                  setOwnerForm({ username: '', password: '', role: 'pet_owner', fullName: '', email: '', phone: '' });
                }}>Adaugă proprietar</Button>
              )}
              {showOwnerForm && (
                <Box component="form" onSubmit={handleAddOwner} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField label="Nume utilizator" variant="outlined" value={ownerForm.username} onChange={e => setOwnerForm(f => ({ ...f, username: e.target.value }))} fullWidth disabled={!!editingOwner} />
                  <TextField label="Parolă" type="password" variant="outlined" value={ownerForm.password} onChange={e => setOwnerForm(f => ({ ...f, password: e.target.value }))} fullWidth />
                  <TextField label="Nume complet" variant="outlined" value={ownerForm.fullName} onChange={e => setOwnerForm(f => ({ ...f, fullName: e.target.value }))} fullWidth />
                  <TextField label="Email" variant="outlined" value={ownerForm.email} onChange={e => setOwnerForm(f => ({ ...f, email: e.target.value }))} fullWidth />
                  <TextField label="Telefon" variant="outlined" value={ownerForm.phone} onChange={e => setOwnerForm(f => ({ ...f, phone: e.target.value }))} fullWidth />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" color="primary">{editingOwner ? 'Salvează modificările' : 'Salvează'}</Button>
                    <Button variant="outlined" color="secondary" onClick={() => { setShowOwnerForm(false); setEditingOwner(null); }}>Anulează</Button>
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
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={async () => {
                            if (editingOwner) {
                              // PATCH la proprietar cu noul animal
                              const updatedPets = [...(editingOwner.pets || []), petForm];
                              await fetch(`http://localhost:4000/admin/staff/${editingOwner.id}`,
                                {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    // Adaugă Authorization dacă e nevoie
                                    ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {})
                                  },
                                  body: JSON.stringify({ pets: updatedPets })
                                });
                            }
                            setShowPetForm(false);
                            setPetForm({ name: '', species: '', breed: '', sex: '', birthDate: '', color: '', microchipId: '', tagNumber: '', sterilized: '', photo: null });
                          }}
                        >Salvează animal</Button>
                        <Button variant="outlined" color="secondary" onClick={() => setShowPetForm(false)}>Anulează</Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            {successOwner && <Alert severity="success" sx={{ mb: 2 }}>{successOwner}</Alert>}
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Listă proprietari de animale</Typography>
            <List>
              {ownerList.length === 0 && <ListItem><ListItemText primary="Nu există proprietari adăugați." /></ListItem>}
              {ownerList.map((o) => (
                <ListItem key={o.id} divider sx={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%' }} onClick={() => {
                    setShowOwnerForm(true);
                    setEditingOwner(o);
                    setOwnerForm({
                      username: o.username,
                      password: '',
                      role: o.role,
                      fullName: o.fullName || '',
                      email: o.email || '',
                      phone: o.phone || ''
                    });
                  }}>
                    <ListItemText
                      primary={<><b>{o.username}</b>{o.fullName && <> &mdash; {o.fullName}</>}{o.phone && <> &mdash; {o.phone}</>}</>}
                      secondary={o.email && <span><b>Email:</b> {o.email}</span>}
                    />
                  </Box>
                  {o.pets && o.pets.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {o.pets.map((p, idx) => (
                        <Button key={idx} size="small" variant="outlined" color="primary" onClick={() => setSelectedPet(p)}>
                          {p.name} ({p.species})
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <span style={{ color: '#888', marginTop: 8 }}>Fără animale</span>
                  )}
                </ListItem>
              ))}
              {selectedPet && (
                <Box sx={{ mt: 3, p: 2, border: '1px solid #1976d2', borderRadius: 2, background: '#f5faff' }}>
                  <Typography variant="h6" color="primary">Detalii animal</Typography>
                  {editPetMode ? (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField label="Nume" variant="outlined" value={editPetForm.name} onChange={e => setEditPetForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                      <TextField label="Specie" variant="outlined" value={editPetForm.species} onChange={e => setEditPetForm(f => ({ ...f, species: e.target.value }))} fullWidth />
                      <TextField label="Rasă" variant="outlined" value={editPetForm.breed} onChange={e => setEditPetForm(f => ({ ...f, breed: e.target.value }))} fullWidth />
                      <TextField select label="Sex" value={editPetForm.sex} onChange={e => setEditPetForm(f => ({ ...f, sex: e.target.value }))} SelectProps={{ native: true }} fullWidth>
                        <option value="">Selectează</option>
                        <option value="mascul">Mascul</option>
                        <option value="femela">Femelă</option>
                      </TextField>
                      <TextField label="Data nașterii / Vârstă estimată" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={editPetForm.birthDate} onChange={e => setEditPetForm(f => ({ ...f, birthDate: e.target.value }))} fullWidth />
                      <TextField label="Culoare / semne distinctive" variant="outlined" value={editPetForm.color} onChange={e => setEditPetForm(f => ({ ...f, color: e.target.value }))} fullWidth />
                      <TextField label="Microcip" variant="outlined" value={editPetForm.microchipId} onChange={e => setEditPetForm(f => ({ ...f, microchipId: e.target.value }))} fullWidth />
                      <TextField label="Număr medalion" variant="outlined" value={editPetForm.tagNumber} onChange={e => setEditPetForm(f => ({ ...f, tagNumber: e.target.value }))} fullWidth />
                      <TextField select label="Sterilizat" value={editPetForm.sterilized} onChange={e => setEditPetForm(f => ({ ...f, sterilized: e.target.value }))} SelectProps={{ native: true }} fullWidth>
                        <option value="">Selectează</option>
                        <option value="da">Da</option>
                        <option value="nu">Nu</option>
                      </TextField>
                      <TextField label="Data sterilizării" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={editPetForm.sterilizationDate} onChange={e => setEditPetForm(f => ({ ...f, sterilizationDate: e.target.value }))} fullWidth />
                      {/* Deparazitare internă: array, nu string! */}
                      {(editPetForm.dewormingInternal || []).map((d, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                          <TextField label="Produs/Tip" variant="outlined" value={d.name || ''} onChange={e => {
                            const arr = [...editPetForm.dewormingInternal];
                            arr[idx].name = e.target.value;
                            setEditPetForm(f => ({ ...f, dewormingInternal: arr }));
                          }} sx={{ flex: 1 }} />
                          <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date || ''} onChange={e => {
                            const arr = [...editPetForm.dewormingInternal];
                            arr[idx].date = e.target.value;
                            setEditPetForm(f => ({ ...f, dewormingInternal: arr }));
                          }} sx={{ flex: 1 }} />
                          <Button color="error" onClick={() => {
                            const arr = editPetForm.dewormingInternal.filter((_, i) => i !== idx);
                            setEditPetForm(f => ({ ...f, dewormingInternal: arr }));
                          }}>Șterge</Button>
                        </Box>
                      ))}
                      <Button variant="outlined" onClick={() => setEditPetForm(f => ({ ...f, dewormingInternal: [...(f.dewormingInternal || []), { name: '', date: '' }] }))}>Adaugă deparazitare internă</Button>
                      {/* Deparazitare externă: array, nu string! */}
                      {(editPetForm.dewormingExternal || []).map((d, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                          <TextField label="Produs/Tip" variant="outlined" value={d.name || ''} onChange={e => {
                            const arr = [...editPetForm.dewormingExternal];
                            arr[idx].name = e.target.value;
                            setEditPetForm(f => ({ ...f, dewormingExternal: arr }));
                          }} sx={{ flex: 1 }} />
                          <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date || ''} onChange={e => {
                            const arr = [...editPetForm.dewormingExternal];
                            arr[idx].date = e.target.value;
                            setEditPetForm(f => ({ ...f, dewormingExternal: arr }));
                          }} sx={{ flex: 1 }} />
                          <Button color="error" onClick={() => {
                            const arr = editPetForm.dewormingExternal.filter((_, i) => i !== idx);
                            setEditPetForm(f => ({ ...f, dewormingExternal: arr }));
                          }}>Șterge</Button>
                        </Box>
                      ))}
                      <Button variant="outlined" onClick={() => setEditPetForm(f => ({ ...f, dewormingExternal: [...(f.dewormingExternal || []), { name: '', date: '' }] }))}>Adaugă deparazitare externă</Button>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Vaccinuri</Typography>
                        {(editPetForm.vaccines || []).map((v, idx) => (
                          <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <TextField label="Nume vaccin" variant="outlined" value={v.name} onChange={e => {
                              const vaccines = [...editPetForm.vaccines];
                              vaccines[idx].name = e.target.value;
                              setEditPetForm(f => ({ ...f, vaccines }));
                            }} sx={{ flex: 1 }} />
                            <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={v.date} onChange={e => {
                              const vaccines = [...editPetForm.vaccines];
                              vaccines[idx].date = e.target.value;
                              setEditPetForm(f => ({ ...f, vaccines }));
                            }} sx={{ flex: 1 }} />
                            <Button color="error" onClick={() => {
                              const vaccines = editPetForm.vaccines.filter((_, i) => i !== idx);
                              setEditPetForm(f => ({ ...f, vaccines }));
                            }}>Șterge</Button>
                          </Box>
                        ))}
                        <Button variant="outlined" onClick={() => setEditPetForm(f => ({ ...f, vaccines: [...(f.vaccines || []), { name: '', date: '' }] }))}>Adaugă vaccin</Button>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={async (e) => {
                          e.preventDefault();
                          // Găsește proprietarul curent
                          const owner = ownerList.find(o => o.pets && o.pets.some(p => p.name === selectedPet.name && p.species === selectedPet.species));
                          if (!owner) return;
                          // Deep copy to avoid React state mutation issues
                          const petCopy = {
                            ...editPetForm,
                            vaccines: editPetForm.vaccines ? editPetForm.vaccines.map(v => ({ ...v })) : [],
                            dewormingInternal: editPetForm.dewormingInternal ? editPetForm.dewormingInternal.map(d => ({ ...d })) : [],
                            dewormingExternal: editPetForm.dewormingExternal ? editPetForm.dewormingExternal.map(d => ({ ...d })) : [],
                          };
                          const updatedPets = owner.pets.map(p =>
                            (p.name === selectedPet.name && p.species === selectedPet.species) ? petCopy : p
                          );
                          await fetch(`http://localhost:4000/admin/staff/${owner.id}`,
                            {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {})
                              },
                              body: JSON.stringify({ pets: updatedPets })
                            });
                          setUsers(users => users.map(u => u.id === owner.id ? { ...u, pets: updatedPets } : u));
                          setSelectedPet(petCopy);
                          setEditPetMode(false);
                          setSuccessOwner('Datele animalului au fost actualizate cu succes!');
                        }}>Salvează modificările</Button>
                        <Button variant="outlined" color="secondary" onClick={() => setEditPetMode(false)}>Anulează</Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography><b>Nume:</b> {selectedPet.name}</Typography>
                      <Typography><b>Specie:</b> {selectedPet.species}</Typography>
                      <Typography><b>Rasă:</b> {selectedPet.breed}</Typography>
                      <Typography><b>Sex:</b> {selectedPet.sex}</Typography>
                      <Typography><b>Data nașterii:</b> {selectedPet.birthDate}</Typography>
                      <Typography><b>Culoare:</b> {selectedPet.color}</Typography>
                      <Typography><b>Microcip:</b> {selectedPet.microchipId}</Typography>
                      <Typography><b>Număr medalion:</b> {selectedPet.tagNumber}</Typography>
                      <Typography><b>Sterilizat:</b> {selectedPet.sterilized}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={() => setSelectedPet(null)}>Închide</Button>
                        <Button variant="contained" color="primary" onClick={() => {
                          setEditPetForm({
                            ...selectedPet,
                            vaccines: selectedPet.vaccines ? selectedPet.vaccines.map(v => ({ ...v })) : [],
                            dewormingInternal: selectedPet.dewormingInternal ? selectedPet.dewormingInternal.map(d => ({ ...d })) : [],
                            dewormingExternal: selectedPet.dewormingExternal ? selectedPet.dewormingExternal.map(d => ({ ...d })) : [],
                          });
                          setEditPetMode(true);
                        }}>Editează</Button>
                        <Button variant="contained" color="info" onClick={() => setShowAdvancedPetDetails(v => !v)}>{showAdvancedPetDetails ? 'Ascunde detalii avansate' : 'Detalii avansate'}</Button>
                        <Button variant="contained" color="error" onClick={() => setShowDeleteConfirm(true)}>Șterge animal</Button>
                      </Box>
                      {showAdvancedPetDetails && (
                        <Box sx={{ mt: 2, p: 2, border: '1px solid #0288d1', borderRadius: 2, background: '#e3f2fd' }}>
                          <Typography variant="subtitle1" color="primary">Detalii avansate</Typography>
                          {editAdvancedMode ? (
                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <TextField
                                label="Data sterilizării"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                value={selectedPet.sterilized === 'da' ? advancedForm.sterilizationDate : ''}
                                onChange={e => setAdvancedForm(f => ({ ...f, sterilizationDate: e.target.value }))}
                                fullWidth
                                disabled={selectedPet.sterilized !== 'da'}
                                helperText={selectedPet.sterilized !== 'da' ? 'Animalul nu este sterilizat' : ''}
                              />
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Deparazitare internă</Typography>
                                {(advancedForm.dewormingInternal || []).map((d, idx) => (
                                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                    <TextField label="Produs/Tip" variant="outlined" value={d.name} onChange={e => {
                                      const dewormingInternal = [...advancedForm.dewormingInternal];
                                      dewormingInternal[idx].name = e.target.value;
                                      setAdvancedForm(f => ({ ...f, dewormingInternal }));
                                    }} sx={{ flex: 1 }} />
                                    <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date} onChange={e => {
                                      const dewormingInternal = [...advancedForm.dewormingInternal];
                                      dewormingInternal[idx].date = e.target.value;
                                      setAdvancedForm(f => ({ ...f, dewormingInternal }));
                                    }} sx={{ flex: 1 }} />
                                    <Button color="error" onClick={() => {
                                      const dewormingInternal = advancedForm.dewormingInternal.filter((_, i) => i !== idx);
                                      setAdvancedForm(f => ({ ...f, dewormingInternal }));
                                    }}>Șterge</Button>
                                  </Box>
                                ))}
                                <Button variant="outlined" onClick={() => setAdvancedForm(f => ({ ...f, dewormingInternal: [...(f.dewormingInternal || []), { name: '', date: '' }] }))}>Adaugă deparazitare internă</Button>
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Deparazitare externă</Typography>
                                {(advancedForm.dewormingExternal || []).map((d, idx) => (
                                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                    <TextField label="Produs/Tip" variant="outlined" value={d.name} onChange={e => {
                                      const dewormingExternal = [...advancedForm.dewormingExternal];
                                      dewormingExternal[idx].name = e.target.value;
                                      setAdvancedForm(f => ({ ...f, dewormingExternal }));
                                    }} sx={{ flex: 1 }} />
                                    <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date} onChange={e => {
                                      const dewormingExternal = [...advancedForm.dewormingExternal];
                                      dewormingExternal[idx].date = e.target.value;
                                      setAdvancedForm(f => ({ ...f, dewormingExternal }));
                                    }} sx={{ flex: 1 }} />
                                    <Button color="error" onClick={() => {
                                      const dewormingExternal = advancedForm.dewormingExternal.filter((_, i) => i !== idx);
                                      setAdvancedForm(f => ({ ...f, dewormingExternal }));
                                    }}>Șterge</Button>
                                  </Box>
                                ))}
                                <Button variant="outlined" onClick={() => setAdvancedForm(f => ({ ...f, dewormingExternal: [...(f.dewormingExternal || []), { name: '', date: '' }] }))}>Adaugă deparazitare externă</Button>
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Vaccinuri</Typography>
                                {(advancedForm.vaccines || []).map((v, idx) => (
                                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                    <TextField label="Nume vaccin" variant="outlined" value={v.name} onChange={e => {
                                      const vaccines = [...advancedForm.vaccines];
                                      vaccines[idx].name = e.target.value;
                                      setAdvancedForm(f => ({ ...f, vaccines }));
                                    }} sx={{ flex: 1 }} />
                                    <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={v.date} onChange={e => {
                                      const vaccines = [...advancedForm.vaccines];
                                      vaccines[idx].date = e.target.value;
                                      setAdvancedForm(f => ({ ...f, vaccines }));
                                    }} sx={{ flex: 1 }} />
                                    <Button color="error" onClick={() => {
                                      const vaccines = advancedForm.vaccines.filter((_, i) => i !== idx);
                                      setAdvancedForm(f => ({ ...f, vaccines }));
                                    }}>Șterge</Button>
                                  </Box>
                                ))}
                                <Button variant="outlined" onClick={() => setAdvancedForm(f => ({ ...f, vaccines: [...(f.vaccines || []), { name: '', date: '' }] }))}>Adaugă vaccin</Button>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button variant="contained" color="primary" onClick={async (e) => {
                                  e.preventDefault();
                                  // Găsește proprietarul curent
                                  const owner = ownerList.find(o => o.pets && o.pets.some(p => p.name === selectedPet.name && p.species === selectedPet.species));
                                  if (!owner) return;
                                  const updatedPets = owner.pets.map(p =>
                                    (p.name === selectedPet.name && p.species === selectedPet.species)
                                      ? { ...p, ...advancedForm }
                                      : p
                                  );
                                  await fetch(`http://localhost:4000/admin/staff/${owner.id}`,
                                    {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {})
                                      },
                                      body: JSON.stringify({ pets: updatedPets })
                                    });
                                  setUsers(users => users.map(u => u.id === owner.id ? { ...u, pets: updatedPets } : u));
                                  setSelectedPet(updatedPets.find(p => p.name === selectedPet.name && p.species === selectedPet.species));
                                  setEditAdvancedMode(false);
                                  setShowAdvancedPetDetails(true);
                                  setSuccessOwner('Detaliile avansate au fost salvate cu succes!');
                                }}>Salvează detalii</Button>
                                <Button variant="outlined" color="secondary" onClick={() => setEditAdvancedMode(false)}>Anulează</Button>
                              </Box>
                            </Box>
                          ) : (
                            <>
                              <Typography><b>Data sterilizării:</b> {selectedPet.sterilized === 'da' ? (selectedPet.sterilizationDate || '-') : 'N/A'}</Typography>
                              {/* Deparazitare internă - label and button horizontally aligned, history below */}
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ mr: 2 }}><b>Deparazitare internă:</b></Typography>
                                  <Button variant="outlined" size="small" onClick={() => setShowInternalHistory(v => !v)}>
                                    {showInternalHistory ? 'Ascunde' : 'Afișează'} istoric
                                  </Button>
                                </Box>
                                {showInternalHistory && (
                                  (selectedPet.dewormingInternal && selectedPet.dewormingInternal.length > 0) ? (
                                    <List sx={{ mt: 1 }}>
                                      {selectedPet.dewormingInternal.map((d, idx) => (
                                        <ListItem key={idx}>
                                          <ListItemText primary={d.name} secondary={d.date} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography color="text.secondary" sx={{ mt: 1 }}>Nu există deparazitări interne înregistrate.</Typography>
                                  )
                                )}
                              </Box>
                              {/* Deparazitare externă - label and button horizontally aligned, history below */}
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ mr: 2 }}><b>Deparazitare externă:</b></Typography>
                                  <Button variant="outlined" size="small" onClick={() => setShowExternalHistory(v => !v)}>
                                    {showExternalHistory ? 'Ascunde' : 'Afișează'} istoric
                                  </Button>
                                </Box>
                                {showExternalHistory && (
                                  (selectedPet.dewormingExternal && selectedPet.dewormingExternal.length > 0) ? (
                                    <List sx={{ mt: 1 }}>
                                      {selectedPet.dewormingExternal.map((d, idx) => (
                                        <ListItem key={idx}>
                                          <ListItemText primary={d.name} secondary={d.date} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography color="text.secondary" sx={{ mt: 1 }}>Nu există deparazitări externe înregistrate.</Typography>
                                  )
                                )}
                              </Box>
                              {/* Vaccinuri - label and button horizontally aligned, history below */}
                              <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Vaccinuri efectuate:</Typography>
                                  <Button variant="outlined" size="small" onClick={() => setShowVaccinesHistory(v => !v)}>
                                    {showVaccinesHistory ? 'Ascunde' : 'Afișează'} istoric
                                  </Button>
                                </Box>
                                {showVaccinesHistory && (
                                  (selectedPet.vaccines && selectedPet.vaccines.length > 0) ? (
                                    <List sx={{ mt: 1 }}>
                                      {selectedPet.vaccines.map((v, idx) => (
                                        <ListItem key={idx}>
                                          <ListItemText primary={v.name} secondary={v.date} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography color="text.secondary" sx={{ mt: 1 }}>Nu există vaccinuri înregistrate.</Typography>
                                  )
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button variant="contained" color="primary" onClick={() => {
                                  setAdvancedForm({
                                    sterilizationDate: selectedPet.sterilizationDate || '',
                                    vaccines: selectedPet.vaccines ? [...selectedPet.vaccines] : [],
                                    dewormingInternal: selectedPet.dewormingInternal || '',
                                    dewormingExternal: selectedPet.dewormingExternal || ''
                                  });
                                  setEditAdvancedMode(true);
                                }}>Editează detalii avansate</Button>
                              </Box>
                            </>
                          )}
                        </Box>
                      )}
                      {showDeleteConfirm && (
                        <Box sx={{ mt: 2, p: 2, border: '1px solid #d32f2f', borderRadius: 2, background: '#fff0f0' }}>
                          <Typography color="error" sx={{ mb: 2 }}>Ești sigur că vrei să ștergi acest animal?</Typography>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" color="error" onClick={async () => {
                              // Găsește proprietarul curent
                              const owner = ownerList.find(o => o.pets && o.pets.some(p => p.name === selectedPet.name && p.species === selectedPet.species));
                              if (!owner) return;
                              const updatedPets = owner.pets.filter(p => !(p.name === selectedPet.name && p.species === selectedPet.species));
                              await fetch(`http://localhost:4000/admin/staff/${owner.id}`,
                                {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {})
                                  },
                                  body: JSON.stringify({ pets: updatedPets })
                                });
                              setUsers(users => users.map(u => u.id === owner.id ? { ...u, pets: updatedPets } : u));
                              setSelectedPet(null);
                              setShowDeleteConfirm(false);
                              setSuccessOwner('Animalul a fost șters cu succes!');
                            }}>Confirmă ștergerea</Button>
                            <Button variant="outlined" onClick={() => setShowDeleteConfirm(false)}>Renunță</Button>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}
            </List>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Administrare personal
  return (
    <Box>
      <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h5" align="center" color="primary" gutterBottom>Administrare personal</Typography>
          <Box sx={{ mb: 2 }}>
            {!showStaffForm && (
              <Button variant="contained" color="primary" onClick={() => { setShowStaffForm(true); setEditingStaff(null); }}>Adaugă personal</Button>
            )}
            {showStaffForm && (
              <Box component="form" onSubmit={handleAddStaff} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField label="Nume utilizator" variant="outlined" value={staffForm.username} onChange={e => setStaffForm(f => ({ ...f, username: e.target.value }))} fullWidth disabled={!!editingStaff} />
                <TextField label="Parolă" type="password" variant="outlined" value={staffForm.password} onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))} fullWidth />
                <TextField label="Nume complet" variant="outlined" value={staffForm.fullName} onChange={e => setStaffForm(f => ({ ...f, fullName: e.target.value }))} fullWidth />
                <TextField label="Email" variant="outlined" value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} fullWidth />
                <TextField label="Telefon" variant="outlined" value={staffForm.phone} onChange={e => setStaffForm(f => ({ ...f, phone: e.target.value }))} fullWidth />
                  <TextField label="Adresa" variant="outlined" value={staffForm.address} onChange={e => setStaffForm(f => ({ ...f, address: e.target.value }))} fullWidth />
                <TextField label="Specializare" variant="outlined" value={staffForm.specialization} onChange={e => setStaffForm(f => ({ ...f, specialization: e.target.value }))} fullWidth />
                <TextField select label="Rol personal" value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))} SelectProps={{ native: true }} fullWidth>
                  <option value="clinic_admin">Administrator clinică</option>
                  <option value="vet">Medic veterinar</option>
                  <option value="assistant">Asistent</option>
                </TextField>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button type="submit" variant="contained" color="primary">{editingStaff ? 'Salvează modificările' : 'Salvează'}</Button>
                  <Button variant="outlined" color="secondary" onClick={() => { setShowStaffForm(false); setEditingStaff(null); }}>Anulează</Button>
                </Box>
              </Box>
            )}
          </Box>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Listă personal</Typography>
          <List>
            {staffList.length === 0 && <ListItem><ListItemText primary="Nu există personal adăugat." /></ListItem>}
            {staffList.map((s) => (
              <ListItem key={s.id} divider button onClick={() => {
                setShowStaffForm(true);
                setEditingStaff(s);
                setStaffForm({
                  username: s.username,
                  password: '',
                  role: s.role,
                  fullName: s.fullName || '',
                  email: s.email || '',
                  phone: s.phone || '',
                  specialization: s.specialization || '',
                  address: s.address || ''
                });
              }} sx={{ cursor: 'pointer' }}>
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
    </Box>
  );
}

export default StaffManager;
