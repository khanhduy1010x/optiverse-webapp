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
    // var token = localStorage.getItem('authToken');
  const  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODI5ZmY0NmRiMjhiZjg3ZmVmNzM5ZTciLCJlbWFpbCI6Im5ndXllbmtoYW5oZHV5OTIwMDBAZ21haWwuY29tIiwiZnVsbF9uYW1lIjoiTmd1eWVuIEtoYW5oIER1eSIsInNlc3Npb25faWQiOiI2ODMwMjM1ZmVjMmI0Mjc1ZWVhOTAwMzUiLCJpYXQiOjE3NDc5ODUyNDcsImV4cCI6MTc0ODA3MTY0N30.Jec2_JkEnKFUQpe230rRmCPHmzVG-pQvfYLNHSmkJ4k"
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