import React, { useContext, useRef } from "react";
import "./detail.scss";
import AuthLinkAbnormal from "../../assets/images/auth-link-abnormal.png";
import { useState, useEffect, useCallback } from "react";
import { Header } from "../../components/header/header";
import { ExhibitItem } from "../../api/interface";
import { getExhibitAuthStatus, getExhibitInfo, getExhibitSignCount } from "../../api/freelog";
import { formatDate } from "../../utils/common";
import { Tags } from "../../components/tags/tags";
import { useMyHistory, useMyShelf } from "../../utils/hooks";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { Share } from "../../components/share/share";
import { LoginBtn } from "../../components/login-btn/login-btn";
import { globalContext } from "../../router";
import { Directory } from "../../components/directory/directory";
import { showToast } from "../../components/toast/toast";

const detailContext = React.createContext<any>({});

export const DetailScreen = (props: any) => {
  const { id } = props.match.params;
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [directoryShow, setDirectoryShow] = useState(false);

  const getBookInfo = useCallback(async () => {
    const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
      getExhibitInfo(id, { isLoadVersionProperty: 1 }),
      getExhibitSignCount(id),
      getExhibitAuthStatus(id),
    ]);
    const bookInfo = {
      ...exhibitInfo.data.data,
      signCount: signCountData.data.data[0].count,
      defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType,
    };

    setBook(bookInfo);
  }, [id]);

  useEffect(() => {
    document.documentElement.scroll({ top: 0 });
    document.body.scroll({ top: 0 });

    getBookInfo();
    // eslint-disable-next-line
  }, []);

  return (
    <detailContext.Provider value={{ book, setDirectoryShow }}>
      <div className="detail-wrapper">
        <Header />

        <BookBody />

        <Footer />

        <LoginBtn />

        <ThemeEntrance />

        <Directory book={book} directoryShow={directoryShow} setDirectoryShow={setDirectoryShow} />
      </div>
    </detailContext.Provider>
  );
};

