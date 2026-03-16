import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui-kit/form';
import { Input } from '@/components/ui-kit/input';
import { Button } from '@/components/ui-kit/button';
import { CustomCheckbox, Captcha, useCaptcha } from '@/components/core';
import { signupFormDefaultValue, signupFormType, getSignupFormValidationSchema } from './utils';
import { useSignupByEmail } from '../../hooks/use-auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/**
 * SignupForm Component
 *
 * A user registration form component that collects username (email) and handles user registration.
 * It ensures basic validation using a Zod schema for secure form submission.
 *
 * Features:
 * - Username (email) field with validation
 * - Form validation using Zod and React Hook Form
 * - Terms of Service and Privacy Policy acknowledgement checkbox
 * - Loading state handling during async submission
 *
 */

export const SignupForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<signupFormType>({
    defaultValues: signupFormDefaultValue,
    resolver: zodResolver(getSignupFormValidationSchema(t)),
  });

  const { mutateAsync } = useSignupByEmail();
  const googleSiteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY || '';
  const captchaEnabled = googleSiteKey !== '';
  const captchaType =
    import.meta.env.VITE_CAPTCHA_TYPE === 'reCaptcha' ? 'reCaptcha-v2-checkbox' : 'hCaptcha';

  const {
    code: captchaCode,
    captcha,
    reset: resetCaptcha,
  } = useCaptcha({
    siteKey: googleSiteKey,
    type: captchaType,
  });

  const { isValid } = form.formState;

  const onSubmitHandler = async (values: signupFormType) => {
    try {
      const res = await mutateAsync({
        ...values,
        captchaCode,
      });
      if (!res.isSuccess) {
        resetCaptcha();
        toast({
          variant: 'destructive',
          title: t('ERROR'),
          description: t('SOMETHING_WENT_WRONG'),
        });
      }
      return navigate(`/sent-email`);
    } catch (error) {
      resetCaptcha();
      toast({ variant: 'destructive', title: t('ERROR'), description: t('SOMETHING_WENT_WRONG') });
    }
  };

  useEffect(() => {
    if (!isValid && captchaCode) resetCaptcha();
  }, [captchaCode, isValid, resetCaptcha]);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmitHandler)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-high-emphasis font-normal">{t('EMAIL')}</FormLabel>
              <FormControl>
                <Input placeholder={t('ENTER_YOUR_EMAIL')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <CustomCheckbox
            label={
              <>
                {t('I_AGREE_TO')}{' '}
                <span className="text-primary underline hover:text-primary-600">
                  <a href="https://selisegroup.com/software-development-terms/">
                    {t('TERM_OF_SERVICE')}
                  </a>
                </span>{' '}
                {t('ACKNOWLEDGE_I_HAVE_READ')}{' '}
                <span className="text-primary underline hover:text-primary-600">
                  <a href="https://selisegroup.com/privacy-policy/">{t('PRIVACY_POLICY')}</a>
                </span>
              </>
            }
            labelClassName="text-medium-emphasis font-normal mt-5 leading-5"
          />
        </div>

        {captchaEnabled && (
          <div className="my-4">
            <Captcha {...captcha} theme="light" size="normal" />
          </div>
        )}

        <div className="flex gap-10 mt-2">
          <Button
            className="flex-1 font-extrabold"
            size="lg"
            type="submit"
            disabled={captchaEnabled && !captchaCode}
          >
            {t('SIGN_UP')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
