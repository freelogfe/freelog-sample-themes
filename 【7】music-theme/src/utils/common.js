/**
 * 格式化日期
 * @param time 时间戳、字符串日期等等
 * @param format 自定义输出结果格式（YYYY:年，MM:月，DD:日，hh:时，mm:分，ss:秒）
 */
export const formatDate = (date, format = "YYYY-MM-DD hh:mm:ss") => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error("Invalid Date:", date);
    return "";
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("hh", hour)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * 相对时间
 * @param time 时间戳、字符串日期等等
 */
export const relativeTime = time => {
  if (!time) return;

  const timeStamp = new Date(time).getTime();
  const now = new Date();
  const current = now.getTime();
  const timeDifference = current - timeStamp;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const today = new Date(`${currentYear}-${currentMonth}-${currentDay}`).getTime();
  const MINUTE = 60 * 1000;
  const YESTERDAY = today - 24 * 60 * MINUTE;
  const SIX_DAYS_AGO = today - 6 * 24 * 60 * MINUTE;
  let result = "";

  if (timeDifference < MINUTE) {
    result = "刚刚";
  } else if (timeDifference < 60 * MINUTE) {
    const minutes = Math.floor(timeDifference / MINUTE);
    result = `${minutes}分钟前`;
  } else if (timeStamp >= today) {
    const hours = Math.floor(timeDifference / (60 * MINUTE));
    result = `${hours}小时前`;
  } else if (timeStamp >= YESTERDAY) {
    const hoursMinutes = formatDate(time, "hh:mm");
    result = `昨天 ${hoursMinutes}`;
  } else if (timeStamp >= SIX_DAYS_AGO) {
    const days = Math.ceil((today - timeStamp) / (24 * 60 * MINUTE));
    result = `${days}天前`;
  } else {
    result = formatDate(time, "YYYY/MM/DD");
  }

  return result;
};

/**
 * 绝对时间
 * @param time 时间戳、字符串日期等等
 */
export const absoluteTime = time => {
  if (!time) return "";

  let formattedTime = time;

  if (typeof time === "string") {
    // 修复 iOS 解析问题
    if (time.includes("T") || time.includes("Z")) {
      // ISO 8601 格式，直接解析
      formattedTime = new Date(time);
    } else {
      // 替换 "-" 为 "/" 以兼容 iOS
      formattedTime = new Date(time.replace(/-/g, "/"));
    }
  } else {
    formattedTime = new Date(time);
  }

  if (isNaN(formattedTime.getTime())) {
    console.error("Invalid Date:", time);
    return "";
  }

  return formatDate(formattedTime, "YYYY/MM/DD");
};

/**
 * 秒转为时分秒
 * @param time 时间（毫秒数）
 */
export const secondsToHMS = time => {
  if (!time) return "00:00";

  let result = "";
  const totalSeconds = Math.ceil(time / 1000);
  const hours = Math.floor(totalSeconds / 60 / 60);
  const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60);
  const seconds = totalSeconds - hours * 60 * 60 - minutes * 60;

  result = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (hours) result = `${String(hours).padStart(2, "0")}:${result}`;

  return result;
};

/**
 * 签约量显示规则（小于10000显示原数字，等于10000显示1万，大于10000显示1万+）
 * @param count 签约量
 */
export const getSignCount = count => {
  if (!count) return 0;

  const LIMIT = 10000;
  if (count < LIMIT) return count;
  else if (count >= LIMIT && count < LIMIT ** 2)
    return (Math.floor((count / LIMIT) * 10) / 10).toFixed(1) + "w";
  else return (Math.floor((count / LIMIT ** 2) * 10) / 10).toFixed(1) + "亿";
};

/** 判断设备 */
export const judgeDevice = () => {
  const mobile =
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
  let inMobile = !!navigator.userAgent.match(mobile);
  if (!inMobile) {
    const deviceWidth = Math.min(document.body.clientWidth, document.body.clientHeight);
    if (deviceWidth <= 500) inMobile = true;
  }

  return inMobile;
};

/** 判断 IOS 设备 */
export const judgeIOSDevice = () => {
  const ios = /(iPhone|iPod|ios|iPad)/i;
  const isIOS = !!navigator.userAgent.match(ios);

  return isIOS;
};

/** 弹出轻提示 */
let timeout = null;
export const showToast = msg => {
  const toast = document.getElementById("toast-wrapper");
  if (toast) document.body.removeChild(toast);
  if (timeout) clearTimeout(timeout);
  const div = document.createElement("div");
  div.className = "toast-wrapper";
  div.id = "toast-wrapper";
  div.innerHTML = msg;
  document.body.appendChild(div);

  timeout = setTimeout(() => {
    document.body.removeChild(div);
  }, 2000);
};

/** 获取assets静态资源 */
export const getAssetsFile = url => {
  return new URL(`../assets/images/${url}`, import.meta.url).href;
};
