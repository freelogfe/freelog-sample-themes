import React, { useContext, useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { freelogApp } from "freelog-runtime";
import CSSTransition from "react-transition-group/CSSTransition";
import { globalContext } from "../../router";
import { BackTop } from "../../components/back-top/back-top";
import { Header } from "../../components/header/header";
import { CatalogueModal } from "../../components/catalogue-modal/catalogue-modal";
import { showToast } from "../../components/toast/toast";
import { Loader } from "../../components/loader/loader";
import { useMyHistory, useMyScroll, useMyShelf } from "../../utils/hooks";
import { getUrlParams } from "../../utils/common";
import { CollectionList, ExhibitItem, ThemeItem } from "../../api/interface";
import { readerThemeList } from "../../api/data";
import Lock from "../../assets/images/lock.png";
import AuthLinkAbnormal from "../../assets/images/auth-link-abnormal.png";
import "./reader.scss";

export const readerContext = React.createContext<any>({});

/** 阅读页 */
export const ReaderScreen = (props: any) => {
  const { id } = getUrlParams(props.location.search);
  const { collection } = getUrlParams(props.location.search);
  const { subId } = getUrlParams(props.location.search);
  const { inMobile } = useContext(globalContext);
  const myTheme = JSON.parse(localStorage.getItem("theme") || "null");
  const [book, setBook] = useState<ExhibitItem | null>(null);
  const [fontSize, setFontSize] = useState(22);
  const [theme, setTheme] = useState<ThemeItem>(myTheme?.bgColor ? myTheme : readerThemeList[0]);
  const [fontSizePopupShow, setFontSizePopupShow] = useState(false);
  const [themePopupShow, setThemePopupShow] = useState(false);
  const [changeChapterPopupShow, setChangeChapterPopupShow] = useState<boolean>(false);
  const [mobileBarShow, setMobileBarShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [modalStatus, setModalStatus] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [collectionList, setCollectionList] = useState<CollectionList[]>([]);
  const [currentSortId, setCurrentSortId] = useState<number>(0);
  const [recommendList, setRecommendList] = useState<ExhibitItem[]>([]);
  const location = useLocation();
  const skip = useRef(0);
  const widgetList = useRef<any>({});

  /** 获取小说信息 */
  const getNovelInfo = useCallback(async () => {
    setLoading(true);
    const [exhibitInfo, statusInfo] = await Promise.all([
      freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
      freelogApp.getExhibitAuthStatus(id)
    ]);

    const { articleType } = exhibitInfo.data.data.articleInfo;
    if (articleType === 2) {
      getCollectionList(true);
      getCollectionInfo();
    }
    getRecommendList();
    setBook({
      ...exhibitInfo.data.data,
      defaulterIdentityType: statusInfo.data.data[0]?.defaulterIdentityType ?? null
    });
  }, [id]);

  // 获取合集下的单品列表
  const getCollectionList = useCallback(
    async (init = false, skipChapter = 0) => {
      try {
        if (!init && collectionList.length >= total) {
          return;
        }

        skip.current = init ? 0 : skip.current + 30;

        const subList = await (freelogApp as any).getCollectionSubList(id, {
          skip: skipChapter ? skipChapter : skip.current,
          limit: 30
        });
        const { dataList, totalItem } = subList.data.data;
        setTotal(totalItem);

        if (dataList.length !== 0) {
          const ids = dataList.map((item: any) => item.itemId).join();
          const statusInfo = await (freelogApp as any).getCollectionSubAuth(id, { itemIds: ids });
          if (statusInfo.data.data) {
            (dataList as CollectionList[]).forEach(item => {
              const index = statusInfo.data.data.findIndex(
                (resultItem: { itemId: string }) => resultItem.itemId === item.itemId
              );
              if (index !== -1) {
                item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
              }
            });
          }
          // return dataList;

          setCollectionList(pre => [...pre, ...dataList]);
        }
      } catch (error) {
        console.error("Failed to get collection list", error);
      }
    },
    [id, collectionList]
  );

  /** 获取推荐列表 */
  const getRecommendList = async () => {
    const res = await (freelogApp as any).getExhibitRecommend(id, {
      recommendNorm: "sameAuthorAndType,sameTagAndType,sameType,latestCreate",
      size: 10
    });
    const { data: recommendData } = res.data;
    const sliceData = recommendData.slice(0, 6);

    setRecommendList(sliceData);
  };

  // 获取单品详细信息
  const getCollectionInfo = async () => {
    const res = await (freelogApp as any).getCollectionSubInfo(id, { itemId: subId });
    const { sortId } = res.data.data;

    setBook((pre: any) => {
      return {
        ...pre,
        articleInfo: res.data.data.articleInfo
      };
    });
    getCollectionList(false, sortId - 15 < 0 ? 0 : sortId - 15);
    setCurrentSortId(sortId);
  };

  /** 加载分享插件 */
  const mountShareWidget = async () => {
    if (inMobile) return;

    if (widgetList.current.share) await widgetList.current.share.unmount();

    const subDeps = await freelogApp.getSelfDependencyTree();
    const widgetData = subDeps.find(item => item.articleName === "ZhuC/Freelog插件-展品分享");
    if (!widgetData) return;

    const { articleId, parentNid, nid } = widgetData;
    const topExhibitId = freelogApp.getTopExhibitId();

    const params = {
      articleId,
      parentNid,
      nid,
      topExhibitId,
      container: document.getElementById("share")!,
      renderWidgetOptions: {
        data: {
          exhibit: { ...book, itemId: subId, collection },
          type: "小说",
          routerType: "reader"
        }
      }
    };
    widgetList.current.share = await freelogApp.mountArticleWidget(params);
  };

  /** 加载 markdown 插件 */
  const mountMarkdownWidget = async (exhibitInfo: ExhibitItem, content: string) => {
    const subDeps = await freelogApp.getSelfDependencyTree();
    const widgetData = subDeps.find(item => item.articleName === "ZhuC/Freelog插件-markdown解析");
    if (!widgetData) return;

    const { articleId, parentNid, nid } = widgetData;
    const topExhibitId = freelogApp.getTopExhibitId();

    const myFontSize = Number(localStorage.getItem("fontSize")) || 22;
    setFontSize(myFontSize);

    const params = {
      articleId,
      parentNid,
      nid,
      topExhibitId,
      container: document.getElementById("markdown")!,
      renderWidgetOptions: {
        data: { exhibitInfo, content, fontSize: myFontSize }
      }
      // widget_entry: "https://localhost:8202",
    };
    widgetList.current.markdown = await freelogApp.mountArticleWidget(params);
  };

  /** 通知插件更新数据 */
  const setWidgetData = (widget: string, key: string, value: any) => {
    widgetList.current[widget]?.setData({ [key]: value });
  };

  /** 点击页面（关闭所有打开的弹窗） */
  const clickPage = () => {
    setWidgetData("share", "show", false);
    if (fontSizePopupShow) setFontSizePopupShow(false);
    if (themePopupShow) setThemePopupShow(false);
    // if (!changeChapterPopupShow) setChangeChapterPopupShow(true);
    !changeChapterPopupShow ? setChangeChapterPopupShow(true) : setChangeChapterPopupShow(false);
    if (inMobile) setMobileBarShow(true);
  };

  const handleChangeSort = (status: string) => {
    const compare = (a: any, b: any) => {
      return status === "asc" ? a.sortId - b.sortId : b.sortId - a.sortId;
    };

    setCollectionList(() => [...collectionList.sort(compare)]);
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
    if (collection) {
      getCollectionInfo();
    }

    const handleLastViewedHistory = async (data: { id: string; subId: string }) => {
      const lastViewedResponse = await freelogApp.getUserData("novelLastViewedHistory");
      const lastViewed = lastViewedResponse?.data?.data || [];

      if (!lastViewed.length) {
        lastViewed.push({ id: data.id, subId: data.subId });
        freelogApp.setUserData("novelLastViewedHistory", lastViewed);
        return;
      }

      const index = lastViewed.findIndex((i: { id: string }) => i.id === data.id);

      if (index !== -1) {
        // 如果找到相同的数据，则替换它
        lastViewed[index] = { id: data.id, subId: data.subId };
      } else {
        // 如果没有找到相同的数据，则新增一条记录
        lastViewed.push({ id: data.id, subId: data.subId });
      }

      freelogApp.setUserData("novelLastViewedHistory", lastViewed);
    };

    return () => {
      const { id, subId } = getUrlParams(location.search);

      if (subId) {
        handleLastViewedHistory({ id, subId });
      }
    };
  }, [location]);

  useEffect(() => {
    setWidgetData("markdown", "fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    setWidgetData("markdown", "themeColor", theme);
  }, [theme]);

  const context = {
    id,
    collection,
    subId,
    inMobile,
    book,
    setBook,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    modalStatus,
    setModalStatus,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
    changeChapterPopupShow,
    setChangeChapterPopupShow,
    mobileBarShow,
    setMobileBarShow,
    loading,
    setLoading,
    mountShareWidget,
    mountMarkdownWidget,
    setWidgetData,
    currentSortId,
    total,
    collectionList,
    recommendList
  };

  return (
    <readerContext.Provider value={context}>
      <div
        className={`reader-wrapper ${inMobile && "in-mobile"}`}
        style={{ backgroundColor: theme?.bgColor }}
        onClick={() => clickPage()}
      >
        <CSSTransition
          in={(inMobile && mobileBarShow) || !inMobile}
          classNames="slide-up"
          timeout={150}
          unmountOnExit
        >
          <Header readerHeader={true} />
        </CSSTransition>
        <ReaderBody />
        <OperaterBtns />

        {/* 目录弹窗 */}
        {modalStatus && (
          <CatalogueModal
            modalStatus
            book={book}
            collectionList={collectionList}
            total={total}
            closeCatalogueModal={() => setModalStatus(false)}
            getCollectionList={getCollectionList}
            updateSort={(status: string) => handleChangeSort(status)}
          />
        )}
      </div>
    </readerContext.Provider>
  );
};

/** 阅读页主体内容 */
const ReaderBody = () => {
  const history = useMyHistory();
  const location = useLocation();
  const { scrollToTop } = useMyScroll();
  const { userData } = useContext(globalContext);
  const {
    inMobile,
    book,
    id,
    collection,
    subId,
    theme,
    mountMarkdownWidget,
    loading,
    setLoading,
    currentSortId,
    total,
    collectionList,
    recommendList
  } = useContext(readerContext);

  const [content, setContent] = useState<string>("");
  const [defaulterIdentityType, setDefaulterIdentityType] = useState<number | null>(null);

  const preSubId =
    (collection &&
      currentSortId !== 0 &&
      collectionList.filter((i: any) => i.sortId === currentSortId - 1)[0]?.itemId) ||
    0;
  const nextSubId =
    (collection &&
      currentSortId !== total &&
      collectionList.filter((i: any) => i.sortId === currentSortId + 1)[0]?.itemId) ||
    0;

  /** 获取小说内容 */
  const getContent = useCallback(async () => {
    let authErrType: any = -1;
    const statusInfo = collection
      ? await (freelogApp as any).getCollectionSubAuth(id, { itemIds: subId })
      : await freelogApp.getExhibitAuthStatus(id);
    if (statusInfo.data.data) {
      authErrType = statusInfo.data.data[0].defaulterIdentityType;
    }
    setDefaulterIdentityType(authErrType!);

    if (authErrType === 0) {
      // 已签约并且授权链无异常
      const info: any = collection
        ? await (freelogApp as any).getCollectionSubFileStream(id, { itemId: subId })
        : await freelogApp.getExhibitFileStream(id);
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
  }, [id, subId]);

  /** 获取授权 */
  const getAuth = async () => {
    const authResult = await freelogApp.addAuth(id, { immediate: true });
    const { status } = authResult;
    if (status === 0) getContent();
  };

  /** 跳转详情 */
  const toDetailFromRecommend = (exhibitId: string) => {
    history.switchPage(`/detail?id=${exhibitId}`);
  };

  useEffect(() => {
    getContent();
    // eslint-disable-next-line
  }, [id, location]);

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
            backgroundColor: theme?.bookColor
          } as any
        }
      >
        {book.articleInfo?.status === 1 ? (
          <React.Fragment>
            {book.onlineStatus === 0 ? (
              <div>
                <div className="exceptional-box">
                  <div className="icon">
                    <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"></i>
                  </div>

                  <span className="exceptional-text"> 作品已下架，无法访问 </span>
                </div>
              </div>
            ) : ![0, 4].includes(book?.defaulterIdentityType) ? (
              <div className="exceptional-box">
                <div className="icon">
                  <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
                </div>

                <span className="exceptional-text"> 作品异常，无法访问 </span>
              </div>
            ) : defaulterIdentityType === 4 || userData?.isLogin === false ? (
              <div className="lock-box">
                <img className="lock" src={Lock} alt="未授权" />
                <div className="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
                <div className="get-btn" onClick={() => getAuth()}>
                  获得授权
                </div>
              </div>
            ) : !["阅读"].includes(book?.articleInfo.resourceType[0]) ? (
              <div className="exceptional-box">
                <div className="icon">
                  <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
                </div>

                <span className="exceptional-text">此作品格式暂不支持访问 </span>
              </div>
            ) : defaulterIdentityType === 0 ? (
              <React.Fragment>
                <div id="markdown" />
                {collection && currentSortId === total && (
                  <div className="no-more">— 已加载全部章节 —</div>
                )}
              </React.Fragment>
            ) : (
              <></>
            )}
          </React.Fragment>
        ) : (
          <div className="freeze-exhibit">
            <div className="icon">
              <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
            </div>
            <span className="exceptional-text"> 此作品因违规无法访问 </span>
          </div>
        )}

        {currentSortId === total && (
          <div className={`recommend-wrap ${theme?.type === 1 ? "dark" : "light"}`}>
            {/* 合集-上一章节-下一章节 */}
            <React.Fragment>
              {/* 更多书籍 */}
              <div className="more">更多书籍</div>
              <div className="recommend-box">
                {recommendList.map((item: ExhibitItem) => {
                  return (
                    <div
                      className="recommend-item"
                      key={item.exhibitId}
                      onClick={() => toDetailFromRecommend(item.exhibitId)}
                    >
                      <div className="cover-image">
                        <img src={item.coverImages[0]} alt={item.exhibitTitle} />
                      </div>

                      <div className="recommend-info">
                        <span className="title">{item.exhibitTitle}</span>
                        <span className="name">{item?.articleInfo?.articleOwnerName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
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
            <div className="second-text-btn" onClick={() => history.switchPage(`/detail?id=${id}`)}>
              {book?.exhibitTitle}
            </div>
          </div>
        </div>
        {/* 内容 */}
        <div
          className={`content ${theme?.type === 1 ? "dark" : "light"}`}
          style={
            {
              backgroundColor: theme?.bookColor
            } as any
          }
        >
          {book.articleInfo?.status === 1 ? (
            <React.Fragment>
              {book.onlineStatus === 0 ? (
                <div>
                  <div className="exceptional-box">
                    <div className="icon">
                      <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"></i>
                    </div>

                    <span className="exceptional-text"> 作品已下架，无法访问 </span>
                  </div>
                </div>
              ) : ![0, 4].includes(book?.defaulterIdentityType) ? (
                <div className="exceptional-box">
                  <div className="icon">
                    <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
                  </div>

                  <span className="exceptional-text"> 作品异常，无法访问 </span>
                </div>
              ) : defaulterIdentityType === 4 || userData?.isLogin === false ? (
                <div className="lock-box">
                  <img className="lock" src={Lock} alt="未授权" />
                  <div className="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
                  <div className="get-btn" onClick={() => getAuth()}>
                    获得授权
                  </div>
                </div>
              ) : !["阅读"].includes(book?.articleInfo.resourceType[0]) ? (
                <div className="exceptional-box">
                  <div className="icon">
                    <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
                  </div>

                  <span className="exceptional-text">此作品格式暂不支持访问 </span>
                </div>
              ) : defaulterIdentityType === 0 ? (
                <React.Fragment>
                  <div id="markdown" />
                  {collection && currentSortId === total && (
                    <div className="no-more">— 已加载全部章节 —</div>
                  )}
                </React.Fragment>
              ) : (
                <></>
              )}
            </React.Fragment>
          ) : (
            <div className="freeze-exhibit">
              <div className="icon">
                <i className="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
              </div>
              <span className="exceptional-text"> 此作品因违规无法访问 </span>
            </div>
          )}
        </div>
        <div className={`recommend-wrap ${theme?.type === 1 ? "dark" : "light"}`}>
          {currentSortId === total && (
            <React.Fragment>
              <div className="more">更多书籍</div>
              <div className="recommend-box">
                {recommendList.map((item: ExhibitItem) => {
                  return (
                    <div
                      className="recommend-item"
                      key={item.exhibitId}
                      onClick={() => toDetailFromRecommend(item.exhibitId)}
                    >
                      <div className="cover-image">
                        <img src={item.coverImages[0]} alt={item.exhibitTitle} />
                      </div>

                      <div className="recommend-info">
                        <span className="title">{item.exhibitTitle}</span>
                        <span className="name">{item?.articleInfo?.articleOwnerName}</span>
                        <div className="tags-wrap">
                          {item.tags.map((tag: string, index: number) => {
                            return (
                              <div
                                className="tag"
                                key={index}
                                onClick={e => {
                                  e.stopPropagation();
                                  history.switchPage(`/home?tags=${tag}`);
                                }}
                              >
                                {tag}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          )}
          {/* 合集-上一章节-下一章节 */}
          {collection && (
            <React.Fragment>
              <div
                className="pre-next-chapter"
                style={
                  {
                    backgroundColor: theme?.bookColor
                  } as any
                }
              >
                <div
                  className={`pre ${currentSortId === 1 && "disabled"}`}
                  onClick={() => {
                    scrollToTop();
                    history.switchPage(
                      `/reader?collection=${true}&id=${book.exhibitId}&subId=${preSubId}`
                    );
                  }}
                >
                  上一章
                </div>
                <div
                  className="detail"
                  onClick={() => history.switchPage(`/detail?id=${book?.exhibitId}`)}
                >
                  书籍详情
                </div>
                <div
                  className={`next ${currentSortId === total && "disabled"}`}
                  onClick={() => {
                    scrollToTop();
                    history.switchPage(
                      `/reader?collection=${true}&id=${book.exhibitId}&subId=${nextSubId}`
                    );
                  }}
                >
                  下一章
                </div>
              </div>
            </React.Fragment>
          )}
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
    setModalStatus,
    fontSizePopupShow,
    setFontSizePopupShow,
    themePopupShow,
    setThemePopupShow,
    changeChapterPopupShow,
    setChangeChapterPopupShow,
    mobileBarShow,
    setMobileBarShow,
    mountShareWidget,
    setWidgetData,
    currentSortId,
    total,
    collectionList,
    collection
  } = useContext(readerContext);
  const history = useMyHistory();
  const { isCollected, operateShelf } = useMyShelf(book?.exhibitId);
  const { scrollToTop } = useMyScroll();
  const [href, setHref] = useState("");
  let changingFontSize = useRef(false);
  let changingFontSizeTimer = useRef<any>(null);

  const preSubId =
    (collection &&
      currentSortId !== 0 &&
      collectionList.filter((i: any) => i.sortId === currentSortId - 1)[0]?.itemId) ||
    0;
  const nextSubId =
    (collection &&
      currentSortId !== total &&
      collectionList.filter((i: any) => i.sortId === currentSortId + 1)[0]?.itemId) ||
    0;

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
    setChangeChapterPopupShow(false);
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
    if (scrollTop === 0 && !mobileBarShow) {
      setMobileBarShow(true);
      setChangeChapterPopupShow(true);
    }
    if (scrollTop !== 0 && mobileBarShow) {
      setMobileBarShow(false);
      setChangeChapterPopupShow(false);
    }
    // eslint-disable-next-line
  }, [scrollTop]);

  useEffect(() => {
    document.body.style.overflowY =
      (fontSizePopupShow || themePopupShow) && inMobile ? "hidden" : "auto";
  }, [fontSizePopupShow, themePopupShow, inMobile]);

  return inMobile ? (
    // mobile
    <CSSTransition in={mobileBarShow} classNames="slide-down" timeout={150} unmountOnExit>
      <div className="mobile-operater-wrapper">
        {/* 目录 */}
        {collection && (
          <div
            className="operater-btn"
            onClick={() => {
              closeAllPopup();
              setModalStatus(true);
            }}
          >
            <i className="freelog fl-icon-xiaoshuomulu"></i>
            <div className="operater-btn-label">目录</div>
          </div>
        )}

        {/* 收藏 */}
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

        {/* 分享 */}
        <div
          className="operater-btn"
          onClick={e => {
            e.stopPropagation();
            closeAllPopup();
            share();
          }}
        >
          <i className="freelog fl-icon-fenxiang"></i>
          <div className="operater-btn-label">分享</div>
        </div>

        {/* 字号 */}
        <div
          className="operater-btn"
          onClick={e => {
            e.stopPropagation();
            closeAllPopup();
            setFontSizePopupShow(true);
          }}
        >
          <div className="freelog">A</div>
          <div className="operater-btn-label">字号</div>
        </div>

        {/* 切换背景颜色 */}
        <div
          className="operater-btn"
          onClick={e => {
            e.stopPropagation();

            closeAllPopup();
            setThemePopupShow(true);
          }}
        >
          <i className="freelog fl-icon-beijingyanse"></i>
          <div className="operater-btn-label">背景色</div>
        </div>

        {fontSizePopupShow && (
          <div className="operater-popup" onClick={() => setFontSizePopupShow(false)}>
            <div className="fontsize-popup" onClick={e => e.stopPropagation()}>
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
            <div className="theme-popup" onClick={e => e.stopPropagation()}>
              {readerThemeList.map(item => {
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

        {/* 上一章 | 下一章 */}
        {collection && changeChapterPopupShow && book.defaulterIdentityType === 0 && (
          <div className="operater-popup chapter" onClick={() => setChangeChapterPopupShow(false)}>
            <div className="chapter-popup" onClick={e => e.stopPropagation()}>
              <div
                className={`chapter-label ${currentSortId === 1 && "disabled"}`}
                onClick={() => {
                  scrollToTop();
                  inMobile
                    ? history.replacePage(
                        `/reader?collection=${true}&id=${book.exhibitId}&subId=${preSubId}`
                      )
                    : history.switchPage(
                        `/reader?collection=${true}&id=${book.exhibitId}&subId=${preSubId}`
                      );
                }}
              >
                上一章
              </div>
              <div className="chapter-value">
                <span className="current">{currentSortId}</span>
                <span className="total">/{total}</span>
              </div>
              <div
                className={`chapter-label ${currentSortId === total && "disabled"}`}
                onClick={() => {
                  scrollToTop();
                  inMobile
                    ? history.replacePage(
                        `/reader?collection=${true}&id=${book.exhibitId}&subId=${nextSubId}`
                      )
                    : history.switchPage(
                        `/reader?collection=${true}&id=${book.exhibitId}&subId=${nextSubId}`
                      );
                }}
              >
                下一章
              </div>
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
        {/* 目录 */}
        {collection && (
          <OperateBtn
            icon="fl-icon-xiaoshuomulu"
            onClick={() => {
              closeAllPopup();
              setModalStatus(true);
            }}
          />
        )}

        {/* 收藏 */}
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

        {/* 分享 */}
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

        {/* 字号 */}
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

        {/* 切换背景颜色 */}
        <OperateBtn
          icon="fl-icon-beijingyanse"
          onClick={() => {
            closeAllPopup();
            setThemePopupShow(true);
          }}
          slot={
            <div className="operater-popup" style={{ width: themePopupShow ? "228px" : "0" }}>
              {readerThemeList.map(item => {
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

        {/* 回到顶部 */}
        <BackTop onClick={() => closeAllPopup()}>
          <OperateBtn icon="fl-icon-huidaodingbu" />
        </BackTop>
      </div>
    </div>
  );
};

/** 功能操作按钮 */
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
      onClick={e => e.stopPropagation()}
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