const BookBody = () => {
  const { inMobile } = useContext(globalContext);
  const { book } = useContext(detailContext);
  const { isCollected, operateShelf } = useMyShelf(book?.exhibitId);
  const history = useMyHistory();
  const introContent = useRef<any>();
  const [introState, setIntroState] = useState(0);
  const [shareShow, setShareShow] = useState(false);
  const [href, setHref] = useState("");
  // const directory = Array.from({ length: 12 }, () => book?.exhibitTitle || "????????????");

  const share = () => {
    // ????????????
    const input: any = document.getElementById("href");
    input.select();
    document.execCommand("Copy");
    showToast("?????????????????????");
  };

  useEffect(() => {
    setHref((window.location as any).currentURL);
  }, []);

  useEffect(() => {
    const introHeight = introContent.current?.clientHeight;
    const foldHeight = inMobile ? 120 : 60;
    if (introHeight > foldHeight) setIntroState(1);
  }, [book, inMobile]);

  useEffect(() => {
    document.body.style.overflowY = shareShow && inMobile ? "hidden" : "auto";
  }, [shareShow, inMobile]);

  return inMobile ? (
    // mobile
    <div className="mobile-content">
      {/* ????????????????????? */}
      {![0, 4].includes(book.defaulterIdentityType) && (
        <div className="auth-link-abnormal-tip">
          <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="???????????????" />
          <div className="tip-text">??????????????????????????????</div>
        </div>
      )}
      {/* ???????????? */}
      <div className="book-info">
        <div className="book-base-info">
          <div className="book-cover">
            <img className="book-cover-image" src={book?.coverImages[0]} alt={book?.exhibitTitle} />
          </div>

          <div className="book-content">
            <div className="content-top">
              <div className="book-name">{book?.exhibitTitle}</div>

              <div className="book-author">{book?.articleInfo.articleOwnerName}</div>

              <div className="tags">
                <Tags data={book?.tags || []} />
              </div>
            </div>

            <div className="content-bottom">
              <div className="sign-count">{book?.signCount}?????????</div>
              <div className="share-btn" onClick={() => share()}>
                <span className="share-btn-text">
                  <i className="freelog fl-icon-fenxiang"></i>
                  ??????????????????
                </span>
              </div>
              <input id="href" className="hidden-input" value={href} readOnly />
            </div>
          </div>
        </div>

        <div className="book-date-info">
          <div className="date-info">???????????????{formatDate(book?.createDate)}</div>

          <div className="date-info">???????????????{formatDate(book?.updateDate)}</div>
        </div>

        <div className="operate-btns">
          <div
            className={`btn main-btn mobile ${![0, 4].includes(book.defaulterIdentityType) && "disabled"}`}
            onClick={() => history.switchPage(`/reader/${book?.exhibitId}`)}
          >
            ????????????
          </div>
          <div className={`btn ${isCollected ? "delete" : "collect-btn mobile"}`} onClick={() => operateShelf(book)}>
            {isCollected ? "????????????" : "????????????"}
          </div>
        </div>
      </div>
      {/* ???????????? */}
      <div className="book-intro">
        <div className="intro-title">????????????</div>

        {book?.versionInfo?.exhibitProperty?.intro ? (
          <div className={`intro ${introState === 1 ? "fold" : "unfold"}`}>
            <div className="intro-content" ref={introContent}>
              {book?.versionInfo?.exhibitProperty?.intro}
            </div>

            {introState === 1 && (
              <div className="view-all-btn" onClick={() => setIntroState(3)}>
                ...????????????
              </div>
            )}
          </div>
        ) : (
          <div className="no-intro-tip">????????????</div>
        )}
      </div>

      {/* ???????????? */}
      {/* <div className="directory-list">
        <div className="directory-header">
          <div className="directory-title">??????</div>
          <div className="view-all-btn" onClick={() => setDirectoryShow(true)}>
            ??????{directory.length}
            <i className="freelog fl-icon-zhankaigengduo"></i>
          </div>
        </div>

        <div className="directory-list-box">
          {directory
            .filter((_, index) => index < 5)
            .map((item, index) => {
              return (
                <div className="directory-item" key={item + index}>
                  <div className="item-content">
                    <div className="directory-title">{item}</div>
                    <i className="freelog fl-icon-zhankaigengduo"></i>
                  </div>
                </div>
              );
            })}
        </div>
      </div> */}
    </div>
  ) : (
    // PC
    <div className="content">
      {book && (
        <div className="content-box">
          {/* ????????????????????? */}
          {![0, 4].includes(book.defaulterIdentityType) && (
            <div className="auth-link-abnormal-tip">
              <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="???????????????" />
              <div className="tip-text">??????????????????????????????</div>
            </div>
          )}
          {/* ???????????? */}
          <div className="book-info">
            <div className="book-cover">
              <img className="book-cover-image" src={book?.coverImages[0]} alt={book?.exhibitTitle} />
            </div>

            <div className="book-content">
              <div className="book-name">{book?.exhibitTitle}</div>

              <div className="book-author">{book?.articleInfo.articleOwnerName}</div>

              <div className="tags">
                <Tags data={book?.tags || []} />
              </div>

              <div className="create-date">???????????????{formatDate(book?.createDate)}</div>

              <div className="update-date">???????????????{formatDate(book?.updateDate)}</div>

              <div className="btns-box">
                <div className="operate-btns">
                  <div
                    className={`btn main-btn ${![0, 4].includes(book.defaulterIdentityType) && "disabled"}`}
                    onClick={() => history.switchPage(`/reader/${book?.exhibitId}`)}
                  >
                    ????????????
                  </div>
                  <div
                    className={`btn ${isCollected ? "warning-btn" : "collect-btn"}`}
                    onClick={() => operateShelf(book)}
                  >
                    {isCollected ? "????????????" : "????????????"}
                  </div>
                </div>

                <div className="other-btns">
                  <div className="sign-count">{book?.signCount}?????????</div>
                  <div
                    className="share-btn"
                    onMouseOver={() => setShareShow(true)}
                    onMouseLeave={() => setShareShow(false)}
                  >
                    <span className={`share-btn-text ${shareShow && "active"}`}>
                      <i className="freelog fl-icon-fenxiang"></i>
                      ??????????????????
                    </span>

                    <Share show={shareShow} exhibit={book} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ???????????? */}
          <div className="book-intro">
            <div className="intro-title">????????????</div>

            {book?.versionInfo?.exhibitProperty?.intro ? (
              <div className={`intro ${introState === 1 ? "fold" : "unfold"}`}>
                <div className="intro-content" ref={introContent}>
                  {book?.versionInfo?.exhibitProperty?.intro}
                </div>

                {introState === 1 && (
                  <div className="view-all-btn" onClick={() => setIntroState(3)}>
                    ...????????????
                  </div>
                )}
              </div>
            ) : (
              <div className="no-intro-tip">????????????</div>
            )}
          </div>

          {/* ???????????? */}
          {/* <div className="directory-list">
            <div className="directory-title">
              ??????
              <span className="directory-length">({directory.length}???)</span>
            </div>

            <div className="directory-list-box">
              {directory.map((item, index) => {
                return (
                  <div className="directory-item" key={item + index}>
                    <div className="directory-title">{item}</div>
                    <div className="directory-status">?????????</div>
                  </div>
                );
              })}
            </div>

            <div className="no-more">??? ????????????????????? ???</div>
          </div> */}
        </div>
      )}
    </div>
  );
};
