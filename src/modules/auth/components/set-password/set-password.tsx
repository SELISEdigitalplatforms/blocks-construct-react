import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BasePasswordForm } from '@/components/core';
import { useAccountActivation } from '../../hooks/use-auth';
import { setPasswordFormDefaultValue, getSetPasswordFormValidationSchema } from './utils';

/**
 * SetPasswordForm Component
 *
 * A wrapper component that handles the account activation and password setting process
 * by connecting the account activation API mutation with a base password form component.
 *
 * Features:
 * - Integrates account activation API with form submission
 * - Manages CAPTCHA validation state
 * - Passes loading state to the base form
 * - Handles form submission with password, verification code, and CAPTCHA token
 * - Delegates validation and UI rendering to the BasePasswordForm
 *
 */

export const SetpasswordForm = ({ code }: Readonly<{ code: string }>) => {
  const { t } = useTranslation();
  const { isPending, mutateAsync } = useAccountActivation();
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // Check if captcha is enabled
  const captchaEnabled = (import.meta.env.VITE_CAPTCHA_SITE_KEY || '') !== '';

  const handleSubmit = async (password: string, code: string, captchaToken?: string, formData?: any) => {
    if (captchaEnabled && !captchaToken) {
      return;
    }

    await mutateAsync({
      firstname: formData?.firstName ?? '',
      lastname: formData?.lastName ?? '',
      password,
      code,
      captchaCode: captchaToken ?? '',
      projectKey: import.meta.env.VITE_X_BLOCKS_KEY || '',
    });
  };

  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
  };

  return (
    <BasePasswordForm
      code={code}
      onSubmit={handleSubmit}
      validationSchema={getSetPasswordFormValidationSchema(t)}
      defaultValues={setPasswordFormDefaultValue}
      isPending={isPending}
      isCaptchaValid={isCaptchaValid}
      onCaptchaValidation={handleCaptchaValidation}
      showNameFields={true}
    />
  );
};
