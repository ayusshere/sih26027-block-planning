import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token expiry
api.interceptors.response.use(
  (response) => {
    // Backend wraps responses in { success, message, data, timestamp }
    // Axios gives us response.data = the wrapped object
    // We unwrap to just the data payload for convenience
    if (response.data && response.data.success === false) {
      console.error('[API Error]', response.data.message);
      return Promise.reject(new Error(response.data.message));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('[API Error]', message);
    
    return Promise.reject(error);
  }
);

export default api;