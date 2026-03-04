// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ---- Request Interceptor: Attach JWT ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: Token Refresh ----
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---- Auth API ----
export const authAPI = {
  sendOTP: (email, purpose) => api.post('/auth/send-otp', { email, purpose }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  register: (data) => api.post('/auth/register', data),
  loginWithOTP: (email) => api.post('/auth/login', { email }),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// ---- Profile API ----
export const profileAPI = {
  getMyProfile: () => api.get('/profile'),
  saveStep1: (data) => api.put('/profile/step/1', data),
  saveStep2: (data) => api.put('/profile/step/2', data),
  saveStep3: (data) => api.put('/profile/step/3', data),
  saveStep4: (data) => api.put('/profile/step/4', data),
  completeProfile: () => api.post('/profile/complete'),
  getPublicProfile: (userId) => api.get(`/profile/${userId}`),
};

// ---- Search API ----
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getFilters: () => api.get('/search/filters'),
};

// ---- Document API ----
export const documentAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDocuments: () => api.get('/documents'),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

// ---- Admin API ----
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId, status, reason) =>
    api.put(`/admin/users/${userId}/status`, { status, reason }),
  verifyDocument: (documentId, status, rejectionReason) =>
    api.put(`/admin/documents/${documentId}/verify`, { status, rejectionReason }),
};

export default api;
