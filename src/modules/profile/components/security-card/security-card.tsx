import { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui-kit/card';
import { Separator } from '@/components/ui-kit/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui-kit/tooltip';
import { Skeleton } from '@/components/ui-kit/skeleton';
import { Button } from '@/components/ui-kit/button';
import { ChangePassword } from '../change-password/change-password';
import { MfaDialogState } from '../../enums/mfa-dialog-state.enum';
import { useGetMfaTemplate } from '../../hooks/use-mfa';
import { TwoFactorAuthenticationSetup } from '../modals/two-factor-authentication-setup/two-factor-authentication-setup';
import { AuthenticatorAppSetup } from '../modals/authenticator-app-setup/authenticator-app-setup';
import { EmailVerification } from '../modals/email-verification/email-verification';
import { ManageTwoFactorAuthentication } from '../modals/manage-two-factor-authentication/manage-two-factor-authentication';

interface SecurityCardProps {
  userInfo: any;
  isLoading: boolean;
  isDemoAccount: boolean;
  t: (key: string) => string;
  currentDialog: MfaDialogState;
  setCurrentDialog: React.Dispatch<React.SetStateAction<MfaDialogState>>;
  closeAllModals: () => void;
  dialogState: MfaDialogState;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SecurityCard = ({
  userInfo,
  isLoading,
  isDemoAccount,
  t,
  currentDialog,
  setCurrentDialog,
  closeAllModals,
  dialogState,
  isChangePasswordModalOpen,
  setIsChangePasswordModalOpen,
}: Readonly<SecurityCardProps>) => {
  const { data } = useGetMfaTemplate();
  const [mfaId, setMfaId] = useState<string>('');
  const mfaButtonText =
    (userInfo?.mfaEnabled || userInfo?.isMfaVerified) &&
    data?.userMfaType.includes(userInfo?.userMfaType)
      ? t('MANAGE')
      : t('ENABLE');

  const getTooltipText = () => {
    if (isDemoAccount) return t('NOT_AVAILABLE_DEMO_ACCOUNTS');
    return userInfo?.mfaEnabled || userInfo?.isMfaVerified
      ? t('CLICK_MANAGE_MFA')
      : t('CLICK_ENABLE_MFA');
  };

  const renderMfaDialogs = () => {
    switch (currentDialog) {
      case MfaDialogState.TWO_FACTOR_SETUP:
        return (
          <TwoFactorAuthenticationSetup
            userInfo={userInfo}
            setCurrentDialog={setCurrentDialog}
            onClose={closeAllModals}
            setMfaId={setMfaId}
          />
        );
      case MfaDialogState.AUTHENTICATOR_APP_SETUP:
        return (
          <AuthenticatorAppSetup
            userInfo={userInfo}
            onClose={closeAllModals}
            onNext={() => setCurrentDialog(MfaDialogState.MANAGE_TWO_FACTOR_AUTHENTICATION)}
            mfaId={mfaId}
          />
        );
      case MfaDialogState.EMAIL_VERIFICATION:
        return (
          <EmailVerification
            userInfo={userInfo}
            onClose={closeAllModals}
            onNext={() => setCurrentDialog(MfaDialogState.MANAGE_TWO_FACTOR_AUTHENTICATION)}
            mfaId={mfaId}
          />
        );
      case MfaDialogState.MANAGE_TWO_FACTOR_AUTHENTICATION:
        return (
          <ManageTwoFactorAuthentication
            userInfo={userInfo}
            onClose={closeAllModals}
            dialogState={dialogState}
          />
        );
      default:
        return null;
    }
  };

  const securityCardItemClass = `flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between ${isDemoAccount ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <Card className="w-full border-none rounded-[8px] shadow-sm">
      <CardHeader className="space-y-0 p-0 hidden">
        <CardTitle />
        <CardDescription />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <h1 className="text-xl text-high-emphasis font-semibold">{t('ACCOUNT_SECURITY')}</h1>
        <Separator orientation="horizontal" />
        <div className="flex flex-col py-2 gap-10">
          {data?.enableMfa && (
            <div className={securityCardItemClass}>
              <div className="flex flex-col gap-1">
                <h1 className="text-sm text-high-emphasis font-bold">
                  {t('TWO_FACTOR_AUTHENTICATION')}
                </h1>
                <p className="text-sm text-medium-emphasis">{t('ENHANCE_YOUR_SECURITY')}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isLoading ? (
                    <Skeleton className="w-[102px] h-8" />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-sm font-bold text-primary hover:text-primary"
                      onClick={() => setCurrentDialog(MfaDialogState.TWO_FACTOR_SETUP)}
                      disabled={isDemoAccount}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {mfaButtonText}
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent className="bg-neutral-700 text-white text-center max-w-[100px]">
                  {getTooltipText()}
                </TooltipContent>
              </Tooltip>
              {renderMfaDialogs()}
            </div>
          )}

          <div className={securityCardItemClass}>
            <div className="flex flex-col gap-1">
              <h1 className="text-sm text-high-emphasis font-bold">{t('CHANGE_PASSWORD')}</h1>
              <p className="text-sm text-medium-emphasis">
                {t('UPDATE_PASSWORD_KEEP_ACCOUNT_SAFE')}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-primary hover:text-primary text-sm font-bold"
              onClick={() => setIsChangePasswordModalOpen(true)}
              disabled={isDemoAccount}
            >
              <Lock className="w-4 h-4" />
              {t('UPDATE_PASSWORD')}
            </Button>
            <ChangePassword
              key={isChangePasswordModalOpen ? 'open' : 'closed'}
              onClose={() => setIsChangePasswordModalOpen(false)}
              open={isChangePasswordModalOpen}
              onOpenChange={setIsChangePasswordModalOpen}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
