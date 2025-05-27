import {
  setFormField,
  setErrors,
  setImageUri,
  setImage,
  setImageBase64,
  setIsVisible,
  resetForm,
  registrationReducer,
  setImageDeleted,
  setAlertVisible,
  setAlertMessage,
  setAlertTitle,
  setAlertType,
  setEditProfileForm,
  setReceivePhoneNumber,
} from '../slices/registrationSlice';

const initialState = {
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
  receivePhoneNumber:'',
};

describe('registration slice', () => {
  it('should return the initial state', () => {
    expect(registrationReducer(undefined, {type: '@@INIT'})).toEqual(
      initialState,
    );
  });

  it('should handle setFormField', () => {
    let newState = registrationReducer(
      initialState,
      setFormField({key: 'firstName', value: 'TestName'}),
    );
    newState = registrationReducer(
      newState,
      setFormField({key: 'lastName', value: 'TestName'}),
    );

    expect(newState.form.firstName).toBe('TestName');
    expect(newState.form.lastName).toBe('TestName');
    expect(newState).toMatchObject({
      ...initialState,
      form: {
        ...initialState.form,
        firstName: 'TestName',
        lastName: 'TestName',
      },
    });
  });

  it('should handle setEditProfileForm', () => {
    let newState = registrationReducer(
      initialState,
      setEditProfileForm({key: 'firstName', value: 'TestName'}),
    );
    newState = registrationReducer(
      newState,
      setEditProfileForm({key: 'lastName', value: 'TestName'}),
    );

    expect(newState.editProfileForm.firstName).toBe('TestName');
    expect(newState.editProfileForm.lastName).toBe('TestName');
    expect(newState).toMatchObject({
      ...initialState,
      editProfileForm: {
        ...initialState.editProfileForm,
        firstName: 'TestName',
        lastName: 'TestName',
      },
    });
  });

  it('should handle setErrors', () => {
    const errors = {email: 'Invalid email', password: 'Too short'};
    const newState = registrationReducer(initialState, setErrors(errors));
    expect(newState.errors).toEqual(errors);
  });

  it('should handle setImageUri', () => {
    const uri = 'http://test.com/image.jpg';
    const newState = registrationReducer(initialState, setImageUri(uri));
    expect(newState.imageUri).toBe(uri);
  });
  it('should handle isVisible', () => {
    const isVisible = true;
    const newState = registrationReducer(initialState, setIsVisible(true));
    expect(newState.isVisible).toBe(isVisible);
  });
  it('should handle isAlertVisible', () => {
    const alertVisible = true;
    const newState = registrationReducer(initialState, setAlertVisible(true));
    expect(newState.alertVisible).toBe(alertVisible);
  });

  it('should handle setImage', () => {
    const imagepath = '';
    const newState = registrationReducer(initialState, setImage(imagepath));
    expect(newState.imageUri).toBe(imagepath);
  });
    it('should handle receiver phone number', () => {
    const receivePhoneNumber = '';
    const newState = registrationReducer(initialState, setReceivePhoneNumber(receivePhoneNumber));
    expect(newState.receivePhoneNumber).toBe(receivePhoneNumber);
  });
  it('should handle alertType', () => {
    const alertType = 'hello';
    const newState = registrationReducer(initialState, setAlertType(alertType));
    expect(newState.alertType).toBe(alertType);
  });
  it('should handle alertTitle', () => {
    const alertTitle = 'hello';
    const newState = registrationReducer(
      initialState,
      setAlertTitle(alertTitle),
    );
    expect(newState.alertTitle).toBe(alertTitle);
  });
  it('should handle alertMessage', () => {
    const alertMessage = 'hello';
    const newState = registrationReducer(
      initialState,
      setAlertMessage(alertMessage),
    );
    expect(newState.alertMessage).toBe(alertMessage);
  });

  it('should handle setImageBase64', () => {
    const imagebase64 = '';
    const newState = registrationReducer(
      initialState,
      setImageBase64(imagebase64),
    );
    expect(newState.imageUri).toBe(imagebase64);
  });

  it('should handle deleted image', () => {
    const imagebase64 = '';
    const newState = registrationReducer(
      initialState,
      setImageDeleted(imagebase64),
    );
    expect(newState.imageDeleted).toBe(imagebase64);
  });

  it('should handle resetForm', () => {
    const modifiedState = {
      form: {
        firstName: 'firstName',
        lastName: 'lastName',
        phoneNumber: '1234567890',
        password: 'secret',
        confirmPassword: 'secret',
        email: 'test@example.com',
      },
      editProfileForm: {
        phoneNumber: '',
        image: '',
        firstName: '',
        lastName: '',
        email: '',
        token: '',
      },
      errors: {email: 'Invalid'},
      imageUri: 'img.jpg',
      image: '',
      imageBase64: '',
      isVisible: false,
      imageDeleted: false,
      alertVisible: false,
      alertType: '',
      alertTitle: '',
      alertMessage: '',
      receivePhoneNumber:'',
    };
    const newState = registrationReducer(modifiedState, resetForm());
    expect(newState).toEqual(initialState);
  });
});
