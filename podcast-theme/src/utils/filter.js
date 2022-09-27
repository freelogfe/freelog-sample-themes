import { formatDate, relativeTime as myRelativeTime, getSignCount, secondsToHMS as mySecondsToHMS } from "./common";

export const date = (time, format) => {
  return formatDate(time, format);
};

export const relativeTime = (time) => {
  return myRelativeTime(time);
};

export const signCount = (count) => {
  return getSignCount(count);
};

export const secondsToHMS = (time) => {
  return mySecondsToHMS(time);
};
