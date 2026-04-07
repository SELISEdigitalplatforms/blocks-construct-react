import { useTranslation } from 'react-i18next';
import darkLogo from '@/assets/images/construct_logo_dark.svg';
import lightLogo from '@/assets/images/construct_logo_light.svg';
import { useTheme } from '@/styles/theme/theme-provider';
import { SsoSignupForm } from '@/modules/auth/components/sso-signup/sso-signup-form';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

export const SsoSignupPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const provider = searchParams.get('provider') ?? '';

  if (!email || !provider) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col gap-6">
      <div className="w-32 h-14 mb-2">
        <img src={theme === 'dark' ? lightLogo : darkLogo} className="w-full h-full" alt="logo" />
      </div>
      <div>
        <div className="text-2xl font-bold text-high-emphasis">{t('COMPLETE_SIGNUP')}</div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-normal text-medium-emphasis">
          {t('ALREADY_HAVE_ACCOUNT')}
        </span>
        <Link
          to={'/login'}
          className="text-sm font-bold text-primary hover:text-primary-600 hover:underline"
        >
          {t('LOG_IN')}
        </Link>
      </div>
      <SsoSignupForm email={email} provider={provider} />
    </div>
  );
};
