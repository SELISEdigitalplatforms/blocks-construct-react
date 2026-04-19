import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/state/store/auth';
import { useSigninMutation } from '@/modules/auth/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function getSsoActivationPath(url: string, provider?: string): string | null {
  const queryPart = url.split('?')[1];
  if (!queryPart) return null;

  const params = new URLSearchParams(queryPart);
  const username = params.get('username');
  const ssoCode = params.get('code');

  return username && ssoCode
    ? `/sso-signup?email=${username}&code=${ssoCode}&provider=${provider}`
    : null;
}

/**
 * Reads `code` and `state` from the URL search params and exchanges them
 * for a session token. Handles deduplication (Apple POST → 302 → GET),
 * MFA redirects, and error feedback.
 */
export function useSsoActivation(provider?: string) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { login, logout: setUnAuthenticated, setTokens } = useAuthStore();
  const { mutateAsync, isPending } = useSigninMutation<'social'>({ suppressToast: true });
  const { toast } = useToast();

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const effectRan = useRef(false);

  useEffect(() => {
    if (!code || !state) {
      navigate('/login', { replace: true });
      return;
    }

    if (effectRan.current) {
      navigate('/login', { replace: true });
      return;
    }

    effectRan.current = true;

    async function activate() {
      try {
        const res = await mutateAsync({
          grantType: 'social',
          code: code as string,
          state: state as string,
        });

        // mutateAsync<'social'> returns SignInResponse | MFASigninResponse
        // But for social login, it typically returns SignInResponse
        if ('access_token' in res && res.access_token) {
          login(res.access_token, res.refresh_token ?? '');
          setTokens({ accessToken: res.access_token, refreshToken: res.refresh_token ?? '' });
          return navigate('/dashboard', { replace: true });
        }

        const activationPath =
          'sso_user_redirect_url' in res && res.sso_user_redirect_url
            ? getSsoActivationPath(res.sso_user_redirect_url, provider)
            : null;

        if (activationPath) {
          return navigate(activationPath, { replace: true });
        }
        if ('enable_mfa' in res && res.enable_mfa) {
          return navigate(`/verify-mfa?mfa_id=${res.mfaId}&mfa_type=${res.mfaType}`);
        }
        navigate('/login', { replace: true });
      } catch (error: any) {
        console.error('SSO Callback error:', error);
        setUnAuthenticated();

        const errorPayloadStr = `${error?.message || ''} ${JSON.stringify(
          error?.error || {}
        )} ${JSON.stringify(error || {})}`.toLowerCase();

        if (errorPayloadStr.includes('state_data_not_found')) {
          toast({
            title: 'ERROR',
            description: t('VERIFICATION_FAILED_PLEASE_TRY_AGAIN'),
            variant: 'destructive',
          });
        } else {
          // if any error, we consider, user is not on the system and signup sso is disabled
          const emailTarget = error?.error?.error_description?.split(' ')[0];
          const errorMsg = emailTarget
            ? t('NO_SUCH_EMAIL_MESSAGE').replace('---', ` (${emailTarget})`)
            : t('NO_SUCH_EMAIL_MESSAGE').replace('---', ``);
          navigate(`/login`, { state: { ssoError: errorMsg } });
          effectRan.current = false;
          return;
        }

        navigate('/login', { replace: true });
        effectRan.current = false;
      }
    }

    activate();
  }, [
    code,
    state,
    mutateAsync,
    navigate,
    login,
    setUnAuthenticated,
    provider,
    toast,
    setTokens,
    t,
  ]);

  return { isPending };
}
