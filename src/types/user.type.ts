//TODO FE: Changes of roles structure only for the dev environment
export type Membership = {
  organizationId: string;
  roles: string[];
};

export type User = {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  language: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber: string | null;
  roles: string[];
  permissions: string[];
  active: boolean;
  isVarified: boolean;
  profileImageUrl: string;
  lastLoggedInTime: string;
  isMfaVerified: boolean;
  mfaEnabled: boolean;
  userMfaType: number;
  userCreationType: number;
  lastLoggedInDeviceInfo: string;
  logInCount: number;
  memberships?: Membership[];
};
