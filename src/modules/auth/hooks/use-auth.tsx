import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  accountActivation,
  forgotPassword,
  resendActivation,
  resetPassword,
  signin,
  signout,
  logoutAll,
  PasswordSigninPayload,
  MFASigninPayload,
  SSoSigninPayload,
  SignInResponse,
  MFASigninResponse,
  signinByEmail,
  SigninByBlocksOidcPayload,
} from '../services/auth.service';
import { useGlobalMutation, useGlobalQuery } from '../../../state/query-client/hooks';
import { ErrorResponse } from '../../../hooks/use-error-handler';
import { getLoginOption } from '../services/sso.service';

/**
 * Authentication Mutations
 *
 * A collection of reusable hooks for handling authentication-related operations using `useGlobalMutation`.
 * These hooks manage server communication, error handling, and success feedback for various auth flows,
 * including sign-in, sign-out, password reset, and account activation.
 *
 * Hooks:
 * - `useSigninMutation`: Handles password or MFA-based sign-in logic with error messaging
 * - `useSignoutMutation`: Handles user sign-out
 * - `useAccountActivation`: Activates a newly registered user account with toast notifications
 * - `useForgotPassword`: Sends a password reset link to the user's email
 * - `useResetPassword`: Resets user password after verification
 * - `useResendActivation`: Resends account activation link to user's email
 * - `useLogoutAllMutation`: Logs out user from all devices
 *
 * Features:
 * - Generic mutation handling using a global mutation wrapper
 * - Custom toast notifications for success and error feedback
 * - Flexible payload typing for sign-in variants (password or MFA)
 * - Detailed error parsing and user-friendly messaging
 *
 * Example:
 * ```tsx
 * const { mutate: signin, errorDetails } = useSigninMutation<'password'>();
 * signin({ username, password });
 * ```
 *
 * @module authMutations
 */

export const useSigninMutation = <
  T extends 'password' | 'mfa_code' | 'social' | 'authorization_code',
>() => {
  const queryClient = useQueryClient();
  return useGlobalMutation<
    SignInResponse | MFASigninResponse,
    ErrorResponse,
    PasswordSigninPayload | MFASigninPayload | SSoSigninPayload | SigninByBlocksOidcPayload
  >({
    mutationKey: ['signin'],
    mutationFn: async (payload) => signin<T>(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getLanguages'] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useSignoutMutation = () => {
  return useGlobalMutation({
    mutationKey: ['signout'],
    mutationFn: signout,
    onError: (error) => {
      throw error;
    },
  });
};

export const useAccountActivation = () => {
  return useGlobalMutation<unknown, ErrorResponse, any>({
    mutationKey: ['accountActivation'],
    mutationFn: accountActivation,
    onError: (error) => {
      throw error;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: ['forgotPassword'],
    mutationFn: forgotPassword,
  });
};

export const useResetPassword = () => {
  return useGlobalMutation<unknown, ErrorResponse, { code: string; password: string }>({
    mutationKey: ['resetPassword'],
    mutationFn: resetPassword,
    onError: (error) => {
      throw error;
    },
  });
};

export const useResendActivation = () => {
  return useGlobalMutation<unknown, ErrorResponse, { userId: string }>({
    mutationKey: ['resendActivation'],
    mutationFn: resendActivation,
    onError: (error) => {
      throw error;
    },
  });
};

export const useLogoutAllMutation = () => {
  return useGlobalMutation<unknown, ErrorResponse>({
    mutationKey: ['logoutAll'],
    mutationFn: logoutAll,
  });
};

export const useGetLoginOptions = () => {
  return useGlobalQuery({
    queryKey: ['getLoginOptions'],
    queryFn: getLoginOption,
  });
};

export const useSigninEmail = () => {
  return useMutation({
    mutationKey: ['signin', 'email'],
    mutationFn: signinByEmail,
  });
};

// export const useSigninBySSO = () => {
//   return useMutation({
//     mutationKey: ["login", "sso"],
//     mutationFn: oauthService.signinBySSO,
//   });
// };

// export const useVerifyMfa = () => {
//   return useMutation({
//     mutationKey: ["verify", "mfa"],
//     mutationFn: authService.verifyMfa,
//   });
// };

// export const useLogout = () => {
//   return useMutation({
//     mutationKey: ["logout"],
//     mutationFn: authService.logout,
//   });
// };

// export const useSignupByEmail = () => {
//   return useMutation({
//     mutationKey: ["signup", "email"],
//     mutationFn: authService.signupByEmail,
//   });
// };
