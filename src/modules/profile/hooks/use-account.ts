import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  createAccount,
  getAccount,
  updateAccount,
} from '../services/accounts.service';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useErrorHandler } from '@/hooks/use-error-handler';

export const useChangePassword = () => {
  return useMutation({
    mutationKey: ['changePassword'],
    mutationFn: changePassword,
  });
};

export const useGetAccount = () => {
  return useQuery({
    queryKey: ['getAccount'],
    queryFn: getAccount,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    throwOnError: false,
  });
};

export const useUpdateAccount = (options?: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationKey: ['updateAccount'],
    mutationFn: updateAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccount'] });
      toast({
        variant: 'success',
        title: t('PROFILE_UPDATED'),
        description: t('PROFILE_HAS_UPDATED_SUCCESSFULLY'),
      });

      options?.onSuccess?.();
    },
    onError: (error) => {
      handleError(error, {
        title: t('UPDATE_FAILED'),
        defaultMessage: t('ERROR_OCCURRED_WHILE_UPDATING_PROFILE'),
      });
    },
  });
};

export const ACCOUNT_QUERY_KEY = ['account'];

export const useCreateAccount = (options?: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationKey: ['createAccount'],
    mutationFn: createAccount,
    onSuccess: () => {
      toast({
        variant: 'success',
        title: t('USER_ADDED'),
        description: t('USER_HAS_ADDED_SUCCESSFULLY'),
      });

      options?.onSuccess?.();
    },
    onError: (error) => {
      handleError(error, {
        title: t('UNABLE_ADD_USER'),
        defaultMessage: t('ERROR_OCCURRED_WHILE_ADDING_USER'),
      });
    },
  });
};
