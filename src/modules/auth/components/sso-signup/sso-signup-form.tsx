import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui-kit/button';
import { Checkbox } from '@/components/ui-kit/checkbox';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSigninMutation, useGetLoginOptions } from '../../hooks/use-auth';
import { SignInResponse } from '../../services/auth.service';
import { useAuthStore } from '@/state/store/auth';
import { SSOservice } from '../../services/sso.service';
import { SOCIAL_AUTH_PROVIDERS, SSO_PROVIDERS } from '@/constant/sso';
import { useToast } from '@/hooks/use-toast';

export const SsoSignupForm = ({ email, provider }: { email: string; provider: string }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') || '';
  const { mutateAsync: signinMutate } = useSigninMutation<'sso_consent'>();
  const { login, setTokens } = useAuthStore();
  const { data: loginOptions } = useGetLoginOptions();
  const audience = loginOptions?.ssoInfo?.find((info) => info.provider === provider)?.audience;
  const displayProvider = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : '';

  const onSubmitHandler = async () => {
    try {
      const res = (await signinMutate({
        grantType: 'sso_consent',
        code,
      })) as SignInResponse;

      if (res.enable_mfa) {
        navigate(`/verify-mfa?mfa_id=${res.mfaId}&mfa_type=${res.mfaType}&sso=true`, {
          replace: true,
        });
        return;
      }

      if (!res.access_token) {
        navigate('/login', { replace: true });
        return;
      }

      login(res.access_token, res.refresh_token ?? '');
      setTokens({ accessToken: res.access_token, refreshToken: res.refresh_token ?? '' });
      navigate('/', { replace: true });
    } catch (error) {
      if (JSON.stringify(error).includes('expire')) {
        toast({
          title: t('ERROR'),
          description: t('SOMETHING_WENT_WRONG'),
          variant: 'destructive',
        });
      }
      console.error('SSO signup consent failed:', error);
    }
  };

  const onDifferentAccountHandler = async () => {
    if (provider && audience) {
      try {
        const ssoService = new SSOservice();
        const requestPayload = {
          provider,
          audience,
          sendAsResponse: true,
        };
        const res = await ssoService.getSocialLoginEndpoint(requestPayload);

        if (res.error) {
          return alert(`Authentication error: ${res.error}`);
        }

        if (res.providerUrl) {
          const finalUrl = new URL(res.providerUrl);
          // Google's OAuth 2.0 endpoint throws an error when
          // both approval_prompt and prompt parameters are provided simultaneously
          // because they conflict with each other
          finalUrl.searchParams.delete('approval_prompt');
          finalUrl.searchParams.set('prompt', 'select_account');
          window.location.href = finalUrl.toString();
        }
      } catch (error) {
        console.error('Failed to get alternative account URL:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="w-full">
      {displayProvider && email && (
        <div className="flex flex-row mb-4 text-sm text-medium-emphasis gap-2">
          <img
            src={SOCIAL_AUTH_PROVIDERS[provider as SSO_PROVIDERS].imageSrc}
            width={16}
            height={16}
            alt={`${provider} logo`}
          />
          {`${t('SIGNING_IN_USING_ACCOUNT').replace('---', displayProvider)} (${email})`}
        </div>
      )}
      {displayProvider && (
        <div
          className="font-bold text-primary cursor-pointer hover:underline w-fit mb-4"
          onClick={onDifferentAccountHandler}
        >
          {t('USE_A_DIFFERENT_ACCOUNT').replace('---', displayProvider)}
        </div>
      )}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-start gap-2 mt-5 mb-2">
            <Checkbox
              id="terms-checkbox"
              checked={isTermsAccepted}
              onCheckedChange={(checked: boolean) => setIsTermsAccepted(checked)}
              className="mt-1"
            />
            <label
              htmlFor="terms-checkbox"
              className="text-medium-emphasis font-normal leading-5 cursor-pointer"
            >
              {t('I_AGREE_TO')}{' '}
              <span className="text-primary underline hover:text-primary-600">
                <a href="https://selisegroup.com/software-development-terms/">
                  {t('TERM_OF_SERVICE')}
                </a>
              </span>{' '}
              {t('ACKNOWLEDGE_I_HAVE_READ')}{' '}
              <span className="text-primary underline hover:text-primary-600">
                <a href="https://selisegroup.com/privacy-policy/">{t('PRIVACY_POLICY')}</a>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-5">
          <Button
            className="w-full font-extrabold"
            size="lg"
            onClick={onSubmitHandler}
            disabled={!isTermsAccepted}
          >
            {t('SAVE')}
          </Button>
        </div>
      </div>
    </div>
  );
};
