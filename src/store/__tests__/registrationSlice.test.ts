import  {
  setFormField,
  setErrors,
  setImageUri,
  setImage,
  setImageBase64,
  setIsVisible,
  resetForm,
  registrationReducer
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
  errors: {},
  imageUri: '',
  image: '',
  imageBase64: '',
  isVisible:false,
};

describe('registration slice', () => {
  it('should return the initial state', () => {
    expect(registrationReducer(undefined, {type: '@@INIT'})).toEqual(initialState);
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
    const isVisible=true;
    const newState = registrationReducer(initialState, setIsVisible(true));
    expect(newState.isVisible).toBe(isVisible);
  });

  it('should handle setImage', () => {
    const imagepath = '';
    const newState = registrationReducer(initialState, setImage(imagepath));
    expect(newState.imageUri).toBe(imagepath);
  });

  it('should handle setImageBase64', () => {
    const imagebase64 = '';
    const newState = registrationReducer(initialState, setImageBase64(imagebase64));
    expect(newState.imageUri).toBe(imagebase64);
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
      errors: {email: 'Invalid'},
      imageUri: 'img.jpg',
      image: '',
      imageBase64: '',
      isVisible:false
    };
    const newState = registrationReducer(modifiedState, resetForm());
    expect(newState).toEqual(initialState);
  });
});
