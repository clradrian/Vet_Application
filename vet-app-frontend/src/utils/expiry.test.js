import { daysUntil } from './expiry';

test('daysUntil returns correct sign and approximate days', () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  expect(daysUntil(tomorrow.toISOString())).toBeGreaterThanOrEqual(0);
  expect(daysUntil(in30.toISOString())).toBeGreaterThanOrEqual(29);
  expect(daysUntil(yesterday.toISOString())).toBeLessThan(0);
});
