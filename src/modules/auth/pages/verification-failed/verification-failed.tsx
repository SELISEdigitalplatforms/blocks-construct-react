import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircleCheckBig } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { useResendActivation } from '@/modules/auth/hooks/use-auth';
import emailSentIcon from '@/assets/images/verification-failed.svg';

export const VerificationFailed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const { mutateAsync: resendActivation, isPending } = useResendActivation();
  const [isResendSuccess, setIsResendSuccess] = useState(false);

  const handleResendActivation = async () => {
    if (!userId) return;
    try {
      await resendActivation({
        userId,
        projectKey: import.meta.env.VITE_X_BLOCKS_KEY || '',
      });
      setIsResendSuccess(true);
    } catch (error) {
      setIsResendSuccess(false);
      console.error('Failed to resend activation link:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center align-center">
        <div className="w-32 h-14 mb-20">
          <img src={emailSentIcon} alt="emailSentIcon" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-high-emphasis mb-4">{t('VERIFICATION_FAILED')}</div>
        <div className="flex gap-1 mt-1">
          <div className="text-base font-normal text-medium-emphasis leading-6">
            {t('VERIFICATION_EMAIL_NO_LONGER_VALID')}
          </div>
        </div>
      </div>
      {userId && (
        <Button
          className="font-extrabold"
          size="lg"
          onClick={handleResendActivation}
          disabled={isPending}
        >
          {isPending ? t('SENDING...') : t('RESEND_LINK')}
        </Button>
      )}
      <Button
        className="font-extrabold text-primary mt-[-10px]"
        size="lg"
        variant="ghost"
        onClick={() => navigate('/login')}
      >
        {t('GO_TO_LOGIN')}
      </Button>

      {isResendSuccess && (
        <div className="flex items-center gap-2 mt-2">
          <CircleCheckBig className="text-green-600 shrink-0" size={20} />
          <span className="text-sm text-green-600 font-medium">
            {t('RESET_PASSWORD_LINK_SENT_EMAIL')}
            {/* it says A link has been sent successfully */}
          </span>
        </div>
      )}
    </div>
  );
};
