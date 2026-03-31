import { GRANT_TYPES } from './auth';
import microsoftIcon from '@/assets/images/social_media_ms.svg';
import googleIcon from '@/assets/images/social_media_google.svg';
import githubIcon from '@/assets/images/social_media_github.svg';
import linkedinIcon from '@/assets/images/social_media_in.svg';
import xIcon from '@/assets/images/social_media_x.svg';
import ownSSOIcon from '@/assets/images/social_media_ownsso.svg';

export enum SSO_PROVIDERS {
  google = 'google',
  microsoft = 'microsoft',
  github = 'github',
  linkedin = 'linkedin',
  x = 'x',
  ownsso = 'ownsso',
}

export const SOCIAL_AUTH_PROVIDERS: Record<SSO_PROVIDERS, SocialAuthProvider> = {
  google: {
    value: SSO_PROVIDERS.google,
    label: 'Google',
    description: 'Allow your users to seamlessly log in with their trusted Google Account.',
    icon: 'google-icon',
    imageSrc: googleIcon,
    isAvailable: true,
    isConfigured: false,
    configurations: null,
  },
  microsoft: {
    value: SSO_PROVIDERS.microsoft,
    label: 'Microsoft',
    description: 'Enable your users to securely sign in through their trusted Microsoft Account.',
    icon: 'microsoft-icon',
    imageSrc: microsoftIcon,
    isAvailable: true,
    isConfigured: false,
    configurations: null,
  },
  github: {
    value: SSO_PROVIDERS.github,
    label: 'GitHub',
    description: 'Enable the GitHub login option for your Auth0 applications',
    icon: 'github-icon',
    imageSrc: githubIcon,
    isAvailable: true,
    isConfigured: false,
    configurations: null,
  },
  linkedin: {
    value: SSO_PROVIDERS.linkedin,
    label: 'LinkedIn',
    description:
      'Leverage the largest professional social network to enhance your sign-in experience',
    icon: 'linkedin-icon',
    imageSrc: linkedinIcon,
    isAvailable: true,
    isConfigured: false,
    configurations: null,
  },
  x: {
    value: SSO_PROVIDERS.x,
    label: 'X',
    description: 'Enable the X login option for your Auth0 applications',
    icon: 'x-icon',
    imageSrc: xIcon,
    isAvailable: true,
    isConfigured: false,
    configurations: null,
  },
  ownsso: {
    value: SSO_PROVIDERS.ownsso,
    label: 'Custom SSO',
    description: 'Configure your own SSO provider using OIDC protocols.',
    icon: 'own-sso-icon',
    imageSrc: ownSSOIcon,
    isAvailable: true,
    isConfigured: false,
    configurations: null,
  },
};

export interface IGetSocialLoginEndpointPayload {
  provider: SSO_PROVIDERS;
  audience: string;
  nextUrl?: string;
  sendAsResponse: boolean;
}
export interface IGetSocialLoginEndpointResponse {
  error: unknown;
  isAResponse: boolean;
  providerUrl: string;
}
export interface ISigninBySSOPayload {
  code: string;
  state: string;
}
export interface ISigninBySSOResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export type SocialAuthProvider = {
  value: SSO_PROVIDERS;
  label: string;
  description: string;
  icon: string;
  imageSrc: string;
  isAvailable?: boolean;
  isConfigured: boolean;
  configurations: SsoProvider | null;
  audience?: string | null;
  provider?: SSO_PROVIDERS;
};

export type SsoProvider = {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
  language: string;
  lastUpdatedBy: string;
  organizationIds: string[];
  tags: string[];
  provider: string;
  audience: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  getProfileUrl: string;
  redirectUrl: string;
  scope: string[];
  initialRoles: string[];
  initialPermisssions: string[];
  isDisabled: boolean;
};

export interface ISaveSsoCredentialPayload {
  provider: string;
  audience: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  projectKey: string;
}

export interface ISaveSsoCredentialResponse {
  isSuccess: boolean;
  errors: unknown;
}

export interface IDeleteSsoCredentialPayload {
  itemId: string;
  projectKey: string;
}

export interface IDeleteSsoCredentialResponse {
  isSuccess: boolean;
  errors: unknown;
}

export interface IGetSsoCredentialByIdPayload {
  itemId: string;
  projectKey: string;
}

export interface IGetSsoCredentialsPayload {
  projectKey: string;
}

export type IGetSsoCredentialsResponse = SsoProvider[];

type SSO_INFO = {
  provider: SSO_PROVIDERS;
  audience: string;
};

export type LoginOption = {
  allowedGrantTypes: GRANT_TYPES[];
  ssoInfo: SSO_INFO[];
  oidc?: {
    clientId: string;
    redirectUrl: string;
  };
};
