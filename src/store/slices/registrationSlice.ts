import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface RegistrationForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  email: string;
}

interface RegistrationState {
  form: RegistrationForm;
  errors: Partial<RegistrationForm>;
  imageUri: string;
  image: string;
  imageBase64: string;
  isVisible: boolean;
}

const initialState: RegistrationState = {
  form: {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
  },
  errors: {},
  imageUri: '',
  image: '',
  imageBase64: '',
  isVisible: false,
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setFormField: (
      state,
      action: PayloadAction<{key: keyof RegistrationForm; value: string}>,
    ) => {
      state.form[action.payload.key] = action.payload.value;
    },
    setErrors: (state, action: PayloadAction<Partial<RegistrationForm>>) => {
      state.errors = action.payload;
    },
    setImageUri: (state, action: PayloadAction<string>) => {
      state.imageUri = action.payload;
    },
    setImage: (state, action: PayloadAction<string>) => {
      state.image = action.payload;
    },
    setImageBase64: (state, action: PayloadAction<string>) => {
      state.imageBase64 = action.payload;
    },
    setIsVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
    resetForm: () => initialState,
  },
});

export const {
  setFormField,
  setErrors,
  setImageUri,
  resetForm,
  setImage,
  setImageBase64,
  setIsVisible,
} = registrationSlice.actions;

export const registrationReducer = registrationSlice.reducer;
