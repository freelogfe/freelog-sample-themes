import React, { useContext, useRef } from "react";
import "./detail.scss";
import { useState, useEffect, useCallback } from "react";
import { Header } from "../../components/header/header";
import { ExhibitItem } from "../../api/interface";
import { getExhibitInfo, getExhibitSignCount } from "../../api/freelog";
import { formatDate } from "../../utils/common";
import { Tags } from "../../components/tags/tags";
import { useMyHistory, useMyShelf } from "../../utils/hooks";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { Share } from "../../components/share/share";
import { BreadCrumbs } from "../../components/breadcrumbs/breadcrumbs";
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
    const exhibitInfo = await getExhibitInfo(id, { isLoadVersionProperty: 1 });
    const signCountData = await getExhibitSignCount(id);

    setBook({
      ...exhibitInfo.data.data,
      signCount: signCountData?.data.data[0]?.count,
    });
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
  // const directory = Array.from({ length: 12 }, () => book?.exhibitName || "目录名称");

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
      {/* 书籍信息 */}
      <div className="book-info">
        <div className="book-base-info">
          <div className="book-cover">
            <img className="book-cover-image" src={book?.coverImages[0]} alt={book?.exhibitName} />
          </div>

          <div className="book-content">
            <div className="content-top">
              <div className="book-name">{book?.exhibitName}</div>

              <div className="book-author">{book?.articleInfo.articleOwnerName}</div>

              <div className="tags">
                <Tags data={book?.tags || []} />
              </div>
            </div>

            <div className="content-bottom">
              <div className="sign-count">{book?.signCount}人签约</div>
              <div className="share-btn" onClick={() => share()}>
                <span className="share-btn-text">
                  <i className="freelog fl-icon-fenxiang"></i>
                  分享给更多人
                </span>
              </div>
              <input id="href" className="hidden-input" value={href} readOnly />
            </div>
          </div>
        </div>

        <div className="book-date-info">
          <div className="date-info">创建时间：{formatDate(book?.createDate)}</div>

          <div className="date-info">最近更新：{formatDate(book?.updateDate)}</div>
        </div>

        <div className="operate-btns">
          <div className="btn main-btn mobile" onClick={() => history.switchPage(`/reader/${book?.exhibitId}`)}>
            立即阅读
          </div>
          <div className={`btn ${isCollected ? "delete" : "collect"}`} onClick={() => operateShelf(book)}>
            {isCollected ? "移出书架" : "加入书架"}
          </div>
        </div>
      </div>

      {/* 书籍简介 */}
      {book?.versionInfo?.exhibitProperty?.intro && (
        <div className="book-intro">
          <div className="intro-title">内容简介</div>

          <div className={`intro ${introState === 1 ? "fold" : "unfold"}`}>
            <div className="intro-content" ref={introContent}>
              {book?.versionInfo?.exhibitProperty?.intro}
            </div>

            {introState === 1 && (
              <div className="view-all-btn" onClick={() => setIntroState(3)}>
                ...查看全部
              </div>
            )}
          </div>
        </div>
      )}

      {/* 书籍目录 */}
      {/* <div className="directory-list">
        <div className="directory-header">
          <div className="directory-title">目录</div>
          <div className="view-all-btn" onClick={() => setDirectoryShow(true)}>
            全部{directory.length}
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
      <BreadCrumbs />

      {book && (
        <div className="content-box">
          {/* 书籍信息 */}
          <div className="book-info">
            <div className="book-cover">
              <img className="book-cover-image" src={book?.coverImages[0]} alt={book?.exhibitName} />
            </div>

            <div className="book-content">
              <div className="book-name">{book?.exhibitName}</div>

              <div className="book-author">{book?.articleInfo.articleOwnerName}</div>

              <div className="tags">
                <Tags data={book?.tags || []} />
              </div>

              <div className="create-date">创建时间：{formatDate(book?.createDate)}</div>

              <div className="update-date">最近更新：{formatDate(book?.updateDate)}</div>

              <div className="btns-box">
                <div className="operate-btns">
                  <div className="btn main-btn" onClick={() => history.switchPage(`/reader/${book?.exhibitId}`)}>
                    立即阅读
                  </div>
                  <div className={`btn ${isCollected ? "delete" : "collect"}`} onClick={() => operateShelf(book)}>
                    {isCollected ? "移出书架" : "加入书架"}
                  </div>
                </div>

                <div className="other-btns">
                  <div className="sign-count">{book?.signCount}人签约</div>
                  <div
                    className="share-btn"
                    onMouseOver={() => setShareShow(true)}
                    onMouseLeave={() => setShareShow(false)}
                  >
                    <span className={`share-btn-text ${shareShow && "active"}`}>
                      <i className="freelog fl-icon-fenxiang"></i>
                      分享给更多人
                    </span>

                    <Share show={shareShow} exhibit={book} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 书籍简介 */}
          {book?.versionInfo?.exhibitProperty?.intro && (
            <div className="book-intro">
              <div className="intro-title">内容简介</div>

              <div className={`intro ${introState === 1 ? "fold" : "unfold"}`}>
                <div className="intro-content" ref={introContent}>
                  {book?.versionInfo?.exhibitProperty?.intro}
                </div>

                {introState === 1 && (
                  <div className="view-all-btn" onClick={() => setIntroState(3)}>
                    ...查看全部
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 书籍目录 */}
          {/* <div className="directory-list">
            <div className="directory-title">
              目录
              <span className="directory-length">({directory.length}章)</span>
            </div>

            <div className="directory-list-box">
              {directory.map((item, index) => {
                return (
                  <div className="directory-item" key={item + index}>
                    <div className="directory-title">{item}</div>
                    <div className="directory-status">已授权</div>
                  </div>
                );
              })}
            </div>

            <div className="no-more">— 已加载全部章节 —</div>
          </div> */}
        </div>
      )}
    </div>
  );
};
