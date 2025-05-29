import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:81/productivity/', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // var token = localStorage.setItem('authToken');
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODM3MmU0NzM0ZmI5YTg4YzY4M2Y0NjAiLCJlbWFpbCI6Im5ndXllbmtoYW5oZHV5OTIwMEBnbWFpbC5jb20iLCJmdWxsX25hbWUiOiJOZ3V5ZW4gS2hhbmggRHV5Iiwic2Vzc2lvbl9pZCI6IjY4MzcyZTc0MzRmYjlhODhjNjgzZjQ2NyIsImlhdCI6MTc0ODQ0NjgzNiwiZXhwIjoxNzQ4NTMzMjM2fQ.IVH2jn1a79HSSVaMwsT_B7Ff5doq5yVXHcGkLptq2DY"
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;