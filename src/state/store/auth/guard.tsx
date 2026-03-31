import { useGetAccount } from '@/modules/profile/hooks/use-account';
import { useAuthStore } from '.';
import { useEffect, useRef } from 'react';
import { useErrorHandler } from '@/hooks/use-error-handler';

export const Guard = ({ children }: { children: React.ReactNode }) => {
  const { data, isSuccess, error } = useGetAccount();
  const { setUser, isAuthenticated } = useAuthStore();
  const { handleError } = useErrorHandler();
  const lastErrorRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      handleError(error);
      return;
    }

    if (!isSuccess) return;
    setUser(data || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isAuthenticated, isSuccess, error, setUser]);

  return <>{children}</>;
};
