import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/state/store/auth';
import { decodeJWT } from '@/lib/utils/decode-jwt-utils';
import DummyProfile from '@/assets/images/dummy_profile.png';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui-kit/card';
import { Button } from '@/components/ui-kit/button';
import { Dialog } from '@/components/ui-kit/dialog';
import { Separator } from '@/components/ui-kit/separator';
import { Skeleton } from '@/components/ui-kit/skeleton';
import { EditProfile } from '../modals/edit-profile/edit-profile';

interface ProfileCardProps {
  userInfo: any;
  isLoading: boolean;
  formatDate: (dateString: string | undefined) => string;
  onEditClick: () => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditProfileClose: () => void;
}

export const ProfileCard = ({
  userInfo,
  isLoading,
  formatDate,
  onEditClick,
  isEditProfileModalOpen,
  setIsEditProfileModalOpen,
  handleEditProfileClose,
}: Readonly<ProfileCardProps>) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const profileImageSrc = useMemo(() => {
    if (!userInfo?.profileImageUrl || userInfo.profileImageUrl === '') {
      return DummyProfile;
    }
    // Add cache busting parameter to force reload when image changes
    const timestamp = new Date().getTime();
    return `${userInfo.profileImageUrl}?t=${timestamp}`;
  }, [userInfo?.profileImageUrl]);

  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [profileImageSrc]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(true);
    setImageError(true);
  };

  const { accessToken } = useAuthStore();

  const currentOrgRoles = useMemo(() => {
    if (!userInfo?.memberships?.length || !accessToken) return userInfo?.roles ?? [];
    const decoded = decodeJWT(accessToken);
    const currentOrgId = decoded?.org_id;
    if (!currentOrgId) return userInfo?.roles ?? [];
    const membership = userInfo.memberships.find((m: any) => m.organizationId === currentOrgId);
    return membership?.roles ?? userInfo?.roles ?? [];
  }, [userInfo, accessToken]);

  const translatedRoles = currentOrgRoles
    ?.map((role: any) => {
      const roleKey = role.toUpperCase();
      return t(roleKey);
    })
    .join(', ');

  return (
    <Card className="w-full border-none rounded-[8px] shadow-sm">
      <CardHeader className="p-0 hidden">
        <CardTitle />
        <CardDescription />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="relative w-16 h-16 rounded-full border overflow-hidden border-white shadow-sm">
              {isLoading ? (
                <Skeleton className="w-16 h-16 rounded-full" />
              ) : (
                <>
                  {!imageLoaded && !imageError && (
                    <Skeleton className="w-16 h-16 rounded-full absolute inset-0 z-10" />
                  )}
                  <img
                    key={profileImageSrc}
                    src={imageError ? DummyProfile : profileImageSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </>
              )}
            </div>
            <div className="flex flex-col gap-1 ml-3 sm:ml-9">
              {isLoading ? (
                <>
                  <Skeleton className="w-40 h-5" />
                  <Skeleton className="w-48 h-4 mt-1" />
                </>
              ) : (
                <>
                  <h1 className="text-xl text-high-emphasis font-semibold">
                    {userInfo?.firstName} {userInfo?.lastName}
                  </h1>
                  <p className="text-sm text-medium-emphasis">{userInfo?.email}</p>
                </>
              )}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onEditClick}>
            <Pencil className="w-3 h-3 text-primary" />
            <span className="text-primary text-sm font-bold sr-only sm:not-sr-only sm:whitespace-nowrap">
              {t('EDIT')}
            </span>
          </Button>
          <Dialog open={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen}>
            {userInfo && <EditProfile userInfo={userInfo} onClose={handleEditProfileClose} />}
          </Dialog>
        </div>
        <Separator orientation="horizontal" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map(() => (
              <div key={uuidv4()}>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-36" />
              </div>
            ))
          ) : (
            <>
              <div>
                <p className="text-medium-emphasis text-xs font-normal">{t('ROLES')}</p>
                <p className="text-high-emphasis text-sm">{translatedRoles ?? '-'}</p>
              </div>
              <div>
                <p className="text-medium-emphasis text-xs font-normal">{t('MOBILE_NO')}</p>
                <p className="text-high-emphasis text-sm">{userInfo?.phoneNumber ?? '-'}</p>
              </div>
              <div>
                <p className="text-medium-emphasis text-xs font-normal">{t('JOINED_ON')}</p>
                <p className="text-high-emphasis text-sm">{formatDate(userInfo?.createdDate)}</p>
              </div>
              <div>
                <p className="text-medium-emphasis text-xs font-normal">{t('LAST_LOGGED_IN')}</p>
                <p className="text-high-emphasis text-sm">
                  {formatDate(userInfo?.lastLoggedInTime)}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
