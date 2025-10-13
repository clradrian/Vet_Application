const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In-memory user store for demo
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('adminpass', 10), // hashed password
    role: 'clinic_admin',
    fullName: 'Administrator',
    email: 'admin@vetapp.ro',
    phone: '0700000000',
    pets: []
  }
];

function findUser(username) {
  return users.find(u => u.username === username);
}

function createUser(username, password, role) {
  const id = users.length + 1;
  const hashed = bcrypt.hashSync(password, 10);
  // Acceptă argumente suplimentare pentru detalii
  const user = {
    id,
    username,
    password: hashed,
    role,
    fullName: arguments[3] || '',
    email: arguments[4] || '',
    phone: arguments[5] || '',
    pets: arguments[6] || []
  };
  users.push(user);
  return user;
}

module.exports = { users, findUser, createUser };
