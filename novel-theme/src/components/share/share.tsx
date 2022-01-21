import "./share.scss";
import CSSTransition from "react-transition-group/CSSTransition";
import { useContext, useEffect, useState } from "react";
import { ExhibitItem, shareBtnItem } from "../../api/interface";
import { shareBtns } from "../../api/data";
import { showToast } from "../toast/toast";
import { globalContext } from "../../router";
const QRCode = require("qrcode.react");

export const Share = (props: {
  show: boolean;
  setShareShow?: (show: boolean) => void;
  exhibit: ExhibitItem | null;
}) => {
  const { inMobile } = useContext(globalContext);
  const { show, setShareShow, exhibit } = props;
  const [shareText, setShareText] = useState("");
  const [href, setHref] = useState("");
  const [qrcodeShow, setQrcodeShow] = useState(false);
  const [qrcodeInfo, setQrcodeInfo] = useState<{ name: string; url: string }>({
    name: "",
    url: "",
  });

  const share = (item: { id: string; name: string }) => {
    const url = href;
    const title = exhibit?.exhibitTitle;
    const summary = ``;
    const image = exhibit?.coverImages[0];

    if (item.id === "qqZone") {
      // QQ空间
      const shareWeb = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&desc=${shareText}&summary=${summary}&title=${title}&pics=${image}`;
      window.open(shareWeb);
    } else if (item.id === "weibo") {
      // 微博
      const weiboTitle = `我在freelog发现一个不错的小说：${exhibit?.exhibitTitle}`;
      window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${weiboTitle}&pic=${image}`);
    } else if (item.id === "douban") {
      // 豆瓣
      window.open(`https://www.douban.com/share/service?url=${url}&title=${title}&image=${image}`);
    } else if (["qq", "wechat"].includes(item.id)) {
      // qq、微信
      const qrcodeInfo = { name: item.name, url };
      setQrcodeInfo(qrcodeInfo);
      setQrcodeShow(true);
    } else if (item.id === "copy") {
      // 复制链接
      const input: any = document.getElementById("href");
      input.select();
      document.execCommand("Copy");
      showToast("链接复制成功～");
    }
  };

  useEffect(() => {
    const url = (window.location as any).currentURL;
    setHref(url);
    setShareText(`我在freelog发现一个不错的小说：${exhibit?.exhibitTitle} ${url}`);
  }, [exhibit?.exhibitTitle]);

  useEffect(() => {
    if (!show) setQrcodeShow(false);
  }, [show]);

  return inMobile ? (
    // mobile
    <CSSTransition in={show} classNames="fade" timeout={200} unmountOnExit>
      <div className="mobile-share-wrapper" onClick={() => setShareShow && setShareShow(false)}>
        <div className="exihibit-info" onClick={(e) => e.stopPropagation()}>
          <div className="book-cover-box">
            <img className="book-cover" src={exhibit?.coverImages[0]} alt={exhibit?.exhibitTitle} />
          </div>

          <div className="book-name" title={exhibit?.exhibitTitle}>
            {exhibit?.exhibitTitle}
          </div>
        </div>

        <div className="share-btns" onClick={(e) => e.stopPropagation()}>
          <div className="share-label">快速分享至</div>
          <div className="btns-list">
            {shareBtns.map((item: shareBtnItem, index: number) => {
              return (
                <div className="share-btn-item" key={item.id} onClick={() => share(item)}>
                  <div className="share-btn-icon" style={{ backgroundColor: item.bgColor }}>
                    <i className={`freelog ${item.icon}`}></i>
                  </div>

                  <div className="share-btn-label">{item.name}</div>
                </div>
              );
            })}
          </div>
          <div className="cancel-btn" onClick={() => setShareShow && setShareShow(false)}>
            取消
          </div>
        </div>
      </div>
    </CSSTransition>
  ) : (
    // PC
    <CSSTransition in={show} classNames="fade" timeout={200} unmountOnExit>
      <div className="share-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="share-popup">
          <div className="share-title">分享</div>

          <input id="href" className="hidden-input" value={href} readOnly />

          <textarea className="textarea" value={shareText} onChange={(e) => setShareText(e.target.value)}></textarea>

          <div className="btns-box">
            <div className="share-btns">
              <div className="share-label">快速分享至：</div>
              {shareBtns.map((item: shareBtnItem, index: number) => {
                return (
                  <div
                    className="share-btn-item"
                    style={{ backgroundColor: item.bgColor }}
                    key={item.id}
                    onClick={() => share(item)}
                  >
                    <i className={`freelog ${item.icon}`}></i>
                  </div>
                );
              })}
            </div>

            <div className="copy-btn" onClick={() => share({ id: "copy", name: "" })}>
              复制链接
            </div>

            <QrcodePopup
              show={qrcodeShow}
              name={qrcodeInfo.name}
              value={qrcodeInfo.url}
              setQrcodeShow={setQrcodeShow}
            />
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

const QrcodePopup = (props: { show: boolean; name: string; value: string; setQrcodeShow: (show: boolean) => void }) => {
  const { show, name, value, setQrcodeShow } = props;

  return (
    <CSSTransition in={show} classNames="fade" timeout={200} unmountOnExit>
      <div className="qrcode-popup-wrapper" onClick={() => setQrcodeShow(false)}>
        <div className="qrcode-popup" onClick={(e) => e.stopPropagation()}>
          <i className="close-btn freelog fl-icon-guanbi" onClick={() => setQrcodeShow(false)}></i>
          <div className="qrcode-text">分享到{name}</div>
          <QRCode value={value} size={220} />
          <div className="qrcode-text">使用{name}扫一扫完成分享</div>
        </div>
      </div>
    </CSSTransition>
  );
};
