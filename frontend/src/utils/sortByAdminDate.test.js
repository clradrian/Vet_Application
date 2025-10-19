import { sortByAdminDate } from './sortByAdminDate';

describe('sortByAdminDate', () => {
  test('orders items from oldest to newest by date', () => {
    const items = [
      { id: 1, date: '2025-10-15' },
      { id: 2, date: '2025-10-10' },
      { id: 3, date: '2025-10-20' }
    ];
    const sorted = sortByAdminDate(items);
    expect(sorted.map(i => i.id)).toEqual([2, 1, 3]);
  });

  test('places items without date at the end', () => {
    const items = [
      { id: 1, date: '2025-10-15' },
      { id: 2 },
      { id: 3, date: '2025-10-10' }
    ];
    const sorted = sortByAdminDate(items);
    expect(sorted.map(i => i.id)).toEqual([3, 1, 2]);
  });

  test('handles invalid dates gracefully', () => {
    const items = [
      { id: 1, date: 'not-a-date' },
      { id: 2, date: '2025-10-10' }
    ];
    const sorted = sortByAdminDate(items);
    expect(sorted.map(i => i.id)).toEqual([2, 1]);
  });
});
