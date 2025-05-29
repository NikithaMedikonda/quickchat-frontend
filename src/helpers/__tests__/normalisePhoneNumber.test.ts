import {normalise} from '../normalisePhoneNumber';

describe('Tetsing normalise function', () => {
  it('should remove spaces, parentheses, and dashes', () => {
    const inputPhoneNumber = '(123) 456-7890';
    const expectedPhoneNumber = '1234567890';
    expect(normalise(inputPhoneNumber)).toBe(expectedPhoneNumber);
  });

  it('should remove leading 0', () => {
    const inputPhoneNumber = '0123456789';
    const expectedPhoneNumber = '123456789';
    expect(normalise(inputPhoneNumber)).toBe(expectedPhoneNumber);
  });

  it('should remove both formatting and leading 0', () => {
    const inputPhoneNumber = '0 (123) 456-7890';
    const expectedPhoneNumber = '1234567890';
    expect(normalise(inputPhoneNumber)).toBe(expectedPhoneNumber);
  });

  it('should return the same number if no formatting or leading 0 is present', () => {
    const inputPhoneNumber = '919876543210';
    const expectedPhoneNumber = '919876543210';
    expect(normalise(inputPhoneNumber)).toBe(expectedPhoneNumber);
  });
});
