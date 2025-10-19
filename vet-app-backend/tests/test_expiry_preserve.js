// Quick integration-ish test: create a pet, add a vaccine with expiry, add another vaccine without expiry via edit flow,
// then patch existing vaccine with no expiry provided and assert expiry preserved.

(async () => {
  const base = 'http://localhost:4000';
  console.log('This test expects a running backend on port 4000 and a test DB.');
  try {
    // Create a pet for owner_id 1 (assumes owner 1 exists in test DB)
    let res = await fetch(`${base}/api/pets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_id: 1, name: 'TestPet', species: 'dog' }) });
    const pet = await res.json();
    console.log('Created pet', pet.id);
    // Add vaccine with expiry
    res = await fetch(`${base}/api/vaccines`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pet_id: pet.id, name: 'Rabies', date: '2025-01-01', expiryDate: '2026-01-01' }) });
    const v1 = await res.json();
    console.log('Added vaccine v1', v1.id, v1.expirydate || v1.expiryDate);
    // Now simulate edit that adds a new vaccine but does not provide expiry for v1 in the payload - we PATCH v1 without expiry field
    res = await fetch(`${base}/api/vaccines/${v1.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: v1.name, date: v1.date }) });
    const patched = await res.json();
    console.log('Patched vaccine', patched.id, patched.expirydate || patched.expiryDate);
    if (!patched.expirydate && !patched.expiryDate) {
      console.error('Expiry lost after patch!');
      process.exit(2);
    }
    console.log('Expiry preserved — test OK');
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  }
})();
