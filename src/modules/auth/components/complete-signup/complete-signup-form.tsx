import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { PasswordInput, SharedPasswordStrengthChecker } from '@/components/core';
import {
  completeSigninFormType,
  getCompleteSigninFormValidationSchema,
  completeSigninFormDefaultValue,
} from './utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const CompleteSignupForm = () => {
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: completeSigninFormDefaultValue,
    resolver: zodResolver(getCompleteSigninFormValidationSchema(t)),
  });

  const [requirementsMet, setRequirementsMet] = useState(false);

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  const onSubmitHandler = async (values: completeSigninFormType) => {
    // TODO: backend is not ready
    console.log('Form values submitted:', values);
  };

  const isSubmitDisabled = !requirementsMet;

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitHandler)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-high-emphasis font-normal">{t('FIRST_NAME')}</FormLabel>
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

          <div className="flex gap-10 mt-5">
            <Button
              className="flex-1 font-extrabold"
              size="lg"
              type="submit"
              disabled={isSubmitDisabled}
            >
              {t('SAVE')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
