import { z } from 'zod';

export const getForgotPasswordFormValidationSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .email({ message: t('INVALID_EMAIL_ADDRESS') })
      .min(1, { message: t('EMAIL_NAME_CANT_EMPTY') }),
  });

export type forgotPasswordFormType = z.infer<
  ReturnType<typeof getForgotPasswordFormValidationSchema>
>;

/**
 * Default values for the forgot password form
 * Provides an empty email string as the initial state
 */
export const forgotPasswordFormDefaultValue: forgotPasswordFormType = {
  email: '',
};
