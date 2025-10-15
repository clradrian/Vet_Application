import React, { useEffect, useState } from 'react';
  import { Card, CardContent, Typography, TextField, Button, Box, List, ListItem, ListItemText, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

  function StaffManager({ token, proprietariOnly }) {
  // State pentru afisare istoric deparazitare/vaccinuri
  const [showInternalHistory, setShowInternalHistory] = useState(false);
    const [showExternalHistory, setShowExternalHistory] = useState(false);
    const [showVaccinesHistory, setShowVaccinesHistory] = useState(false);
  // State pentru editare detalii avansate
  const [editAdvancedMode, setEditAdvancedMode] = useState(false);
  const [editAdvancedForm, setEditAdvancedForm] = useState(null);
    // State pentru animal selectat
    const [selectedPet, setSelectedPet] = useState(null);
  // State pentru confirmare ștergere animal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
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
  const [expandedOwnerId, setExpandedOwnerId] = useState(null);

  const fetchOwnersAndPets = async () => {
    try {
      const res = await fetch('http://localhost:4000/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const owners = data.filter(u => u.role === 'pet_owner');
      const staff = data.filter(u => u.role !== 'pet_owner');
      const ownersWithPets = await Promise.all(owners.map(async (owner) => {
        const petsRes = await fetch(`http://localhost:4000/api/pets/${owner.id}`);
        const pets = await petsRes.json();
        return { ...owner, pets };
      }));
      setUsers([...staff, ...ownersWithPets]);
    } catch {
      setError('Failed to fetch staff or pets');
    }
  };

  useEffect(() => {
    fetchOwnersAndPets();
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
        setEditingOwner(data); // set to new owner
        setShowOwnerForm(false);
        setSuccessOwner('Proprietarul a fost adăugat cu succes!');
        setShowPetForm(true); // open pet form automatically
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
                    {/* Show add pet button only when editing an existing owner */}
                    {editingOwner && (
                      <Button variant="outlined" color="primary" onClick={() => setShowPetForm(true)}>
                        Adaugă animal de companie
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            {showPetForm && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
                {/* Deworming Internal */}
                {(editPetForm.dewormingInternal || []).map((d, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <TextField label="Produs/Tip" variant="outlined" value={d.name || ''} onChange={e => {
                      const arr = [...editPetForm.dewormingInternal];
                      arr[idx].name = e.target.value;
                      setEditPetForm(f => ({ ...f, dewormingInternal: arr }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data administrare" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date || ''} onChange={e => {
                      const arr = [...editPetForm.dewormingInternal];
                      arr[idx].date = e.target.value;
                      setEditPetForm(f => ({ ...f, dewormingInternal: arr }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.expiryDate || ''} onChange={e => {
                      const arr = [...editPetForm.dewormingInternal];
                      arr[idx].expiryDate = e.target.value;
                      setEditPetForm(f => ({ ...f, dewormingInternal: arr }));
                    }} sx={{ flex: 1 }} />
                    <Button color="error" onClick={() => {
                      const arr = editPetForm.dewormingInternal.filter((_, i) => i !== idx);
                      setEditPetForm(f => ({ ...f, dewormingInternal: arr }));
                    }}>Șterge</Button>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => setEditPetForm(f => ({ ...f, dewormingInternal: [...(f.dewormingInternal || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă deparazitare internă</Button>
                {/* Deworming External */}
                {(editPetForm.dewormingExternal || []).map((d, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <TextField label="Produs/Tip" variant="outlined" value={d.name || ''} onChange={e => {
                      const arr = [...editPetForm.dewormingExternal];
                      arr[idx].name = e.target.value;
                      setEditPetForm(f => ({ ...f, dewormingExternal: arr }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data administrare" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date || ''} onChange={e => {
                      const arr = [...editPetForm.dewormingExternal];
                      arr[idx].date = e.target.value;
                      setEditPetForm(f => ({ ...f, dewormingExternal: arr }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.expiryDate || ''} onChange={e => {
                      const arr = [...editPetForm.dewormingExternal];
                      arr[idx].expiryDate = e.target.value;
                      setEditPetForm(f => ({ ...f, dewormingExternal: arr }));
                    }} sx={{ flex: 1 }} />
                    <Button color="error" onClick={() => {
                      const arr = editPetForm.dewormingExternal.filter((_, i) => i !== idx);
                      setEditPetForm(f => ({ ...f, dewormingExternal: arr }));
                    }}>Șterge</Button>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => setEditPetForm(f => ({ ...f, dewormingExternal: [...(f.dewormingExternal || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă deparazitare externă</Button>
                {/* Vaccines */}
                {(editPetForm.vaccines || []).map((v, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <TextField label="Nume vaccin" variant="outlined" value={v.name} onChange={e => {
                      const vaccines = [...editPetForm.vaccines];
                      vaccines[idx].name = e.target.value;
                      setEditPetForm(f => ({ ...f, vaccines }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data administrare" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={v.date} onChange={e => {
                      const vaccines = [...editPetForm.vaccines];
                      vaccines[idx].date = e.target.value;
                      setEditPetForm(f => ({ ...f, vaccines }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={v.expiryDate} onChange={e => {
                      const vaccines = [...editPetForm.vaccines];
                      vaccines[idx].expiryDate = e.target.value;
                      setEditPetForm(f => ({ ...f, vaccines }));
                    }} sx={{ flex: 1 }} />
                    <Button color="error" onClick={() => {
                      const vaccines = editPetForm.vaccines.filter((_, i) => i !== idx);
                      setEditPetForm(f => ({ ...f, vaccines }));
                    }}>Șterge</Button>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => setEditPetForm(f => ({ ...f, vaccines: [...(f.vaccines || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă vaccin</Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      setError('');
                      let errorMsg = '';
                      if (editingOwner) {
                        try {
                          // Patch: convert empty date fields to null
                          const petPayload = {
                            owner_id: editingOwner.id,
                            ...petForm,
                            birthDate: petForm.birthDate ? petForm.birthDate : null,
                            sterilizationDate: petForm.sterilizationDate ? petForm.sterilizationDate : null
                          };
                          const petRes = await fetch('http://localhost:4000/api/pets', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {})
                            },
                            body: JSON.stringify(petPayload)
                          });
                          const petData = await petRes.json();
                          if (!petRes.ok) {
                            errorMsg = petData.error || 'Eroare la salvarea animalului';
                            setError(errorMsg);
                            console.error('Pet save error:', petData);
                            return;
                          }
                          // Save vaccines
                          if (petForm.vaccines && petForm.vaccines.length > 0 && petData.id) {
                            await Promise.all(petForm.vaccines.map(v =>
                              fetch('http://localhost:4000/api/vaccines', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                body: JSON.stringify({ pet_id: petData.id, name: v.name, date: v.date, expiryDate: v.expiryDate })
                              })
                            ));
                          }
                          // Save dewormingInternal
                          if (petForm.dewormingInternal && petForm.dewormingInternal.length > 0 && petData.id) {
                            await Promise.all(petForm.dewormingInternal.map(d =>
                              fetch('http://localhost:4000/api/dewormings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                body: JSON.stringify({ pet_id: petData.id, name: d.name, date: d.date, expiryDate: d.expiryDate, type: 'internal' })
                              })
                            ));
                          }
                          // Save dewormingExternal
                          if (petForm.dewormingExternal && petForm.dewormingExternal.length > 0 && petData.id) {
                            await Promise.all(petForm.dewormingExternal.map(d =>
                              fetch('http://localhost:4000/api/dewormings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                body: JSON.stringify({ pet_id: petData.id, name: d.name, date: d.date, expiryDate: d.expiryDate, type: 'external' })
                              })
                            ));
                          }
                          // Refetch owners and pets
                          await fetchOwnersAndPets();
                        } catch (err) {
                          setError('Eroare la comunicarea cu backend-ul');
                          console.error('Pet save fetch error:', err);
                          return;
                        }
                      }
                      // Always refetch after adding a pet
                      await fetchOwnersAndPets();
                      setShowPetForm(false);
                      setPetForm({ name: '', species: '', breed: '', sex: '', birthDate: '', color: '', microchipId: '', tagNumber: '', sterilized: '', photo: null, vaccines: [], dewormingInternal: [], dewormingExternal: [] });
                    }}
                  >Salvează animal</Button>
                  <Button variant="outlined" color="secondary" onClick={() => setShowPetForm(false)}>Anulează</Button>
                </Box>
              </Box>
            )}
            {successOwner && <Alert severity="success" sx={{ mb: 2 }}>{successOwner}</Alert>}
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Listă proprietari de animale</Typography>
            <List>
              {ownerList.length === 0 && <ListItem><ListItemText primary="Nu există proprietari adăugați." /></ListItem>}
              {ownerList.map((o) => (
                <ListItem key={o.id} divider sx={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box onClick={() => {
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
                    }} sx={{ flex: 1 }}>
                      <ListItemText
                        primary={<><b>{o.username}</b>{o.fullName && <> &mdash; {o.fullName}</>}{o.phone && <> &mdash; {o.phone}</>}</>}
                        secondary={o.email && <span><b>Email:</b> {o.email}</span>}
                      />
                    </Box>
                    <Button size="small" variant="contained" sx={{ ml: 2 }} onClick={e => {
                      e.stopPropagation();
                      setExpandedOwnerId(expandedOwnerId === o.id ? null : o.id);
                    }}>
                      {expandedOwnerId === o.id ? 'Ascunde animalele de companie' : 'Afișează animalele de companie'}
                    </Button>
                  </Box>
                  {expandedOwnerId === o.id && (
                    <>
                      {Array.isArray(o.pets) && o.pets.length > 0 ? (
                        <Box sx={{ mt: 1, ml: 2 }}>
                          <Typography variant="subtitle2" color="secondary">Animale:</Typography>
                          <List dense>
                            {o.pets.map(pet => (
                              <ListItem key={pet.id} sx={{ pl: 0 }}>
                                <ListItemText
                                  primary={<span><b>{pet.name}</b> ({pet.species})</span>}
                                  secondary={pet.breed ? `Rasă: ${pet.breed}` : null}
                                />
                                <Button size="small" variant="outlined" sx={{ ml: 2 }} onClick={e => {
                                  e.stopPropagation();
                                  setSelectedPet(pet);
                                  setShowAdvancedPetDetails(true);
                                }}>Detalii avansate</Button>
                                <Button size="small" color="error" variant="outlined" sx={{ ml: 1 }} onClick={e => {
                                  e.stopPropagation();
                                  setPetToDelete(pet);
                                  setShowDeleteConfirm(true);
                                }}>Șterge</Button>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>Nu are animale salvate.</Typography>
                      )}
                    </>
                  )}
                </ListItem>
              ))}
            </List>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
        {/* Modal for advanced pet details */}
        <Dialog open={showAdvancedPetDetails} onClose={() => { setShowAdvancedPetDetails(false); setEditAdvancedMode(false); }} maxWidth="sm" fullWidth>
          <DialogTitle>Detalii avansate animal</DialogTitle>
          <DialogContent dividers>
            {selectedPet ? (
              !editAdvancedMode ? (
                <Box>
                  <Typography><b>Nume:</b> {selectedPet.name}</Typography>
                  <Typography><b>Specie:</b> {selectedPet.species}</Typography>
                  <Typography><b>Rasă:</b> {selectedPet.breed}</Typography>
                  <Typography><b>Sex:</b> {selectedPet.sex}</Typography>
                  <Typography><b>Data nașterii:</b> {selectedPet.birthDate || '-'}</Typography>
                  <Typography><b>Culoare:</b> {selectedPet.color}</Typography>
                  <Typography><b>Microcip:</b> {selectedPet.microchipId}</Typography>
                  <Typography><b>Număr medalion:</b> {selectedPet.tagNumber}</Typography>
                  <Typography><b>Sterilizat:</b> {selectedPet.sterilized}</Typography>
                  <Typography><b>Data sterilizare:</b> {selectedPet.sterilizationDate || '-'}</Typography>
                  {/* Istoric vaccinuri */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary">Istoric vaccinuri</Typography>
                    {Array.isArray(selectedPet.vaccines) && selectedPet.vaccines.length > 0 ? (
                      <List dense>
                        {selectedPet.vaccines.map((v, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={v.name} secondary={v.date ? `Data: ${v.date}` : null} />
                          </ListItem>
                        ))}
                      </List>
                    ) : <Typography color="text.secondary">Nu există vaccinuri salvate.</Typography>}
                  </Box>
                  {/* Istoric deparazitări interne */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary">Istoric deparazitări interne</Typography>
                    {Array.isArray(selectedPet.dewormingInternal) && selectedPet.dewormingInternal.length > 0 ? (
                      <List dense>
                        {selectedPet.dewormingInternal.map((d, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={d.name} secondary={d.date ? `Data: ${d.date}` : null} />
                          </ListItem>
                        ))}
                      </List>
                    ) : <Typography color="text.secondary">Nu există deparazitări interne salvate.</Typography>}
                  </Box>
                  {/* Istoric deparazitări externe */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary">Istoric deparazitări externe</Typography>
                    {Array.isArray(selectedPet.dewormingExternal) && selectedPet.dewormingExternal.length > 0 ? (
                      <List dense>
                        {selectedPet.dewormingExternal.map((d, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={d.name} secondary={d.date ? `Data: ${d.date}` : null} />
                          </ListItem>
                        ))}
                      </List>
                    ) : <Typography color="text.secondary">Nu există deparazitări externe salvate.</Typography>}
                  </Box>
                </Box>
              ) : (
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Nume" value={editAdvancedForm.name || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                  <TextField label="Specie" value={editAdvancedForm.species || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, species: e.target.value }))} fullWidth />
                  <TextField label="Rasă" value={editAdvancedForm.breed || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, breed: e.target.value }))} fullWidth />
                  <TextField label="Sex" value={editAdvancedForm.sex || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, sex: e.target.value }))} fullWidth />
                  <TextField label="Data nașterii" type="date" InputLabelProps={{ shrink: true }} value={editAdvancedForm.birthDate || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, birthDate: e.target.value }))} fullWidth />
                  <TextField label="Culoare" value={editAdvancedForm.color || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, color: e.target.value }))} fullWidth />
                  <TextField label="Microcip" value={editAdvancedForm.microchipId || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, microchipId: e.target.value }))} fullWidth />
                  <TextField label="Număr medalion" value={editAdvancedForm.tagNumber || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, tagNumber: e.target.value }))} fullWidth />
                  <TextField label="Sterilizat" value={editAdvancedForm.sterilized || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, sterilized: e.target.value }))} fullWidth />
                  <TextField label="Data sterilizare" type="date" InputLabelProps={{ shrink: true }} value={editAdvancedForm.sterilizationDate || ''} onChange={e => setEditAdvancedForm(f => ({ ...f, sterilizationDate: e.target.value }))} fullWidth />
                  {/* Vaccines */}
                  <Typography variant="subtitle2" color="primary">Vaccinuri</Typography>
                  {(editAdvancedForm.vaccines || []).map((v, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField label="Nume vaccin" value={v.name || ''} onChange={e => {
                        const arr = [...editAdvancedForm.vaccines];
                        arr[idx].name = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, vaccines: arr }));
                      }} sx={{ flex: 1 }} />
                      <TextField label="Data administrare" type="date" InputLabelProps={{ shrink: true }} value={v.date || ''} onChange={e => {
                        const arr = [...editAdvancedForm.vaccines];
                        arr[idx].date = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, vaccines: arr }));
                      }} sx={{ flex: 1 }} />
                      <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} value={v.expiryDate || ''} onChange={e => {
                        const arr = [...editAdvancedForm.vaccines];
                        arr[idx].expiryDate = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, vaccines: arr }));
                      }} sx={{ flex: 1 }} />
                      <Button color="error" onClick={() => {
                        setEditAdvancedForm(f => ({ ...f, vaccines: f.vaccines.filter((_, i) => i !== idx) }));
                      }}>Șterge</Button>
                    </Box>
                  ))}
                  <Button variant="outlined" onClick={() => setEditAdvancedForm(f => ({ ...f, vaccines: [...(f.vaccines || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă vaccin</Button>
                  {/* Deworming Internal */}
                  <Typography variant="subtitle2" color="primary">Deparazitări interne</Typography>
                  {(editAdvancedForm.dewormingInternal || []).map((d, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField label="Produs/Tip" value={d.name || ''} onChange={e => {
                        const arr = [...editAdvancedForm.dewormingInternal];
                        arr[idx].name = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, dewormingInternal: arr }));
                      }} sx={{ flex: 1 }} />
                      <TextField label="Data administrare" type="date" InputLabelProps={{ shrink: true }} value={d.date || ''} onChange={e => {
                        const arr = [...editAdvancedForm.dewormingInternal];
                        arr[idx].date = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, dewormingInternal: arr }));
                      }} sx={{ flex: 1 }} />
                      <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} value={d.expiryDate || ''} onChange={e => {
                        const arr = [...editAdvancedForm.dewormingInternal];
                        arr[idx].expiryDate = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, dewormingInternal: arr }));
                      }} sx={{ flex: 1 }} />
                      <Button color="error" onClick={() => {
                        setEditAdvancedForm(f => ({ ...f, dewormingInternal: f.dewormingInternal.filter((_, i) => i !== idx) }));
                      }}>Șterge</Button>
                    </Box>
                  ))}
                  <Button variant="outlined" onClick={() => setEditAdvancedForm(f => ({ ...f, dewormingInternal: [...(f.dewormingInternal || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă deparazitare internă</Button>
                  {/* Deworming External */}
                  <Typography variant="subtitle2" color="primary">Deparazitări externe</Typography>
                  {(editAdvancedForm.dewormingExternal || []).map((d, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField label="Produs/Tip" value={d.name || ''} onChange={e => {
                        const arr = [...editAdvancedForm.dewormingExternal];
                        arr[idx].name = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, dewormingExternal: arr }));
                      }} sx={{ flex: 1 }} />
                      <TextField label="Data administrare" type="date" InputLabelProps={{ shrink: true }} value={d.date || ''} onChange={e => {
                        const arr = [...editAdvancedForm.dewormingExternal];
                        arr[idx].date = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, dewormingExternal: arr }));
                      }} sx={{ flex: 1 }} />
                      <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} value={d.expiryDate || ''} onChange={e => {
                        const arr = [...editAdvancedForm.dewormingExternal];
                        arr[idx].expiryDate = e.target.value;
                        setEditAdvancedForm(f => ({ ...f, dewormingExternal: arr }));
                      }} sx={{ flex: 1 }} />
                      <Button color="error" onClick={() => {
                        setEditAdvancedForm(f => ({ ...f, dewormingExternal: f.dewormingExternal.filter((_, i) => i !== idx) }));
                      }}>Șterge</Button>
                    </Box>
                  ))}
                  <Button variant="outlined" onClick={() => setEditAdvancedForm(f => ({ ...f, dewormingExternal: [...(f.dewormingExternal || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă deparazitare externă</Button>
                </Box>
              )
            ) : <Typography>Nu există detalii pentru acest animal.</Typography>}
          </DialogContent>
          <DialogActions>
            {!editAdvancedMode ? (
              <Button onClick={() => { setEditAdvancedMode(true); setEditAdvancedForm(selectedPet); }} color="primary">Editează</Button>
            ) : (
              <>
                <Button onClick={async () => {
                  // Save changes to backend
                  try {
                    // PATCH pet details
                    await fetch(`http://localhost:4000/api/pets/${editAdvancedForm.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}) },
                      body: JSON.stringify({
                        ...editAdvancedForm,
                        birthDate: editAdvancedForm.birthDate ? editAdvancedForm.birthDate : null,
                        sterilizationDate: editAdvancedForm.sterilizationDate ? editAdvancedForm.sterilizationDate : null
                      })
                    });
                    // PATCH vaccines
                    if (editAdvancedForm.vaccines && editAdvancedForm.vaccines.length > 0) {
                      await Promise.all(editAdvancedForm.vaccines.map(v =>
                        fetch(`http://localhost:4000/api/vaccines/${v.id || ''}`, {
                          method: v.id ? 'PATCH' : 'POST',
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                          body: JSON.stringify({ pet_id: editAdvancedForm.id, name: v.name, date: v.date, expiryDate: v.expiryDate })
                        })
                      ));
                    }
                    // PATCH dewormings
                    if (editAdvancedForm.dewormingInternal && editAdvancedForm.dewormingInternal.length > 0) {
                      await Promise.all(editAdvancedForm.dewormingInternal.map(d =>
                        fetch(`http://localhost:4000/api/dewormings/${d.id || ''}`, {
                          method: d.id ? 'PATCH' : 'POST',
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                          body: JSON.stringify({ pet_id: editAdvancedForm.id, name: d.name, date: d.date, expiryDate: d.expiryDate, type: 'internal' })
                        })
                      ));
                    }
                    if (editAdvancedForm.dewormingExternal && editAdvancedForm.dewormingExternal.length > 0) {
                      await Promise.all(editAdvancedForm.dewormingExternal.map(d =>
                        fetch(`http://localhost:4000/api/dewormings/${d.id || ''}`, {
                          method: d.id ? 'PATCH' : 'POST',
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                          body: JSON.stringify({ pet_id: editAdvancedForm.id, name: d.name, date: d.date, expiryDate: d.expiryDate, type: 'external' })
                        })
                      ));
                    }
                    // Refetch owners and pets
                    await fetchOwnersAndPets();
                    setShowAdvancedPetDetails(false);
                    setEditAdvancedMode(false);
                  } catch (err) {
                    alert('Eroare la salvarea modificărilor!');
                  }
                }} color="primary">Salvează</Button>
                <Button onClick={() => setEditAdvancedMode(false)} color="secondary">Anulează</Button>
              </>
            )}
            <Button onClick={() => { setShowAdvancedPetDetails(false); setEditAdvancedMode(false); }} color="inherit">Închide</Button>
          </DialogActions>
        </Dialog>
        {/* Confirmare ștergere animal */}
        <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
          <DialogTitle>Confirmare ștergere</DialogTitle>
          <DialogContent>
            <Typography>Sigur doriți să ștergeți animalul <b>{petToDelete?.name}</b>? Această acțiune nu poate fi anulată.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteConfirm(false)} color="inherit">Anulează</Button>
            <Button color="error" onClick={async () => {
              try {
                await fetch(`http://localhost:4000/api/pets/${petToDelete.id}`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                });
                setShowDeleteConfirm(false);
                setPetToDelete(null);
                await fetchOwnersAndPets();
              } catch (err) {
                alert('Eroare la ștergerea animalului!');
              }
            }}>Șterge</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  if (!proprietariOnly) {
    // Administrare personal
    return (
      <Box>
        <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h5" align="center" color="primary" gutterBottom>Administrare personal</Typography>
            <Box sx={{ mb: 2 }}>
              {!showStaffForm && (
                <Button variant="contained" color="primary" onClick={() => {
                  setShowStaffForm(true);
                  setEditingStaff(null);
                  setStaffForm({ username: '', password: '', role: 'vet', fullName: '', email: '', phone: '', specialization: '', address: '' });
                }}>Adaugă personal</Button>
              )}
              {showStaffForm && (
                <Box component="form" onSubmit={handleAddStaff} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField label="Nume utilizator" variant="outlined" value={staffForm.username} onChange={e => setStaffForm(f => ({ ...f, username: e.target.value }))} fullWidth disabled={!!editingStaff} />
                  <TextField label="Parolă" type="password" variant="outlined" value={staffForm.password} onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))} fullWidth />
                  <TextField label="Nume complet" variant="outlined" value={staffForm.fullName} onChange={e => setStaffForm(f => ({ ...f, fullName: e.target.value }))} fullWidth />
                  <TextField label="Email" variant="outlined" value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} fullWidth />
                  <TextField label="Telefon" variant="outlined" value={staffForm.phone} onChange={e => setStaffForm(f => ({ ...f, phone: e.target.value }))} fullWidth />
                  <TextField label="Specializare" variant="outlined" value={staffForm.specialization || ''} onChange={e => setStaffForm(f => ({ ...f, specialization: e.target.value }))} fullWidth />
                  <TextField label="Adresă" variant="outlined" value={staffForm.address || ''} onChange={e => setStaffForm(f => ({ ...f, address: e.target.value }))} fullWidth />
                  <TextField select label="Rol" value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))} SelectProps={{ native: true }} fullWidth>
                    <option value="vet">Medic veterinar</option>
                    <option value="asistent">Asistent</option>
                    <option value="receptioner">Receptioner</option>
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
                <ListItem key={s.id} divider sx={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box onClick={() => {
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
                    }} sx={{ flex: 1 }}>
                      <ListItemText
                        primary={<><b>{s.username}</b>{s.fullName && <> &mdash; {s.fullName}</>}{s.phone && <> &mdash; {s.phone}</>}</>}
                        secondary={s.email && <span><b>Email:</b> {s.email}</span>}
                      />
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
      </Box>
    );
  }

}
export default StaffManager;
