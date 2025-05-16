import React from 'react';
import {render} from '@testing-library/react-native';
import {TimeStamp} from './TimeStamp';
import moment from 'moment';


beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-05-13T12:00:00').getTime());
});

afterAll(() => {
  jest.useRealTimers();
});

describe('TimeStamp component', () => {
  test(' should display correct time for today', () => {
    const {getByText} = render(<TimeStamp messageTime="2025-05-13T10:00:00" />);
    expect(getByText(/10:00 am/i)).toBeTruthy();
  });

  test('Should display "Yesterday" if the time is more than one day', () => {
    const {getByText} = render(<TimeStamp messageTime="2025-05-12T08:00:00" />);
    expect(getByText('Yesterday')).toBeTruthy();
  });

  test('Should display day name within last 7 days', () => {
    const dayName = moment('2025-05-09').format('dddd'); // Friday
    const {getByText} = render(<TimeStamp messageTime="2025-05-09T09:00:00" />);
    expect(getByText(dayName)).toBeTruthy();
  });

  test('Should display full date, if the timestamps are older than 7 days', () => {
    const {getByText} = render(<TimeStamp messageTime="2025-04-30T15:30:00" />);
    expect(getByText('Apr 30, 2025')).toBeTruthy();
  });

  test(' Should display "---" for null or invalid timestamp', () => {
    const {getByText} = render(<TimeStamp messageTime={null} />);
    expect(getByText('---')).toBeTruthy();
  });
});
