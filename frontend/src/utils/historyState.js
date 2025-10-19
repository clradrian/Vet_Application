// Helpers to persist per-pet history expand/collapse state in localStorage
const STORAGE_KEY = 'vetapp_history_state_v1';

export function loadAllHistoryState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function loadHistoryState(petId) {
  const all = loadAllHistoryState();
  return all[petId] || null;
}

export function saveHistoryState(petId, state) {
  try {
    const all = loadAllHistoryState();
    all[petId] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
}
