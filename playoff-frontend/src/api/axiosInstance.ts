import axios from 'axios';
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

// axiosInstance.interceptors.response.use(
//     response => response,
//     error => {
//       if (error.response && error.response.status === 401) {
//         // Token is expired or invalid
//         // Clear any stored token (e.g., from localStorage or context)
//         localStorage.removeItem('token');
//         console.log(error.response);
//         // Redirect to login page
//         window.location.href = '/login';
//       }
//       return Promise.reject(error);
//     }
//   );
export default axiosInstance;