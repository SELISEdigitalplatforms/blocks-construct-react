import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, redirect, useSearchParams } from 'react-router-dom';
import { SetpasswordForm } from '@/modules/auth/components/set-password';
import { useAuthState } from '@/state/client-middleware';

export const AccountActivationPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const { isMounted, isAuthenticated } = useAuthState();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) redirect('/');
  }, [isAuthenticated]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-2xl font-bold text-high-emphasis">{t('COMPLETE_SIGNUP')}</div>
        {/* <div className="flex gap-1 mt-1">
          <div className="text-sm font-normal text-medium-emphasis">
            {t('SECURE_ACCOUNT_STRONG_PASSWORD')}
          </div>
        </div> */}
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
      <SetpasswordForm code={code} />
    </div>
  );
};
