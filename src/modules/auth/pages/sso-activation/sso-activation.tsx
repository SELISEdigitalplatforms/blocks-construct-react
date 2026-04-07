import { useSsoActivation } from '@/modules/auth/hooks/use-sso-activation';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/state/store/auth';
import { Loader } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="text-sm text-medium-emphasis">Signing in...</p>
      </div>
    </div>
  );
};

type SsoCallbackProps = {
  provider?: string;
};

export const SsoActivationPage = ({ provider: propProvider }: SsoCallbackProps) => {
  const { provider: routeProvider } = useParams();
  const provider = propProvider || routeProvider;
  const { isAuthenticated } = useAuthStore();

  useSsoActivation(provider);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  if (!provider) return <Navigate to="/login" replace />;

  return <LoadingOverlay />;
};
