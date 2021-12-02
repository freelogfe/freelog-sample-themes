import React, { useContext } from "react";
import "./reader.scss";
import { useState, useEffect, useCallback } from "react";
import { ExhibitItem, ThemeItem } from "../../utils/interface";
import { getExhibitsInfo, getInfo } from "../../api/freelog";
import { themeList } from "../../api/data";
import { BackTop } from "../../components/back-top/back-top";
import { useMyHistory, useMyScroll, useMyShelf } from "../../utils/hooks";
import { Header } from "../../components/header/header";
import { BreadCrumbs } from "../../components/breadcrumbs/breadcrumbs";
import { Directory } from "../../components/directory/directory";
import { globalContext } from "../../router";
import { Share } from "../../components/share/share";

const readerContext = React.createContext<any>({});

export const ReaderScreen = (props: any) => {
  const id = props.match.params.id;
  const myFontSize = Number(localStorage.getItem("fontSize"));
  const myTheme = JSON.parse(localStorage.getItem("theme") || "null");
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [fontSize, setFontSize] = useState(myFontSize || 22);
  const [theme, setTheme] = useState<ThemeItem>(myTheme || themeList[0]);
  const [sharePopupShow, setSharePopupShow] = useState(false);
  const [fontSizePopupShow, setFontSizePopupShow] = useState(false);
  const [themePopupShow, setThemePopupShow] = useState(false);
  const [directoryShow, setDirectoryShow] = useState(false);

  const context = {
    id,
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
  };

  const getBookInfo = useCallback(async () => {
    const exhibitInfo = await getExhibitsInfo(id, {
      isLoadVersionProperty: 1,
      isLoadCustomPropertyDescriptors: 1,
      isLoadResourceDetailInfo: 1,
      isLoadResourceVersionInfo: 1,
    });
    setBook(exhibitInfo.data.data);
  }, [id]);

  const clickPage = () => {
    if (sharePopupShow || fontSizePopupShow || themePopupShow) {
      setSharePopupShow(false);
      setFontSizePopupShow(false);
      setThemePopupShow(false);
    }
  };

  useEffect(() => {
    getBookInfo();
    // eslint-disable-next-line
  }, [id]);

  return (
    <readerContext.Provider value={context}>
      <div
        className="reader-wrapper"
        style={{ backgroundColor: theme?.bgColor }}
        onClick={() => clickPage()}
      >
        <Header currentPage={book?.presentableTitle} />

        <Body />

        <Operater />

        <Directory
          book={book}
          directoryShow={directoryShow}
          setDirectoryShow={setDirectoryShow}
        />
      </div>
    </readerContext.Provider>
  );
};

const Body = () => {
  const history = useMyHistory();
  const { book, id, fontSize, theme } = useContext(readerContext);
  const { inMobile } = useContext(globalContext);
  const [content, setContent] = useState<string[]>([]);

  const getContent = useCallback(async () => {
    const info: any = await getInfo("getFileStreamById", [id], () => {
      history.back();
    });
    if (!info) return;

    const content = info.data.split(/\s/g).filter((item: string) => !!item);
    setContent(content);
  }, [id, history]);

  useEffect(() => {
    getContent();
    // eslint-disable-next-line
  }, [id]);

  return inMobile ? (
    // mobile
    <div
      className={`mobile-body-wrapper ${theme?.type === 1 ? "dark" : "light"}`}
      style={{
        backgroundColor: theme?.bookColor,
        fontSize: fontSize + "px",
        lineHeight: fontSize + 14 + "px",
      }}
    >
      {content.map((item, index) => {
        return (
          <p className="paragraph" key={item + index}>
            {item}
          </p>
        );
      })}
    </div>
  ) : (
    // PC
    <div className="body-wrapper">
      <BreadCrumbs title={book?.presentableTitle} dark={theme?.type === 1} />

      <div
        className={`content ${theme?.type === 1 ? "dark" : "light"}`}
        style={{
          backgroundColor: theme?.bookColor,
          fontSize: fontSize + "px",
          lineHeight: fontSize + 14 + "px",
        }}
      >
        {content.map((item, index) => {
          return (
            <p className="paragraph" key={item + index}>
              {item}
            </p>
          );
        })}
      </div>

      <div className="footer-bar" style={{ backgroundColor: theme?.bookColor }}>
        <div className={`footer-btn`} onClick={() => console.log(123)}>
          上一章
        </div>
        <div
          className="footer-btn"
          onClick={() => history.switchPage("/detail/" + id)}
        >
          书籍详情
        </div>
        <div className={`footer-btn`} onClick={() => console.log(123)}>
          下一章
        </div>
      </div>
    </div>
  );
};

