import { User } from '@/types/user.type';

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  selectedOrgId: string | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  } | null;
  login: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  setUser: (user: User | null) => void;
  reset: () => void;
};
