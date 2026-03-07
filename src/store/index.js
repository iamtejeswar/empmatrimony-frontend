import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Load state from localStorage
const loadState = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (!token || !user) return undefined;
    return {
      auth: {
        isAuthenticated: true,
        accessToken: token,
        refreshToken: localStorage.getItem('refreshToken'),
        user: JSON.parse(user),
        loading: false,
        error: null,
      }
    };
  } catch {
    return undefined;
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(),
});

export default store;
