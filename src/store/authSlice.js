// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

// ---- Async Thunks ----
export const sendOTP = createAsyncThunk('auth/sendOTP', async ({ email, purpose }, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.sendOTP(email, purpose);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.verifyOTP(email, otp);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginWithOTP = createAsyncThunk('auth/loginWithOTP', async (email, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.loginWithOTP(email);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const googleAuth = createAsyncThunk('auth/googleAuth', async (idToken, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.googleAuth(idToken);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authAPI.logout();
  } catch {
    // Continue with local logout even if API fails
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getMe();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

// ---- Helper: load user from localStorage ----
const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    return token && user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// ---- Slice ----
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUserFromStorage(),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    otpSent: false,
    otpVerified: false,
    error: null,
    welcomeMessage: null,
    redirectTo: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearOTPState: (state) => { state.otpSent = false; state.otpVerified = false; },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendOTP.fulfilled, (state) => { state.loading = false; state.otpSent = true; })
      .addCase(sendOTP.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

    // Verify OTP
      .addCase(verifyOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOTP.fulfilled, (state) => { state.loading = false; state.otpVerified = true; })
      .addCase(verifyOTP.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

    // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.data.user;
        state.isAuthenticated = true;
        state.welcomeMessage = payload.message;
        state.redirectTo = payload.data.redirectTo;
      })
      .addCase(register.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

    // Login with OTP
      .addCase(loginWithOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithOTP.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.data.user;
        state.isAuthenticated = true;
        state.welcomeMessage = payload.message;
        state.redirectTo = payload.data.redirectTo;
      })
      .addCase(loginWithOTP.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

    // Google Auth
      .addCase(googleAuth.fulfilled, (state, { payload }) => {
        state.user = payload.data.user;
        state.isAuthenticated = true;
        state.welcomeMessage = payload.message;
        state.redirectTo = payload.data.redirectTo;
      })
      .addCase(googleAuth.rejected, (state, { payload }) => { state.error = payload; })

    // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.welcomeMessage = null;
        state.redirectTo = null;
      })

    // Get Me
      .addCase(getMe.fulfilled, (state, { payload }) => {
        state.user = payload.data.user;
        localStorage.setItem('user', JSON.stringify(payload.data.user));
      });
  },
});

export const { clearError, clearOTPState, updateUser } = authSlice.actions;
export default authSlice.reducer;
