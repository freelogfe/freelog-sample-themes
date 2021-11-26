import "./share.scss";
import CSSTransition from "react-transition-group/CSSTransition";
import { useEffect, useState } from "react";
import { ExhibitItem, shareBtnItem } from "../../utils/interface";
import { shareBtns } from "../../api/data";

export const Share = (props: { show: boolean; exhibit: ExhibitItem }) => {
  const [shareText, setShareText] = useState("");
  const [href, setHref] = useState("");

  const share = (type: string) => {
    const url = href;
    const title = props.exhibit.presentableTitle;
    const summary = `我在freelog发现一个不错的小说：${props.exhibit.presentableTitle} ${href}`;
    const image = props.exhibit.coverImages[0];

    if (type === "qqZone") {
      // QQ空间
      window.open(
        `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${title}&pics=${image}&desc=这是描述&summary=这是简介`
      );
    } else if (type === "qq") {
      // qq
      const iframe = document.createElement("iframe");
      iframe.src = `https://connect.qq.com/widget/shareqq/index.html?url=https://www.iqiyi.com/v_ao5v2gub40.html`;
      iframe.className = "qq-iframe";
      iframe.title = "qq分享";
      const shareBtns = document.getElementById("shareBtns");
      shareBtns?.appendChild(iframe);
      // window.location.href = `https://connect.qq.com/widget/shareqq/index.html?url=${url}`;
    } else if (type === "weibo") {
      // 微博
      window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=${image}`);
    } else if (type === "wechat") {
      // 微信
      // 用链接生成一个二维码就行了
    } else if (type === "douban") {
      // 豆瓣
      window.open(`https://www.douban.com/share/service?url=${url}&title=${title}&image=${image}`);
    } else if (type === "copy") {
      // 复制链接
      const input: any = document.getElementById("href");
      input.select();
      document.execCommand("Copy");
    }
  };

  useEffect(() => {
    setHref(window.location.href);
  }, []);

  return (
    <CSSTransition in={true} classNames="slide-down" timeout={200} unmountOnExit>
      {/* <CSSTransition in={props.show} classNames="slide-down" timeout={200} unmountOnExit> */}
      <div className="share-wrapper">
        <div className="share-popup">
          <div className="share-title">分享</div>

          <input id="href" className="hidden-input" value={href} readOnly />

          <textarea className="textarea" value={shareText} onChange={(e) => setShareText(e.target.value)}></textarea>

          <div className="btns-box">
            <div id="shareBtns" className="share-btns">
              <div className="share-label">快速分享至：</div>
              {shareBtns.map((item: shareBtnItem) => {
                return (
                  <div
                    className="share-btn-item"
                    style={{ backgroundColor: item.bgColor }}
                    key={item.name}
                    onClick={() => share(item.name)}
                  >
                    <i className={`freelog ${item.icon}`}></i>
                  </div>
                );
              })}
            </div>

            <div className="copy-btn" onClick={() => share("copy")}>
              复制链接
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};
