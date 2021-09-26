import React, { useContext } from "react";
import "./reader.scss";
import { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Slider } from "antd";
import { ExhibitItem, ThemeItem } from "../../utils/interface";
import { getExhibitsInfo, getInfo } from "../../api/freelog";
import { themeList } from "../../api/data";
import CSSTransition from "react-transition-group/CSSTransition";
import { BackTop } from "../../components/back-top/back-top";
import { useMyScroll, useMyShelf } from "../../utils/hooks";

const readerContext = React.createContext<any>({});

export const ReaderScreen = (props: any) => {
  const id = props.match.params.id;
  const myFontSize = Number(localStorage.getItem("fontSize"));
  const myTheme = JSON.parse(localStorage.getItem("theme") || "null");
  const myBgTheme = localStorage.getItem("bgTheme");
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [fontSize, setFontSize] = useState(myFontSize || 22);
  const [theme, setTheme] = useState<ThemeItem>(myTheme || themeList[0]);
  const [bgTheme, setBgTheme] = useState<"light" | "dark">(myBgTheme === "dark" ? "dark" : "light");
  const [barShow, setBarShow] = useState(false);
  const [fontSizePopupShow, setFontSizePopupShow] = useState(false);
  const [themePopupShow, setThemePopupShow] = useState(false);

  const context = {
    id,
    book,
    setBook,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    bgTheme,
    setBgTheme,
    barShow,
    setBarShow,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
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
    if (fontSizePopupShow || themePopupShow) {
      setFontSizePopupShow(false);
      setThemePopupShow(false);
      return;
    }

    setBarShow(!barShow);
  };

  useEffect(() => {
    getBookInfo();
    // eslint-disable-next-line
  }, [id]);

  return (
    <readerContext.Provider value={context}>
      <div className={`reader-wrapper text-center transition ${bgTheme}`} onClick={() => clickPage()}>
        <Header />
        <Body />
        <Operater />

        <CSSTransition in={barShow} classNames="slide-up" timeout={500} unmountOnExit>
          <Footer />
        </CSSTransition>
      </div>
    </readerContext.Provider>
  );
};

const Header = () => {
  const { book, barShow, setBarShow } = useContext(readerContext);
  const history = useHistory();

  return (
    <div
      className={`reader-header-wrapper p-fixed lt-0 w-100p flex-row align-center space-between h-73 pl-30 pr-72 b-box transition z-100 ${
        !barShow && "hide"
      }`}
      onMouseOver={() => setBarShow(true)}
      onMouseOut={() => setBarShow(false)}
    >
      <div className="flex-row align-center">
        {/* logo */}
        <div className="logo f-italic fw-bold fs-22 cur-pointer transition" onClick={() => history.push("/")}>
          freelog novel
        </div>

        {/* 书名 */}
        <div className="ml-20 fs-16 flex-row">
          <div className="link cur-pointer transition" onClick={() => history.push(`/detail/${book?.presentableId}`)}>
            {book?.presentableTitle}
          </div>
        </div>
      </div>

      <div className="link fs-16 cur-pointer transition" onClick={() => history.push(`/shelf`)}>
        我的书架
      </div>
    </div>
  );
};

const Body = () => {
  const history = useHistory();
  const { id, fontSize, theme } = useContext(readerContext);
  const [content, setContent] = useState<string[]>([]);

  const getContent = useCallback(async () => {
    const info: any = await getInfo("getFileStreamById", [id], () => {
      history.replace("/");
    });
    const content = info.data.split(/\s/g).filter((item: string) => !!item);
    setContent(content);
  }, [id, history]);

  useEffect(() => {
    getContent();
    // eslint-disable-next-line
  }, [id]);

  return (
    <div
      className="body-wrapper transition"
      style={{
        backgroundColor: theme?.readerBg,
        lineHeight: 2,
        fontSize: fontSize + "px",
      }}
    >
      {content.map((item, index) => {
        return (
          <p className="text-breakAll" key={item + index}>
            {item}
          </p>
        );
      })}
    </div>
  );
};

