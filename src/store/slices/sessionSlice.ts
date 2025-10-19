import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setString, getString, deleteKey } from '../../storage/mmkv';

export type SessionState = {
  token: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
  isSuperadmin: boolean;
};

const initialState: SessionState = {
  token: null,
  user: null,
  loading: false,
  error: null,
  isSuperadmin: false,
};

export const loginUser = createAsyncThunk(
  'session/loginUser',
  async (
    data: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post('/auth/login', {
        username: data.username,
        password: data.password,
      });

      console.log('Login response:', res.data);

      const token: string | undefined = res.data?.accessToken;
      const user = res.data ?? null;

      if (!token) {
        return rejectWithValue('No token returned from server');
      }

      //  حفظ بيانات الدخول
      setString('token', token);
      setString('username', data.username);

      const isSuperadmin =
        data.username === 'michaelw' || data.username === 'michaelwpass';
      setString('isSuper', isSuperadmin ? '1' : '0');

      return { token, user, username: data.username, isSuperadmin };
    } catch (err: any) {
      const msg = err?.response?.data || err.message || 'Login failed';
      console.log('Login error:', msg);
      return rejectWithValue(msg);
    }
  }
);

/** ♻️ استرجاع السيشن من MMKV */
export const restoreSession = createAsyncThunk(
  'session/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = getString('token');
      const username = getString('username');
      const isSuper = getString('isSuper') === '1';

      if (!token) return rejectWithValue('No token');

      try {
        await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // لو التوكن مش صالح، نحذفه بس، ونسيب البصمة
        deleteKey('token');
        deleteKey('isSuper');
        return rejectWithValue('Invalid token');
      }

      return { token, username, isSuper };
    } catch (e) {
      return rejectWithValue('restore_failed');
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    /** 🚪 تسجيل خروج بدون مسح بيانات البصمة */
    logout: (state) => {
      console.log('🚪 Logging out but keeping biometric data');

      state.token = null;
      state.user = null;
      state.isSuperadmin = false;
        state.error = null;

      // نحذف فقط التوكن والسيشن
      deleteKey('token');
      deleteKey('isSuper');

    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isSuperadmin = action.payload.isSuperadmin ?? false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreSession.fulfilled, (state, action: any) => {
        state.token = action.payload.token;
        state.user = action.payload.user ?? null;
        state.isSuperadmin = action.payload.isSuper ?? false;
        state.error = null;
      });
  },
});

export const { logout } = sessionSlice.actions;
export default sessionSlice.reducer;
