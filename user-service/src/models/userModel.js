const pool = require('../db');

module.exports = {
  async findUser(username) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0];
  },

  async findUserById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
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
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
    return rows;
  },

  async updateUser(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteUser(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async getUsersByRole(role) {
    const { rows } = await pool.query('SELECT * FROM users WHERE role = $1 ORDER BY id', [role]);
    return rows;
  }
};