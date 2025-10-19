import React, { useEffect, useState } from 'react';
  import { Card, CardContent, Typography, TextField, Button, Box, List, ListItem, ListItemText, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Pagination } from '@mui/material';
  import { loadHistoryState, saveHistoryState } from './utils/historyState';
  import { sortByAdminDate } from './utils/sortByAdminDate';

  function StaffManager({ token, proprietariOnly }) {
  // State pentru afisare istoric deparazitare/vaccinuri
  const [showInternalHistory, setShowInternalHistory] = useState(false);
    const [showExternalHistory, setShowExternalHistory] = useState(false);
    const [showVaccinesHistory, setShowVaccinesHistory] = useState(false);
  // Toggle showing expired administrations per-section
  const [showExpiredVaccines, setShowExpiredVaccines] = useState(false);
  const [showExpiredInternal, setShowExpiredInternal] = useState(false);
  const [showExpiredExternal, setShowExpiredExternal] = useState(false);
  // State pentru editare detalii avansate
  const [editAdvancedMode, setEditAdvancedMode] = useState(false);
  const [editAdvancedForm, setEditAdvancedForm] = useState(null);
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
    // per-record editing inside advanced edit form
    const [editingItem, setEditingItem] = useState(null); // { section: 'vaccines'|'dewormingInternal'|'dewormingExternal', idx }
    const [editingBackup, setEditingBackup] = useState(null);
  // State comun
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Date helpers for display and calculations
  const parseDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };
  const monthAbbrRo = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const formatDateShort = (s) => {
    const d = parseDate(s);
    if (!d) return s || '';
    const dd = (`0${d.getDate()}`).slice(-2);
    const mm = monthAbbrRo[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };
  const daysBetween = (from, to) => {
    if (!from || !to) return null;
    const ms = to.getTime() - from.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  };
  
  const renderExpiryInfo = (adminDateStr, expiryDateStr) => {
    const expiry = parseDate(expiryDateStr);
    const admin = parseDate(adminDateStr);
    if (!expiry) return null;
    const now = new Date();
    const totalValidity = admin && expiry ? daysBetween(admin, expiry) : null;
    const daysLeft = daysBetween(now, expiry);
    if (daysLeft === null) return null;
    if (daysLeft < 0) {
      return (
        <Box>
          <Typography variant="caption" color="error">Expirat ({formatDateShort(expiryDateStr)})</Typography>
          <Typography variant="caption" color="error"> — valabilitate: {totalValidity ?? 'N/A'} zile</Typography>
        </Box>
      );
    }
    return (
      <Box>
        <Typography variant="caption" color="text.secondary">Expiră: {formatDateShort(expiryDateStr)} ({daysLeft} zile)</Typography>
        <Typography variant="caption" color="text.secondary"> — valabilitate: {totalValidity ?? 'N/A'} zile</Typography>
      </Box>
    );
  };

  const getExpiryMeta = (adminDateStr, expiryDateStr) => {
    const expiry = parseDate(expiryDateStr);
    const admin = parseDate(adminDateStr);
    if (!expiry) return { expiry, admin, daysLeft: null, totalValidity: null, expired: false };
    const now = new Date();
    const totalValidity = admin && expiry ? daysBetween(admin, expiry) : null;
    const daysLeft = daysBetween(now, expiry);
    return { expiry, admin, daysLeft, totalValidity, expired: daysLeft !== null && daysLeft < 0 };
  };

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

  // State pentru paginare
  const [ownersPage, setOwnersPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const [ownersPageInput, setOwnersPageInput] = useState('1');
  const [staffPageInput, setStaffPageInput] = useState('1');
  const ITEMS_PER_PAGE = 10;

  // State pentru căutare/filtrare
  const [ownersSearchTerm, setOwnersSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');

  // Funcții pentru navigarea directă la pagină
  const handleOwnersPageInputChange = (e) => {
    const value = e.target.value;
    setOwnersPageInput(value);
  };

  const handleOwnersPageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(ownersPageInput);
    if (pageNum >= 1 && pageNum <= ownersTotalPages) {
      setOwnersPage(pageNum);
      setExpandedOwnerId(null); // Închide detaliile când schimbăm pagina
    } else {
      setOwnersPageInput(ownersPage.toString()); // Reset la pagina curentă dacă input invalid
    }
  };

  const handleStaffPageInputChange = (e) => {
    const value = e.target.value;
    setStaffPageInput(value);
  };

  const handleStaffPageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(staffPageInput);
    if (pageNum >= 1 && pageNum <= staffTotalPages) {
      setStaffPage(pageNum);
    } else {
      setStaffPageInput(staffPage.toString()); // Reset la pagina curentă dacă input invalid
    }
  };

  // Sincronizare input cu pagina curentă
  useEffect(() => {
    setOwnersPageInput(ownersPage.toString());
  }, [ownersPage]);

  useEffect(() => {
    setStaffPageInput(staffPage.toString());
  }, [staffPage]);

  // Reset pagina la 1 când se schimbă termenul de căutare
  useEffect(() => {
    setOwnersPage(1);
    setOwnersPageInput('1');
  }, [ownersSearchTerm]);

  useEffect(() => {
    setStaffPage(1);
    setStaffPageInput('1');
  }, [staffSearchTerm]);

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
        const petsRaw = await petsRes.json();
        // Normalize keys from backend (which returns lowercase JSON keys) to camelCase used in frontend
        const pets = (petsRaw || []).map(p => {
          const vaccines = (p.vaccines || []).map(v => ({ ...v, expiryDate: v.expiryDate || v.expirydate || v.expiry }));
          const dewormings = (p.deworminginternal || p.dewormings || p.dewormingInternal || p.dewormingExternal || []).map(d => ({ ...d, expiryDate: d.expiryDate || d.expirydate || d.expiry }));
          // dewormings come partitioned by backend into dewormingInternal/dewormingExternal already, but normalize casing
          const dewormingInternal = (p.dewormingInternal || p.deworminginternal || []).map(d => ({ ...d, expiryDate: d.expiryDate || d.expirydate || d.expiry }));
          const dewormingExternal = (p.dewormingExternal || p.dewormingexternal || []).map(d => ({ ...d, expiryDate: d.expiryDate || d.expirydate || d.expiry }));
          return {
            ...p,
            // normalize pet-level keys
            birthDate: p.birthDate || p.birthdate || null,
            microchipId: p.microchipId || p.microchipid || null,
            tagNumber: p.tagNumber || p.tagnumber || null,
            sterilizationDate: p.sterilizationDate || p.sterilizationdate || null,
            vaccines,
            dewormingInternal,
            dewormingExternal,
            schedules: p.schedules || []
          };
        });
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

  // Ștergere animal
  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi animalul "${petName}"? Această acțiune nu poate fi anulată.`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/pets/${petId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete pet');
      }

      // Refresh the list after deletion
      await fetchOwnersAndPets();
      setSuccessOwner('Animalul a fost șters cu succes!');
      // Auto-hide success message after 2 seconds
      setTimeout(() => setSuccessOwner(''), 2000);
    } catch (err) {
      setError(err.message || 'Eroare la ștergerea animalului');
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  // Test notifications function
  const testNotifications = async () => {
    try {
      const response = await fetch('http://localhost:4000/admin/test-notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessStaff('Test notificări completat! Verifică consola backend-ului pentru detalii.');
        setTimeout(() => setSuccessStaff(''), 2000);
      } else {
        setError('Eroare la testarea notificărilor');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Error testing notifications:', err);
      setError('Eroare la conectarea cu serverul');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Add/edit staff function
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
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(''), 5000);
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
        // Auto-hide success message after 2 seconds
        setTimeout(() => setSuccessOwner(''), 2000);
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
        // Auto-hide success message after 2 seconds
        setTimeout(() => setSuccessOwner(''), 2000);
      }
    } catch (err) {
      setError(err.message);
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  // Sortare alfabetică și filtrare după nume pentru personal
  const allStaff = users
    .filter(u => u.role !== 'pet_owner')
    .filter(u => {
      const searchTerm = staffSearchTerm.toLowerCase();
      const fullName = (u.fullName || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return fullName.includes(searchTerm) || username.includes(searchTerm);
    })
    .sort((a, b) => {
      const nameA = a.fullName || a.username || '';
      const nameB = b.fullName || b.username || '';
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
    });
  
  const staffTotalPages = Math.max(1, Math.ceil(allStaff.length / ITEMS_PER_PAGE));
  const staffStartIndex = (staffPage - 1) * ITEMS_PER_PAGE;
  const staffEndIndex = staffStartIndex + ITEMS_PER_PAGE;
  const staffList = allStaff.slice(staffStartIndex, staffEndIndex);

  // Sortare alfabetică și filtrare după nume pentru proprietari
  const allOwners = users
    .filter(u => u.role === 'pet_owner')
    .filter(u => {
      const searchTerm = ownersSearchTerm.toLowerCase();
      const fullName = (u.fullName || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return fullName.includes(searchTerm) || username.includes(searchTerm);
    })
    .sort((a, b) => {
      const nameA = a.fullName || a.username || '';
      const nameB = b.fullName || b.username || '';
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
    });
  
  const ownersTotalPages = Math.max(1, Math.ceil(allOwners.length / ITEMS_PER_PAGE));
  const ownersStartIndex = (ownersPage - 1) * ITEMS_PER_PAGE;
  const ownersEndIndex = ownersStartIndex + ITEMS_PER_PAGE;
  const ownerList = allOwners.slice(ownersStartIndex, ownersEndIndex);

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
                  </Box>
                </Box>
              )}
            </Box>
            {showPetForm && editingOwner && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Typography variant="subtitle1" color="primary">Adaugă animal pentru: {editingOwner.fullName || editingOwner.username}</Typography>
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
                    <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date || ''} onChange={e => {
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
                    <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={d.date || ''} onChange={e => {
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
                    <TextField label="Nume vaccin" variant="outlined" value={v.name || ''} onChange={e => {
                      const vaccines = [...editPetForm.vaccines];
                      vaccines[idx].name = e.target.value;
                      setEditPetForm(f => ({ ...f, vaccines }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={v.date || ''} onChange={e => {
                      const vaccines = [...editPetForm.vaccines];
                      vaccines[idx].date = e.target.value;
                      setEditPetForm(f => ({ ...f, vaccines }));
                    }} sx={{ flex: 1 }} />
                    <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} variant="outlined" value={v.expiryDate || ''} onChange={e => {
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
                              Authorization: `Bearer ${token}`
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
                          // Validate and Save vaccines
                          if (petForm.vaccines && petForm.vaccines.length > 0 && petData.id) {
                            for (const v of petForm.vaccines) {
                              if (v.expiryDate && v.date && parseDate(v.expiryDate) && parseDate(v.date)) {
                                if (parseDate(v.expiryDate) < parseDate(v.date)) {
                                  setError('Data de expirare nu poate fi înaintea datei de administrare pentru vaccinuri');
                                  // Auto-hide error message after 5 seconds
                                  setTimeout(() => setError(''), 5000);
                                  return;
                                }
                              }
                            }
                            await Promise.all(petForm.vaccines.map(v =>
                              fetch('http://localhost:4000/api/vaccines', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ pet_id: petData.id, ...v, expiryDate: v.expiryDate ? v.expiryDate : null })
                              })
                            ));
                          }
                          // Save dewormingInternal
                          if (petForm.dewormingInternal && petForm.dewormingInternal.length > 0 && petData.id) {
                            for (const d of petForm.dewormingInternal) {
                              if (d.expiryDate && d.date && parseDate(d.expiryDate) && parseDate(d.date)) {
                                if (parseDate(d.expiryDate) < parseDate(d.date)) {
                                  setError('Data de expirare nu poate fi înaintea datei de administrare pentru deparazitări interne');
                                  // Auto-hide error message after 5 seconds
                                  setTimeout(() => setError(''), 5000);
                                  return;
                                }
                              }
                            }
                            await Promise.all(petForm.dewormingInternal.map(d =>
                              fetch('http://localhost:4000/api/dewormings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ pet_id: petData.id, ...d, type: 'internal', expiryDate: d.expiryDate ? d.expiryDate : null })
                              })
                            ));
                          }
                          // Save dewormingExternal
                          if (petForm.dewormingExternal && petForm.dewormingExternal.length > 0 && petData.id) {
                            for (const d of petForm.dewormingExternal) {
                              if (d.expiryDate && d.date && parseDate(d.expiryDate) && parseDate(d.date)) {
                                if (parseDate(d.expiryDate) < parseDate(d.date)) {
                                  setError('Data de expirare nu poate fi înaintea datei de administrare pentru deparazitări externe');
                                  // Auto-hide error message after 5 seconds
                                  setTimeout(() => setError(''), 5000);
                                  return;
                                }
                              }
                            }
                            await Promise.all(petForm.dewormingExternal.map(d =>
                              fetch('http://localhost:4000/api/dewormings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ pet_id: petData.id, ...d, type: 'external', expiryDate: d.expiryDate ? d.expiryDate : null })
                              })
                            ));
                          }
                          // Refetch owners and pets
                          await fetchOwnersAndPets();
                        } catch (err) {
                          setError('Eroare la comunicarea cu backend-ul');
                          // Auto-hide error message after 5 seconds
                          setTimeout(() => setError(''), 5000);
                          console.error('Pet save fetch error:', err);
                          return;
                        }
                      }
                      setShowPetForm(false);
                      setShowOwnerForm(false);
                      setEditingOwner(null);
                      setPetForm({ name: '', species: '', breed: '', sex: '', birthDate: '', color: '', microchipId: '', tagNumber: '', sterilized: '', photo: null });
                    }}
                  >Salvează animal</Button>
                  <Button variant="outlined" color="secondary" onClick={() => {
                    setShowPetForm(false);
                    setShowOwnerForm(false);
                    setEditingOwner(null);
                    setPetForm({ name: '', species: '', breed: '', sex: '', birthDate: '', color: '', microchipId: '', tagNumber: '', sterilized: '', photo: null });
                  }}>Anulează</Button>
                </Box>
              </Box>
            )}
            {successOwner && <Alert severity="success" sx={{ mb: 2 }}>{successOwner}</Alert>}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 1 }}>
              <Typography variant="h6" color="primary">Listă proprietari de animale</Typography>
              <TextField
                size="small"
                placeholder="Caută după nume..."
                value={ownersSearchTerm}
                onChange={(e) => setOwnersSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </Box>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" color="primary" sx={{ ml: 1 }} onClick={e => {
                        e.stopPropagation();
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
                        setShowPetForm(true);
                      }}>
                        Adaugă animal
                      </Button>
                      <Button size="small" variant="contained" onClick={e => {
                        e.stopPropagation();
                        setExpandedOwnerId(expandedOwnerId === o.id ? null : o.id);
                      }}>
                        {expandedOwnerId === o.id ? 'Ascunde animalele de companie' : 'Afișează animalele de companie'}
                      </Button>
                    </Box>
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
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button size="small" variant="outlined" color="error" onClick={async e => {
                                    e.stopPropagation();
                                    await handleDeletePet(pet.id, pet.name);
                                  }}>
                                    Șterge
                                  </Button>
                                  <Button size="small" variant="outlined" onClick={async e => {
                                  e.stopPropagation();
                                  // Refetch owners and pets to ensure we have up-to-date vaccine/deworming records (including expiryDate)
                                  await fetchOwnersAndPets();
                                  // Find the fresh pet object from users state
                                  const owner = users.find(u => u.id === o.id);
                                  const freshPet = owner && Array.isArray(owner.pets) ? owner.pets.find(p => p.id === pet.id) : pet;
                                  setSelectedPet(freshPet || pet);
                                  // initialize per-pet history toggles from localStorage
                                  const hs = loadHistoryState(pet.id) || {};
                                  setShowVaccinesHistory(!!hs.vaccines);
                                  setShowInternalHistory(!!hs.dewormingInternal);
                                  setShowExternalHistory(!!hs.dewormingExternal);
                                  setShowAdvancedPetDetails(true);
                                }}>Detalii avansate</Button>
                                </Box>
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
            
            {/* Paginare proprietari */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pagina {ownersPage} din {ownersTotalPages} ({allOwners.length} proprietari total)
                </Typography>
                  <Box component="form" onSubmit={handleOwnersPageInputSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Mergi la pagina:</Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={ownersPageInput}
                      onChange={handleOwnersPageInputChange}
                      inputProps={{ min: 1, max: ownersTotalPages, style: { width: '60px', textAlign: 'center' } }}
                    />
                    <Button type="submit" size="small" variant="outlined">Go</Button>
                  </Box>
                </Box>
                <Pagination
                  count={ownersTotalPages}
                  page={ownersPage}
                  onChange={(event, value) => {
                    setOwnersPage(value);
                    setExpandedOwnerId(null);
                  }}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            
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
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="primary">Istoric vaccinuri</Typography>
                    <Button size="small" onClick={() => {
                      const newVaccines = !showVaccinesHistory;
                      // If opening vaccines, close others; if closing, keep others as-is
                      const newInternal = newVaccines ? false : showInternalHistory;
                      const newExternal = newVaccines ? false : showExternalHistory;
                      setShowVaccinesHistory(newVaccines);
                      setShowInternalHistory(newInternal);
                      setShowExternalHistory(newExternal);
                      if (selectedPet) saveHistoryState(selectedPet.id, { vaccines: newVaccines, dewormingInternal: newInternal, dewormingExternal: newExternal });
                    }}>{showVaccinesHistory ? 'Ascunde' : 'Afișează'}</Button>
                  </Box>
                  {showVaccinesHistory && (
                    (Array.isArray(selectedPet.vaccines) && selectedPet.vaccines.length > 0) ? (
                      (() => {
                        const sorted = sortByAdminDate(selectedPet.vaccines);
                        const active = sorted.filter(v => !getExpiryMeta(v.date, v.expiryDate).expired);
                        const expired = sorted.filter(v => getExpiryMeta(v.date, v.expiryDate).expired);
                        return (
                          <Box>
                            <List dense>
                              {active.map((v, idx) => {
                                const meta = getExpiryMeta(v.date, v.expiryDate);
                                return (
                                  <ListItem key={v.id || `vacc-${idx}`} sx={{ alignItems: 'center' }}>
                                    <ListItemText
                                      primary={v.name}
                                      secondary={(
                                        <>
                                          {v.date || v.expiryDate ? (
                                            <div>{`${v.date ? `Administrare: ${formatDateShort(v.date)}` : ''}${v.expiryDate ? (v.date ? ' — ' : '') + `Expirare: ${formatDateShort(v.expiryDate)}` : ''}`}</div>
                                          ) : null}
                                          {v.expiryDate && (() => {
                                            const meta = getExpiryMeta(v.date, v.expiryDate);
                                            return (
                                              <div>
                                                <Typography variant="caption" color="text.secondary">valabilitate: {meta.totalValidity ?? 'N/A'} zile</Typography>
                                                <Typography variant="caption" color={meta.expired ? 'error' : 'text.secondary'} sx={{ ml: 1 }}>{meta.expired ? ` — Expirat (${formatDateShort(v.expiryDate)})` : ` — Expiră în ${meta.daysLeft} zile`}</Typography>
                                              </div>
                                            );
                                          })()}
                                        </>
                                      )}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                            {expired.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Button size="small" onClick={() => setShowExpiredVaccines(s => !s)}>{showExpiredVaccines ? 'Ascunde administrările expirate' : 'Arată administrările expirate'}</Button>
                                {showExpiredVaccines && (
                                  <List dense sx={{ mt: 1 }}>
                                    {expired.map((v, idx) => {
                                      const meta = getExpiryMeta(v.date, v.expiryDate);
                                      return (
                                        <ListItem key={v.id || `vacc-exp-${idx}`} sx={{ alignItems: 'center', borderLeft: '4px solid rgba(211,47,47,0.6)', pl: 2 }}>
                                          <ListItemText
                                            primary={v.name}
                                            secondary={(
                                              <>
                                                {v.date || v.expiryDate ? (
                                                  <div>{`${v.date ? `Administrare: ${formatDateShort(v.date)}` : ''}${v.expiryDate ? (v.date ? ' — ' : '') + `Expirare: ${formatDateShort(v.expiryDate)}` : ''}`}</div>
                                                ) : null}
                                                {v.expiryDate && (
                                                  <div>
                                                    <Typography variant="caption" color="error">valabilitate: {meta.totalValidity ?? 'N/A'} zile</Typography>
                                                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>{` — Expirat (${formatDateShort(v.expiryDate)})`}</Typography>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          />
                                        </ListItem>
                                      );
                                    })}
                                  </List>
                                )}
                              </Box>
                            )}
                          </Box>
                        );
                      })()
                    ) : <Typography color="text.secondary">Nu există vaccinuri salvate.</Typography>
                  )}
                  {/* Istoric deparazitări interne */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="primary">Istoric deparazitări interne</Typography>
                    <Button size="small" onClick={() => {
                      const newInternal = !showInternalHistory;
                      const newVaccines = newInternal ? false : showVaccinesHistory;
                      const newExternal = newInternal ? false : showExternalHistory;
                      setShowInternalHistory(newInternal);
                      setShowVaccinesHistory(newVaccines);
                      setShowExternalHistory(newExternal);
                      if (selectedPet) saveHistoryState(selectedPet.id, { vaccines: newVaccines, dewormingInternal: newInternal, dewormingExternal: newExternal });
                    }}>{showInternalHistory ? 'Ascunde' : 'Afișează'}</Button>
                  </Box>
                  {showInternalHistory && (
                    (Array.isArray(selectedPet.dewormingInternal) && selectedPet.dewormingInternal.length > 0) ? (
                      (() => {
                        const sorted = sortByAdminDate(selectedPet.dewormingInternal);
                        const active = sorted.filter(d => !getExpiryMeta(d.date, d.expiryDate).expired);
                        const expired = sorted.filter(d => getExpiryMeta(d.date, d.expiryDate).expired);
                        return (
                          <Box>
                            <List dense>
                              {active.map((d, idx) => {
                                const meta = getExpiryMeta(d.date, d.expiryDate);
                                return (
                                  <ListItem key={d.id || `dewi-${idx}`} sx={{ alignItems: 'center' }}>
                                    <ListItemText
                                      primary={d.name}
                                      secondary={(
                                        <>
                                          {d.date || d.expiryDate ? (
                                            <div>{`${d.date ? `Administrare: ${formatDateShort(d.date)}` : ''}${d.expiryDate ? (d.date ? ' — ' : '') + `Expirare: ${formatDateShort(d.expiryDate)}` : ''}`}</div>
                                          ) : null}
                                          {d.expiryDate && (() => {
                                            const meta = getExpiryMeta(d.date, d.expiryDate);
                                            return (
                                              <div>
                                                <Typography variant="caption" color="text.secondary">valabilitate: {meta.totalValidity ?? 'N/A'} zile</Typography>
                                                <Typography variant="caption" color={meta.expired ? 'error' : 'text.secondary'} sx={{ ml: 1 }}>{meta.expired ? ` — Expirat (${formatDateShort(d.expiryDate)})` : ` — Expiră în ${meta.daysLeft} zile`}</Typography>
                                              </div>
                                            );
                                          })()}
                                        </>
                                      )}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                            {expired.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Button size="small" onClick={() => setShowExpiredInternal(s => !s)}>{showExpiredInternal ? 'Ascunde administrările expirate' : 'Arată administrările expirate'}</Button>
                                {showExpiredInternal && (
                                  <List dense sx={{ mt: 1 }}>
                                    {expired.map((d, idx) => {
                                      const meta = getExpiryMeta(d.date, d.expiryDate);
                                      return (
                                        <ListItem key={d.id || `dewi-exp-${idx}`} sx={{ alignItems: 'center', borderLeft: '4px solid rgba(211,47,47,0.6)', pl: 2 }}>
                                          <ListItemText
                                            primary={d.name}
                                            secondary={(
                                              <>
                                                {d.date || d.expiryDate ? (
                                                  <div>{`${d.date ? `Administrare: ${formatDateShort(d.date)}` : ''}${d.expiryDate ? (d.date ? ' — ' : '') + `Expirare: ${formatDateShort(d.expiryDate)}` : ''}`}</div>
                                                ) : null}
                                                {d.expiryDate && (
                                                  <div>
                                                    <Typography variant="caption" color="error">valabilitate: {meta.totalValidity ?? 'N/A'} zile</Typography>
                                                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>{` — Expirat (${formatDateShort(d.expiryDate)})`}</Typography>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          />
                                        </ListItem>
                                      );
                                    })}
                                  </List>
                                )}
                              </Box>
                            )}
                          </Box>
                        );
                      })()
                    ) : <Typography color="text.secondary">Nu există deparazitări interne salvate.</Typography>
                  )}
                  {/* Istoric deparazitări externe */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="primary">Istoric deparazitări externe</Typography>
                    <Button size="small" onClick={() => {
                      const newExternal = !showExternalHistory;
                      const newVaccines = newExternal ? false : showVaccinesHistory;
                      const newInternal = newExternal ? false : showInternalHistory;
                      setShowExternalHistory(newExternal);
                      setShowVaccinesHistory(newVaccines);
                      setShowInternalHistory(newInternal);
                      if (selectedPet) saveHistoryState(selectedPet.id, { vaccines: newVaccines, dewormingInternal: newInternal, dewormingExternal: newExternal });
                    }}>{showExternalHistory ? 'Ascunde' : 'Afișează'}</Button>
                  </Box>
                  {showExternalHistory && (
                    (Array.isArray(selectedPet.dewormingExternal) && selectedPet.dewormingExternal.length > 0) ? (
                      (() => {
                        const sorted = sortByAdminDate(selectedPet.dewormingExternal);
                        const active = sorted.filter(d => !getExpiryMeta(d.date, d.expiryDate).expired);
                        const expired = sorted.filter(d => getExpiryMeta(d.date, d.expiryDate).expired);
                        return (
                          <Box>
                            <List dense>
                              {active.map((d, idx) => {
                                const meta = getExpiryMeta(d.date, d.expiryDate);
                                return (
                                  <ListItem key={d.id || `dewe-${idx}`} sx={{ alignItems: 'center' }}>
                                    <ListItemText
                                      primary={d.name}
                                      secondary={(
                                        <>
                                          {d.date || d.expiryDate ? (
                                            <div>{`${d.date ? `Administrare: ${formatDateShort(d.date)}` : ''}${d.expiryDate ? (d.date ? ' — ' : '') + `Expirare: ${formatDateShort(d.expiryDate)}` : ''}`}</div>
                                          ) : null}
                                          {d.expiryDate && (() => {
                                            const meta = getExpiryMeta(d.date, d.expiryDate);
                                            return (
                                              <div>
                                                <Typography variant="caption" color="text.secondary">valabilitate: {meta.totalValidity ?? 'N/A'} zile</Typography>
                                                <Typography variant="caption" color={meta.expired ? 'error' : 'text.secondary'} sx={{ ml: 1 }}>{meta.expired ? ` — Expirat (${formatDateShort(d.expiryDate)})` : ` — Expiră în ${meta.daysLeft} zile`}</Typography>
                                              </div>
                                            );
                                          })()}
                                        </>
                                      )}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                            {expired.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Button size="small" onClick={() => setShowExpiredExternal(s => !s)}>{showExpiredExternal ? 'Ascunde administrările expirate' : 'Arată administrările expirate'}</Button>
                                {showExpiredExternal && (
                                  <List dense sx={{ mt: 1 }}>
                                    {expired.map((d, idx) => {
                                      const meta = getExpiryMeta(d.date, d.expiryDate);
                                      return (
                                        <ListItem key={d.id || `dewe-exp-${idx}`} sx={{ alignItems: 'center', borderLeft: '4px solid rgba(211,47,47,0.6)', pl: 2 }}>
                                          <ListItemText
                                            primary={d.name}
                                            secondary={(
                                              <>
                                                {d.date || d.expiryDate ? (
                                                  <div>{`${d.date ? `Administrare: ${formatDateShort(d.date)}` : ''}${d.expiryDate ? (d.date ? ' — ' : '') + `Expirare: ${formatDateShort(d.expiryDate)}` : ''}`}</div>
                                                ) : null}
                                                {d.expiryDate && (
                                                  <div>
                                                    <Typography variant="caption" color="error">valabilitate: {meta.totalValidity ?? 'N/A'} zile</Typography>
                                                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>{` — Expirat (${formatDateShort(d.expiryDate)})`}</Typography>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          />
                                        </ListItem>
                                      );
                                    })}
                                  </List>
                                )}
                              </Box>
                            )}
                          </Box>
                        );
                      })()
                    ) : <Typography color="text.secondary">Nu există deparazitări externe salvate.</Typography>
                  )}
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
                  {sortByAdminDate(editAdvancedForm.vaccines).map((v, idx) => {
                    const isEditing = editingItem && editingItem.section === 'vaccines' && editingItem.idx === idx;
                    return (
                      <Box key={v.id || `edit-vacc-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        {!isEditing ? (
                          <>
                            <Box sx={{ flex: 1 }}>
                              <Typography>{v.name || '—'}</Typography>
                              <Typography variant="caption" color="text.secondary">{v.date ? `Administrare: ${formatDateShort(v.date)}` : ''}{v.expiryDate ? ` — Expirare: ${formatDateShort(v.expiryDate)}` : ''}</Typography>
                            </Box>
                            <Button onClick={() => {
                              setEditingBackup({ section: 'vaccines', idx, item: { ...v } });
                              setEditingItem({ section: 'vaccines', idx });
                            }}>Editează</Button>
                            <Button color="error" onClick={() => setEditAdvancedForm(f => ({ ...f, vaccines: f.vaccines.filter((_, i) => i !== idx) }))}>Șterge</Button>
                          </>
                        ) : (
                          <>
                            <TextField label="Nume vaccin" value={v.name || ''} onChange={e => {
                              const arr = [...editAdvancedForm.vaccines];
                              arr[idx].name = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, vaccines: arr }));
                            }} sx={{ flex: 1 }} />
                            <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} value={v.date || ''} onChange={e => {
                              const arr = [...editAdvancedForm.vaccines];
                              arr[idx].date = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, vaccines: arr }));
                            }} sx={{ flex: 1 }} />
                            <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} value={v.expiryDate || ''} onChange={e => {
                              const arr = [...editAdvancedForm.vaccines];
                              arr[idx].expiryDate = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, vaccines: arr }));
                            }} sx={{ flex: 1 }} />
                            <Button onClick={() => { setEditingItem(null); setEditingBackup(null); }}>Anulează</Button>
                          </>
                        )}
                      </Box>
                    );
                  })}
                  <Button variant="outlined" onClick={() => setEditAdvancedForm(f => ({ ...f, vaccines: [...(f.vaccines || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă vaccin</Button>
                  {/* Deworming Internal */}
                  <Typography variant="subtitle2" color="primary">Deparazitări interne</Typography>
                  {sortByAdminDate(editAdvancedForm.dewormingInternal).map((d, idx) => {
                    const isEditing = editingItem && editingItem.section === 'dewormingInternal' && editingItem.idx === idx;
                    return (
                      <Box key={d.id || `edit-dewi-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        {!isEditing ? (
                          <>
                            <Box sx={{ flex: 1 }}>
                              <Typography>{d.name || '—'}</Typography>
                              <Typography variant="caption" color="text.secondary">{d.date ? `Administrare: ${formatDateShort(d.date)}` : ''}{d.expiryDate ? ` — Expirare: ${formatDateShort(d.expiryDate)}` : ''}</Typography>
                            </Box>
                            <Button onClick={() => { setEditingBackup({ section: 'dewormingInternal', idx, item: { ...d } }); setEditingItem({ section: 'dewormingInternal', idx }); }}>Editează</Button>
                            <Button color="error" onClick={() => setEditAdvancedForm(f => ({ ...f, dewormingInternal: f.dewormingInternal.filter((_, i) => i !== idx) }))}>Șterge</Button>
                          </>
                        ) : (
                          <>
                            <TextField label="Produs/Tip" value={d.name || ''} onChange={e => {
                              const arr = [...editAdvancedForm.dewormingInternal];
                              arr[idx].name = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, dewormingInternal: arr }));
                            }} sx={{ flex: 1 }} />
                            <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} value={d.date || ''} onChange={e => {
                              const arr = [...editAdvancedForm.dewormingInternal];
                              arr[idx].date = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, dewormingInternal: arr }));
                            }} sx={{ flex: 1 }} />
                            <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} value={d.expiryDate || ''} onChange={e => {
                              const arr = [...editAdvancedForm.dewormingInternal];
                              arr[idx].expiryDate = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, dewormingInternal: arr }));
                            }} sx={{ flex: 1 }} />
                            <Button onClick={() => { setEditingItem(null); setEditingBackup(null); }}>Anulează</Button>
                          </>
                        )}
                      </Box>
                    );
                  })}
                  <Button variant="outlined" onClick={() => setEditAdvancedForm(f => ({ ...f, dewormingInternal: [...(f.dewormingInternal || []), { name: '', date: '', expiryDate: '' }] }))}>Adaugă deparazitare internă</Button>
                  {/* Deworming External */}
                  <Typography variant="subtitle2" color="primary">Deparazitări externe</Typography>
                  {sortByAdminDate(editAdvancedForm.dewormingExternal).map((d, idx) => {
                    const isEditing = editingItem && editingItem.section === 'dewormingExternal' && editingItem.idx === idx;
                    return (
                      <Box key={d.id || `edit-dewe-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        {!isEditing ? (
                          <>
                            <Box sx={{ flex: 1 }}>
                              <Typography>{d.name || '—'}</Typography>
                              <Typography variant="caption" color="text.secondary">{d.date ? `Administrare: ${formatDateShort(d.date)}` : ''}{d.expiryDate ? ` — Expirare: ${formatDateShort(d.expiryDate)}` : ''}</Typography>
                            </Box>
                            <Button onClick={() => { setEditingBackup({ section: 'dewormingExternal', idx, item: { ...d } }); setEditingItem({ section: 'dewormingExternal', idx }); }}>Editează</Button>
                            <Button color="error" onClick={() => setEditAdvancedForm(f => ({ ...f, dewormingExternal: f.dewormingExternal.filter((_, i) => i !== idx) }))}>Șterge</Button>
                          </>
                        ) : (
                          <>
                            <TextField label="Produs/Tip" value={d.name || ''} onChange={e => {
                              const arr = [...editAdvancedForm.dewormingExternal];
                              arr[idx].name = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, dewormingExternal: arr }));
                            }} sx={{ flex: 1 }} />
                            <TextField label="Data" type="date" InputLabelProps={{ shrink: true }} value={d.date || ''} onChange={e => {
                              const arr = [...editAdvancedForm.dewormingExternal];
                              arr[idx].date = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, dewormingExternal: arr }));
                            }} sx={{ flex: 1 }} />
                            <TextField label="Data expirare" type="date" InputLabelProps={{ shrink: true }} value={d.expiryDate || ''} onChange={e => {
                              const arr = [...editAdvancedForm.dewormingExternal];
                              arr[idx].expiryDate = e.target.value;
                              setEditAdvancedForm(f => ({ ...f, dewormingExternal: arr }));
                            }} sx={{ flex: 1 }} />
                            <Button onClick={() => { setEditingItem(null); setEditingBackup(null); }}>Anulează</Button>
                          </>
                        )}
                      </Box>
                    );
                  })}
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
                      for (const v of editAdvancedForm.vaccines) {
                        if (v.expiryDate && v.date && parseDate(v.expiryDate) && parseDate(v.date)) {
                          if (parseDate(v.expiryDate) < parseDate(v.date)) {
                            alert('Data de expirare nu poate fi înaintea datei de administrare pentru vaccinuri');
                            throw new Error('Invalid expiry date');
                          }
                        }
                      }
                      await Promise.all(editAdvancedForm.vaccines.map(v =>
                        fetch(`http://localhost:4000/api/vaccines/${v.id || ''}`, {
                          method: v.id ? 'PATCH' : 'POST',
                          headers: { 'Content-Type': 'application/json', ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}) },
                          body: JSON.stringify({ pet_id: editAdvancedForm.id, ...v, expiryDate: v.expiryDate ? v.expiryDate : null })
                        })
                      ));
                    }
                    // PATCH dewormings
                    if (editAdvancedForm.dewormingInternal && editAdvancedForm.dewormingInternal.length > 0) {
                      for (const d of editAdvancedForm.dewormingInternal) {
                        if (d.expiryDate && d.date && parseDate(d.expiryDate) && parseDate(d.date)) {
                          if (parseDate(d.expiryDate) < parseDate(d.date)) {
                            alert('Data de expirare nu poate fi înaintea datei de administrare pentru deparazitări interne');
                            throw new Error('Invalid expiry date');
                          }
                        }
                      }
                      await Promise.all(editAdvancedForm.dewormingInternal.map(d =>
                        fetch(`http://localhost:4000/api/dewormings/${d.id || ''}`, {
                          method: d.id ? 'PATCH' : 'POST',
                          headers: { 'Content-Type': 'application/json', ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}) },
                          body: JSON.stringify({ pet_id: editAdvancedForm.id, ...d, type: 'internal', expiryDate: d.expiryDate ? d.expiryDate : null })
                        })
                      ));
                    }
                    if (editAdvancedForm.dewormingExternal && editAdvancedForm.dewormingExternal.length > 0) {
                      for (const d of editAdvancedForm.dewormingExternal) {
                        if (d.expiryDate && d.date && parseDate(d.expiryDate) && parseDate(d.date)) {
                          if (parseDate(d.expiryDate) < parseDate(d.date)) {
                            alert('Data de expirare nu poate fi înaintea datei de administrare pentru deparazitări externe');
                            throw new Error('Invalid expiry date');
                          }
                        }
                      }
                      await Promise.all(editAdvancedForm.dewormingExternal.map(d =>
                        fetch(`http://localhost:4000/api/dewormings/${d.id || ''}`, {
                          method: d.id ? 'PATCH' : 'POST',
                          headers: { 'Content-Type': 'application/json', ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}) },
                          body: JSON.stringify({ pet_id: editAdvancedForm.id, ...d, type: 'external', expiryDate: d.expiryDate ? d.expiryDate : null })
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
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {!showStaffForm && (
                <>
                  <Button variant="contained" color="primary" onClick={() => {
                    setShowStaffForm(true);
                    setEditingStaff(null);
                    setStaffForm({ username: '', password: '', role: 'vet', fullName: '', email: '', phone: '', specialization: '', address: '' });
                  }}>Adaugă personal</Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={testNotifications}
                    sx={{ ml: 1 }}
                  >
                    Test Notificări Email
                  </Button>
                </>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 1 }}>
              <Typography variant="h6" color="primary">Listă personal</Typography>
              <TextField
                size="small"
                placeholder="Caută după nume..."
                value={staffSearchTerm}
                onChange={(e) => setStaffSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </Box>
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
            
            {/* Paginare personal */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pagina {staffPage} din {staffTotalPages} ({allStaff.length} membri personal total)
                </Typography>
                  <Box component="form" onSubmit={handleStaffPageInputSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Mergi la pagina:</Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={staffPageInput}
                      onChange={handleStaffPageInputChange}
                      inputProps={{ min: 1, max: staffTotalPages, style: { width: '60px', textAlign: 'center' } }}
                    />
                    <Button type="submit" size="small" variant="outlined">Go</Button>
                  </Box>
                </Box>
                <Pagination
                  count={staffTotalPages}
                  page={staffPage}
                  onChange={(event, value) => setStaffPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
      </Box>
    );
  }

}
export default StaffManager;
