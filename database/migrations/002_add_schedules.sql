-- Migration: add schedules table for planned events
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL
);
