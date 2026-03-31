import { clients, HttpError } from '@/lib/https';
import { useAuthStore } from '@/state/store/auth';
import {
  AccountActivationPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  SigninEmailPayload,
  SigninEmailResponse,
} from '../types/auth.type';

/**
 * Authentication API Utilities
 *
 * A set of low-level API functions for handling authentication-related operations such as signing in (with or without MFA),
 * signing out, refreshing tokens, and managing account lifecycle actions (activation, password reset, etc.).
 *
 * Functions:
 * - `signin`: Signs in a user using either password or MFA-based flow
 * - `signout`: Logs out the user and removes relevant local storage
 * - `getRefreshToken`: Refreshes the user's access token using a stored refresh token
 * - `accountActivation`: Activates a new account using password, code, and CAPTCHA
 * - `forgotPassword`: Triggers a password recovery email
 * - `resetPassword`: Resets the user password and logs them out from all devices
 * - `resendActivation`: Resends the account activation link
 * - `logoutAll`: Logs the user out from all devices
 *
 * Interfaces & Types:
 * - `SignInResponse`: Response from password-based sign-in
 * - `MFASigninResponse`: Response from MFA-based sign-in
 * - `PasswordSigninPayload`, `MFASigninPayload`: Payloads for sign-in methods
 * - `AccountActivationPayload`: Data used for account activation request
 *
 * Features:
 * - Uses `fetch` or `clients.post` for API communication
 * - All endpoints are protected with proper headers and credentials
 * - Throws structured `HttpError` for non-OK responses
 * - Supports CAPTCHA where applicable
 *
 * Example:
 * ```ts
 * // Password Sign-in
 * const result = await signin<'password'>({
 *   grantType: 'password',
 *   username: 'user@example.com',
 *   password: 'secret',
 *   captchaToken: 'captcha-token'
 * });
 *
 * // Reset Password
 * await resetPassword({ code: '123456', password: 'newPassword' });
 * ```
 *
 */

export interface SignInResponse {
  access_token: string;
  refresh_token: string;
  enable_mfa: boolean;
  mfaId: string;
  mfaType: number;
}

export type PasswordSigninPayload = {
  grantType: 'password';
  username: string;
  password: string;
  captchaToken?: string;
};

export type SSoSigninPayload = {
  grantType: 'social';
  code: string;
  state: string;
};

export type MFASigninPayload = {
  grantType: 'mfa_code';
  code: string;
  mfaId: string;
  mfaType: number;
};

export type MFASigninResponse = {
  access_token: string;
  refresh_token: string;
};

export interface SigninBySSOPayload {
  grantType: 'social';
  code: string;
  state: string;
}

export interface SigninByBlocksOidcPayload {
  grantType: 'authorization_code';
  code: string;
}

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

const getApiUrl = (path: string) => {
  const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};

export const savedOrgId =
  typeof window !== 'undefined' ? window.localStorage.getItem('selected-org-id') : null;

export const signin = async <
  T extends 'password' | 'social' | 'mfa_code' | 'authorization_code' = 'password',
