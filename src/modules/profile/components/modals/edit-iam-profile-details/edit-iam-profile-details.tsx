import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { isPossiblePhoneNumber, isValidPhoneNumber, Value } from 'react-phone-number-input';
import { User } from '@/types/user.type';
import { useQueryClient } from '@tanstack/react-query';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';
import { Label } from '@/components/ui-kit/label';
import { Input } from '@/components/ui-kit/input';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui-kit/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-kit/select';
import { Badge } from '@/components/ui-kit/badge';
import { UIPhoneInput } from '@/components/core';
import { ACCOUNT_QUERY_KEY, useUpdateAccount } from '@/modules/profile/hooks/use-account';
import { useGetRolesQuery } from '@/modules/iam/hooks/use-iam';
import { IamData } from '@/modules/iam/types/user.types';

// Constants
const MAX_ROLES = 5;
const ROLES_PAGE_SIZE = 100;
const DEFAULT_COUNTRY = 'CH';

// Types
type FormData = {
  itemId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  currentRole: string;
};

type EditIamProfileDetailsProps = {
  userInfo: User | IamData;
  onClose: () => void;
};

type MappedRole = {
  name: string;
  slug: string;
};

const createSlugFromName = (name: string): string => name.toLowerCase().replace(/\s+/g, '-');

const mapRolesToMapped = (roles: Array<{ name: string }>): MappedRole[] =>
  roles.map((role) => ({
    name: role.name,
    slug: createSlugFromName(role.name),
  }));

const parseFullName = (fullName: string) => {
  const names = fullName.trim().split(' ');
  return {
    firstName: names[0] || '',
    lastName: names.slice(1).join(' ') || '',
  };
};

const createFullName = (firstName?: string, lastName?: string): string =>
  `${firstName ?? ''} ${lastName ?? ''}`.trim();

const createInitialFormValues = (): FormData => ({
  itemId: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  roles: [],
  currentRole: '',
});

const validatePhoneNumber = (value: string, t: (key: string) => string) => {
  if (!value) return t('PHONE_NUMBER_REQUIRED');
  if (!isPossiblePhoneNumber(value)) return t('PHONE_NUMBER_LENGTH_INVALID');
  if (!isValidPhoneNumber(value)) return t('INVALID_PHONE_NUMBER');
  return true;
};

const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
};

// Custom hooks
const useRolesData = () => {
  const [availableRoles, setAvailableRoles] = useState<MappedRole[]>([]);

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({
    page: 0,
    pageSize: ROLES_PAGE_SIZE,
    filter: { search: '' },
    sort: { property: 'name', isDescending: false },
  });

  useEffect(() => {
    if (rolesData?.data) {
      setAvailableRoles(mapRolesToMapped(rolesData.data));
    }
  }, [rolesData]);

  return { availableRoles, isLoadingRoles };
};

const useFormInitialization = (userInfo: User | IamData, setValue: UseFormSetValue<FormData>) => {
  useEffect(() => {
    if (!userInfo) return;

    const fullName = createFullName(
      userInfo.firstName ?? undefined,
      userInfo.lastName ?? undefined
    );
    setValue('fullName', fullName);
    setValue('email', userInfo.email ?? '');
    setValue('phoneNumber', userInfo.phoneNumber ?? '');
    setValue('itemId', userInfo.itemId ?? '');

    if (userInfo.roles && Array.isArray(userInfo.roles)) {
      setValue('roles', userInfo.roles.slice(0, MAX_ROLES));
    }
  }, [userInfo, setValue]);
};

const useFormChangeDetection = (watchedValues: FormData, userInfo: User | IamData) => {
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    if (!userInfo) return;

    const initialValues = {
      fullName: createFullName(userInfo.firstName ?? undefined, userInfo.lastName ?? undefined),
      phoneNumber: userInfo.phoneNumber ?? '',
      roles: userInfo.roles ?? [],
    };

    const rolesEqual =
      Array.isArray(watchedValues.roles) &&
      Array.isArray(initialValues.roles) &&
      watchedValues.roles.length === initialValues.roles.length &&
      watchedValues.roles.every((role) => initialValues.roles.includes(role));

    setIsFormChanged(
      watchedValues.fullName !== initialValues.fullName ||
        watchedValues.phoneNumber !== initialValues.phoneNumber ||
        !rolesEqual
    );
  }, [watchedValues, userInfo]);

  return isFormChanged;
};

/**
 * `EditIamProfileDetails` component allows the user to edit their profile details, including their full name, email, phone number, and roles.
 * It integrates with the backend to fetch available roles, updates the account, and provides role selection with a limit of 5 roles.
 * The component supports form validation and ensures the changes are saved to the server.
 *
 * @component
 * @example
 * const userInfo = {
 *   fullName: 'John Doe',
 *   email: 'john.doe@example.com',
 *   phoneNumber: '+1234567890',
 *   roles: ['admin', 'user'],
 *   itemId: '12345'
 * };
 *
 * <EditIamProfileDetails userInfo={userInfo} onClose={() => {}} />
 */
