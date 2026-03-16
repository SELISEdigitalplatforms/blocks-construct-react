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
import {
  ssoSignupFormType,
  getSsoSignupFormValidationSchema,
  ssoSignupFormDefaultValue,
} from './utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const SsoSignupForm = () => {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: ssoSignupFormDefaultValue,
    resolver: zodResolver(getSsoSignupFormValidationSchema(t)),
  });

  const onSubmitHandler = async (values: ssoSignupFormType) => {
    // TODO: backend is not ready
    console.log('Form values submitted:', values);
  };

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

          <div className="flex gap-10 mt-5">
            <Button className="flex-1 font-extrabold" size="lg" type="submit">
              {t('SAVE')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
