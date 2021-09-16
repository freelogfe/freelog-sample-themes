/**
 * 推荐到豆瓣
 */
export const ShareToDouban = (props: { title?: string }) => {
  const share = () => {
    const myDocument: any = document;
    const selection =
      window.getSelection() ||
      myDocument.getSelection() ||
      myDocument.selection.createRange().text ||
      "";
    const url = `https://www.douban.com/recommend/?url=${encodeURIComponent(
      myDocument.location.href
    )}&title=${encodeURIComponent(
      props?.title || document.title
    )}&sel=${encodeURIComponent(selection)}&v=1`;
    const openShareFrame = () => {
      if (
        !window.open(
          url,
          "douban",
          `toolbar=0,resizable=1,scrollbars=yes,status=1`
        )
      )
        document.location.href = url + "&r=1";
    };

    if (/Firefox/.test(navigator.userAgent)) {
      setTimeout(openShareFrame, 0);
    } else {
      openShareFrame();
    }
  };

  return (
    <img
      className="cur-pointer"
      src="https://img3.doubanio.com/pics/fw2douban_s.png"
      alt="推荐到豆瓣"
      onClick={share}
    />
  );
};

/**
 * 推荐到微博
 */
export const ShareToWeibo = (props: { title?: string }) => {
  const share = () => {
    const url =
      "http://service.weibo.com/share/share.php?url=" +
      encodeURIComponent(document.location.href) +
      "&title=" +
      props.title +
      "&pic=" +
      "https://img3.doubanio.com/pics/fw2douban_s.png";
    const openShareFrame = () => {
      if (
        !window.open(
          url,
          "douban",
          `toolbar=0,resizable=1,scrollbars=yes,status=1`
        )
      )
      document.location.href = url + "&r=1";
    };

    if (/Firefox/.test(navigator.userAgent)) {
      setTimeout(openShareFrame, 0);
    } else {
      openShareFrame();
    }
  };

  return (
    <img
      className="cur-pointer"
      src="https://img3.doubanio.com/pics/fw2douban_s.png"
      alt="推荐到微博"
      onClick={share}
    />
  );
};
