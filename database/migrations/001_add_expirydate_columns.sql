-- Migration: ensure expiryDate columns exist on vaccines and dewormings
ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS expirydate DATE;
ALTER TABLE dewormings ADD COLUMN IF NOT EXISTS expirydate DATE;

-- No-op if already present. This migration is idempotent.
