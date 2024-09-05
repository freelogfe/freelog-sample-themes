/* key为分享链接的标识
 * 例如:
 */
export default {
  detail: (exhibitId: string, subID: string, albumName: string) => {
    if (!subID) {
      return `/detail?id=${exhibitId}`;
    }

    return `/detail?id=${exhibitId}&subID=${subID}&albumName=${albumName}`;
  }
};
