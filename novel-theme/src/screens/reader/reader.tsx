import React, { useContext, useRef } from "react";
import "./reader.scss";
import Lock from "../../assets/images/lock.png";
import BgImage from "../../assets/images/reader-bg.png";
import AuthLinkAbnormal from "../../assets/images/auth-link-abnormal.png";
import { useState, useEffect, useCallback } from "react";
import { ExhibitItem, ThemeItem } from "../../api/interface";
import {
  addAuth,
  getExhibitAuthStatus,
  getExhibitFileStream,
  getExhibitInfo,
  getSubDep,
  mountWidget,
} from "../../api/freelog";
import { readerThemeList } from "../../api/data";
import { BackTop } from "../../components/back-top/back-top";
import { useMyHistory, useMyScroll, useMyShelf } from "../../utils/hooks";
import { Header } from "../../components/header/header";
import { globalContext } from "../../router";
import { showToast } from "../../components/toast/toast";
import CSSTransition from "react-transition-group/CSSTransition";
import { Loader } from "../../components/loader/loader";

export const readerContext = React.createContext<any>({});

/** 阅读页 */
export const ReaderScreen = (props: any) => {
  const id = props.match.params.id;
  const { inMobile } = useContext(globalContext);
  const myTheme = JSON.parse(localStorage.getItem("theme") || "null");
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [fontSize, setFontSize] = useState(22);
  const [theme, setTheme] = useState<ThemeItem>(myTheme || readerThemeList[0]);
  const [fontSizePopupShow, setFontSizePopupShow] = useState(false);
  const [themePopupShow, setThemePopupShow] = useState(false);
  const [mobileBarShow, setMobileBarShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const widgetList = useRef<any>({});

  /** 获取小说信息 */
  const getNovelInfo = useCallback(async () => {
    setLoading(true);
    const exhibitInfo = await getExhibitInfo(id, { isLoadVersionProperty: 1 });
    setBook(exhibitInfo.data.data);
  }, [id]);

  /** 加载分享插件 */
  const mountShareWidget = async () => {
    if (inMobile) return;

    const themeData = await getSubDep();
    const widget = themeData.subDep.find((item: any) => item.name === "ZhuC/share-widget");
    if (!widget) return;
    widgetList.current.share = await mountWidget({
      widget,
      container: document.getElementById("share"),
      topExhibitData: themeData,
      config: { exhibit: book, type: "小说" },
    });
  };

  /** 加载 markdown 插件 */
  const mountMarkdownWidget = async (exhibitInfo: ExhibitItem, content: string) => {
    const themeData = await getSubDep();
    const widget = themeData.subDep.find((item: any) => item.name === "ZhuC/markdown-widget");
    if (!widget) return;
    const myFontSize = Number(localStorage.getItem("fontSize")) || 22;
    setFontSize(myFontSize);
    widgetList.current.markdown = await mountWidget({
      widget,
      container: document.getElementById("markdown"),
      topExhibitData: themeData,
      config: { exhibitInfo, content, fontSize: myFontSize },
      widget_entry: "http://localhost:8201/",
    });
  };

  /** 通知插件更新数据 */
  const setWidgetData = (widget: string, key: string, value: any) => {
    if (widgetList.current[widget] && widgetList.current[widget].getApi().setData) {
      widgetList.current[widget].getApi().setData(key, value);
    }
  };

  /** 点击页面（关闭所有打开的弹窗） */
  const clickPage = () => {
    setWidgetData("share", "show", false);
    if (fontSizePopupShow) setFontSizePopupShow(false);
    if (themePopupShow) setThemePopupShow(false);
    if (inMobile) setMobileBarShow(true);
  };

  useEffect(() => {
    return () => {
      (async function unmountWidget() {
        // eslint-disable-next-line
        for (const key in widgetList.current) {
          // eslint-disable-next-line
          await widgetList.current[key].unmount();
        }
      })();
    };
  }, []);

  useEffect(() => {
    getNovelInfo();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    setWidgetData("markdown", "fontSize", fontSize);
  }, [fontSize]);

  const context = {
    id,
    inMobile,
    book,
    setBook,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
    mobileBarShow,
    setMobileBarShow,
    loading,
    setLoading,
    mountShareWidget,
    mountMarkdownWidget,
    setWidgetData,
  };

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
        <ReaderBody />
        <OperaterBtns />
      </div>
    </readerContext.Provider>
  );
};

