/* key为分享链接的标识
 * 例如:
 */
export default {
  detail: (exhibitId: string) => {
    return `/detail?id=${exhibitId}`;
  },
  reader: (exhibitId: string, itemId: string, query: Record<string, string>) => {
    debugger;
    if (!itemId) {
      return `/reader?id=${exhibitId}`;
    } else {
      return `/reader?id=${exhibitId}&subId=${itemId}&collection=${query.collection}`;
    }
  }
};
