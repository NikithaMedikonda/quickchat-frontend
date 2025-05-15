import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UUIDTypes} from 'uuid';

interface LoginForm {
  phoneNumber: string;
  password: string;
}

interface User {
  id?: UUIDTypes;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profilePicture: string;
}

interface LoginState {
  form: LoginForm;
  errors: Partial<LoginForm>;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

const initialState: LoginState = {
  form: {
    phoneNumber: '',
    password: '',
  },
  errors: {},
  isLoggedIn: false,
  accessToken: null,
  refreshToken: null,
  user: null,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginField: (
      state,
      action: PayloadAction<{key: keyof LoginForm; value: string}>,
    ) => {
      state.form[action.payload.key] = action.payload.value;
    },
    setLoginErrors: (state, action: PayloadAction<Partial<LoginForm>>) => {
      state.errors = action.payload;
    },
    setLoginSuccess: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>,
    ) => {
      state.isLoggedIn = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    logout: state => {
      state.isLoggedIn = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.form = {phoneNumber: '', password: ''};
      state.errors = {};
    },
    resetLoginForm: state => {
      state.form = {...initialState.form};
    },
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePicture = action.payload;
      }
    },
  },
});

export const {
  setLoginField,
  setLoginErrors,
  setLoginSuccess,
  logout,
  resetLoginForm,
  updateProfilePicture,
} = loginSlice.actions;
export const loginReducer = loginSlice.reducer;