const Operater = () => {
  const { scrollTop } = useMyScroll();
  const {
    book,
    fontSize,
    setFontSize,
    setTheme,
    bgTheme,
    setBgTheme,
    barShow,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
  } = useContext(readerContext);
  const { isCollected, operateShelf } = useMyShelf(book?.presentableId);

  useEffect(() => {
    if (fontSizePopupShow) setFontSizePopupShow(false);
    if (themePopupShow) setThemePopupShow(false);
    // eslint-disable-next-line
  }, [scrollTop]);

  return (
    <div className={`operater-wrapper p-fixed ${barShow ? "show" : "hide"}`}>
      <div className="p-absolute rb-0 flex-column align-end">
        <div className="back-top">
          <BackTop
            onClick={() => {
              setFontSizePopupShow(false);
              setThemePopupShow(false);
            }}
          >
            <OperateBtn icon="&#xe600;" />
          </BackTop>
        </div>

        <OperateBtn
          icon="&#xe6f1;"
          onClick={() => {
            setFontSizePopupShow(false);
            setThemePopupShow(false);
          }}
        />

        {isCollected ? (
          <OperateBtn
            icon="&#xe658;"
            onClick={() => {
              operateShelf(book);
              setFontSizePopupShow(false);
              setThemePopupShow(false);
            }}
          />
        ) : (
          <OperateBtn
            icon="&#xe64c;"
            onClick={() => {
              operateShelf(book);
              setFontSizePopupShow(false);
              setThemePopupShow(false);
            }}
          />
        )}

        <OperateBtn
          icon="&#xe650;"
          onClick={() => {
            setFontSizePopupShow(true);
            setThemePopupShow(false);
          }}
          slot={
            <div className="text-center over-h transition" style={{ maxWidth: fontSizePopupShow ? "300px" : "0" }}>
              <i className="iconfont fs-16 text-center">&#xe650;</i>
              <Slider
                className="w-150 mx-10"
                defaultValue={fontSize}
                min={16}
                max={26}
                dots
                onChange={(e) => {
                  setFontSize(e);
                  localStorage.setItem("fontSize", String(e));
                }}
              />
            </div>
          }
        />

        <OperateBtn
          icon="&#xe823;"
          onClick={() => {
            setThemePopupShow(true);
            setFontSizePopupShow(false);
          }}
          slot={
            <div className="text-center transition" style={{ maxWidth: themePopupShow ? "300px" : "0" }}>
              {themeList.map((theme) => {
                return (
                  <div
                    className="theme-btn w-32 h-32 brs-50p ml-10 cur-pointer"
                    key={theme.name}
                    title={theme.name}
                    style={{ backgroundColor: theme.readerBg }}
                    onClick={() => {
                      setTheme(theme);
                      localStorage.setItem("theme", JSON.stringify(theme));
                    }}
                  ></div>
                );
              })}
            </div>
          }
        />

        {bgTheme === "light" ? (
          <OperateBtn
            icon="&#xe65f;"
            onClick={() => {
              setBgTheme("dark");
              setFontSizePopupShow(false);
              setThemePopupShow(false);
              localStorage.setItem("bgTheme", "dark");
            }}
          />
        ) : (
          <OperateBtn
            icon="&#xe68f;"
            onClick={() => {
              setBgTheme("light");
              setFontSizePopupShow(false);
              setThemePopupShow(false);
              localStorage.setItem("bgTheme", "light");
            }}
          />
        )}
      </div>
    </div>
  );
};

const OperateBtn = (props: { icon: string; disabled?: boolean; onClick?: (e: any) => void; slot?: any }) => {
  const { icon, disabled = false, onClick, slot } = props;

  return (
    <div
      className={`operate-btn-wrapper mt-self-24 over-h text-center cur-pointer ${disabled && "disabled"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {slot}
      <i className="operate-btn iconfont fs-26 text-center" onClick={onClick}>
        {icon}
      </i>
    </div>
  );
};

const Footer = () => {
  const { book } = useContext(readerContext);
  const history = useHistory();

  return (
    <div
      className="footer-wrapper p-fixed lb-0 w-100p h-56 text-center z-100 transition"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 text-center-column" onClick={() => history.push(`/`)}>
        <i className="iconfont fs-20 lh-20">&#xe663;</i>
        <div className="fs-12 mt-3">首页</div>
      </div>

      <div className="flex-1 text-center-column" onClick={() => history.push(`/detail/${book?.presentableId}`)}>
        <div className="detail-icon p-relative w-20 h-20 brs-4 text-center over-h">
          <img className="h-100p" src={book?.coverImages[0]} alt={book?.presentableTitle} />
        </div>

        <div className="fs-12 mt-3">详情</div>
      </div>

      <div className="shelf-btn w-200 h-35 brs-40 fs-15 text-center mx-20" onClick={() => history.push(`/shelf`)}>
        我的书架
      </div>
    </div>
  );
};