const Operater = () => {
  const { scrollTop } = useMyScroll();
  const {
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
    setDirectoryShow,
  } = useContext(readerContext);
  const { inMobile } = useContext(globalContext);
  const { isCollected, operateShelf } = useMyShelf(book?.presentableId);

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
  };

  const closeAllPopup = () => {
    setSharePopupShow(false);
    setFontSizePopupShow(false);
    setThemePopupShow(false);
  };

  useEffect(() => {
    if (sharePopupShow) setSharePopupShow(false);
    if (fontSizePopupShow) setFontSizePopupShow(false);
    if (themePopupShow) setThemePopupShow(false);
    // eslint-disable-next-line
  }, [scrollTop]);

  useEffect(() => {
    document.body.style.overflowY =
      (sharePopupShow || fontSizePopupShow || themePopupShow) && inMobile
        ? "hidden"
        : "auto";
  }, [sharePopupShow, fontSizePopupShow, themePopupShow, inMobile]);

  return inMobile ? (
    // mobile
    <div className="mobile-operater-wrapper">
      <div
        className="operater-btn"
        onClick={() => {
          closeAllPopup();
          setDirectoryShow(true);
        }}
      >
        <i className="iconfont fl-icon-xiaoshuomulu"></i>
        <div className="operater-btn-label">目录</div>
      </div>

      {isCollected ? (
        <div
          className="operater-btn"
          onClick={() => {
            closeAllPopup();
            operateShelf(book);
          }}
        >
          <i className="iconfont fl-icon-shoucangxiaoshuoyishoucang"></i>
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
          <i className="iconfont fl-icon-shoucangxiaoshuo"></i>
          <div className="operater-btn-label">加入书架</div>
        </div>
      )}

      <div
        className="operater-btn"
        onClick={() => {
          closeAllPopup();
          setSharePopupShow(true);
        }}
      >
        <i className="iconfont fl-icon-fenxiang"></i>
        <div className="operater-btn-label">分享</div>
      </div>

      <div
        className="operater-btn"
        onClick={() => {
          closeAllPopup();
          setFontSizePopupShow(true);
        }}
      >
        <div className="iconfont">A</div>
        <div className="operater-btn-label">字号</div>
      </div>

      <div
        className="operater-btn"
        onClick={() => {
          closeAllPopup();
          setThemePopupShow(true);
        }}
      >
        <i className="iconfont fl-icon-beijingyanse"></i>
        <div className="operater-btn-label">背景色</div>
      </div>

      {fontSizePopupShow && (
        <div
          className="operater-popup"
          onClick={() => setFontSizePopupShow(false)}
        >
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
        <div
          className="operater-popup"
          onClick={() => setThemePopupShow(false)}
        >
          <div className="theme-popup" onClick={(e) => e.stopPropagation()}>
            {themeList.map((item) => {
              return (
                <div
                  className={`theme-btn ${
                    theme.bookColor === item.bookColor && "active"
                  }`}
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

      <Share
        show={sharePopupShow}
        setShareShow={setSharePopupShow}
        exhibit={book}
      />
    </div>
  ) : (
    // PC
    <div className="operater-wrapper">
      <div className="operater-btns-box">
        <OperateBtn
          icon="fl-icon-xiaoshuomulu"
          onClick={() => {
            closeAllPopup();
            setDirectoryShow(true);
          }}
        />

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
              className={`operater-popup ${
                theme?.type === 1 ? "dark" : "light"
              }`}
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
            <div
              className="operater-popup"
              style={{ width: themePopupShow ? "228px" : "0" }}
            >
              {themeList.map((item) => {
                return (
                  <div
                    className={`theme-btn ${
                      theme.bookColor === item.bookColor && "active"
                    }`}
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

const OperateBtn = (props: {
  icon?: string;
  text?: string;
  slot?: any;
  onClick?: (e: any) => void;
}) => {
  const { icon, text, slot, onClick } = props;
  const { theme } = useContext(readerContext);

  return (
    <div
      className={`operate-btn-wrapper ${theme?.type === 1 ? "dark" : "light"}`}
      style={{ backgroundColor: theme?.bookColor }}
      onClick={(e) => e.stopPropagation()}
    >
      {slot}
      {icon && <i className={`iconfont ${icon}`} onClick={onClick}></i>}
      {text && (
        <span className="iconfont" onClick={onClick}>
          {text}
        </span>
      )}
    </div>
  );
};
