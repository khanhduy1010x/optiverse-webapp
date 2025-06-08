export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface VerifyCodeResponse {
  reset_token: string;
}
