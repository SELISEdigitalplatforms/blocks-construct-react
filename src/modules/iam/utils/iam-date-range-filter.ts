import { endOfDay, isWithinInterval, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

/**
 * Returns whether an instant falls in the selected local calendar range (inclusive).
 * Single-day selection uses [startOfDay(from), endOfDay(to|from)] so times during that day match.
 */
export function isIamDateInFilterRange(
  rowDate: Date,
  filterValue: DateRange | undefined,
  column: 'createdDate' | 'lastLoggedInTime'
): boolean {
  if (!filterValue?.from) return true;
  if (Number.isNaN(rowDate.getTime())) return false;
  if (column === 'lastLoggedInTime' && rowDate.getFullYear() === 1) return false;

  const rangeStart = startOfDay(new Date(filterValue.from));
  const rangeEnd = endOfDay(
    filterValue.to != null ? new Date(filterValue.to) : new Date(filterValue.from)
  );

  return isWithinInterval(rowDate, { start: rangeStart, end: rangeEnd });
}
