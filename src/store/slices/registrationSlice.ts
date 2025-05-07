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
    resetForm: () => initialState,
  },
});

export const {setFormField, setErrors, setImageUri, resetForm} =
  registrationSlice.actions;

export default registrationSlice.reducer;
