/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-empty-function */

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, ChevronDown, Trash2 } from 'lucide-react';
import { SharedUser } from '../../../utils/file-manager';
import { Button } from '@/components/ui-kit/button';

interface PermissionOption {
  value: string;
  label: string;
}

interface ShareWithMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedUsers: SharedUser[], permissions: { [key: string]: string }) => void;
  currentSharedUsers?: SharedUser[];
  availableRoles?: PermissionOption[];
  defaultRole?: string;
}

export const sharedUsers: SharedUser[] = [
  {
    id: '1',
    name: 'Luca Meier',
    email: 'luca.meier@gmail.com',
    role: 'Editor',
  },
  {
    id: '2',
    name: 'Aaron Green',
    email: 'aaron.green@gmail.com',
    role: 'Editor',
  },
  {
    id: '3',
    name: 'Sarah Pavan',
    email: 'sarah.pavan@gmail.com',
    role: 'Viewer',
  },
  {
    id: '4',
    name: 'Adrian Müller',
    email: 'adrian.mueller@gmail.com',
    role: 'Editor',
  },
  {
    id: '5',
    name: 'Blocks Smith',
    email: 'demo.construct@studioblocks.com',
    role: 'Owner',
  },
];

function Avatar({ name, size = 'md' }: Readonly<{ name: string; size?: 'sm' | 'md' }>) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${sizeClasses} rounded-full bg-primary text-white flex items-center justify-center font-medium`}
    >
      {initials}
    </div>
  );
}

function PermissionDropdown({
  value,
  onChange,
  options,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button disabled variant="outline" onClick={() => setIsOpen(!isOpen)} className=" bg-gray">
        {options.find((opt) => opt.value === value)?.label ?? 'Select'}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[120px]">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const ShareWithMeModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentSharedUsers = [],
  availableRoles = [
    { value: 'Editor', label: 'Editor' },
    { value: 'Viewer', label: 'Viewer' },
    { value: 'Admin', label: 'Admin' },
  ],
  defaultRole = 'Editor',
}: Readonly<ShareWithMeModalProps>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SharedUser[]>(currentSharedUsers);
  const [permissions, setPermissions] = useState<{ [key: string]: string }>(() => {
    const initialPermissions: { [key: string]: string } = {};
    currentSharedUsers.forEach((user) => {
      initialPermissions[user.id] = user.role ?? defaultRole;
    });
    return initialPermissions;
  });

  type UserRole = 'Editor' | 'Viewer' | 'Owner';

  useEffect(() => {
    const initialPermissions: { [key: string]: string } = {};
    const syncedUsers = currentSharedUsers.map((user) => {
      const userPermission = user.role ?? (defaultRole as UserRole);
      initialPermissions[user.id] = userPermission;
      return { ...user, role: userPermission };
    });

    setSelectedUsers(syncedUsers);
    setPermissions(initialPermissions);
  }, [currentSharedUsers, defaultRole]);

  const handleCancel = useCallback(() => {
    setSelectedUsers(currentSharedUsers);
    setPermissions(() => {
      const initialPermissions: { [key: string]: string } = {};
      currentSharedUsers.forEach((user) => {
        initialPermissions[user.id] = user.role ?? defaultRole;
      });
      return initialPermissions;
    });
    setSearchQuery('');
    setCurrentView('share');
    setDefaultPermission(defaultRole as UserRole);
    onClose();
  }, [currentSharedUsers, defaultRole, onClose]);
  const [currentView, setCurrentView] = useState<'share' | 'manage'>('share');
  const [defaultPermission, setDefaultPermission] = useState<UserRole>(defaultRole as UserRole);

  const handlePermissionChange = useCallback((userId: string, permission: string) => {
    setPermissions((prev) => ({
      ...prev,
      [userId]: permission,
    }));

    setSelectedUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role: permission as UserRole } : user))
    );
  }, []);

  const handleConfirm = useCallback(() => {
    const updatedUsers = selectedUsers.map((user) => ({
      ...user,
      role: (permissions[user.id] || user.role) as UserRole,
    }));

    onConfirm(updatedUsers, permissions);
    onClose();
  }, [selectedUsers, permissions, onConfirm, onClose]);

  const handleUserToggle = useCallback(
    (user: SharedUser) => {
      setSelectedUsers((prev) => {
        const isSelected = prev.some((u) => u.id === user.id);
        if (isSelected) {
          setPermissions((prevPermissions) => {
            const newPermissions = { ...prevPermissions };
            delete newPermissions[user.id];
            return newPermissions;
          });
          return prev.filter((u) => u.id !== user.id);
        } else {
          setPermissions((prevPermissions) => ({
            ...prevPermissions,
            [user.id]: defaultPermission,
          }));
          return [...prev, { ...user, role: defaultPermission }];
        }
      });
    },
    [defaultPermission]
  );

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    setPermissions((prev) => {
      const newPermissions = { ...prev };
      delete newPermissions[userId];
      return newPermissions;
    });
  }, []);

  useEffect(() => {
    const initialPermissions: { [key: string]: string } = {};
    const syncedUsers = currentSharedUsers.map((user) => {
      const userPermission = (user.role ?? defaultRole) as UserRole;
      initialPermissions[user.id] = userPermission;
      return { ...user, role: userPermission };
    });

    setSelectedUsers(syncedUsers);
    setPermissions(initialPermissions);
  }, [currentSharedUsers, defaultRole]);

  if (!isOpen) return null;

  const permissionOptions = availableRoles;

  const filteredUsers = sharedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ??
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDialogTitle = () => {
    if (currentView === 'share') {
      return 'Share';
    }

    if (selectedUsers.length > 0) {
      return 'Listed people';
    }

    return 'Share people';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-xl">
        <div className="pt-4 px-4 bg-background">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-high-emphasis">{getDialogTitle()}</h2>
            <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-medium-emphasis" />
            </button>
          </div>
        </div>

        {currentView === 'share' && (
          <>
            <div className="p-4 bg-background">
              <h3 className="text-sm font-medium text-high-emphasis mb-3">Share with people</h3>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Add people"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 border border-gray-300 bg-background rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <PermissionDropdown
                    value={defaultPermission}
                    onChange={(value) => setDefaultPermission(value as UserRole)}
                    options={permissionOptions}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 bg-background">
              {searchQuery ? (
                <div className="space-y-2">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.some((u) => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleUserToggle(user)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 border-2 transition-all w-full text-left ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'border-transparent'
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? 'Deselect' : 'Select'} user ${user.name}`}
                      >
                        <Avatar name={user.name} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-high-emphasis truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-medium-emphasis truncate">{user.email}</div>
                        </div>
                        {isSelected && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </button>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <div className="text-center text-medium-emphasis text-sm py-8">
                      No users found
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-medium-emphasis text-sm py-12">
                  The list is currently empty
                </div>
              )}
            </div>
          </>
        )}

        {currentView === 'manage' && (
          <>
            <div className="p-4">
              <h3 className="text-sm font-medium text-high-emphasis mb-1">Share with people</h3>
              <div className="text-xs text-medium-emphasis">
                {selectedUsers.length} added to the list
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 bg-background">
              <div className="space-y-3">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2">
                    <Avatar name={user.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-high-emphasis truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-medium-emphasis truncate">{user.email}</div>
                    </div>
                    <PermissionDropdown
                      value={permissions[user.id] || defaultRole}
                      onChange={(value) => handlePermissionChange(user.id, value)}
                      options={permissionOptions}
                    />
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="py-3  px-4 flex items-center justify-between bg-background">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-high-emphasis hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {currentView === 'share' && selectedUsers.length > 0 && (
              <button
                onClick={() => setCurrentView('manage')}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
              >
                Manage ({selectedUsers.length})
              </button>
            )}
            {currentView === 'manage' && (
              <button
                onClick={() => setCurrentView('share')}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Back
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
