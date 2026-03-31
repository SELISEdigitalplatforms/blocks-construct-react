import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/state/store/auth';
import { useSigninMutation } from '../../hooks/use-auth';
import { SignInResponse } from '../../services/auth.service';
import { LoadingOverlay } from '@/components/core/loading-overlay/loading-overlay';
import { Signin } from '@/modules/auth/components/signin';
import { useTranslation } from 'react-i18next';

export const SigninPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync: signinMutate } = useSigninMutation<'social'>({ suppressToast: true });
  const { login, setTokens } = useAuthStore();
  const isExchangingRef = useRef(false);

  // Handle SSO callback parameters
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const isSSOCallback = !!(code && state);

  useEffect(() => {
    if (code && state && !isExchangingRef.current) {
      isExchangingRef.current = true;

      (async () => {
        try {
          const res = (await signinMutate({
            grantType: 'social',
            code,
            state,
          })) as SignInResponse;

          if (res.enable_mfa) {
            navigate(`/verify-mfa?mfa_id=${res.mfaId}&mfa_type=${res.mfaType}&sso=true`, {
              replace: true,
            });
            return;
          }

          if (res.sso_user_redirect_url) {
            try {
              const url = new URL(res.sso_user_redirect_url);
              const username = url.searchParams.get('username');
              if (username) {
                const params = new URLSearchParams();

                url.searchParams.forEach((value, key) => {
                  if (key.toLowerCase() === 'username') {
                    params.set('email', value);
                  } else {
                    params.set(key, value);
                  }
                });

                navigate(`/sso-signup?${params.toString()}`, { replace: true });
                return;
              }
            } catch (e) {
              console.error('Failed to parse sso_user_redirect_url', e);
            }
          }

          if (!res.access_token) {
            navigate('/login', { replace: true });
            return;
          }

          login(res.access_token, res.refresh_token ?? '');
          setTokens({ accessToken: res.access_token, refreshToken: res.refresh_token ?? '' });
          navigate('/', { replace: true });
        } catch (error: any) {
          console.error('SSO Callback error:', error);

          const errorPayloadStr =
            `${error?.message || ''} ${JSON.stringify(error?.error || {})} ${JSON.stringify(error || {})}`.toLowerCase();
          if (errorPayloadStr.includes('user_not_found')) {
            const emailTarget = error?.error?.error_description?.split(' ')[0];
            const errorMsg = emailTarget
              ? t('NO_SUCH_EMAIL_MESSAGE').replace('---', ` (${emailTarget})`)
              : t('NO_SUCH_EMAIL_MESSAGE').replace('---', ``);
            navigate(`/login`, { state: { ssoError: errorMsg } });
            isExchangingRef.current = false;
            return;
          }
        } finally {
          isExchangingRef.current = false;
        }
      })();
    }
  }, [code, state, searchParams, signinMutate, login, setTokens, navigate, t]);

  if (isSSOCallback) return <LoadingOverlay />;
  return <Signin />;
};
