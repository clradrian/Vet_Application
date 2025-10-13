const pool = require('./db');

// Exemplu: CRUD pentru utilizatori
module.exports = {
  async findUser(username) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0];
  },
  async createUser({ username, password, role, fullName, email, phone }) {
    const { rows } = await pool.query(
      'INSERT INTO users (username, password, role, fullName, email, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [username, password, role, fullName, email, phone]
    );
    return rows[0];
  },
  async getAllUsers() {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows;
  },
  // Adaugă și alte funcții după nevoie
};
