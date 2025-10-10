const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In-memory user store for demo
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('adminpass', 10), // hashed password
    role: 'clinic_admin'
  }
];

function findUser(username) {
  return users.find(u => u.username === username);
}

function createUser(username, password, role) {
  const id = users.length + 1;
  const hashed = bcrypt.hashSync(password, 10);
  const user = { id, username, password: hashed, role };
  users.push(user);
  return user;
}

module.exports = { users, findUser, createUser };
