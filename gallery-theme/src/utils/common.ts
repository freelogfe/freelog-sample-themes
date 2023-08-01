/**
 * 签约量显示规则（小于10000显示原数字，等于10000显示1万，大于10000显示1万+）
 * @param count 签约量
 */
export const getSignCount = (count: number) => {
  if (!count) return 0;
  if (count < 10000) return count;
  if (count === 10000) return "1万";
  if (count > 10000) return "1万+";
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

/** 轻提示 */
let timeout: number | null = null;
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
