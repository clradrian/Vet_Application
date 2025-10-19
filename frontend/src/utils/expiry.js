export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const exp = new Date(dateStr);
  const now = new Date();
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}
