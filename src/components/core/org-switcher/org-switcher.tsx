import { useState, useMemo } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui-kit/dropdown-menu';
import { Skeleton } from '@/components/ui-kit/skeleton';
import { useGetAccount } from '@/modules/profile/hooks/use-account';
import { switchOrganization } from '@/modules/auth/services/auth.service';
import { useAuthStore } from '@/state/store/auth';
import { useToast } from '@/hooks/use-toast';
import { HttpError } from '@/lib/https';
import { useGetMultiOrgs } from '@/lib/api/hooks/use-multi-orgs';
import { Button } from '@/components/ui-kit/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui-kit/tooltip';

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';

export const OrgSwitcher = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { t } = useTranslation();
  const { setTokens, selectedOrgId } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetAccount();
  const { data: orgsData, isLoading: isLoadingOrgs } = useGetMultiOrgs({
    ProjectKey: projectKey,
    Page: 0,
    PageSize: 10,
  });

  const membershipOrgIds = useMemo(() => {
    return data?.memberships?.map((m) => m.organizationId) ?? [];
  }, [data]);

  const organizations = orgsData?.organizations ?? [];
  const enabledOrganizations = organizations.filter(
    (org) => org.isEnable && membershipOrgIds.includes(org.itemId)
  );

  const selectedOrg = selectedOrgId
    ? enabledOrganizations.find((org) => org.itemId === selectedOrgId)
    : enabledOrganizations[0];

  const currentOrgRoles = useMemo(() => {
    if (!data?.memberships?.length || !selectedOrgId) return [];
    const membership = data.memberships.find((m) => m.organizationId === selectedOrgId);
    return membership?.roles ?? [];
  }, [data, selectedOrgId]);

  const translatedRoles = currentOrgRoles
    .map((role: string) => {
      const roleKey = role.toUpperCase();
      return t(roleKey);
    })
    .join(', ');

  const handleOrgSelect = async (orgId: string) => {
    if (isSwitching || orgId === selectedOrgId) {
      return;
    }

    try {
      setIsSwitching(true);
      setIsDropdownOpen(false);

      const response = await switchOrganization(orgId);

      setTokens({
        accessToken: response.access_token,
        refreshToken: (response.refresh_token || useAuthStore.getState().refreshToken) ?? '',
      });

      await queryClient.invalidateQueries({
        queryKey: ['getAccount'],
      });

      setIsSwitching(false);

      toast({
        title: t('ORGANIZATION_SWITCHED'),

        description: t('SUCCESSFULLY_SWITCHED_ORGANIZATION'),
      });
    } catch (error) {
      setIsSwitching(false);

      let errorTitle = t('FAILED_TO_SWITCH_ORGANIZATION');
      let errorDescription = t('SOMETHING_WENT_WRONG');

      if (error instanceof HttpError) {
        const errorData = error.error;

        if (errorData?.error === 'user_inactive_or_not_verified') {
          errorTitle = t('ACCESS_DENIED');
          errorDescription =
            typeof errorData?.error_description === 'string'
              ? errorData.error_description
              : t('USER_NOT_EXIST_IN_ORGANIZATION');
        } else if (typeof errorData?.error_description === 'string') {
          errorDescription = errorData.error_description;
        } else if (typeof errorData?.error === 'string') {
          errorDescription = errorData.error;
        }
      }

      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorDescription,
      });
    }
  };

  const isComponentLoading = isLoading || isLoadingOrgs || isSwitching;

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto py-1.5 px-3 gap-2.5 focus-visible:ring-0"
          disabled={isComponentLoading}
        >
          {isComponentLoading ? (
            <>
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <div className="hidden sm:flex flex-col items-start gap-0.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 text-medium-emphasis flex-shrink-0" />

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="hidden sm:flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-high-emphasis max-w-[120px] md:max-w-[160px] lg:max-w-[200px] truncate block leading-[1.1]">
                        {selectedOrg?.name ?? '_'}
                      </span>
                      <span className="text-[10px] text-low-emphasis capitalize block leading-[1.1] mt-1">
                        {translatedRoles || 'No role'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  {selectedOrg?.name && selectedOrg.name.length > 20 && (
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs font-medium">{selectedOrg.name}</p>
                      {translatedRoles && (
                        <p className="text-[10px] text-low-emphasis capitalize mt-0.5">
                          {translatedRoles}
                        </p>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          <ChevronDown className="h-3.5 w-3.5 text-medium-emphasis opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align="end" sideOffset={8}>
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-medium-emphasis">{t('SWITCH_ORGANIZATION')}</p>
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
          {enabledOrganizations.length > 0 ? (
            enabledOrganizations.map((org) => {
              const membership = data?.memberships?.find((m) => m.organizationId === org.itemId);
              const orgRoles = membership?.roles ?? [];
              const translatedOrgRoles = orgRoles
                .map((role: string) => t(role.toUpperCase()))
                .join(', ');

              const isSelected = org.itemId === selectedOrgId;

              return (
                <DropdownMenuItem
                  key={org.itemId}
                  onClick={() => handleOrgSelect(org.itemId)}
                  className="flex flex-col items-start gap-1 py-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    {isSelected ? (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span
                      className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-high-emphasis'}`}
                    >
                      {org.name}
                    </span>
                  </div>
                  {translatedOrgRoles && (
                    <span className="text-[10px] text-low-emphasis capitalize ml-6 truncate w-full">
                      {translatedOrgRoles}
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-sm text-medium-emphasis">{t('NO_ORGANIZATIONS_FOUND')}</span>
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
