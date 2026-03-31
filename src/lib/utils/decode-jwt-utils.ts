/**
 * Decodes a JWT access token to extract the `org_id` and other payload claims.
 *
 * Used by:
 * - `OrgSwitcher` - to display the current organization name
 * - `useIsProtected` - to enforce organization-specific role-based access control
 *
 * When users switch organizations, the backend issues a new JWT with the selected `org_id`.
 * This function extracts that `org_id` to determine which organization's roles should be
 * used for feature guards and protected routes.
 *
 * @param token - JWT access token string
 * @returns Decoded payload with `org_id`, or `null` if decoding fails
 */
export const decodeJWT = (token: string): { org_id?: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};
