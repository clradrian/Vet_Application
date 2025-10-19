const pool = require('../db');

module.exports = {
  async createPet({ owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo }) {
    const { rows } = await pool.query(
      `INSERT INTO pets (owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo]
    );
    return rows[0];
  },

  async getPetById(id) {
    const { rows } = await pool.query('SELECT * FROM pets WHERE id = $1', [id]);
    return rows[0];
  },

  async getPetsByOwner(owner_id) {
    const { rows: pets } = await pool.query('SELECT * FROM pets WHERE owner_id = $1', [owner_id]);
    if (!pets || pets.length === 0) return [];

    // For each pet, fetch vaccines and dewormings and attach them
    const petsWithDetails = await Promise.all(pets.map(async (pet) => {
      const { rows: vaccines } = await pool.query('SELECT id, name, date, expiryDate FROM vaccines WHERE pet_id = $1 ORDER BY date DESC', [pet.id]);
      const { rows: dewormings } = await pool.query('SELECT id, type, name, date, expiryDate FROM dewormings WHERE pet_id = $1 ORDER BY date DESC', [pet.id]);
      const { rows: schedules } = await pool.query('SELECT id, name, date FROM schedules WHERE pet_id = $1 ORDER BY date ASC', [pet.id]);

      const dewormingInternal = dewormings.filter(d => d.type === 'internal');
      const dewormingExternal = dewormings.filter(d => d.type === 'external');

      return {
        ...pet,
        vaccines: vaccines || [],
        dewormingInternal,
        dewormingExternal,
        schedules: schedules || []
      };
    }));

    return petsWithDetails;
  },

  async updatePet(id, updates) {
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
    const query = `UPDATE pets SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deletePet(id) {
    const result = await pool.query('DELETE FROM pets WHERE id = $1', [id]);
    return result;
  },

  // Vaccine operations
  async addVaccine({ pet_id, name, date, expiryDate }) {
    const { rows } = await pool.query(
      'INSERT INTO vaccines (pet_id, name, date, expiryDate) VALUES ($1, $2, $3, $4) RETURNING *',
      [pet_id, name, date, expiryDate]
    );
    return rows[0];
  },

  async updateVaccine(id, updates) {
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

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE vaccines SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteVaccine(id) {
    const { rowCount } = await pool.query('DELETE FROM vaccines WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // Deworming operations
  async addDeworming({ pet_id, type, name, date, expiryDate }) {
    const { rows } = await pool.query(
      'INSERT INTO dewormings (pet_id, type, name, date, expiryDate) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [pet_id, type, name, date, expiryDate]
    );
    return rows[0];
  },

  async updateDeworming(id, updates) {
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

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE dewormings SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteDeworming(id) {
    const { rowCount } = await pool.query('DELETE FROM dewormings WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // Schedule operations
  async addSchedule({ pet_id, name, date }) {
    const { rows } = await pool.query(
      'INSERT INTO schedules (pet_id, name, date) VALUES ($1, $2, $3) RETURNING *',
      [pet_id, name, date]
    );
    return rows[0];
  },

  async updateSchedule(id, updates) {
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

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE schedules SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteSchedule(id) {
    const { rowCount } = await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // Get pets with upcoming expirations (for notification service)
  async getPetsWithExpirations(daysAhead = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const query = `
      SELECT 
        p.id as pet_id,
        p.name as pet_name,
        p.owner_id,
        'vaccine' as type,
        v.name as medication_name,
        v.expiryDate as expiry_date
      FROM pets p
      JOIN vaccines v ON p.id = v.pet_id
      WHERE v.expiryDate BETWEEN $1 AND $2

      UNION ALL

      SELECT 
        p.id as pet_id,
        p.name as pet_name,
        p.owner_id,
        CONCAT('deworming_', d.type) as type,
        d.name as medication_name,
        d.expiryDate as expiry_date
      FROM pets p
      JOIN dewormings d ON p.id = d.pet_id
      WHERE d.expiryDate BETWEEN $1 AND $2

      ORDER BY expiry_date ASC
    `;

    const { rows } = await pool.query(query, [todayStr, futureDateStr]);
    return rows;
  }
};