export interface SigninEmailPayload {
  username: string;
  password: string;
  captchaCode?: string;
}

export interface SigninEmailTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface SigninEmailMfaResponse {
  enable_mfa: boolean;
  message: string;
  mfaType: number;
  mfaId: string;
}

export interface ActivationCodeExpirationResponse {
  errors: unknown | null;
  isSuccess: boolean;
  userId: string;
}

export interface SigninEmailResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  enable_mfa?: boolean;
  message?: string;
  mfaType?: number;
  mfaId?: string;
}

export interface ForgotPasswordPayload {
  email: string;
  captchaCode?: string;
  projectKey: string;
}

export interface ForgotPasswordResponse {
  errors: unknown;
  isSuccess: boolean;
}

export interface AccountActivationPayload {
  firstname: string;
  lastname: string;
  password: string;
  code: string;
  captchaCode: string;
  projectKey: string;
}

export interface ISignupByEmailPayload {
  email: string;
  captchaCode: string;
}
export interface ISignupByEmailResponse {
  itemId: string | null;
  errors: {
    already_signup: string;
  } | null;
  isSuccess: boolean;
}

export interface IGetSignUpSettingResponse {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
  language: string;
  lastUpdatedBy: string;
  organizationIds: string[];
  tags: string[];
  isEmailPasswordSignUpEnabled: boolean;
  isSSoSignUpEnabled: boolean;
}

export interface ISignupByEmailErrorResponse {
  errors?: {
    already_signup: string;
  } | null;
  isSuccess?: boolean;
  itemId?: string | null;
}
