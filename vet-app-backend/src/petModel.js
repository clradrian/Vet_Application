const pool = require('./db');

module.exports = {
  async createPet({ owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo }) {
    const { rows } = await pool.query(
      `INSERT INTO pets (owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [owner_id, name, species, breed, sex, birthDate, color, microchipId, tagNumber, sterilized, sterilizationDate, photo]
    );
    return rows[0];
  },
  async getPetsByOwner(owner_id) {
    const { rows } = await pool.query('SELECT * FROM pets WHERE owner_id = $1', [owner_id]);
    return rows;
  },
  // Adaugă și alte funcții după nevoie
};
