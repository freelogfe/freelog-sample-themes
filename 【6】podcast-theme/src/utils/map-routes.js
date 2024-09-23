/* key为分享链接的标识
 * 例如: 
*/
export default {
  "detail": (exhibitId)=>{
    return `/detail?id=${exhibitId}`
  },
  "detail-sub": (exhibitId, itemId)=>{
    return `/detail-sub?id=${exhibitId}&itemId=${itemId}`
  }
}