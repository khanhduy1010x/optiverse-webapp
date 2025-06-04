import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({

  baseURL: 'http://localhost:81', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {

    // const token = localStorage.getItem('authToken');
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODI5YTA3MDM5M2I1ODE3OTY4NjA2OTQiLCJlbWFpbCI6Im5ndXllbmtoYW5oZHV5QGdtYWlsLmNvbSIsImZ1bGxfbmFtZSI6IkxvaVRyYW4iLCJzZXNzaW9uX2lkIjoiNjg0MDA3OTg5YTg1MDI3OTkzZDc4ODNlIiwiaWF0IjoxNzQ5MDI2NzEyLCJleHAiOjE3NDkxMTMxMTJ9.IJD3OKkOBl5FybiDpKDSedemfQVsy-dD7pLQdA8WFVI"
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