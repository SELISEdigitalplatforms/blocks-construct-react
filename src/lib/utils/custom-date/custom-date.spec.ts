import { formatDate } from './custom-date';

describe('Date formatting utilities', () => {
  describe('formatDate', () => {
    test('should format date with time correctly', () => {
      // Test with a specific date and time
      const testDate = new Date(2023, 0, 15, 9, 5); // Jan 15, 2023, 09:05
      expect(formatDate(testDate)).toBe('15/01/2023, 09:05');

      // Test with another date and time
      const anotherDate = new Date(2023, 11, 31, 23, 59); // Dec 31, 2023, 23:59
      expect(formatDate(anotherDate)).toBe('31/12/2023, 23:59');
    });

    test('should format date without time when withoutTime is true', () => {
      const testDate = new Date(2023, 0, 15, 9, 5); // Jan 15, 2023, 09:05
      expect(formatDate(testDate, true)).toBe('15/01/2023');

      const anotherDate = new Date(2023, 11, 31, 23, 59); // Dec 31, 2023, 23:59
      expect(formatDate(anotherDate, true)).toBe('31/12/2023');
    });

    test('should pad single-digit days and months with leading zeros', () => {
      const testDate = new Date(2023, 0, 1, 9, 5); // Jan 1, 2023, 09:05
      expect(formatDate(testDate)).toBe('01/01/2023, 09:05');

      const anotherDate = new Date(2023, 8, 5, 9, 5); // Sep 5, 2023, 09:05
      expect(formatDate(anotherDate)).toBe('05/09/2023, 09:05');
    });

    test('should pad single-digit hours and minutes with leading zeros', () => {
      const testDate = new Date(2023, 0, 15, 9, 5); // Jan 15, 2023, 09:05
      expect(formatDate(testDate)).toBe('15/01/2023, 09:05');

      const anotherDate = new Date(2023, 0, 15, 9, 0); // Jan 15, 2023, 09:00
      expect(formatDate(anotherDate)).toBe('15/01/2023, 09:00');
    });

    test('should handle midnight correctly', () => {
      const testDate = new Date(2023, 0, 15, 0, 0); // Jan 15, 2023, 00:00
      expect(formatDate(testDate)).toBe('15/01/2023, 00:00');
    });

    test('should handle noon correctly', () => {
      const testDate = new Date(2023, 0, 15, 12, 0); // Jan 15, 2023, 12:00
      expect(formatDate(testDate)).toBe('15/01/2023, 12:00');
    });

    test('should format the current date correctly', () => {
      // Use a fixed date for testing
      const fixedDate = new Date(2023, 5, 15, 15, 30); // Jun 15, 2023, 15:30

      // Format this specific date instead of mocking the Date constructor
      expect(formatDate(fixedDate)).toBe('15/06/2023, 15:30');
      expect(formatDate(fixedDate, true)).toBe('15/06/2023');
    });

    test('should handle mocked current dates with vi.useFakeTimers', () => {
      const mockDate = new Date(2023, 5, 15, 15, 30);
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      expect(formatDate(new Date())).toBe('15/06/2023, 15:30');

      // Clean up
      vi.useRealTimers();
    });

    test('should handle leap years correctly', () => {
      const leapYearDate = new Date(2024, 1, 29, 12, 30); // Feb 29, 2024, 12:30 (leap year)
      expect(formatDate(leapYearDate)).toBe('29/02/2024, 12:30');
    });

    test('should handle year transitions correctly', () => {
      const newYearsEve = new Date(2023, 11, 31, 23, 59); // Dec 31, 2023, 23:59
      expect(formatDate(newYearsEve)).toBe('31/12/2023, 23:59');

      const newYearsDay = new Date(2024, 0, 1, 0, 0); // Jan 1, 2024, 00:00
      expect(formatDate(newYearsDay)).toBe('01/01/2024, 00:00');
    });
  });
});
