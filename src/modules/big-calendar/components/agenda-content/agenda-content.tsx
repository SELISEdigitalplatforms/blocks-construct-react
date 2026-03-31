import { useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent } from '../../types/calendar-event.types';
import { WEEK_DAYS } from '../../constants/calendar.constants';

interface AgendaContentProps {
  events: CalendarEvent[];
  date: Date;
  onSelectEvent?: (event: CalendarEvent) => void;
}

/**
 * AgendaContent Component
 *
 * A weekly agenda viewer that displays events grouped by each day of the current week.
 * The component calculates the start of the week based on the provided `date`, and filters events accordingly.
 *
 * Features:
 * - Highlights the current day
 * - Groups and displays events by weekday
 * - Uses custom event colors from `event.resource.color`
 * - Includes `title` and `navigate` static methods for calendar header rendering and navigation
 *
 * Props:
 * - `events`: `CalendarEvent[]` – list of events to display
 * - `date`: `Date` – the reference date for the current week
 *
 * @param {AgendaContentProps} props - Props including the date and list of events
 * @example
 * <AgendaContent events={eventList} date={new Date()} />
 */

export const AgendaContent = ({ events, date, onSelectEvent }: Readonly<AgendaContentProps>) => {
  const weekEvents = useMemo(() => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const endOfWeekDate = new Date(startOfWeek);
    endOfWeekDate.setDate(startOfWeek.getDate() + 6);

    return events.filter((event) => event.start >= startOfWeek && event.start <= endOfWeekDate);
  }, [events, date]);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-200px)] overflow-y-auto">
      {WEEK_DAYS.map((day, index) => {
        const currentDay = new Date(date);
        currentDay.setDate(date.getDate() - date.getDay() + index);

        return (
          <div
            key={day}
            className={`${index !== WEEK_DAYS.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="flex flex-col sm:flex-row w-full px-3 py-4 gap-4 sm:gap-6">
              <div className="flex items-center sm:w-[15%] gap-2">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${isToday(currentDay) && ' bg-primary'}`}
                >
                  <p
                    className={`text-base font-semibold ${isToday(currentDay) ? 'text-white' : 'text-high-emphasis'}`}
                  >
                    {currentDay.getDate()}
                  </p>
                </div>
                <p className="text-sm font-normal text-high-emphasis">
                  {format(currentDay, 'MMM, EEE')}
                </p>
              </div>
              <div className="flex flex-col sm:w-[85%] w-full gap-2">
                {weekEvents
                  .filter((event) => isSameDay(event.start, currentDay))
                  .map((event) => (
                    <button
                      key={`${event.start.getTime()}-${event.end.getTime()}-${event.title}`}
                      type="button"
                      onClick={() => onSelectEvent?.(event)}
                      className="w-full text-left cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 hover:bg-surface p-2 hover:rounded"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-[23%]">
                        <div
                          style={{
                            backgroundColor: `${event?.resource?.color}`,
                          }}
                          className="w-6 h-6 rounded-full ring-1 ring-neutral-100"
                        />
                        <p className="font-normal text-sm text-high-emphasis">
                          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-high-emphasis ml-9 sm:ml-0 w-full sm:w-[77%]">
                        {event.title}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

AgendaContent.title = (date: Date) => {
  return format(date, 'MMMM yyyy');
};

AgendaContent.navigate = (date: Date, action: 'PREV' | 'NEXT') => {
  const newDate = new Date(date);
  newDate.setDate(action === 'PREV' ? date.getDate() - 7 : date.getDate() + 7);
  return newDate;
};
