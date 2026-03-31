import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import darkLogo from '@/assets/images/construct_logo_dark.svg';
import lightLogo from '@/assets/images/construct_logo_light.svg';
import { useTheme } from '@/styles/theme/theme-provider';
import { Divider } from '@/components/core';
import { SignupForm } from '@/modules/auth/components/signup';
import { useGetSignupSettings, useGetLoginOptions } from '@/modules/auth/hooks/use-auth';
import { SsoSignin } from '@/modules/auth/components/signin-sso';

export const SignupPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: signupSettings } = useGetSignupSettings();
  const { data: loginOption } = useGetLoginOptions();

  const isEmailPasswordSignUpEnabled = signupSettings?.isEmailPasswordSignUpEnabled ?? false;
  const isSSoSignUpEnabled = signupSettings?.isSSoSignUpEnabled ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div className="w-32 h-14 mb-2">
        <img src={theme === 'dark' ? lightLogo : darkLogo} className="w-full h-full" alt="logo" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-high-emphasis">{t('SIGN_UP_TO_GET_ACCESS')}</h2>
        <div className="flex items-center gap-1 mt-4">
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
      </div>
      {isEmailPasswordSignUpEnabled && <SignupForm />}
      <div>
        {isEmailPasswordSignUpEnabled && isSSoSignUpEnabled && (
          <Divider text={t('OR_CONTINUE_WITH')} />
        )}
        {isSSoSignUpEnabled && loginOption && <SsoSignin loginOption={loginOption} />}
      </div>
    </div>
  );
};