>(
  payload: PasswordSigninPayload | MFASigninPayload | SigninBySSOPayload | SigninByBlocksOidcPayload
): Promise<T extends 'password' | 'social' ? SignInResponse : MFASigninResponse> => {
  const url = getApiUrl('/idp/v1/Authentication/Token');

  // sign in flow
  if (payload.grantType === 'password') {
    const passwordFormData = new URLSearchParams();
    if (payload.grantType === 'password') {
      passwordFormData.append('grant_type', 'password');
      passwordFormData.append('username', payload.username);
      passwordFormData.append('password', payload.password);

      if (savedOrgId) {
        passwordFormData.append('org_id', savedOrgId);
      }
    }
    const response = await fetch(url, {
      method: 'POST',
      body: passwordFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-blocks-key': projectKey,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json();
      throw new HttpError(response.status, err);
    }

    return response.json();
  } else if (payload.grantType === 'social') {
    const signinBySSOData = new URLSearchParams();
    signinBySSOData.append('grant_type', 'social');
    signinBySSOData.append('code', payload.code);
    signinBySSOData.append('state', payload.state);

    if (savedOrgId) {
      signinBySSOData.append('org_id', savedOrgId);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: signinBySSOData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-blocks-key': projectKey,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json();
      throw new HttpError(response.status, err);
    }

    return response.json();
  } else if (payload.grantType === 'authorization_code') {
    const signinBySSOData = new URLSearchParams();
    signinBySSOData.append('grant_type', 'authorization_code');
    signinBySSOData.append('code', payload.code);

    if (savedOrgId) {
      signinBySSOData.append('org_id', savedOrgId);
    }
    const response = await fetch(url, {
      method: 'POST',
      body: signinBySSOData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-blocks-key': projectKey,
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new HttpError(response.status, err);
    }

    return response.json();
  } else {
    // MFA OTP Verification flow
    const mfaFormData = new URLSearchParams();
    mfaFormData.append('grant_type', 'mfa_code');
    mfaFormData.append('code', payload.code || '');
    mfaFormData.append('mfa_id', payload.mfaId);
    mfaFormData.append('mfa_type', payload.mfaType.toString());

    const response = await fetch(url, {
      method: 'POST',
      body: mfaFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-blocks-key': projectKey,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json();
      throw new HttpError(response.status, err);
    }

    return response.json();
  }
};

export const signout = async (): Promise<{ isSuccess: true }> => {
  try {
    localStorage.removeItem('auth-storage');
    const url = '/idp/v1/Authentication/Logout';
    return await clients.post(
      url,
      JSON.stringify({
        refreshToken: useAuthStore.getState().refreshToken,
      })
    );
  } catch (error) {
    console.error('Logout operation failed:', error);
    throw error;
  }
};

export const getRefreshToken = async () => {
  const url = '/idp/v1/Authentication/Token';
  const formData = new URLSearchParams();
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', useAuthStore.getState().refreshToken ?? '');

  const response = await fetch(`${apiBaseUrl}${url}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-blocks-key': projectKey,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.json();
    throw new HttpError(response.status, err);
  }

  return response.json();
};

export const accountActivation = async (data: AccountActivationPayload) => {
  const payload = {
    ...data,
    preventPostEvent: true,
  };
  const url = '/idp/v1/Iam/Activate';
  return clients.post(url, JSON.stringify(payload));
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const modified = {
    ...payload,
    mailPurpose: 'RecoverAccount',
  };
  const url = '/idp/v1/Iam/Recover';
  return clients.post(url, JSON.stringify(modified));
};

export const resetPassword = async (data: { code: string; password: string }) => {
  const payload = {
    ...data,
    logoutFromAllDevices: true,
    ProjectKey: projectKey,
  };

  const url = '/idp/v1/Iam/ResetPassword';
  return clients.post(url, JSON.stringify(payload));
};

export const resendActivation = async (data: { userId: string }) => {
  const payload = {
    ...data,
    mailPurpose: 'ResendActivation',
  };

  const url = '/idp/v1/Iam/ResendActivation';
  return clients.post(url, JSON.stringify(payload));
};

export const logoutAll = async () => {
  const url = '/idp/v1/Authentication/LogoutAll';
  return clients.post(url, '');
};

export const signinByEmail = (payload: SigninEmailPayload): Promise<SigninEmailResponse> => {
  const body = new URLSearchParams();
  body.append('grant_type', 'password');
  body.append('username', payload.username);
  body.append('password', payload.password);

  if (savedOrgId) {
    body.append('org_id', savedOrgId);
  }

  const url = '/idp/v1/Authentication/Token';
  return clients.post(url, body, {
    'Content-Type': 'application/x-www-form-urlencoded',
  });
};

export const switchOrganization = async (orgId: string): Promise<MFASigninResponse> => {
  const url = getApiUrl('/idp/v1/Authentication/Token');
  const formData = new URLSearchParams();
  formData.append('grant_type', 'switch_organization');
  formData.append('refresh_token', useAuthStore.getState().refreshToken ?? '');
  formData.append('org_id', orgId);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-blocks-key': projectKey,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.json();
    throw new HttpError(response.status, err);
  }

  return response.json();
};
