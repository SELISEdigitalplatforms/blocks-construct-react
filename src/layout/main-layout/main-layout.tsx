import { Outlet, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui-kit/sidebar';
import { Button } from '@/components/ui-kit/button';
import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui-kit/menubar';
import {
  LanguageSelector,
  ProfileMenu,
  AppSidebar,
  Notification,
  useGetNotifications,
  ThemeSwitcher,
  OrgSwitcher,
} from '@/components/core';

type NotificationsData = {
  notifications: any[];
  unReadNotificationsCount: number;
  totalNotificationsCount: number;
};

export const MainLayout = () => {
  const { open, isMobile } = useSidebar();
  const { pathname } = useLocation();
  const segments = pathname?.split('/').filter(Boolean);
  const firstSegment = segments?.[0] ?? undefined;
  const isEmailRoute = firstSegment === 'mail';
  const isChatRoute = firstSegment === 'chat';

  const { data: notificationsData } = useGetNotifications({
    Page: 0,
    PageSize: 10,
  });

  const notifications: NotificationsData = notificationsData ?? {
    notifications: [],
    unReadNotificationsCount: 0,
    totalNotificationsCount: 0,
  };

  const getMarginClass = () => {
    if (isMobile) return 'ml-0';
    return open ? 'ml-[var(--sidebar-width)]' : 'ml-16';
  };

  const marginClass = getMarginClass();

  return (
    <div className="flex w-full min-h-screen relative">
      <div className="absolute left-0 top-0 h-full">
        <AppSidebar />
      </div>

      <div
        className={`flex flex-col w-full h-full ${
          marginClass
        } transition-[margin-left] duration-300 ease-in-out`}
      >
        <div className="sticky bg-card z-20 top-0 border-b py-2 px-4 sm:px-6 md:px-8 flex justify-between items-center w-full">
          <div className="flex items-center">
            <SidebarTrigger className="pl-0" />
          </div>
          <div className="flex justify-between items-center gap-1 sm:gap-2 md:gap-4">
            <ThemeSwitcher />
            {/* TODO: Need later when the docs are ready and do binding to redirect to docs page*/}
            {/* <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <Library className="!w-5 !h-5 text-medium-emphasis" />
            </Button> */}
            <Menubar className="border-none p-0">
              <MenubarMenu>
                <MenubarTrigger
                  asChild
                  className="cursor-pointer focus:bg-transparent data-[state=open]:bg-transparent p-0"
                >
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                      <Bell className="!w-5 !h-5 text-medium-emphasis" />
                    </Button>
                    {notifications.unReadNotificationsCount > 0 && (
                      <div className="w-2 h-2 bg-error rounded-full absolute top-[13px] right-[20px]" />
                    )}
                  </div>
                </MenubarTrigger>
                <Notification />
              </MenubarMenu>
            </Menubar>
            <LanguageSelector />
            <OrgSwitcher />
            <ProfileMenu />
          </div>
        </div>
        <div
          className={`flex h-full bg-surface ${!isEmailRoute && !isChatRoute && 'p-4 sm:p-6 md:p-8'} ${open && !isMobile ? 'w-[calc(100dvw-var(--sidebar-width))]' : 'w-full'}`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};
