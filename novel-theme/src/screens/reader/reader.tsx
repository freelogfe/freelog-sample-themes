import React, { useContext } from "react";
import "./reader.scss";
import Lock from "../../assets/images/lock.png";
import BgImage from "../../assets/images/reader-bg.png";
import { useState, useEffect, useCallback } from "react";
import { ExhibitItem, ThemeItem } from "../../api/interface";
import { addAuth, getExhibitAuthStatus, getExhibitFileStream, getExhibitInfo } from "../../api/freelog";
import { readerThemeList } from "../../api/data";
import { BackTop } from "../../components/back-top/back-top";
import { useMyHistory, useMyScroll, useMyShelf } from "../../utils/hooks";
import { Header } from "../../components/header/header";
import { Directory } from "../../components/directory/directory";
import { globalContext } from "../../router";
import { Share } from "../../components/share/share";
import { showToast } from "../../components/toast/toast";
import CSSTransition from "react-transition-group/CSSTransition";
import { Loader } from "../../components/loader/loader";

const readerContext = React.createContext<any>({});

export const ReaderScreen = (props: any) => {
  const id = props.match.params.id;
  const { inMobile } = useContext(globalContext);
  const myFontSize = Number(localStorage.getItem("fontSize"));
  const myTheme = JSON.parse(localStorage.getItem("theme") || "null");
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [fontSize, setFontSize] = useState(myFontSize || 22);
  const [theme, setTheme] = useState<ThemeItem>(myTheme || readerThemeList[0]);
  const [sharePopupShow, setSharePopupShow] = useState(false);
  const [fontSizePopupShow, setFontSizePopupShow] = useState(false);
  const [themePopupShow, setThemePopupShow] = useState(false);
  const [directoryShow, setDirectoryShow] = useState(false);
  const [mobileBarShow, setMobileBarShow] = useState(true);

  const context = {
    id,
    inMobile,
    book,
    setBook,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    sharePopupShow,
    setSharePopupShow,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
    directoryShow,
    setDirectoryShow,
    mobileBarShow,
    setMobileBarShow,
  };

  const getBookInfo = useCallback(async () => {
    const exhibitInfo = await getExhibitInfo(id, { isLoadVersionProperty: 1 });
    setBook(exhibitInfo.data.data);
  }, [id]);

  const clickPage = () => {
    if (sharePopupShow || fontSizePopupShow || themePopupShow) {
      setSharePopupShow(false);
      setFontSizePopupShow(false);
      setThemePopupShow(false);
    }
    if (inMobile) setMobileBarShow(true);
  };

  useEffect(() => {
    getBookInfo();
    // eslint-disable-next-line
  }, [id]);

  return (
    <readerContext.Provider value={context}>
      <div
        className={`reader-wrapper ${inMobile && "in-mobile"}`}
        style={{ backgroundImage: `url(${BgImage})`, backgroundColor: theme?.bgColor }}
        onClick={() => clickPage()}
      >
        <CSSTransition in={(inMobile && mobileBarShow) || !inMobile} classNames="slide-up" timeout={150} unmountOnExit>
          <Header readerHeader={true} />
        </CSSTransition>

        <Body />

        <Operater />

        <Directory book={book} directoryShow={directoryShow} setDirectoryShow={setDirectoryShow} />
      </div>
    </readerContext.Provider>
  );
};

