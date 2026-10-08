import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gyaan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Parse standardized ApiResponse or handle ApiError
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // If 401 Unauthorized, handle token removal if expired
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // User can be logged out gracefully
    }

    return Promise.reject(new Error(customMessage));
  }
);

export default api;
