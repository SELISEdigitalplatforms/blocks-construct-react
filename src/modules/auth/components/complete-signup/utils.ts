import { z } from 'zod';

export const getCompleteSigninFormValidationSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, { message: t('REQUIRED_FIELD') }),
    lastName: z.string().min(1, { message: t('REQUIRED_FIELD') }),
    password: z.string(),
    confirmPassword: z.string(),
  });

export type completeSigninFormType = z.infer<
  ReturnType<typeof getCompleteSigninFormValidationSchema>
>;

export const completeSigninFormDefaultValue: completeSigninFormType = {
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
};
