import {
  formatDate,
  relativeTime as myRelativeTime,
  getSignCount,
  duration as myDuration,
  secondsToHMS as mySecondsToHMS,
} from "./common";

export const date = (time, format) => {
  return formatDate(time, format);
};

export const relativeTime = (time) => {
  return myRelativeTime(time);
};

export const signCount = (count) => {
  return getSignCount(count);
};

export const duration = (time) => {
  return myDuration(time);
};

export const secondsToHMS = (time) => {
  return mySecondsToHMS(time);
};
