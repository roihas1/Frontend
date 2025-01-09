import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/', // Replace with your backend URL
});
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => Promise.reject(error));

axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // Token is expired or invalid
        // Clear any stored token (e.g., from localStorage or context)
        
        
  

        alert("Your session has expired. Please log in again.")
        const username = localStorage.getItem('username')
        window.location.href = '/login';
        axiosInstance.patch(`/auth/logout`,{username})
        localStorage.removeItem('token');
      }
      return Promise.reject(error);
    }
  );
export default axiosInstance;