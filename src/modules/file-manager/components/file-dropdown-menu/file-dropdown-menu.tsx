import React, { useState, useRef, useEffect } from 'react';
import { Users, ArrowRight, Edit3, Info, Download, Trash2, MoreVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type FileDropdownMenuProps = {
  file: any;
  onAction?: (action: string, file: any) => void;
};

export const FileDropdownMenu = ({ file, onAction }: Readonly<FileDropdownMenuProps>) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      icon: Users,
      label: 'Share',
      action: 'share',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      icon: ArrowRight,
      label: 'Move',
      action: 'move',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      icon: Edit3,
      label: 'Rename',
      action: 'rename',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      icon: Info,
      label: 'View details',
      action: 'viewDetails',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      icon: Download,
      label: 'Download',
      action: 'download',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      icon: Trash2,
      label: 'Remove',
      action: 'remove',
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  const handleMenuItemClick = (action: string) => {
    onAction?.(action, file);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-full hover:bg-gray-100 duration-200"
        aria-label="More options"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-full right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        >
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={uuidv4()}
                onClick={() => handleMenuItemClick(item.action)}
                className={`w-full flex items-center px-4 py-3 text-sm duration-150 ${item.className}`}
              >
                <IconComponent className="w-4 h-4 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
