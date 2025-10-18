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
        dewormingExternal
        ,
        schedules: schedules || []
      };
    }));

    return petsWithDetails;
  },
  async deletePet(id) {
    await pool.query('DELETE FROM pets WHERE id = $1', [id]);
  },
  // Adaugă și alte funcții după nevoie
};
