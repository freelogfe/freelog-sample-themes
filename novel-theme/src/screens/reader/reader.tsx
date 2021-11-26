import React, { useContext } from "react";
import "./reader.scss";
import { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { ExhibitItem, ThemeItem } from "../../utils/interface";
import { getExhibitsInfo, getInfo } from "../../api/freelog";
import { themeList } from "../../api/data";
import { BackTop } from "../../components/back-top/back-top";
import { useMyScroll, useMyShelf } from "../../utils/hooks";
import { Header } from "../../components/header/header";

const readerContext = React.createContext<any>({});

export const ReaderScreen = (props: any) => {
  const id = props.match.params.id;
  const myFontSize = Number(localStorage.getItem("fontSize"));
  const myTheme = JSON.parse(localStorage.getItem("theme") || "null");
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [fontSize, setFontSize] = useState(myFontSize || 22);
  const [theme, setTheme] = useState<ThemeItem>(myTheme || themeList[0]);
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
    }
  };

  useEffect(() => {
    getBookInfo();
    // eslint-disable-next-line
  }, [id]);

  return (
    <readerContext.Provider value={context}>
      <div
        className="reader-wrapper flex-column align-center transition"
        style={{ backgroundColor: theme?.bgColor }}
        onClick={() => clickPage()}
      >
        <Header />

        <Body />

        <Operater />
      </div>
    </readerContext.Provider>
  );
};

const Body = () => {
  const history = useHistory();
  const { book, id, fontSize, theme } = useContext(readerContext);
  const [content, setContent] = useState<string[]>([]);

  const getContent = useCallback(async () => {
    const info: any = await getInfo("getFileStreamById", [id], () => {
      history.goBack();
    });
    if (!info) return;

    const content = info.data.split(/\s/g).filter((item: string) => !!item);
    setContent(content);
  }, [id, history]);

  useEffect(() => {
    getContent();
    // eslint-disable-next-line
  }, [id]);

  return (
    <div className="body-wrapper flex-1 flex-column">
      <div className="bread-crumbs fw-bold">{book?.presentableTitle}</div>

      <div
        className={`content flex-1 transition ${theme?.type === 1 ? "dark" : "light"}`}
        style={{
          backgroundColor: theme?.bookColor,
          fontSize: fontSize + "px",
          lineHeight: fontSize + 14 + "px",
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

      <div className="footer-bar flex-row align-center transition" style={{ backgroundColor: theme?.bookColor }}>
        <div className={`footer-btn flex-1 text-center cur-pointer transition`} onClick={() => console.log(123)}>
          上一章
        </div>
        <div
          className="footer-btn flex-1 text-center cur-pointer transition"
          onClick={() => history.push("/detail/" + id)}
        >
          书籍详情
        </div>
        <div className={`footer-btn flex-1 text-center cur-pointer transition`} onClick={() => console.log(123)}>
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
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
  } = useContext(readerContext);
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

  useEffect(() => {
    if (fontSizePopupShow) setFontSizePopupShow(false);
    if (themePopupShow) setThemePopupShow(false);
    // eslint-disable-next-line
  }, [scrollTop]);

  return (
    <div className="operater-wrapper p-fixed l-50p">
      <div className="p-absolute rb-0 flex-column align-end">
        <OperateBtn icon="fl-icon-xiaoshuomulu" onClick={() => {}} />

        {isCollected ? (
          <OperateBtn
            icon="fl-icon-shoucangxiaoshuoyishoucang"
            onClick={() => {
              operateShelf(book);
              setFontSizePopupShow(false);
              setThemePopupShow(false);
            }}
          />
        ) : (
          <OperateBtn
            icon="fl-icon-shoucangxiaoshuo"
            onClick={() => {
              operateShelf(book);
              setFontSizePopupShow(false);
              setThemePopupShow(false);
            }}
          />
        )}

        <OperateBtn
          icon="fl-icon-fenxiang"
          onClick={() => {
            setFontSizePopupShow(false);
            setThemePopupShow(false);
          }}
        />

        <OperateBtn
          icon="fl-icon-bianji"
          onClick={() => {
            setFontSizePopupShow(true);
            setThemePopupShow(false);
          }}
          slot={
            <div
              className={`fontsize-popup text-center over-h transition ${theme?.type === 1 ? "dark" : "light"}`}
              style={{ width: fontSizePopupShow ? "162px" : "0" }}
            >
              <div className="fontsize-label fw-bold" onClick={() => changeFontSize(0)}>
                A-
              </div>
              <div className="fontsize-value text-center">{fontSize}</div>
              <div className="fontsize-label fw-bold" onClick={() => changeFontSize(1)}>
                A+
              </div>
            </div>
          }
        />

        <OperateBtn
          icon="fl-icon-beijingyanse"
          onClick={() => {
            setThemePopupShow(true);
            setFontSizePopupShow(false);
          }}
          slot={
            <div className="text-center over-h transition" style={{ maxWidth: themePopupShow ? "228px" : "0" }}>
              {themeList.map((item) => {
                return (
                  <div
                    className={`theme-btn brs-50p text-center cur-pointer ${
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
          <BackTop
            onClick={() => {
              setFontSizePopupShow(false);
              setThemePopupShow(false);
            }}
          >
            <OperateBtn icon="fl-icon-huidaodingbu" />
          </BackTop>
        </div>
      </div>
    </div>
  );
};

const OperateBtn = (props: { icon: string; onClick?: (e: any) => void; slot?: any }) => {
  const { icon, onClick, slot } = props;
  const { theme } = useContext(readerContext);

  return (
    <div
      className={`operate-btn-wrapper over-h text-center cur-pointer transition ${
        theme?.type === 1 ? "dark" : "light"
      }`}
      style={{ backgroundColor: theme?.bookColor }}
      onClick={(e) => e.stopPropagation()}
    >
      {slot}
      <i className={`iconfont text-center ${icon}`} onClick={onClick}></i>
    </div>
  );
};