/** 阅读页主体内容 */
const ReaderBody = () => {
  const history = useMyHistory();
  const { userData } = useContext(globalContext);
  const { inMobile, book, id, theme, mountMarkdownWidget, loading, setLoading } = useContext(readerContext);
  const [content, setContent] = useState<string>("");
  const [defaulterIdentityType, setDefaulterIdentityType] = useState<number | null>(null);

  /** 获取小说内容 */
  const getContent = useCallback(async () => {
    let authErrType;
    const statusInfo = await getExhibitAuthStatus(id);
    if (statusInfo.data.data) authErrType = statusInfo.data.data[0].defaulterIdentityType;
    setDefaulterIdentityType(authErrType);

    if (authErrType === 0) {
      // 已签约并且授权链无异常
      const info: any = await getExhibitFileStream(id);
      if (!info) {
        setLoading(false);
        return;
      }
      setContent(info.data);
    } else if (authErrType === 4) {
      // 标的物未签约，自动弹出授权弹窗
      getAuth();
    }

    setLoading(false);
    // eslint-disable-next-line
  }, [id]);

  /** 获取授权 */
  const getAuth = async () => {
    const authResult = await addAuth(id);
    const { status } = authResult;
    if (status === 0) getContent();
  };

  useEffect(() => {
    getContent();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (book && content) {
      setLoading(false);
      mountMarkdownWidget(book, content);
    }
    // eslint-disable-next-line
  }, [book, content]);

  if (loading) {
    return <Loader />;
  } else if (inMobile === true) {
    // mobile
    return (
      <div
        className={`mobile-body-wrapper ${theme?.type === 1 ? "dark" : "light"}`}
        style={
          {
            backgroundImage: `url(${BgImage})`,
            backgroundColor: theme?.bookColor,
          } as any
        }
      >
        {defaulterIdentityType === 0 && <div id="markdown" />}
        {![null, 0, 4].includes(defaulterIdentityType) ? (
          <div className="auth-box">
            <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
            <div className="auth-link-tip">授权链异常，无法查看</div>
            <div className="home-btn" onClick={() => history.switchPage("/home/全部")}>
              进入首页
            </div>
          </div>
        ) : defaulterIdentityType && (defaulterIdentityType === 4 || userData?.isLogin === false) ? (
          <div className="lock-box">
            <img className="lock" src={Lock} alt="未授权" />
            <div className="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div className="get-btn" onClick={() => getAuth()}>
              获得授权
            </div>
          </div>
        ) : null}
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
            </div>
          </div>
        </div>

        <div
          className={`content ${theme?.type === 1 ? "dark" : "light"}`}
          style={
            {
              backgroundImage: `url(${BgImage})`,
              backgroundColor: theme?.bookColor,
            } as any
          }
        >
          {defaulterIdentityType === 0 && <div id="markdown" />}
          {![null, 0, 4].includes(defaulterIdentityType) ? (
            <div className="auth-box">
              <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
              <div className="auth-link-tip">授权链异常，无法查看</div>
              <div className="home-btn" onClick={() => history.switchPage("/home/全部")}>
                进入首页
              </div>
            </div>
          ) : defaulterIdentityType && (defaulterIdentityType === 4 || userData?.isLogin === false) ? (
            <div className="lock-box">
              <img className="lock" src={Lock} alt="未授权" />
              <div className="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
              <div className="get-btn" onClick={() => getAuth()}>
                获得授权
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

/** 功能操作按钮群 */
const OperaterBtns = () => {
  const { scrollTop } = useMyScroll();
  const {
    inMobile,
    book,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
    mobileBarShow,
    setMobileBarShow,
    mountShareWidget,
    setWidgetData,
  } = useContext(readerContext);
  const { isCollected, operateShelf } = useMyShelf(book?.exhibitId);
  const [href, setHref] = useState("");
  let changingFontSize = useRef(false);
  let changingFontSizeTimer = useRef<any>(null);

  /** 改变字体大小 */
  const changeFontSize = (type: number) => {
    changingFontSize.current = true;
    clearTimeout(changingFontSizeTimer.current);
    changingFontSizeTimer.current = null;
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
    changingFontSizeTimer.current = setTimeout(() => {
      changingFontSize.current = false;
      clearTimeout(changingFontSizeTimer.current);
      changingFontSizeTimer.current = null;
    }, 500);
  };

  /** 关闭所有弹窗 */
  const closeAllPopup = () => {
    setWidgetData("share", "show", false);
    setFontSizePopupShow(false);
    setThemePopupShow(false);
  };

  /** 移动端分享 */
  const share = () => {
    // 复制链接
    const input: any = document.getElementById("href");
    input.select();
    document.execCommand("Copy");
    showToast("链接复制成功～");
  };

  useEffect(() => {
    if (book) mountShareWidget();
    // eslint-disable-next-line
  }, [book]);

  useEffect(() => {
    setHref((window.location as any).currentURL);
  }, []);

  useEffect(() => {
    if (changingFontSize.current) return;

    setWidgetData("share", "show", false);
    if (fontSizePopupShow) setFontSizePopupShow(false);
    if (themePopupShow) setThemePopupShow(false);
    if (scrollTop === 0 && !mobileBarShow) setMobileBarShow(true);
    if (scrollTop !== 0 && mobileBarShow) setMobileBarShow(false);
    // eslint-disable-next-line
  }, [scrollTop]);

  useEffect(() => {
    document.body.style.overflowY = (fontSizePopupShow || themePopupShow) && inMobile ? "hidden" : "auto";
  }, [fontSizePopupShow, themePopupShow, inMobile]);

  return inMobile ? (
    // mobile
    <CSSTransition in={mobileBarShow} classNames="slide-down" timeout={150} unmountOnExit>
      <div className="mobile-operater-wrapper">
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
            setTimeout(() => {
              setWidgetData("share", "show", true);
            }, 0);
          }}
          slot={<div id="share" className="share-wrapper" />}
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

        <BackTop onClick={() => closeAllPopup()}>
          <OperateBtn icon="fl-icon-huidaodingbu" />
        </BackTop>
      </div>
    </div>
  );
};

/** 功能操作按钮 */
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
