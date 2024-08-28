/* key为分享链接的标识
 * 例如:
 */
export default {
  detail: (exhibitId: string) => {
    return `/detail?id=${exhibitId}`;
  },
  "detail-sub": (exhibitId: string, itemId: string) => {
    return `/detail-sub?id=${exhibitId}&itemId=${itemId}`;
  }
};
