import { z } from 'zod';

export const getSsoSignupFormValidationSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, { message: t('REQUIRED_FIELD') }),
    lastName: z.string().min(1, { message: t('REQUIRED_FIELD') }),
  });

export type ssoSignupFormType = z.infer<ReturnType<typeof getSsoSignupFormValidationSchema>>;

export const ssoSignupFormDefaultValue: ssoSignupFormType = {
  firstName: '',
  lastName: '',
};
