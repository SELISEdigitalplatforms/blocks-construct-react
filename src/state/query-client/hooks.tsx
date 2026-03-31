import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  QueryKey,
} from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';
import { useErrorHandler, ErrorResponse } from '../../hooks/use-error-handler';

// Helper to process API errors consistently
const processApiError = (err: any): ErrorResponse => {
  // Extract errors object from backend response (e.g., {"isSuccess":false,"errors":{"Password":"..."}})
  const backendErrors = err.error?.errors || err.response?.data?.errors;

  // Extract status code from multiple possible locations
  const status = err.status || err.response?.status || err.error?.status;

  const errorInfo = {
    error: err.error?.error || err.response?.data?.error || 'UNKNOWN_ERROR',
    message: err.error?.message || err.response?.data?.message,
    details: backendErrors || err.error?.details || err.response?.data?.details,
  };

  const apiError: ErrorResponse = {
    error: errorInfo,
    error_description:
      err.error_description ||
      err.error?.message ||
      err.message ||
      err.response?.data?.error_description,
    status,
  };

  if (errorInfo.error === 'invalid_refresh_token') {
    const overlay = document.createElement('div');
    overlay.id = 'session-expired-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 z-50';
    document.body.appendChild(overlay);

    apiError.error = {
      error: 'invalid_refresh_token',
      message: 'LOGGED_OUT_DUE_SESSION_EXPIRATION',
    };
    apiError.error_description = 'LOGGED_OUT_DUE_SESSION_EXPIRATION';
  }

  return apiError;
};

// Helper to handle session expiration
const handleSessionExpiration = (
  logout: () => void,
  navigate: (path: string) => void,
  handleError: (error: any, options?: any) => void,
  duration = 3000
) => {
  setTimeout(() => {
    logout();
    navigate('/login');

    const overlay = document.getElementById('session-expired-overlay');
    if (overlay) {
      overlay.remove();
    }

    handleError('LOGGED_OUT_DUE_SESSION_EXPIRATION', {
      variant: 'destructive',
      duration,
      title: 'LOGGED_OUT',
    });
  }, 1500);
};

type ToastVariant = 'default' | 'destructive';

type ApiError = ErrorResponse;

/**
 * A wrapper around React Query's useQuery that adds global error handling
 */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

type GlobalQueryOptions<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  'onError'
> & {
  messageMap?: Record<string, string>;
  variant?: ToastVariant;
  duration?: number;
  onError?: (error: TError) => void;
};

export const useGlobalQuery = <
  TQueryFnData = unknown,
  TError = ErrorResponse,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: GlobalQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) => {
  const { handleError } = useErrorHandler();
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  const hasHandledError = useRef(false);

  const queryResult = useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
    retry: false,
  });

  useEffect(() => {
    if (queryResult.error && !hasHandledError.current) {
      hasHandledError.current = true;
      const err = queryResult.error as any;
      const apiError = processApiError(err);

      if (apiError.error?.error === 'invalid_refresh_token' && !isPublicRoute) {
        handleSessionExpiration(logout, navigate, handleError);
      } else {
        handleError(apiError, {
          variant: 'destructive',
        });
      }

      // Call the original onError if it exists
      if (options.onError) {
        options.onError(queryResult.error);
      }
    }

    // Reset the flag when the error changes
    if (!queryResult.error) {
      hasHandledError.current = false;
    }
  }, [queryResult.error, isPublicRoute, handleError, logout, navigate, options, t]);

  return queryResult;
};

/**
 * useGlobalMutation Hook
 *
 * An enhanced React Query useMutation hook that handles authentication errors globally
 * by automatically logging out users and redirecting to login when refresh tokens expire.
 *
 * Features:
 * - Wraps React Query's useMutation with authentication error handling
 * - Automatically redirects to login page on invalid refresh tokens
 * - Preserves original onError callback functionality
 * - Fully typed with generics for mutation data, errors, variables and context
 *
 * @template TData The type of data returned by the mutation function
 * @template TError The type of error returned by the mutation function (defaults to ApiError)
 * @template TVariables The type of variables passed to the mutation function
 * @template TContext The type of context returned by onMutate
 *
 * @param {UseMutationOptions<TData, TError, TVariables, TContext>} option - Standard React Query mutation options
 * @returns {UseMutationResult<TData, TError, TVariables, TContext>} The mutation result object from React Query
 *
 * @example
 * // Basic usage
 * const { mutate, isLoading } = useGlobalMutation({
 *   mutationFn: (userData) => clients.post('users', JSON.stringify(userData)),
 *   onSuccess: (data) => {
 *     console.log('User created:', data);
 *   }
 * });
 */

export const useGlobalMutation = <
  TData = unknown,
  TError = ApiError,
  TVariables = void,
  TContext = unknown,
>(
  option: UseMutationOptions<TData, TError, TVariables, TContext>
) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  return useMutation({
    ...option,
    onError: (errorData, variables, onMutateResult, context) => {
      const err = errorData as any;
      const apiError = processApiError(err);

      if (apiError.error?.error === 'invalid_refresh_token') {
        handleSessionExpiration(logout, navigate, handleError);
        return;
      }

      // Handle validation errors
      if (apiError.error?.error === 'validation_failed' && apiError.error?.details) {
        handleError(apiError, {
          variant: 'destructive',
        });
        return;
      }

      // Handle specific error messages
      if (apiError.error_description || apiError.error?.message) {
        handleError(apiError, {
          variant: 'destructive',
        });
        return;
      }

      // Default error handling
      handleError(apiError, {
        variant: 'destructive',
      });

      // Call the original onError if provided
      option.onError?.(errorData, variables, onMutateResult as any, context as any);
    },
  });
};
