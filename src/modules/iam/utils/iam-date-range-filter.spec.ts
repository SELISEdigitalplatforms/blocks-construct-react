import { describe, expect, it } from 'vitest';
import { isIamDateInFilterRange } from './iam-date-range-filter';

describe('isIamDateInFilterRange', () => {
  it('includes timestamps later on the same calendar day as a single-day filter', () => {
    const pickedDay = new Date(2026, 3, 20);
    const rowDate = new Date(2026, 3, 20, 14, 42, 3);
    const filter = { from: pickedDay, to: pickedDay };

    expect(isIamDateInFilterRange(rowDate, filter, 'createdDate')).toBe(true);
    expect(isIamDateInFilterRange(rowDate, filter, 'lastLoggedInTime')).toBe(true);
  });

  it('treats missing to as a single day using from', () => {
    const rowDate = new Date(2026, 3, 20, 15, 30, 0);
    const filter = { from: new Date(2026, 3, 20, 0, 0, 0), to: undefined };

    expect(isIamDateInFilterRange(rowDate, filter, 'createdDate')).toBe(true);
  });

  it('excludes rows outside the selected local day range', () => {
    const rowDate = new Date(2026, 3, 19, 12, 0, 0);
    const filter = { from: new Date(2026, 3, 20), to: new Date(2026, 3, 20) };

    expect(isIamDateInFilterRange(rowDate, filter, 'createdDate')).toBe(false);
  });

  it('returns true when no filter from date', () => {
    expect(isIamDateInFilterRange(new Date(), undefined, 'createdDate')).toBe(true);
  });

  it('excludes last-login sentinel year 1 when filtering', () => {
    const sentinel = new Date(1, 0, 1);
    const filter = { from: new Date(2026, 3, 20), to: new Date(2026, 3, 20) };

    expect(isIamDateInFilterRange(sentinel, filter, 'lastLoggedInTime')).toBe(false);
  });
});
