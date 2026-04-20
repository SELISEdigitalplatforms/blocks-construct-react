import { useEffect, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils/custom-date/custom-date';
import { useTranslation } from 'react-i18next';
import { Column } from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import { useIsMobile } from '@/hooks/use-media-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui-kit/popover';
import { Button } from '@/components/ui-kit/button';
import { Separator } from '@/components/ui-kit/separator';
import usePopoverWidth from '@/hooks/use-popover-width';
import { Calendar } from '@/components/ui-kit/calendar';

/**
 * DateRangeFilter Component
 *
 * A filter component that allows users to select a date range from a calendar.
 * This component integrates with `@tanstack/react-table` to filter data based on the selected date range.
 * It supports both desktop and mobile views, with responsive layouts and popover behavior.
 *
 * Features:
 * - Allows users to select a range of dates using a calendar UI.
 * - Displays the selected date range in the filter button.
 * - Clears the selected date range with a "Clear filter" button.
 * - Integrates with `@tanstack/react-table` to filter data based on the selected date range.
 * - Supports mobile-friendly views with responsive layouts.
 *
 * @template TData - The type of data used in the table.
 * @template TValue - The type of value for the column being filtered.
 *
 * @param {Column<TData, TValue>} [column] - The column to be filtered, passed from `@tanstack/react-table`.
 * @param {string} title - The title to be displayed for the date range filter.
 * @param {DateRange | undefined} date - The current selected date range.
 * @param {(date: DateRange | undefined) => void} onDateChange - Callback to handle changes to the selected date range.
 */

interface DateRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title: string;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export const DateRangeFilter = <TData, TValue>({
  column,
  title,
  date,
  onDateChange,
}: Readonly<DateRangeFilterProps<TData, TValue>>) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [buttonRef] = usePopoverWidth();
  const [open, setOpen] = useState(false);
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(date);
  const [month, setMonth] = useState<Date>(date?.from || new Date());

  useEffect(() => {
    setLocalDateRange(date);
    if (date?.from) {
      setMonth(date.from);
    }
  }, [date]);

  const handleDateSelect = (selectedDateRange: DateRange | undefined) => {
    setLocalDateRange(selectedDateRange);
    onDateChange(selectedDateRange);

    if (selectedDateRange?.from) {
      column?.setFilterValue(selectedDateRange);
    } else {
      column?.setFilterValue(undefined);
    }
  };

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();

    setLocalDateRange(undefined);
    onDateChange(undefined);
    column?.setFilterValue(undefined);
    setMonth(new Date());
    setOpen(false);
  };

  const handlePopoverKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.stopPropagation();
    }
  };

  const hasActiveFilter = localDateRange?.from != null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant={hasActiveFilter ? 'default' : 'outline'}
          size="sm"
          className={`h-8 px-2 ${!hasActiveFilter && 'border-dashed'} whitespace-nowrap`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{title}</span>
            {localDateRange?.from && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span className="truncate">
                  {formatDate(localDateRange.from, true)}
                  {localDateRange.to && (
                    <>
                      {' - '}
                      {formatDate(localDateRange.to, true)}
                    </>
                  )}
                </span>
              </>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        sideOffset={8}
        onKeyDown={handlePopoverKeyDown}
        style={{
          width: '100%',
          maxWidth: '100vw',
          background: 'white',
        }}
      >
        <button
          type="button"
          className="flex flex-col w-full text-left border-0 bg-transparent p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar
            autoFocus
            mode="range"
            month={month}
            onMonthChange={setMonth}
            defaultMonth={localDateRange?.from || new Date()}
            selected={localDateRange || { from: new Date(), to: undefined }}
            onSelect={handleDateSelect}
            numberOfMonths={isMobile ? 1 : 2}
            className="rounded-md border"
          />
          <div className="p-2 border-t">
            <Button variant="ghost" onClick={clearFilter} className="w-full" size="sm">
              {t('CLEAR_FILTER')}
            </Button>
          </div>
        </button>
      </PopoverContent>
    </Popover>
  );
};
