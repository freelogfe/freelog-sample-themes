import { ResourceItem } from "./interface";

/**
 * 纵向滚动元素
 * @returns 滚动条距离元素底部的高度
 */
export const scrollDom = (event: any) => {
  const { srcElement } = event;
  if (!srcElement) return;

  // 处理向上使劲滚动的时候scrollTop为undefined
  if (!event.srcElement.scrollTop) return;

  // 滚动高度
  const scrollTop =
    event.srcElement.scrollTop ||
    window.pageYOffset ||
    event.srcElement.body.scrollTop;
  // 元素视窗高度
  const clientHeight =
    event.srcElement.clientHeight || document.body.clientHeight;
  // 元素滚动高度
  const scrollHeight =
    event.srcElement.scrollHeight || document.body.scrollHeight;
  // 滚动条距离元素底部的高度
  const height = scrollHeight - scrollTop - clientHeight;

  return height;
};

/**
 * 获取作者名/资源名
 * @param resourceName 接口返回的资源名称：作者/资源名
 * @returns 作者名/资源名
 */
export const getResourceName = (
  resourceName: string | undefined,
  type: number
) => {
  if (!resourceName) return "";
  const author = resourceName.split("/")[type];
  return author;
};

/**
 * 格式化日期
 * @param time 时间戳、字符串日期等等
 * @param format 自定义输出结果格式（YYYY:年，MM:月，DD:日，hh:时，mm:分，ss:秒）
 */
export const formatDate = (
  time: string | undefined,
  format = "YYYY-MM-DD hh:mm:ss"
) => {
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

/**
 * 整理目录（现阶段暂时不分章节，目录就一章，章节名为资源名）
 * @param data 资源数据
 */
export const getDirectoryList = (data: ResourceItem) => {
  const resourceName = getResourceName(data.resourceName, 1);
  const directoryList = [
    {
      id: 1,
      title: resourceName,
      open: true,
    },
  ];
  return directoryList;
};
