import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui-kit/button';
import githubIcon from '@/assets/images/social_media_github.svg';
import linkedinIcon from '@/assets/images/social_media_in.svg';
import microsoftIcon from '@/assets/images/social_media_ms.svg';
import googleIcon from '@/assets/images/social_media_google.svg';
import darkLogo from '@/assets/images/construct_logo_dark.svg';
import lightLogo from '@/assets/images/construct_logo_light.svg';
import { useTheme } from '@/styles/theme/theme-provider';
import { Divider } from '@/components/core';
import { SignupForm } from '@/modules/auth/components/signup';
import { useGetSignupSettings } from '@/modules/auth/hooks/use-auth';

const socialButtons = [
  { icon: googleIcon, alt: 'Google Logo' },
  { icon: microsoftIcon, alt: 'Microsoft Logo' },
  { icon: linkedinIcon, alt: 'LinkedIn Logo' },
  { icon: githubIcon, alt: 'GitHub Logo' },
];

export const SignupPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data } = useGetSignupSettings();

  const isEmailPasswordSignUpEnabled = data?.isEmailPasswordSignUpEnabled ?? false;
  const isSSoSignUpEnabled = data?.isSSoSignUpEnabled ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div className="w-32 h-14 mb-2">
        <img src={theme === 'dark' ? lightLogo : darkLogo} className="w-full h-full" alt="logo" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-high-emphasis">{t('SIGN_UP_ACCESS_OPEN_SOURCE')}</h2>
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
        {isSSoSignUpEnabled && (
          <div className="flex items-center gap-8 mt-6">
            <div className="flex w-full items-center gap-4">
              {socialButtons.map((button) => (
                <Button key={button.alt} variant="outline" className="w-[25%] h-12">
                  <img src={button.icon} width={20} height={20} alt={button.alt} />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