const Body = () => {
  const history = useMyHistory();
  const { inMobile, book, id, fontSize, theme } = useContext(readerContext);
  const [content, setContent] = useState<string[]>([]);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const getContent = useCallback(async () => {
    setLoading(true);
    const statusInfo = await getExhibitAuthStatus(id);
    const isAuth = statusInfo.data.data ? statusInfo.data.data[0].isAuth : false;
    setIsAuth(isAuth);
    if (isAuth) {
      const info: any = await getExhibitFileStream(id);
      if (!info) {
        setLoading(false);
        return;
      }
      const content = info.data.split(/\n/g).filter((item: string) => !!item);
      setContent(content);
      setLoading(false);
    } else {
      setLoading(false);
      const authResult = await addAuth(id);
      const { status } = authResult;
      if (status === 0) getContent();
    }
  }, [id]);

  const getAuth = async () => {
    const authResult = await addAuth(id);
    const { status } = authResult;
    if (status === 0) getContent();
  };

  useEffect(() => {
    getContent();
    // eslint-disable-next-line
  }, [id]);

  if (loading) {
    return <Loader />;
  } else if (inMobile === true) {
    // mobile
    return (
      <div
        className={`mobile-body-wrapper ${theme?.type === 1 ? "dark" : "light"}`}
        style={{
          backgroundImage: `url(${BgImage})`,
          backgroundColor: theme?.bookColor,
          fontSize: fontSize + "px",
          lineHeight: fontSize + 14 + "px",
        }}
      >
        {isAuth === true &&
          content.map((item, index) => {
            return (
              <p className="paragraph" key={item + index}>
                {item}
              </p>
            );
          })}
        {isAuth === false && (
          <div className="lock-box">
            <img className="lock" src={Lock} alt="未授权" />
            <div className="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div className="get-btn" onClick={() => getAuth()}>
              签约
            </div>
          </div>
        )}
      </div>
    );
  } else if (inMobile === false) {
    // PC
    return (
      <div className="body-wrapper">
        <div className="breadcrumbs-wrapper">
          <div className="breadcrumbs-item">
            <div className="second-text-btn" onClick={() => history.switchPage("/detail/" + id)}>
              {book?.exhibitTitle}
              {/* {book?.exhibitTitle} {">"} */}
            </div>
          </div>

          {/* <div className="breadcrumbs-item">
          <div className="current-page">
            {book?.exhibitTitle}
          </div>
        </div> */}
        </div>

        <div
          className={`content ${theme?.type === 1 ? "dark" : "light"}`}
          style={{
            backgroundImage: `url(${BgImage})`,
            backgroundColor: theme?.bookColor,
            fontSize: fontSize + "px",
            lineHeight: fontSize + 14 + "px",
          }}
        >
          {isAuth === true &&
            content.map((item, index) => {
              return (
                <p className="paragraph" key={item + index}>
                  {item}
                </p>
              );
            })}
          {isAuth === false && (
            <div className="lock-box">
              <img className="lock" src={Lock} alt="未授权" />
              <div className="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
              <div className="get-btn" onClick={() => getAuth()}>
                签约
              </div>
            </div>
          )}
        </div>

        {/* <div
        className="footer-bar"
        style={{
          backgroundImage: `url(${BgImage})`,
          backgroundColor: theme?.bookColor,
          color: theme?.type === 1 ? "#999" : "#222",
        }}
      >
        <div className={`footer-btn invalid`} onClick={() => console.log(123)}>
          上一章
        </div>
        <div className="footer-btn" onClick={() => history.switchPage("/detail/" + id)}>
          书籍详情
        </div>
        <div className={`footer-btn invalid`} onClick={() => console.log(123)}>
          下一章
        </div>
      </div> */}
      </div>
    );
  } else {
    return <div></div>;
  }
};

