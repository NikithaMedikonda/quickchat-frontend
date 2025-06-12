import moment from 'moment';
import { AllMessages } from '../types/messsage.types';

export const GroupMessagesByDate = (messages: AllMessages[]) => {
  return messages.reduce((groups: Record<string, AllMessages[]>, message) => {
    const date = moment(message.timestamp);
    let label = '';

    if (date.isSame(moment(), 'day')) {
      label = 'Today';
    } else if (date.isSame(moment().subtract(1, 'days'), 'day')) {
      label = 'Yesterday';
    } else if (date.isAfter(moment().subtract(7, 'days'))) {
      label = date.format('dddd');
    } else {
      label = date.format('MMM D, YYYY');
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(message);

    return groups;
  }, {});
};
