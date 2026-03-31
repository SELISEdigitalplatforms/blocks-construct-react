import { useMemo } from 'react';
import { useAuthStore } from '.';
import { decodeJWT } from '@/lib/utils/decode-jwt-utils';

type UseIsProtectedOptions = {
  roles?: string[];
  permissions?: string[];
  opt?: 'all' | 'any';
};

const getCurrentOrgRoles = (user: any, accessToken: string | null): string[] => {
  if (!user?.memberships?.length || !accessToken) return [];

  const decoded = decodeJWT(accessToken);
  const currentOrgId = decoded?.org_id;

  if (!currentOrgId) return [];

  const membership = user.memberships.find((m: any) => m.organizationId === currentOrgId);
  return membership?.roles ?? [];
};

const checkAllRoles = (userRoles: string[] | undefined, requiredRoles: string[]): boolean => {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.every((role) => userRoles?.includes(role));
};

const checkAllPermissions = (
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean => {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.every((permission) => userPermissions?.includes(permission));
};

const checkAnyRole = (userRoles: string[] | undefined, requiredRoles: string[]): boolean => {
  if (requiredRoles.length === 0) return false;
  return requiredRoles.some((role) => userRoles?.includes(role));
};

const checkAnyPermission = (
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean => {
  if (requiredPermissions.length === 0) return false;
  return requiredPermissions.some((permission) => userPermissions?.includes(permission));
};

export const useIsProtected = ({
  roles = [],
  permissions = [],
  opt = 'any',
}: UseIsProtectedOptions = {}) => {
  const { user, isAuthenticated, accessToken } = useAuthStore();

  const isProtected = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (roles.length === 0 && permissions.length === 0) return false;

    const userRoles = getCurrentOrgRoles(user, accessToken);

    if (opt === 'all') {
      const hasAllRoles = checkAllRoles(userRoles, roles);
      const hasAllPermissions = checkAllPermissions(user.permissions, permissions);
      return hasAllRoles && hasAllPermissions;
    }

    const hasAnyRole = checkAnyRole(userRoles, roles);
    const hasAnyPermission = checkAnyPermission(user.permissions, permissions);
    return hasAnyRole || hasAnyPermission;
  }, [isAuthenticated, user, accessToken, roles, permissions, opt]);

  return {
    isProtected,
    isAuthenticated,
    user,
  };
};
