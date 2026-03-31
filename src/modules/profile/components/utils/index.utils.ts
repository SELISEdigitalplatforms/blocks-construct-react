import z from 'zod';
// Function to get validation schemas with translations
export const getValidationSchemas = (t: (key: string) => string) => ({
  createUserFormValidationSchema: z.object({
    firstName: z.string().min(1, { message: t('FIRST_NAME_CANT_EMPTY') }),
    lastName: z.string().min(1, { message: t('LAST_NAME_CANT_EMPTY') }),
    email: z.string().email({ message: t('INVALID_EMAIL_FORMAT') }),
  }),

  profileFormValidationSchema: z.object({
    firstName: z.string().min(1, { message: t('FIRST_NAME_CANT_EMPTY') }),
    lastName: z.string().min(1, { message: t('LAST_NAME_CANT_EMPTY') }),
    // email: z.string().email(),
    memberships: z
      .array(
        z.object({
          organizationId: z.string(),
          roles: z.array(z.string()),
        })
      )
      .optional(),
  }),

  changePasswordFormValidationSchema: z.object({
    oldPassword: z.string().min(1, { message: t('CURRENT_PASSWORD_CANT_EMPTY') }),
    newPassword: z.string().min(8, { message: t('PASSWORD_MUST_EIGHT_CHARACTER_LONG') }),
    confirmNewPassword: z.string().min(8, { message: t('PASSWORD_MUST_EIGHT_CHARACTER_LONG') }),
  }),
});

export const getChangePasswordValidationSchemas = (t: (key: string) => string) =>
  z.object({
    oldPassword: z.string().min(1, { message: t('CURRENT_PASSWORD_CANT_EMPTY') }),
    newPassword: z.string().min(8, { message: t('PASSWORD_MUST_EIGHT_CHARACTER_LONG') }),
    confirmNewPassword: z.string().min(8, { message: t('PASSWORD_MUST_EIGHT_CHARACTER_LONG') }),
  });

export type changePasswordFormType = z.infer<ReturnType<typeof getChangePasswordValidationSchemas>>;

export const changePasswordFormDefaultValue: changePasswordFormType = {
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

export type ProfileFormType = z.infer<
  ReturnType<typeof getValidationSchemas>['profileFormValidationSchema']
>;

export type CreateUserFormType = z.infer<
  ReturnType<typeof getValidationSchemas>['createUserFormValidationSchema']
>;
