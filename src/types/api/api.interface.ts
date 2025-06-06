import { HttpStatus } from '../http-status.enum';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  httpStatus?: HttpStatus;
}
export interface ApiResponseWrapper<T> {
  data: T;
}
