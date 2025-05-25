import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface RegistrationForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  email: string;
}
interface editProfileForm {
  phoneNumber: string;
  image: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
}
interface RegistrationState {
  form: RegistrationForm;
  editProfileForm: editProfileForm;
  errors: Partial<RegistrationForm>;
  imageUri: string;
  image: string;
  imageBase64: string;
  isVisible: boolean;
  imageDeleted: boolean;
  alertVisible: boolean;
  alertType: string;
  alertTitle: string;
  alertMessage: string;
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
  editProfileForm: {
    phoneNumber: '',
    image: '',
    firstName: '',
    lastName: '',
    email: '',
    token: '',
  },
  errors: {},
  imageUri: '',
  image: '',
  imageBase64: '',
  isVisible: false,
  imageDeleted: false,
  alertVisible: false,
  alertType: '',
  alertTitle: '',
  alertMessage: '',
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
    setEditProfileForm: (
      state,
      action: PayloadAction<{key: keyof editProfileForm; value: string}>,
    ) => {
      state.editProfileForm[action.payload.key] = action.payload.value;
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
    setAlertVisible: (state, action: PayloadAction<boolean>) => {
      state.alertVisible = action.payload;
    },
    setImageDeleted: (state, action) => {
      state.imageDeleted = action.payload;
    },
    setAlertType: (state, action: PayloadAction<string>) => {
      state.alertType = action.payload;
    },
    setAlertTitle: (state, action: PayloadAction<string>) => {
      state.alertTitle = action.payload;
    },
    setAlertMessage: (state, action: PayloadAction<string>) => {
      state.alertMessage = action.payload;
    },
    resetForm: () => initialState,
  },
});

export const {
  setFormField,
  setEditProfileForm,
  setErrors,
  setImageUri,
  resetForm,
  setImage,
  setImageBase64,
  setIsVisible,
  setImageDeleted,
  setAlertVisible,
  setAlertType,
  setAlertMessage,
  setAlertTitle,
} = registrationSlice.actions;

export const registrationReducer = registrationSlice.reducer;
