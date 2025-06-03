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
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODM4NDgxZWY2MTkyZTllOGU4MzRhYjUiLCJlbWFpbCI6Im5ndXllbmdpYWh1eUBnbWFpbC5jb20iLCJmdWxsX25hbWUiOiJOZ3V5ZW4gS2hhbmggRHV5Iiwic2Vzc2lvbl9pZCI6IjY4M2VkNzE3NWJmMjAzMmZhNmUyMmVhYyIsImlhdCI6MTc0ODk0ODc1OSwiZXhwIjoxNzQ5MDM1MTU5fQ.xoeNBas3TkxIm0R5lESgP0HvwNYgBN70ViDr_B790qQ"
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