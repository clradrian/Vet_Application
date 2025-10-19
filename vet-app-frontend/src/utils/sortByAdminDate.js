export function parseDateForSort(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function sortByAdminDate(arr) {
  return (arr || []).slice().sort((a, b) => {
    const da = parseDateForSort(a.date);
    const db = parseDateForSort(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da - db; // oldest first
  });
}
