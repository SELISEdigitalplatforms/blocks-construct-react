import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SetpasswordForm } from '@/modules/auth/components/set-password';
import { useValidateActivationCodeMutation } from '@/modules/auth/hooks/use-auth';
import { useAuthState } from '@/state/client-middleware';
import { useToast } from '@/hooks/use-toast';

export const AccountActivationPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const { isMounted, isAuthenticated } = useAuthState();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: validateActivation, isPending } = useValidateActivationCodeMutation();
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!code || isAuthenticated) return;

    const validate = async () => {
      try {
        const res = await validateActivation({
          activationCode: code,
          projectKey: import.meta.env.VITE_X_BLOCKS_KEY || '',
        });

        if (res.userId) {
          // Code expired but we have userId — go to verification-failed so user can resend
          navigate(`/activate-failed?userId=${res.userId}`);
        } else if (res.errors) {
          // No userId available — redirect to signup with error toast
          toast({
            variant: 'destructive',
            title: t('ERROR'),
            description: `${t('ACTIVATION_EXPIRED')}. ${t('PLEASE_TRY_AGAIN')}`,
          });
          navigate('/signup');
        } else {
          setIsValidCode(true);
        }
      } catch (error) {
        // Unexpected error — redirect to signup with error toast
        toast({
          variant: 'destructive',
          title: t('ERROR'),
          description: `${t('ACTIVATION_EXPIRED')}. ${t('PLEASE_TRY_AGAIN')}`,
        });
        navigate('/signup');
      }
    };

    validate();
  }, [code, isAuthenticated, navigate, validateActivation, toast, t]);

  if (!isMounted || isPending || (code && isValidCode === null)) return null;

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
