/**
 * 格式化日期
 * @param time 时间戳、字符串日期等等
 * @param format 自定义输出结果格式（YYYY:年，MM:月，DD:日，hh:时，mm:分，ss:秒）
 */
export const formatDate = (time: string | undefined | Date, format = "YYYY-MM-DD hh:mm:ss") => {
  if (!time) return;

  const date = new Date(time);

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const result = format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("hh", hour)
    .replace("mm", minutes)
    .replace("ss", seconds);
  return result;
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

/** 轻提示 */
let timeout: any = null;
export const showToast = (msg: string) => {
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

// 修复ios的safari浏览器, 软键盘将页面顶到安全区域外的问题(方式一)
export const scrollIntoView = () => {
  const headerWrapper = document.getElementById("headerWrapper") as HTMLElement;
  headerWrapper.scrollIntoView({
    block: "end",
    behavior: "smooth"
  });
};

export const sleep = (duration: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
  });
};