const Operater = () => {
  const { scrollTop } = useMyScroll();
  const {
    inMobile,
    book,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    sharePopupShow,
    setSharePopupShow,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
    mobileBarShow,
    setMobileBarShow,
  } = useContext(readerContext);
  const { isCollected, operateShelf } = useMyShelf(book?.exhibitId);
  const [href, setHref] = useState("");

  const changeFontSize = (type: number) => {
    let result = fontSize;
    if (type === 0) {
      if (result === 14) return;
      result--;
    } else {
      if (result === 36) return;
      result++;
    }
    setFontSize(result);
    localStorage.setItem("fontSize", result);
  };

  const closeAllPopup = () => {
    setSharePopupShow(false);
    setFontSizePopupShow(false);
    setThemePopupShow(false);
  };

  const share = () => {
    // 复制链接
    const input: any = document.getElementById("href");
    input.select();
    document.execCommand("Copy");
    showToast("链接复制成功～");
  };

  useEffect(() => {
    setHref((window.location as any).currentURL);
  }, []);

  useEffect(() => {
    if (sharePopupShow) setSharePopupShow(false);
    if (fontSizePopupShow) setFontSizePopupShow(false);
    if (themePopupShow) setThemePopupShow(false);
    if (scrollTop === 0 && !mobileBarShow) setMobileBarShow(true);
    if (scrollTop !== 0 && mobileBarShow) setMobileBarShow(false);
    // eslint-disable-next-line
  }, [scrollTop]);

  useEffect(() => {
    document.body.style.overflowY =
      (sharePopupShow || fontSizePopupShow || themePopupShow) && inMobile ? "hidden" : "auto";
  }, [sharePopupShow, fontSizePopupShow, themePopupShow, inMobile]);

  return inMobile ? (
    // mobile
    <CSSTransition in={mobileBarShow} classNames="slide-down" timeout={150} unmountOnExit>
      <div className="mobile-operater-wrapper">
        {/* <div
        className="operater-btn"
        onClick={() => {
          closeAllPopup();
          setDirectoryShow(true);
        }}
      >
        <i className="freelog fl-icon-xiaoshuomulu"></i>
        <div className="operater-btn-label">目录</div>
      </div> */}

        {isCollected ? (
          <div
            className="operater-btn"
            onClick={() => {
              closeAllPopup();
              operateShelf(book);
            }}
          >
            <i className="freelog fl-icon-shoucangxiaoshuoyishoucang"></i>
            <div className="operater-btn-label">移出书架</div>
          </div>
        ) : (
          <div
            className="operater-btn"
            onClick={() => {
              closeAllPopup();
              operateShelf(book);
            }}
          >
            <i className="freelog fl-icon-shoucangxiaoshuo"></i>
            <div className="operater-btn-label">加入书架</div>
          </div>
        )}

        <div
          className="operater-btn"
          onClick={() => {
            closeAllPopup();
            share();
          }}
        >
          <i className="freelog fl-icon-fenxiang"></i>
          <div className="operater-btn-label">分享</div>
        </div>

        <div
          className="operater-btn"
          onClick={() => {
            closeAllPopup();
            setFontSizePopupShow(true);
          }}
        >
          <div className="freelog">A</div>
          <div className="operater-btn-label">字号</div>
        </div>

        <div
          className="operater-btn"
          onClick={() => {
            closeAllPopup();
            setThemePopupShow(true);
          }}
        >
          <i className="freelog fl-icon-beijingyanse"></i>
          <div className="operater-btn-label">背景色</div>
        </div>

        {fontSizePopupShow && (
          <div className="operater-popup" onClick={() => setFontSizePopupShow(false)}>
            <div className="fontsize-popup" onClick={(e) => e.stopPropagation()}>
              <div className="fontsize-label" onClick={() => changeFontSize(0)}>
                A-
              </div>
              <div className="fontsize-value">{fontSize}</div>
              <div className="fontsize-label" onClick={() => changeFontSize(1)}>
                A+
              </div>
            </div>
          </div>
        )}

        {themePopupShow && (
          <div className="operater-popup" onClick={() => setThemePopupShow(false)}>
            <div className="theme-popup" onClick={(e) => e.stopPropagation()}>
              {readerThemeList.map((item) => {
                return (
                  <div
                    className={`theme-btn ${theme.bookColor === item.bookColor && "active"}`}
                    key={item.bookColor}
                    style={{ backgroundColor: item.bookColor }}
                    onClick={() => {
                      setTheme(item);
                      localStorage.setItem("theme", JSON.stringify(item));
                    }}
                  >
                    <i className="freelog fl-icon-xuanzhong"></i>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <input id="href" className="hidden-input" value={href} readOnly />
      </div>
    </CSSTransition>
  ) : (
    // PC
    <div className="operater-wrapper">
      <div className="operater-btns-box">
        {/* <OperateBtn
          icon="fl-icon-xiaoshuomulu"
          onClick={() => {
            closeAllPopup();
            setDirectoryShow(true);
          }}
        /> */}

        {isCollected ? (
          <OperateBtn
            icon="fl-icon-shoucangxiaoshuoyishoucang"
            onClick={() => {
              closeAllPopup();
              operateShelf(book);
            }}
          />
        ) : (
          <OperateBtn
            icon="fl-icon-shoucangxiaoshuo"
            onClick={() => {
              closeAllPopup();
              operateShelf(book);
            }}
          />
        )}

        <OperateBtn
          icon="fl-icon-fenxiang"
          onClick={() => {
            closeAllPopup();
            setSharePopupShow(true);
          }}
          slot={<Share show={sharePopupShow} exhibit={book} />}
        />

        <OperateBtn
          text="A"
          onClick={() => {
            closeAllPopup();
            setFontSizePopupShow(true);
          }}
          slot={
            <div
              className={`operater-popup ${theme?.type === 1 ? "dark" : "light"}`}
              style={{ width: fontSizePopupShow ? "162px" : "0" }}
            >
              <div className="fontsize-label" onClick={() => changeFontSize(0)}>
                A-
              </div>
              <div className="fontsize-value">{fontSize}</div>
              <div className="fontsize-label" onClick={() => changeFontSize(1)}>
                A+
              </div>
            </div>
          }
        />

        <OperateBtn
          icon="fl-icon-beijingyanse"
          onClick={() => {
            closeAllPopup();
            setThemePopupShow(true);
          }}
          slot={
            <div className="operater-popup" style={{ width: themePopupShow ? "228px" : "0" }}>
              {readerThemeList.map((item) => {
                return (
                  <div
                    className={`theme-btn ${theme.bookColor === item.bookColor && "active"}`}
                    key={item.bookColor}
                    style={{ backgroundColor: item.bookColor }}
                    onClick={() => {
                      setTheme(item);
                      localStorage.setItem("theme", JSON.stringify(item));
                    }}
                  >
                    <i className="freelog fl-icon-xuanzhong"></i>
                  </div>
                );
              })}
            </div>
          }
        />

        <div className="back-top">
          <BackTop onClick={() => closeAllPopup()}>
            <OperateBtn icon="fl-icon-huidaodingbu" />
          </BackTop>
        </div>
      </div>
    </div>
  );
};

const OperateBtn = (props: { icon?: string; text?: string; slot?: any; onClick?: (e: any) => void }) => {
  const { icon, text, slot, onClick } = props;
  const { theme } = useContext(readerContext);

  return (
    <div
      className={`operate-btn-wrapper ${theme?.type === 1 ? "dark" : "light"}`}
      style={{ backgroundColor: theme?.bookColor }}
      onClick={(e) => e.stopPropagation()}
    >
      {slot}
      {icon && <i className={`freelog ${icon}`} onClick={onClick}></i>}
      {text && (
        <span className="freelog" onClick={onClick}>
          {text}
        </span>
      )}
    </div>
  );
};
