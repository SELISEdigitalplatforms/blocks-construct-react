// Set environment variables
process.env.VITE_X_BLOCKS_KEY = 'test-key';
process.env.VITE_API_BASE_URL = 'https://test-api.com';

// Mock window.location
const originalWindow = window as any;
Object.defineProperty(window, 'location', {
  value: {
    ...originalWindow.location,
    hostname: 'localhost',
    protocol: 'http:',
    host: 'localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

import { vi } from 'vitest';
import '../../lib/utils/test-utils/shared-test-utils';

// Mock the core barrel so named imports in MainLayout resolve to test doubles
vi.mock('@/components/core', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language Selector</div>,
  ProfileMenu: () => <div data-testid="profile-menu">Profile Menu</div>,
  AppSidebar: () => <div data-testid="app-sidebar">App Sidebar</div>,
  Notification: () => <div data-testid="notification">Notification</div>,
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>,
  OrgSwitcher: () => <div data-testid="org-switcher">Org Switcher</div>,
  useGetNotifications: vi.fn().mockReturnValue({
    data: {
      notifications: [],
      unReadNotificationsCount: 0,
      totalNotificationsCount: 0,
    },
  }),
}));

vi.mock('@/i18n/language-context', () => ({
  useLanguageContext: vi.fn(() => ({
    currentLanguage: 'en',
    setLanguage: vi.fn(),
    availableLanguages: [
      { languageCode: 'en', languageName: 'English', isDefault: true, itemId: 'en' },
    ],
    isLoading: false,
  })),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="language-provider">{children}</div>
  ),
}));

vi.mock('@/components/ui-kit/sidebar', () => {
  const mockUseSidebar = vi.fn(() => ({
    open: true,
    isMobile: false,
    toggle: vi.fn(),
    setOpenMobile: vi.fn(),
  }));

  return {
    Sidebar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="sidebar" className={className}>
        {children}
      </div>
    ),
    SidebarContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-content">{children}</div>
    ),
    SidebarHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="sidebar-header" className={className}>
        {children}
      </div>
    ),
    SidebarFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="sidebar-footer" className={className}>
        {children}
      </div>
    ),
    SidebarGroup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-group">{children}</div>
    ),
    SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-group-content">{children}</div>
    ),
    SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-group-label">{children}</div>
    ),
    SidebarMenu: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="sidebar-menu" className={className}>
        {children}
      </div>
    ),
    SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-menu-item">{children}</div>
    ),
    SidebarMenuButton: ({ children, className, ...props }: any) => (
      <button data-testid="sidebar-menu-button" className={className} {...props}>
        {children}
      </button>
    ),
    SidebarMenuSub: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-menu-sub">{children}</div>
    ),
    SidebarMenuSubItem: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-menu-sub-item">{children}</div>
    ),
    SidebarMenuSubButton: ({ children, className, ...props }: any) => (
      <button data-testid="sidebar-menu-sub-button" className={className} {...props}>
        {children}
      </button>
    ),
    SidebarTrigger: ({ className }: { className?: string }) => (
      <button data-testid="sidebar-trigger" className={className}>
        Toggle Sidebar
      </button>
    ),
    SidebarProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-provider">{children}</div>
    ),
    useSidebar: mockUseSidebar,
  };
});

vi.mock('providers/permission-provider', () => ({
  PermissionsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="permissions-provider">{children}</div>
  ),
}));

// Note: Use a real router in tests instead of mocking react-router-dom

vi.mock('lucide-react', () => ({
  Bell: () => <div data-testid="bell-icon">Bell Icon</div>,
  Library: () => <div data-testid="library-icon">Library Icon</div>,
  LayoutDashboard: () => <div data-testid="layout-dashboard-icon">LayoutDashboard Icon</div>,
  User: () => <div data-testid="user-icon">User Icon</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight Icon</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown Icon</div>,
  ChevronUp: () => <div data-testid="chevron-up-icon">ChevronUp Icon</div>,
  FileUser: () => <div data-testid="file-user-icon">FileUser Icon</div>,
  Users: () => <div data-testid="users-icon">Users Icon</div>,
  Server: () => <div data-testid="server-icon">Server Icon</div>,
  Store: () => <div data-testid="store-icon">Store Icon</div>,
  CircleHelp: () => <div data-testid="circle-help-icon">CircleHelp Icon</div>,
  Inbox: () => <div data-testid="inbox-icon">Inbox Icon</div>,
  FileClock: () => <div data-testid="file-clock-icon">FileClock Icon</div>,
  Presentation: () => <div data-testid="presentation-icon">Presentation Icon</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar Icon</div>,
  History: () => <div data-testid="history-icon">History Icon</div>,
  SearchX: () => <div data-testid="search-x-icon">SearchX Icon</div>,
  TriangleAlert: () => <div data-testid="triangle-alert-icon">TriangleAlert Icon</div>,
  ChartNoAxesCombined: () => (
    <div data-testid="chart-no-axes-combined-icon">ChartNoAxesCombined Icon</div>
  ),
  ReceiptText: () => <div data-testid="receipt-text-icon">ReceiptText Icon</div>,
  Folder: () => <div data-testid="folder-icon">Folder Icon</div>,
  MessageSquareText: () => <div data-testid="message-square-text-icon">MessageSquareText Icon</div>,
  Check: () => <div data-testid="check-icon">Check Icon</div>,
  Loader2: () => <div data-testid="loader2-icon">Loader2 Icon</div>,
  Menu: () => <div data-testid="menu-icon">Menu Icon</div>,
  Moon: () => <div data-testid="moon-icon">Moon Icon</div>,
  Sun: () => <div data-testid="sun-icon">Sun Icon</div>,
  Settings: () => <div data-testid="settings-icon">Settings Icon</div>,
  LogOut: () => <div data-testid="logout-icon">LogOut Icon</div>,
  MoreHorizontal: () => <div data-testid="more-horizontal-icon">MoreHorizontal Icon</div>,
}));

vi.mock('components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('components/ui/menubar', () => ({
  Menubar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="menubar">{children}</div>
  ),
  MenubarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="menubar-menu">{children}</div>
  ),
  MenubarTrigger: ({
    children,
    className,
    asChild,
  }: {
    children: React.ReactNode;
    className?: string;
    asChild?: boolean;
  }) => (
    <div data-testid="menubar-trigger" className={className}>
      {asChild ? children : <button>{children}</button>}
    </div>
  ),
  MenubarContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="menubar-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/modules/profile/hooks/use-account', () => ({
  useGetAccount: vi.fn().mockReturnValue({
    data: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
    isLoading: false,
  }),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui-kit/sidebar';
import { MainLayout } from './main-layout';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={component}>
              <Route index element={<div data-testid="outlet">Outlet Content</div>} />
            </Route>
          </Routes>
        </SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('MainLayout', () => {
  it('renders the component correctly', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders all navigation and utility elements', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    // expect(screen.getByTestId('library-icon')).toBeInTheDocument();
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
    expect(screen.getByTestId('notification')).toBeInTheDocument();
  });
});
