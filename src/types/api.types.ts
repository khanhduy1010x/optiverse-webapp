import { HttpStatus } from '../types/http-status.enum';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  httpStatus?: HttpStatus;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface ApiResponseWrapper<T> {
  data: T;
}
