const petModel = require('../src/petModel');

async function run() {
  try {
    const ownerId = 7; // adjust if needed in dev DB
    const pets = await petModel.getPetsByOwner(ownerId);
    console.log('Pets for owner', ownerId, JSON.stringify(pets, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  }
}

run();
