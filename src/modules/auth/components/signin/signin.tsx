import { useTranslation } from 'react-i18next';
import { GRANT_TYPES } from '@/constant/auth';
import { Divider } from '@/components/core';
import { SsoSignin } from '../signin-sso';
import { SigninEmail } from '../signin-email';
import { useTheme } from '@/styles/theme/theme-provider';
import darklogo from '@/assets/images/construct_logo_dark.svg';
import lightlogo from '@/assets/images/construct_logo_light.svg';
import { Link } from 'react-router-dom';
import { useGetLoginOptions } from '../../hooks/use-auth';

export const Signin = () => {
  const { data: loginOption } = useGetLoginOptions();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const passwordGrantAllowed = !!loginOption?.allowedGrantTypes?.includes(GRANT_TYPES.password);
  const socialGrantAllowed =
    !!loginOption?.allowedGrantTypes?.includes(GRANT_TYPES.social) &&
    !!loginOption?.ssoInfo?.length;
  const oidcGrantAllowed = !!loginOption?.allowedGrantTypes?.includes(GRANT_TYPES.oidc);

  const isDivider = passwordGrantAllowed && (socialGrantAllowed || oidcGrantAllowed);

  const isBannerAllowedToVisible = [
    'construct.seliseblocks.com',
    'stg-construct.seliseblocks.com',
    'dev-construct.seliseblocks.com',
  ].some((domain) => window.location.hostname === domain);
  return (
    <div className="flex flex-col gap-6">
      <div className="w-32 h-14 mb-2">
        <img src={theme == 'dark' ? lightlogo : darklogo} className="w-full h-full" alt="logo" />
      </div>
      <div>
        <div className="text-2xl font-bold text-high-emphasis">{t('LOG_IN')}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-sm font-normal text-medium-emphasis">{t('DONT_HAVE_ACCOUNT')}</span>
          <Link
            to={'/signup'}
            className="text-sm font-bold text-primary hover:text-primary-600 hover:underline"
          >
            {t('SIGN_UP')}
          </Link>
        </div>
      </div>
      <div className={'w-full ' + (isBannerAllowedToVisible ? 'visible' : 'invisible h-0')}>
        <div className="rounded-lg bg-success-background border border-success p-4">
          <p className="text-xs font-normal text-success-high-emphasis">
            Log in to explore the complete Demo and Documentation. Use the credentials:{' '}
            <span className="font-semibold">demo.construct@seliseblocks.com</span> with password:{' '}
            <span className="font-semibold">H%FE*FYi5oTQ!VyT6TkEy</span>
          </p>
        </div>
      </div>
      <div className="w-full flex flex-col gap-6">
        {passwordGrantAllowed && <SigninEmail />}
        {isDivider && <Divider text={t('AUTH_OR')} />}
        {socialGrantAllowed && loginOption && <SsoSignin loginOption={loginOption} />}
      </div>
    </div>
  );
};
