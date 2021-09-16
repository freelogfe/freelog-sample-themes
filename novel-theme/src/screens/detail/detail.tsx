import React, { useContext } from "react";
import "./detail.scss";
import { useState, useEffect, useCallback } from "react";
import { Header } from "../../components/header/header";
import { useHistory } from "react-router-dom";
import { CollectExhibitItem, ExhibitItem } from "../../utils/interface";
import { getExhibitsInfo, getInfo } from "../../api/freelog";
import { formatDate } from "../../utils/common";
import { Tags } from "../../components/tags/tags";
import CSSTransition from "react-transition-group/CSSTransition";

const detailContext = React.createContext<any>({});

export const DetailScreen = (props: any) => {
  const id = props.match.params.id;
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [popupShow, setPopupShow] = useState<boolean>(false);

  const getBookInfo = useCallback(async () => {
    const resourceInfo = await getInfo(id, "getResourceInfoById");
    const bookInfo = await getExhibitsInfo(id);
    const { intro, username } = resourceInfo.data.data;
    setBook({ ...bookInfo.data.data, intro, username });
  }, [id]);

  useEffect(() => {
    getBookInfo();
    // eslint-disable-next-line
  }, [id]);

  return (
    <detailContext.Provider value={{ book, setPopupShow }}>
      <div className="detail-wrapper flex-column align-center">
        <Header />

        {book?.coverImages && (
          <div className="bg-cover-box p-relative w-100p pb-75p over-h">
            <img
              className="bg-cover p-absolute lt-0 w-100p"
              src={book?.coverImages[0]}
              alt={book?.presentableTitle}
            />
          </div>
        )}

        <BookBody />

        <CSSTransition
          in={popupShow}
          classNames="fade-in"
          timeout={500}
          unmountOnExit
        >
          <IntroPopup />
        </CSSTransition>
      </div>
    </detailContext.Provider>
  );
};

const BookBody = () => {
  const { book, setPopupShow } = useContext(detailContext);
  const [isCollected, setIfConnect] = useState<boolean>(false);
  const history = useHistory();

  const operateMyShelf = () => {
    if (!book) return;

    const myShelf: CollectExhibitItem[] = JSON.parse(
      localStorage.getItem("myShelf") || "[]"
    );

    if (isCollected) {
      const index = myShelf.findIndex(
        (item) => item.presentableId === book?.presentableId
      );
      myShelf.splice(index, 1);
      localStorage.setItem("myShelf", JSON.stringify(myShelf));
      setIfConnect(false);
    } else {
      const collectExhibit: CollectExhibitItem = {
        presentableId: book.presentableId,
        cover: book.coverImages[0] || "",
        presentableTitle: book.presentableTitle,
        username: book.username,
      };
      myShelf.push(collectExhibit);
      localStorage.setItem("myShelf", JSON.stringify(myShelf));
      setIfConnect(true);
    }
  };

  useEffect(() => {
    if (!book) return;

    const myShelf: CollectExhibitItem[] = JSON.parse(
      localStorage.getItem("myShelf") || "[]"
    );
    const ifExist = myShelf.some(
      (item) => item.presentableId === book?.presentableId
    );
    setIfConnect(ifExist);
    // eslint-disable-next-line
  }, [book]);

  return (
    <div className="body-wrapper w-100p b-box text-center z-1">
      {book && (
        <div className="content-wrapper b-box bg-white">
          {/* 书籍信息 */}
          <div
            className="body-info pb-36"
            style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
          >
            <div className="book-cover-box p-relative brs-6 b-box bg-white">
              <div className="w-100p h-100p brs-4 over-h text-center">
                <img
                  className="h-100p"
                  src={book?.coverImages[0]}
                  alt={book?.presentableTitle}
                />
                <div className="book-shadow"></div>
              </div>
            </div>

            <div className="book-content flex-column">
              <div className="book-name fw-bold">{book?.presentableTitle}</div>

              <div className="book-author mt">{book?.username}</div>

              <div className="mt">
                <Tags data={book?.tags || []} size="large" />
              </div>

              <div className="pc-btns mt-25">
                <div
                  className="main-btn flex-1 mw-200 h-40"
                  onClick={() => history.push(`/reader/${book?.presentableId}`)}
                >
                  <span>立即阅读</span>
                </div>

                <div
                  className={`collect-btn flex-1 mw-200 h-40 brs-4 ml-20 b-box bg-white text-center cur-pointer shrink-0 transition ${
                    isCollected && "collect"
                  }`}
                  onClick={operateMyShelf}
                >
                  {isCollected ? "取消收藏" : "加入书架"}
                </div>
              </div>
            </div>
          </div>

          {(book?.intro || book?.presentableTitle) && (
            <div className="mt-30">
              <div
                className="book-intro fs-14 lh-25 cur-pointer transition"
                onClick={() => setPopupShow(true)}
              >
                {book?.intro || `${book?.presentableTitle}-${book?.username}`}
              </div>
            </div>
          )}

          <div className="mobile-btns mt-25">
            <div
              className="main-btn flex-1 h-40"
              onClick={() => history.push(`/reader/${book?.presentableId}`)}
            >
              <span>立即阅读</span>
            </div>

            <div
              className={`collect-btn flex-1 h-40 brs-4 ml-20 b-box bg-white text-center cur-pointer shrink-0 transition ${
                isCollected && "collect"
              }`}
              onClick={operateMyShelf}
            >
              {isCollected ? "取消收藏" : "加入书架"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IntroPopup = () => {
  const { book, setPopupShow } = useContext(detailContext);
  const infoList = [
    {
      title: "作者",
      value: book?.username,
    },
    {
      title: "创建时间",
      value: formatDate(book?.createDate),
    },
    {
      title: "更新时间",
      value: formatDate(book?.updateDate),
    },
    {
      title: "分类",
      value: book?.tags?.join("、") || "无",
    },
  ];

  useEffect(() => {
    document.getElementById("popup")?.addEventListener("touchmove", (e) => {
      e.preventDefault();
    });
    return () => {
      document.getElementById("popup")?.addEventListener("touchmove", (e) => {
        e.preventDefault();
      });
    };
  }, []);

  return (
    <div
      id="popup"
      className="intro-modal-wrapper p-fixed full lt-0 z-200 text-center"
      onClick={() => setPopupShow(false)}
    >
      <div
        className="p-relative w-80p mw-500 mh-80p flex-column bg-white brs-12 py-40 px-32 b-box"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          className="p-absolute w-20 h-20 rt-20 cur-pointer"
          src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/dialog_close.a5f40ec8.png"
          alt="close"
          onClick={() => setPopupShow(false)}
        />

        <div className="fs-18 mb-16 lh-27">书名</div>
        <div className="intro lh-24">{book.presentableTitle}</div>

        {/* <div className="fs-18 mt-32 mb-16 lh-27">简介</div>
        <div className="intro lh-24 flex-1 h-0 y-auto">
          {book.intro || `${book.presentableTitle}-${book.username}`}
        </div> */}

        <div className="fs-18 mt-32 mb-16 lh-27">信息</div>
        {infoList.map((info) => (
          <div
            className="flex-row align-center space-between mt-self-12"
            key={info.title}
          >
            <div className="form-title">{info.title}</div>
            <div className="form-value">{info.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
