import { useTranslation } from 'react-i18next';
import darkLogo from '@/assets/images/construct_logo_dark.svg';
import lightLogo from '@/assets/images/construct_logo_light.svg';
import { useTheme } from '@/styles/theme/theme-provider';
import { SsoSignupForm } from '@/modules/auth/components/sso-signup/sso-signup-form';

export const SsoSignupPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="w-32 h-14 mb-2">
        <img src={theme === 'dark' ? lightLogo : darkLogo} className="w-full h-full" alt="logo" />
      </div>
      <div>
        <div className="text-2xl font-bold text-high-emphasis">{t('COMPLETE_SIGNUP')}</div>
      </div>
      <SsoSignupForm />
    </div>
  );
};
