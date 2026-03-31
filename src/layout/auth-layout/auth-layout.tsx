import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import bgAuthLight from '@/assets/images/bg_auth_light.svg';
import bgAuthDark from '@/assets/images/bg_auth_dark.svg';
import { useGetLoginOptions } from '@/modules/auth/hooks/use-auth';
import { useAuthState } from '@/state/client-middleware';
import { useTheme } from '@/styles/theme/theme-provider';
import { ExtensionBanner, LanguageSelector } from '@/components/core';

export const AuthLayout = () => {
  const { isLoading, error: loginOptionsError } = useGetLoginOptions();
  const navigate = useNavigate();
  const { isMounted, isAuthenticated } = useAuthState();
  const { theme } = useTheme();

  useEffect(() => {
    // Don't redirect if we're on the MFA verification page
    if (isAuthenticated && !window.location.pathname.includes('/verify-mfa')) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isMounted) return null;

  const getBackgroundImage = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? bgAuthDark : bgAuthLight;
    }
    return theme === 'dark' ? bgAuthDark : bgAuthLight;
  };

  const is404Error = (error: any) => {
    return (
      error?.message?.includes('HTTP 404') ||
      error?.message?.includes('HTTP 403') ||
      error?.message?.includes('HTTP 406') ||
      error?.message?.includes('HTTP 424') ||
      error?.response?.status === 404 ||
      error?.response?.status === 403 ||
      error?.response?.status === 406 ||
      error?.response?.status === 424 ||
      error?.status === 404 ||
      error?.status === 403 ||
      error?.status === 406 ||
      error?.status === 424
    );
  };

  const is500Error = (error: any) => {
    const status = error?.response?.status || error?.status;
    if (status && status >= 500 && status < 600) {
      return true;
    }

    if (error?.message) {
      const httpMatch = error.message.match(/HTTP (\d{3})/);
      if (httpMatch) {
        const statusFromMessage = parseInt(httpMatch[1], 10);
        return statusFromMessage >= 500 && statusFromMessage < 600;
      }
    }

    return false;
  };

  const renderAuthContent = () => {
    if (is404Error(loginOptionsError)) {
      return (
        <div className="w-full max-w-xl mx-auto">
          <div className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-transparent"></div>
            <div className="relative z-10">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-900 tracking-tight">
                  Incorrect Project Key
                </h2>
                <div className="space-y-3 text-red-700">
                  <p className="text-base leading-relaxed">
                    It seems your project is not set up in the Blocks Cloud.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Please create a project at{' '}
                    <a
                      href="https://cloud.seliseblocks.com"
                      className="font-semibold underline decoration-red-400 underline-offset-2 hover:decoration-red-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      cloud.seliseblocks.com
                    </a>
                    , then update your{' '}
                    <code className="inline-flex items-center px-2 py-1 rounded-md bg-red-200/60 text-red-800 font-mono text-xs border border-red-300/50">
                      .env
                    </code>{' '}
                    configuration in Construct accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (is500Error(loginOptionsError)) {
      return (
        <div className="w-full max-w-xl mx-auto">
          <div className="relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-transparent"></div>
            <div className="relative z-10">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-orange-100 p-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-orange-900 tracking-tight">
                  Services Temporarily Unavailable
                </h2>
                <div className="space-y-3 text-orange-700">
                  <p className="text-base leading-relaxed">
                    The services are temporarily unavailable.
                  </p>
                  <p className="text-base leading-relaxed font-semibold">
                    Everything will be back to normal soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <Outlet />;
  };

  if (isLoading) return null;

  return (
    <div className="flex w-full flex-col h-screen">
      <ExtensionBanner />
      <div className="flex w-full min-h-screen relative">
        <div className="hidden md:block w-[36%] relative bg-primary-50">
          <img
            src={getBackgroundImage()}
            alt="bg auth"
            className="w-full h-full object-cover"
            key={theme ?? 'default'}
          />
        </div>
        <div className="flex items-center justify-center w-full px-6 sm:px-20 md:w-[64%] md:px-[14%] lg:px-[16%] 2xl:px-[20%]">
          <div className="absolute top-2 right-4">
            <LanguageSelector />
          </div>
          {renderAuthContent()}
        </div>
      </div>
    </div>
  );
};
