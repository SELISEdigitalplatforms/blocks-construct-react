//TODO FE: only for the dev environment
import { Membership } from '@/types/user.type';

export interface IamData {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  lastLoggedInTime: string;
  language: string;
  salutation: string;
  firstName: string;
  lastName: string | null;
  email: string;
  userName: string;
  phoneNumber: string | null;
  roles: string[];
  permissions: string[];
  active: boolean;
  isVarified: boolean;
  profileImageUrl: string | null;
  mfaEnabled: boolean;
  isMfaVerified: boolean;
  userMfaType: number;
  userCreationType: number;
  lastLoggedInDeviceInfo: string;
  logInCount: number;
  memberships?: Membership[];
}

export interface UserFilter {
  email?: string;
  name?: string;
}

export interface GetUsersPayload {
  page: number;
  pageSize: number;
  filter?: UserFilter;
}
