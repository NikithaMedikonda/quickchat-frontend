import {loginReducer, updateProfilePicture} from '../slices/loginSlice';
import {
  setLoginField,
  setLoginErrors,
  setLoginSuccess,
  logout,
  resetLoginForm,
} from '../slices/loginSlice';

const initialState = {
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

describe('login slice', () => {
  it('should return the initial state', () => {
    expect(loginReducer(undefined, {type: '@@INIT'})).toEqual(initialState);
  });

  it('should handle setLoginField', () => {
    let newState = loginReducer(
      initialState,
      setLoginField({key: 'phoneNumber', value: '1234567890'}),
    );
    newState = loginReducer(
      newState,
      setLoginField({key: 'password', value: 'Test@1234'}),
    );

    expect(newState.form.phoneNumber).toBe('1234567890');
    expect(newState.form.password).toBe('Test@1234');
    expect(newState).toMatchObject({
      ...initialState,
      form: {
        ...initialState.form,
        phoneNumber: '1234567890',
        password: 'Test@1234',
      },
    });
  });

  it('should handle setLoginErrors', () => {
    const errors = {phoneNumber: 'Wrong number', password: 'Too short'};
    const newState = loginReducer(initialState, setLoginErrors(errors));
    expect(newState.errors).toEqual(errors);
  });

  it('should handle setLoginSuccess', () => {
    const newState = loginReducer(
      initialState,
      setLoginSuccess({
        accessToken: 'accesToken1',
        refreshToken: 'refreshToken1',
        user: {
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '1234567890',
          email: 'example@gmail.com',
          profilePicture: '',
          publicKey:'',
          privateKey:'',
        },
      }),
    );
    expect(newState.isLoggedIn).toEqual(true);
    expect(newState.accessToken).toEqual('accesToken1');
    expect(newState.refreshToken).toEqual('refreshToken1');
  });

  it('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      isLoggedIn: true,
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      form: {phoneNumber: '9999999999', password: 'pass'},
      errors: {phoneNumber: 'error'},
    };
    const newState = loginReducer(loggedInState, logout());
    expect(newState).toEqual(initialState);
  });

  it('should handle resetForm', () => {
    const modifiedState = {
      ...initialState,
      form: {
        phoneNumber: '1234567890',
        password: 'Test@1234',
      },
    };
    const newState = loginReducer(modifiedState, resetLoginForm());
    expect(newState.form).toEqual(initialState.form);
  });

  it('should handle updateProfilePicture when user exists', () => {
    const modifiedState = {
      ...initialState,
      user: {
        id: 'uuid',
        firstName: 'test',
        lastName: 'user',
        phoneNumber: '1234567890',
        email: 'test@example.com',
        profilePicture: 'old-picture.png',
        publicKey:'',
        privateKey:'',
      },
    };

    const newState = loginReducer(
      modifiedState,
      updateProfilePicture('new.png'),
    );
    expect(newState.user?.profilePicture).toBe('new.png');
  });

  it('should not update profilePicture if user is null', () => {
    const state = loginReducer(initialState, updateProfilePicture('new.png'));
    expect(state.user).toBeNull();
  });
});
