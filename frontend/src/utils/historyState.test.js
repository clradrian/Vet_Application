import { loadHistoryState, saveHistoryState, loadAllHistoryState } from './historyState';

describe('historyState localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('save and load per-pet state', () => {
    saveHistoryState('pet-1', { vaccines: true, dewormingInternal: false, dewormingExternal: false });
    const s = loadHistoryState('pet-1');
    expect(s).toEqual({ vaccines: true, dewormingInternal: false, dewormingExternal: false });
  });

  test('loadAll returns object', () => {
    saveHistoryState('pet-2', { vaccines: false });
    const all = loadAllHistoryState();
    expect(all['pet-2']).toBeTruthy();
  });
});
