import React, { useContext, useRef } from "react";
import "./detail.scss";
import { useState, useEffect, useCallback } from "react";
import { Header } from "../../components/header/header";
import { useHistory } from "react-router-dom";
import { ExhibitItem } from "../../utils/interface";
import { getExhibitsInfo, getExhibitsSignCount } from "../../api/freelog";
import { formatDate, getResourceName } from "../../utils/common";
import { Tags } from "../../components/tags/tags";
import { useMyShelf } from "../../utils/hooks";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { Share } from "../../components/share/share";

const detailContext = React.createContext<any>({});

export const DetailScreen = (props: any) => {
  const { id } = props.match.params;
  const [book, setBook] = useState<ExhibitItem | null>(null);

  const getBookInfo = useCallback(async () => {
    const exhibitInfo = await getExhibitsInfo(id, { isLoadResourceDetailInfo: 1, isLoadResourceVersionInfo: 1 });
    const signCountData = await getExhibitsSignCount(id);
    const { presentableTitle, resourceVersionInfo, resourceInfo } = exhibitInfo.data.data;
    const username = getResourceName(resourceInfo.resourceName, 0);
    const intro = resourceVersionInfo.description || resourceInfo.intro || `${presentableTitle}-${username}`;
    setBook({ ...exhibitInfo.data.data, intro, username, signCount: signCountData.data.data[0].count });
  }, [id]);

  useEffect(() => {
    getBookInfo();
    // eslint-disable-next-line
  }, []);

  return (
    <detailContext.Provider value={{ book }}>
      <div className="detail-wrapper flex-column align-center">
        <Header />

        {/* {book?.coverImages && (
          <div className="bg-cover-box p-relative w-100p pb-75p over-h">
            <img className="bg-cover p-absolute lt-0 w-100p" src={book?.coverImages[0]} alt={book?.presentableTitle} />
          </div>
        )} */}

        <BookBody />

        <Footer />

        <ThemeEntrance />
      </div>
    </detailContext.Provider>
  );
};

const BookBody = () => {
  const { book } = useContext(detailContext);
  const { isCollected, operateShelf } = useMyShelf(book?.presentableId);
  const history = useHistory();
  const introContent = useRef<any>();
  const [introState, setIntroState] = useState(0);
  const [shareShow, setShareShow] = useState(false);

  useEffect(() => {
    const introHeight = introContent.current?.clientHeight;
    if (introHeight > 60) setIntroState(1);
  }, [book]);

  return (
    <div className="content flex-column align-center">
      <div className="bread-crumbs w-100p">书籍详情</div>

      {book && (
        <div className="content-box">
          {/* 书籍信息 */}
          <div className="book-info flex-row">
            <div className="book-cover over-h text-center">
              <img className="h-100p" src={book.coverImages[0]} alt={book.presentableTitle} />
            </div>

            <div className="book-content flex-1">
              <div className="book-name fw-bold">{book.presentableTitle}</div>

              <div className="book-author">{book.username}</div>

              <div className="tags">
                <Tags data={book.tags || []} size="large" />
              </div>

              <div className="create-date">创建时间：{formatDate(book.createDate)}</div>

              <div className="update-date">最近更新：{formatDate(book.updateDate)}</div>

              <div className="btns-box flex-row align-center space-between">
                <div className="flex-row">
                  <div
                    className="btn read-btn text-center fw-bold cur-pointer"
                    onClick={() => history.push(`/reader/${book.presentableId}`)}
                  >
                    立即阅读
                  </div>

                  {isCollected ? (
                    <div className="btn delete-btn text-center fw-bold cur-pointer" onClick={() => operateShelf(book)}>
                      移出书架
                    </div>
                  ) : (
                    <div className="btn collect-btn text-center fw-bold cur-pointer" onClick={() => operateShelf(book)}>
                      加入书架
                    </div>
                  )}
                </div>

                <div className="flex-row align-center">
                  <div className="sign-count">{book.signCount}人签约</div>
                  <div
                    className="share-btn p-relative flex-row align-center cur-pointer"
                    onMouseOver={() => setShareShow(true)}
                    onMouseLeave={() => setShareShow(false)}
                  >
                    <span className={`transition ${shareShow && "active"}`}>
                      <i className="freelog fl-icon-fenxiang"></i>
                      分享给更多人
                    </span>

                    <Share show={shareShow} exhibit={book} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="book-intro">
            <div className="intro-title fw-bold">内容简介</div>

            {(book.intro || book.presentableTitle) && (
              <div className={`intro p-relative over-h ${introState === 1 ? "fold" : "unfold"}`}>
                <div className="intro-content" ref={introContent}>
                  {book.intro || `${book.presentableTitle}-${book.username}`}
                </div>

                {introState === 1 && (
                  <div className="view-all-btn p-absolute rb-0 bg-white cur-pointer" onClick={() => setIntroState(3)}>
                    ...查看全部
                  </div>
                )}
              </div>
            )}
          </div>

          {/* <div className="directory-list">TODO</div> */}
        </div>
      )}
    </div>
  );
};