export function EditIamProfileDetails({ userInfo, onClose }: Readonly<EditIamProfileDetailsProps>) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { availableRoles, isLoadingRoles } = useRolesData();

  const form = useForm<FormData>({
    defaultValues: createInitialFormValues(),
  });

  const { watch, setValue, handleSubmit, control, getValues } = form;
  const watchedValues = watch();

  useFormInitialization(userInfo, setValue);
  const isFormChanged = useFormChangeDetection(watchedValues, userInfo);

  const handleUpdateSuccess = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
    void queryClient.refetchQueries({
      queryKey: ACCOUNT_QUERY_KEY,
      type: 'active',
      exact: false,
    });
    onClose();
    window.location.reload();
  }, [queryClient, onClose]);

  const { mutate: updateAccount, isPending } = useUpdateAccount({
    onSuccess: handleUpdateSuccess,
  });

  const isMaxRolesReached = useCallback(() => {
    const selectedRoles = getValues('roles') || [];
    return selectedRoles.length >= MAX_ROLES;
  }, [getValues]);

  const getSelectPlaceholder = useCallback(() => {
    if (isLoadingRoles) return t('LOADING_ROLES');
    if (isMaxRolesReached()) return t('MAX_ROLES_REACHED');
    return t('SELECT_ROLES');
  }, [isLoadingRoles, isMaxRolesReached, t]);

  const getAvailableRoles = useCallback(() => {
    const selectedRoles = getValues('roles') || [];
    return availableRoles.filter((role) => !selectedRoles.includes(role.slug));
  }, [availableRoles, getValues]);

  const getRoleNameBySlug = useCallback(
    (slug: string) => {
      const role = availableRoles.find((r) => r.slug === slug);
      return role ? role.name : slug;
    },
    [availableRoles]
  );

  const handleAddRole = useCallback(
    (roleSlug: string) => {
      if (!roleSlug) return;

      const currentRoles = getValues('roles') || [];
      if (currentRoles.length >= MAX_ROLES || currentRoles.includes(roleSlug)) return;

      setValue('roles', [...currentRoles, roleSlug]);
      setValue('currentRole', '');
    },
    [getValues, setValue]
  );

  const handleRemoveRole = useCallback(
    (roleToRemove: string) => {
      const currentRoles = getValues('roles') || [];
      setValue(
        'roles',
        currentRoles.filter((role) => role !== roleToRemove)
      );
    },
    [getValues, setValue]
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      const { firstName, lastName } = parseFullName(data.fullName);

      // Get organizationId from existing user memberships
      const organizationId = userInfo?.memberships?.[0]?.organizationId ?? '';

      const payload = {
        itemId: data.itemId,
        firstName,
        lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        memberships: [
          {
            organizationId,
            roles: data.roles,
          },
        ],
      };

      updateAccount(payload);
    },
    [updateAccount, userInfo]
  );

  const handlePhoneChange = useCallback(
    (value: Value) => {
      setValue('phoneNumber', value ?? '');
    },
    [setValue]
  );

  const phoneValidation = useMemo(
    () => ({
      validate: (value: string) => validatePhoneNumber(value, t),
    }),
    [t]
  );

  const fullNameValidation = useMemo(
    () => ({
      required: t('FULL_NAME_REQUIRED'),
    }),
    [t]
  );

  const selectedRolesCount = watchedValues.roles?.length || 0;

  return (
    <DialogContent
      className="rounded-md sm:max-w-[700px] overflow-y-auto max-h-screen"
      onClick={stopPropagation}
    >
      <DialogHeader>
        <DialogTitle>{t('EDIT_PROFILE_DETAILS')}</DialogTitle>
        <DialogDescription>{t('KEEP_DETAILS_ACCURATE_UP_TO_DATE')}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="fullName"
              rules={fullNameValidation}
              render={({ field }) => (
                <FormItem>
                  <Label>{t('FULL_NAME')}*</Label>
                  <FormControl>
                    <Input {...field} placeholder={t('ENTER_YOUR_FULL_NAME')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>{t('EMAIL')}</Label>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="currentRole"
              render={({ field }) => (
                <FormItem>
                  <Label>
                    {t('ROLES')} (max {MAX_ROLES})
                  </Label>
                  <div className="space-y-2">
                    <Select
                      onValueChange={handleAddRole}
                      value={field.value}
                      disabled={isMaxRolesReached() || isLoadingRoles}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={getSelectPlaceholder()} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableRoles().map((role) => (
                          <SelectItem key={role.slug} value={role.slug}>
                            <span>{role.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedValues.roles?.map((roleSlug) => (
                        <Badge
                          key={roleSlug}
                          className="pr-1 flex items-center gap-1 text-white hover:bg-primary"
                        >
                          <span>{getRoleNameBySlug(roleSlug)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveRole(roleSlug)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>

                    {selectedRolesCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedRolesCount} of {MAX_ROLES} {t('ROLES_SELECTED')}
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="phoneNumber"
              rules={phoneValidation}
              render={({ field }) => (
                <FormItem>
                  <Label>{t('MOBILE_NO')}</Label>
                  <FormControl>
                    <UIPhoneInput
                      {...field}
                      onChange={handlePhoneChange}
                      placeholder={t('ENTER_YOUR_MOBILE_NUMBER')}
                      defaultCountry={DEFAULT_COUNTRY}
                      countryCallingCodeEditable={false}
                      international
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={(e) => {
                stopPropagation(e);
                onClose();
              }}
            >
              {t('CANCEL')}
            </Button>
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending || !isFormChanged}
              onClick={stopPropagation}
            >
              {t('SAVE')}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
