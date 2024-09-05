/* key为分享链接的标识
 * 例如:
 */
export default {
  detail: (exhibitId: string, itemId: string, albumName: string) => {
    if (!itemId) {
      return `/detail?id=${exhibitId}`;
    }

    return `/detail?id=${exhibitId}&subID=${itemId}&albumName=${albumName}`;
  }
};
