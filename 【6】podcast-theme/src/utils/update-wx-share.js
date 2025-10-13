import { freelogApp } from "freelog-runtime";

export const updateWxConfig = (exhibitInfo) => {
  const { exhibitIntro, coverImages, exhibitTitle } = exhibitInfo
  const isWeChatOrQQ = freelogApp.isWeChatOrQQ()
  if (isWeChatOrQQ) {
    const defaultImg = "//static.testfreelog.com/static/default_cover.png"
    let imgUrl = coverImages[0] === defaultImg ? "" : coverImages[0]
    const fShare = {
      title: exhibitTitle,
      desc: exhibitIntro,
      imgUrl
    };
    const qShare = {
      title: exhibitTitle,
      imgUrl
    };
    freelogApp.updateWechatShare(fShare, qShare)
  }
}