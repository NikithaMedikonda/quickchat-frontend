import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface LoginForm {
  phoneNumber: string;
  password: string;
}

interface LoginState {
  form: LoginForm;
  errors: Partial<LoginForm>;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
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
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.isLoggedIn = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
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
  },
});

export const {setLoginField, setLoginErrors, setLoginSuccess, logout, resetLoginForm} =
  loginSlice.actions;
export const loginReducer = loginSlice.reducer