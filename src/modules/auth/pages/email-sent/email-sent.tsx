import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui-kit/button';
import emailSentIcon from '@/assets/images/email_sent.svg';

export const EmailSentPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center align-center">
        <div className="w-32 h-14 mb-20 ">
          <img src={emailSentIcon} alt="emailSentIcon" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-high-emphasis mb-4">{t('EMAIL_SENT')}</div>
        <div className="flex gap-1 mt-1">
          <div className="text-base font-normal text-medium-emphasis leading-6">
            {t('EMAIL_SENT_REGISTERED_EMAIL')}
          </div>
        </div>
      </div>

      <Link to="/login">
        <Button className="font-extrabold w-full" size="lg" type="submit">
          {t('GO_TO_LOGIN')}
        </Button>
      </Link>
      <Link to="/signup">
        <Button
          className="font-extrabold text-primary w-full"
          size="lg"
          type="submit"
          variant="ghost"
        >
          {t('CHANGE_EMAIL_ADDRESS')}
        </Button>
      </Link>
    </div>
  );
};
