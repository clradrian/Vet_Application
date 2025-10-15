-- Tabel utilizatori
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  fullName VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20)
);

-- Tabel animale
CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  species VARCHAR(50),
  breed VARCHAR(50),
  sex VARCHAR(10),
  birthDate DATE,
  color VARCHAR(50),
  microchipId VARCHAR(50),
  tagNumber VARCHAR(50),
  sterilized VARCHAR(10),
  sterilizationDate DATE,
  photo VARCHAR(255)
);

-- Tabel vaccinuri
CREATE TABLE IF NOT EXISTS vaccines (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
  name VARCHAR(100),
  date DATE,
  expiryDate DATE
);

-- Tabel deparazitari
CREATE TABLE IF NOT EXISTS dewormings (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
  type VARCHAR(20), -- 'internal' sau 'external'
  name VARCHAR(100),
  date DATE,
  expiryDate DATE
);
