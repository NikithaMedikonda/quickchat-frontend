import {render} from '@testing-library/react-native';
import moment from 'moment';
import {TimeStamp} from './TimeStamp';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-05-13T12:00:00').getTime());
});

afterAll(() => {
  jest.useRealTimers();
});

describe('TimeStamp component', () => {
  test(' should display correct time for today', () => {
    const {getByText} = render(
      <TimeStamp messageTime="2025-05-13T10:00:00" isSent={true} />,
    );
    expect(getByText(/10:00 AM/i)).toBeTruthy();
  });

  test('Should display "Yesterday" if the time is more than one day', () => {
    const {getByText} = render(
      <TimeStamp messageTime="2025-05-12T08:00:00" isSent={true} />,
    );
    expect(getByText(/Yesterday/i)).toBeTruthy();
  });

  test('Should display day name within last 7 days', () => {
    const dayName = moment('2025-05-09').format('dddd');
    const {getByText} = render(
      <TimeStamp messageTime="2025-05-09T09:00:00" isSent={true} />,
    );
    expect(getByText(`${dayName}`)).toBeTruthy();
  });

  test('Should display full date, if the timestamps are older than 7 days', () => {
    const {getByText} = render(
      <TimeStamp messageTime="2025-04-30T15:30:00" isSent={true} />,
    );
    expect(getByText('Apr 30, 2025')).toBeTruthy();
  });

  test('Should display only time for today with showFullTime', () => {
    const {getByText} = render(
      <TimeStamp
        messageTime="2025-05-13T09:45:00"
        isSent={true}
        showFullTime
      />,
    );
    expect(getByText('9:45 AM')).toBeTruthy();
  });

  test('Should display "Yesterday, time" when showFullTime is true', () => {
    const {getByText} = render(
      <TimeStamp
        messageTime="2025-05-12T08:00:00"
        isSent={true}
        showFullTime
      />,
    );
    expect(getByText('8:00 AM')).toBeTruthy();
  });

  test('Should display "Day, time" within last 7 days when showFullTime is true', () => {
    const {getByText} = render(
      <TimeStamp
        messageTime="2025-05-09T09:00:00"
        isSent={true}
        showFullTime
      />,
    );
    expect(getByText('9:00 AM')).toBeTruthy();
  });
});
