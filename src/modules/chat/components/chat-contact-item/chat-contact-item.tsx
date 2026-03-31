import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { BellOff, EllipsisVertical, Mail, MailOpen, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui-kit/dropdown-menu';
import { ChatContact } from '../../types/chat.types';
import { cn } from '@/lib/utils';
import { ChatAvatarContent } from '../chat-avatar-content/chat-avatar-content';

interface ChatContactItemProps extends ChatContact {
  onClick?: (contact: ChatContact) => void;
  isSelected?: boolean;
  isCollapsed?: boolean;
  onMarkAsRead?: (contactId: string) => void;
  onMarkAsUnread?: (contactId: string) => void;
  onMuteToggle?: (contactId: string) => void;
  onDeleteContact?: (contactId: string) => void;
  className?: string;
  showIcon?: boolean;
}

export const ChatContactItem = ({
  id,
  avatarSrc,
  avatarFallback,
  name,
  email,
  phoneNo,
  members,
  date,
  status,
  messages,
  onClick,
  isSelected = false,
  isCollapsed = false,
  onMarkAsUnread,
  onMarkAsRead,
  onMuteToggle,
  onDeleteContact,
  className,
  showIcon: showIconProp = true,
}: Readonly<ChatContactItemProps>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.({
      id,
      name,
      avatarSrc,
      avatarFallback: avatarFallback || name.charAt(0).toUpperCase(),
      status,
      email: email ?? '',
      phoneNo: phoneNo ?? '',
      members: members ?? [],
      date: date ?? new Date().toISOString(),
      messages: messages ?? [],
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  const showIcon = (isHovered || isDropdownOpen) && showIconProp;

  const renderAvatar = () => (
    <div className="relative">
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          status?.isGroup ? 'bg-secondary-50' : 'bg-neutral-100'
        )}
      >
        <ChatAvatarContent
          status={status}
          avatarSrc={avatarSrc}
          name={name}
          avatarFallback={avatarFallback}
        />
      </div>
      {status?.isOnline && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white"
          data-testid="online-indicator"
        />
      )}
    </div>
  );

  const renderDropdown = () => (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'cursor-pointer transition-opacity duration-200 p-1 rounded-full hover:bg-neutral-100',
            showIcon ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            isCollapsed ? 'absolute right-1 top-1' : ''
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVertical className="w-4 h-4 text-medium-emphasis hover:text-high-emphasis" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40" align="end">
        {status?.isUnread ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead?.(id);
            }}
          >
            <Mail className="w-5 h-5 mr-1 text-medium-emphasis" />
            {t('MARK_AS_READ')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsUnread?.(id);
            }}
          >
            <MailOpen className="w-5 h-5 mr-1 text-medium-emphasis" />
            {t('MARK_AS_UNREAD')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle?.(id);
          }}
          disabled={!onMuteToggle}
        >
          <BellOff className="w-5 h-5 mr-1 text-medium-emphasis" />
          {status?.isMuted ? t('UNMUTE_NOTIFICATIONS') : t('MUTE_NOTIFICATIONS')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDeleteContact?.(id);
          }}
          disabled={!onDeleteContact}
        >
          <Trash className="w-5 h-5 mr-1 text-medium-emphasis" />
          {t('DELETE')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isCollapsed) {
    return (
      <button
        type="button"
        className={cn(
          'group relative flex flex-col items-center w-full p-3 text-center hover:bg-surface',
          isSelected && 'bg-primary-50',
          className
        )}
        onClick={handleClick}
        aria-label={`Open chat with ${name}`}
        data-testid={`chat-contact-item-btn-${id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative mb-1">{renderAvatar()}</div>
        <span className="text-xs font-medium text-high-emphasis truncate w-full">{name}</span>
      </button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group relative flex items-center w-full p-4 text-left hover:bg-surface cursor-pointer',
        isSelected && 'bg-primary-50',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open chat with ${name}`}
      data-testid={`chat-contact-item-btn-${id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mr-3 flex-shrink-0">{renderAvatar()}</div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between w-full">
          <p
            className={cn(
              'text-sm text-high-emphasis truncate',
              status?.isUnread ? 'font-bold' : 'font-medium'
            )}
          >
            {name}
          </p>
          <div className="relative h-4 w-16 flex items-center justify-end">
            <span
              className={cn(
                'absolute right-0 text-xs text-medium-emphasis whitespace-nowrap transition-opacity duration-200',
                showIcon ? 'opacity-0' : 'opacity-100'
              )}
            >
              {format(new Date(date), 'dd.MM.yyyy')}
            </span>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <p
            className={cn(
              'text-sm text-medium-emphasis truncate',
              status?.isUnread ? 'font-bold' : 'font-medium'
            )}
          >
            {messages && messages.length > 0 ? messages[messages.length - 1].content : ''}
          </p>
        </div>
      </div>
      <div className="absolute right-4 bottom-4 h-full flex items-center">{renderDropdown()}</div>
    </div>
  );
};
