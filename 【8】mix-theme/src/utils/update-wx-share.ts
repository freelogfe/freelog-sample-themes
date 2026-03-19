import { freelogApp } from "freelog-runtime";

export const updateWxConfig = (exhibitInfo: {
  exhibitIntro: string;
  coverImages: Array<string>;
  exhibitTitle: string;
}) => {
  const { exhibitIntro, coverImages, exhibitTitle } = exhibitInfo;

  const isWeChatOrQQ = (freelogApp as any).isWeChatOrQQ();
  if (isWeChatOrQQ) {
    const defaultImg = "//static.testfreelog.com/static/default_cover.png";
    const imgUrl = coverImages[0] === defaultImg ? "" : coverImages[0];
    const fShare = {
      title: exhibitTitle,
      desc: exhibitIntro,
      imgUrl
    };
    const qShare = {
      title: exhibitTitle,
      imgUrl
    };
    (freelogApp as any).updateWechatShare(fShare, qShare);
  }
};
