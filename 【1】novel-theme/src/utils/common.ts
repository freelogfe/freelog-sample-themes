/**
 * 格式化日期
 * @param time 时间戳、字符串日期等等
 * @param format 自定义输出结果格式（YYYY:年，MM:月，DD:日，hh:时，mm:分，ss:秒）
 */
export const formatDate = (time: string | undefined, format: string = "YYYY-MM-DD hh:mm:ss") => {
  if (!time) return "";

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

/** 获取 url 参数 */
export const getUrlParams = (str: string) => {
  str = decodeURIComponent(str);
  const result: Record<string, string> = {};
  const paramsArr = str.replace("?", "").split("&");
  paramsArr.forEach(item => {
    const [key, value] = item.split("=");
    result[key] = value;
  });
  return result;
};

/**
 * 万字以下显示具体数字，万字以上精确到小数
 * @param value
 * @returns
 */
export const formatWordCount = (value: number) => {
  console.log("value", value);

  if (!value) {
    return;
  }

  if (value < 10000) {
    return value.toString();
  } else {
    let result = (value / 10000).toFixed(1).replace(/\.?0+$/, ""); // 去掉无用的 .00 或 .0
    return result + "万";
  }
};
