import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Alert, AppBar, Toolbar } from '@mui/material';
import PetOwnerDashboard from './PetOwnerDashboard';
import AdminDashboard from './AdminDashboard';
import StaffManager from './StaffManager';

// Tema personalizată cu albastru și alb
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // albastru
      contrastText: '#fff',
    },
  },
});

const API = '/auth';

function App() {
  const [adminTab, setAdminTab] = useState(0);
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', role: '' });
  const [showRegister, setShowRegister] = useState(false); // not used below, keep if you’ll add a register UI

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
  const data = await res.json();
  console.log('Login response:', data);
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setToken(data.token);
  localStorage.setItem('token', data.token);
  // user will be fetched by useEffect after token is set
    } catch (err) {
      setError(err.message || 'Eroare la autentificare.');
    } finally {
      setLoading(false);
    }
  };

  // Add pet handler
  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!token) return setError('Trebuie să fii autentificat.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: petName, type: petType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add pet');
      setPets((prev) => [...prev, data]);
      setPetName('');
      setPetType('');
    } catch (err) {
      setError(err.message || 'Eroare la adăugare.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user and pets when we have a token
  useEffect(() => {
    if (!token) {
      setUser(null);
      setPets([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      // Don't show error on initial load, only after login attempt
      try {
        // 1) get current user
        const meRes = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) throw new Error('Token invalid sau expirat.');
        const me = await meRes.json();

        // 2) get pets
        const petsRes = await fetch(`/api/pets/owner/${me.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!petsRes.ok) throw new Error('Token invalid sau expirat.');
        const petsData = await petsRes.json();

        if (!cancelled) {
          setUser(me);
          setPets(petsData);
        }
      } catch (e) {
        if (!cancelled) {
          // If token is invalid, log out and clear token
          setToken('');
          setUser(null);
          setPets([]);
          localStorage.removeItem('token');
          // Don't show error unless user tried to log in
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setPets([]);
    localStorage.removeItem('token');
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <img src="/logo.png" alt="Logo" style={{ height: 48, marginRight: 16 }} />
            <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
              Aplicație veterinară
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      {user && user.role === 'clinic_admin' ? (
        // ...existing code pentru admin tabs...
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 3 }}>
            <Typography variant="subtitle1" color="primary">
              Autentificat ca <b>{user ? user.username : 'Utilizator'}</b> {user?.role ? `(${user.role})` : ''}
            </Typography>
            <Button variant="outlined" color="primary" onClick={handleLogout}>Deconectare</Button>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, px: 3 }}>
            <Tabs value={adminTab} onChange={(_, v) => setAdminTab(v)} aria-label="Admin Tabs" textColor="primary" indicatorColor="primary">
              <Tab label="Dashboard" />
              <Tab label="Administrare personal" />
              <Tab label="Administrare proprietari" />
            </Tabs>
          </Box>
          <Box sx={{ px: 3 }}>
            {adminTab === 0 && <AdminDashboard token={token} />}
            {adminTab === 1 && <StaffManager token={token} />}
            {adminTab === 2 && <StaffManager token={token} proprietariOnly />}
          </Box>
        </>
      ) : user && user.role === 'pet_owner' ? (
        <PetOwnerDashboard token={token} />
      ) : (
        <Container maxWidth="sm" sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" align="center" color="primary" gutterBottom>Bine ai venit!</Typography>
                <Typography align="center" color="textSecondary">Te rugăm să te autentifici pentru a accesa funcționalitățile aplicației.</Typography>
              </Box>
              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <Typography variant="h6" align="center" color="primary">Autentificare</Typography>
                <TextField
                  label="Nume utilizator"
                  variant="outlined"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Parolă"
                  type="password"
                  variant="outlined"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  fullWidth
                />
                <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                  {loading ? <CircularProgress size={24} /> : 'Autentificare'}
                </Button>
                {error && <Alert severity="error">{error}</Alert>}
              </Box>
            </CardContent>
          </Card>
        </Container>
      )}
    </ThemeProvider>
  );
}

export default App;