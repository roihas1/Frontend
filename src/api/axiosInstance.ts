import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
const axiosInstance = axios.create({
  baseURL: 'http://playoff-backend:3000/', // Replace with your backend URL
});
axiosInstance.interceptors.request.use(config => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => Promise.reject(error));

axiosInstance.interceptors.response.use(
    response => response,
    error => {
      console.log(error)
      if (error.response.data.error !== "Invalid credentials" && error.response && error.response.status === 401) {
        // Token is expired or invalid
        // Clear any stored token (e.g., from localStorage or context)
        
        // alert("Your session has expired. Please log in again.")
        const username = localStorage.getItem('username')
        window.location.href = '/login';
        axiosInstance.patch(`/auth/logout`,{username})
        localStorage.removeItem('token');
      }
      return Promise.reject(error);
    }
  );
export default axiosInstance;