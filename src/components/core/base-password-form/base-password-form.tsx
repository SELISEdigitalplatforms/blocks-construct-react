import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui-kit/form';
import { Button } from '@/components/ui-kit/button';
import {
  SharedPasswordStrengthChecker,
  PasswordInput,
  Captcha,
  useCaptcha,
} from '@/components/core';
import { Input } from '@/components/ui-kit/input';

/**
 * BasePasswordForm Component
 *
 * A form component for password creation/reset that includes validation, strength checking,
 * and optional CAPTCHA verification for enhanced security.
 *
 * Features:
 * - Password and confirmation fields with validation
 * - Password strength requirements checker
 * - Optional Google reCAPTCHA integration
 * - Form state management using React Hook Form
 * - Zod schema validation
 * - Loading state handling
 * - Navigation after successful submission
 *
 * Props:
 * @param {string} code - Verification code used for the password operation
 * @param {(password: string, code: string, captchaToken?: string) => Promise<void>} onSubmit - Callback for form submission
 * @param {z.ZodSchema} validationSchema - Zod schema for form validation
 * @param {{password: string, confirmPassword: string}} defaultValues - Default values for the form fields
 * @param {boolean} isPending - Loading state flag for form submission
 * @param {boolean} [isCaptchaValid] - Optional flag indicating if CAPTCHA is valid
 * @param {(isValid: boolean) => void} [onCaptchaValidation] - Optional callback when CAPTCHA validation state changes
 *
 * @example
 * // Basic usage
 * <BasePasswordForm
 *   code="reset123"
 *   onSubmit={handlePasswordReset}
 *   validationSchema={passwordSchema}
 *   defaultValues={{ password: "", confirmPassword: "" }}
 *   isPending={isSubmitting}
 *   onCaptchaValidation={setIsCaptchaValid}
 * />
 */

interface BasePasswordFormProps {
  code: string;
  onSubmit: (
    password: string,
    code: string,
    captchaToken?: string,
    formData?: any
  ) => Promise<void>;
  validationSchema: z.ZodSchema;
  defaultValues: any;
  isPending: boolean;
  isCaptchaValid?: boolean;
  onCaptchaValidation?: (isValid: boolean) => void;
  showNameFields?: boolean;
}

export const BasePasswordForm = ({
  code,
  onSubmit,
  validationSchema,
  defaultValues,
  isPending,
  onCaptchaValidation,
  showNameFields,
}: Readonly<BasePasswordFormProps>) => {
  const navigate = useNavigate();
  const [requirementsMet, setRequirementsMet] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const { t } = useTranslation();

  const googleSiteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY || '';
  const captchaEnabled = googleSiteKey !== '';

  const captchaType =
    import.meta.env.VITE_CAPTCHA_TYPE === 'reCaptcha' ? 'reCaptcha-v2-checkbox' : 'hCaptcha';

  const { code: captchaToken, captcha } = useCaptcha({
    siteKey: googleSiteKey,
    type: captchaType,
  });

  const form = useForm({
    defaultValues,
    resolver: zodResolver(validationSchema),
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');

  useEffect(() => {
    if (
      captchaEnabled &&
      requirementsMet &&
      password &&
      confirmPassword &&
      password === confirmPassword
    ) {
      setShowCaptcha(true);
    } else {
      setShowCaptcha(false);
      if (captchaToken && onCaptchaValidation) {
        onCaptchaValidation(false);
      }
    }
  }, [
    requirementsMet,
    password,
    confirmPassword,
    captchaToken,
    onCaptchaValidation,
    captchaEnabled,
  ]);

  // Sync captcha token with onCaptchaValidation callback
  useEffect(() => {
    if (onCaptchaValidation) {
      onCaptchaValidation(!!captchaToken);
    }
  }, [captchaToken, onCaptchaValidation]);

  const onSubmitHandler = async (values: any) => {
    if (captchaEnabled && !captchaToken) {
      return;
    }

    try {
      await onSubmit(values.password, code, captchaEnabled ? captchaToken : undefined, values);
      navigate('/success');
    } catch (_error) {
      // Handle error if needed
    }
  };

  const nameFieldsValid = !showNameFields || (!!firstName?.trim() && !!lastName?.trim());

  const isSubmitDisabled =
    isPending || !requirementsMet || (captchaEnabled && !captchaToken) || !nameFieldsValid;

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-5"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--neutral-300)) transparent',
        }}
        onSubmit={form.handleSubmit(onSubmitHandler)}
      >
        {showNameFields && (
          <>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-high-emphasis font-normal">
                    {t('FIRST_NAME')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('ENTER_YOUR_FIRST_NAME')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-high-emphasis font-normal">{t('LAST_NAME')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('ENTER_YOUR_LAST_NAME')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-high-emphasis font-normal">{t('PASSWORD')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('ENTER_YOUR_PASSWORD')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-high-emphasis font-normal">
                {t('CONFIRM_PASSWORD')}
              </FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('CONFIRM_YOUR_PASSWORD')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SharedPasswordStrengthChecker
          password={password}
          confirmPassword={confirmPassword}
          onRequirementsMet={setRequirementsMet}
        />

        {captchaEnabled && showCaptcha && (
          <div className="my-4">
            <Captcha {...captcha} theme="light" size="normal" />
          </div>
        )}

        <div className="flex gap-10 mt-5">
          <Button
            className="flex-1 font-extrabold"
            size="lg"
            type="submit"
            loading={isPending}
            disabled={isSubmitDisabled}
          >
            {t('CONFIRM')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
