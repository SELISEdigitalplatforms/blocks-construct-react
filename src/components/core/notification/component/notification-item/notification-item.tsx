import { useState } from 'react';
import { EllipsisVertical, Loader2 } from 'lucide-react';
import { parseISO, format, isToday, isYesterday } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui-kit/button';
import { useMarkNotificationAsRead } from '../../hooks/use-notification';
import type { Notification } from '../../types/notification.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui-kit/dropdown-menu';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: Readonly<NotificationItemProps>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isRead, setIsRead] = useState(notification.isRead);
  const { mutate: markAsRead, isPending } = useMarkNotificationAsRead();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRead) {
      setIsRead(true);
      markAsRead(notification.id, {
        onError: () => {
          setIsRead(false);
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return `${t('TODAY')}, ${format(date, 'h:mm a')}`;
    }

    if (isYesterday(date)) {
      return `${t('YESTERDAY')}, ${format(date, 'h:mm a')}`;
    }

    return format(date, 'MM/dd/yyyy, h:mm a');
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="group flex items-start gap-3 p-2 hover:bg-muted/50 cursor-pointer">
        <div className={`w-2 h-2 rounded-full mt-3 ${!isRead && 'bg-secondary'}`} />
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-1">
            <h4 className={`text-high-emphasis truncate text-base ${!isRead && 'font-bold'}`}>
              {JSON.parse(notification.denormalizedPayload).Title}
            </h4>
            <p className="text-high-emphasis text-sm line-clamp-2">
              {JSON.parse(notification.denormalizedPayload).Description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-medium-emphasis">
                {formatDate(notification.createdTime)}
              </span>
            </div>
          </div>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <div
              className={`${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <EllipsisVertical className="!w-5 !h-5 text-medium-emphasis" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleMarkAsRead}
                  disabled={isRead || isPending}
                  className="flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('MARKING_AS_READ')}</span>
                    </>
                  ) : (
                    <span>{t('MARKED_AS_READ')}</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>{t('REMOVE_NOTIFICATION')}</DropdownMenuItem>
                <DropdownMenuItem disabled>{t('TURN_OFF_NOTIFICATION_MODULE')}</DropdownMenuItem>
              </DropdownMenuContent>
            </div>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
