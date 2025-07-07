import React, { useContext, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { freelogApp } from "freelog-runtime";
import { globalContext } from "../../router";
import { Header } from "../../components/header/header";
import { NewTags } from "../../components/tags/new-tags";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { LoginBtn } from "../../components/login-btn/login-btn";
import { showToast } from "../../components/toast/toast";

import { CollectionList, ExhibitItem } from "../../api/interface";
import { formatDate, getUrlParams, formatWordCount } from "../../utils/common";
import { useMyHistory, useMyScroll, useMyShelf } from "../../utils/hooks";
import AuthLinkAbnormal from "../../assets/images/auth-link-abnormal.png";
import Freeze from "../../assets/images/freeze.png";
import Lock from "../../assets/images/mini-lock.png";
import RightArrow from "../../assets/images/right-arrow.png";

import "./detail.scss";

const detailContext = React.createContext<any>({});

/**
 * 获取集合项目标题的公共函数
 * @param novel 小说对象
 * @param collectionItem 集合项目对象
 * @returns 返回应该显示的标题
 */
const getCollectionItemTitle = (novel: any, collectionItem: any) => {
  const itemTitle = novel?.versionInfo?.exhibitProperty?.catalogueProperty?.collection_item_title;
  // 作品标题
  if (itemTitle === "collection_item_title_rtitle") {
    return (collectionItem?.articleInfo as any)?.articleTitle || "";
  }
  // 连载编号
  if (itemTitle === "collection_item_title_sn") {
    return (
      collectionItem?.articleInfo?.articleProperty?.number ||
      (collectionItem?.articleInfo as any)?.articleTitle ||
      ""
    );
  }
  // 自定义
  if (itemTitle === "collection_item_title_custom") {
    return collectionItem.itemTitle || (collectionItem?.articleInfo as any)?.articleTitle || "";
  }
  // 不显示
  if (itemTitle === "collection_item_title_empty") {
    return (collectionItem?.articleInfo as any)?.articleTitle || "";
  }
};

/** 详情页 */
export const DetailScreen = (props: any) => {
  const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
  const { id } = getUrlParams(props.location.search);
  const [novel, setNovel] = useState<ExhibitItem | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [collectionRecentDate, setCollectionRecentDate] = useState<string>("");
  const skip = useRef(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const [collectionDataDesc, setCollectionDataDesc] = useState<any>(null);
  const [latestNovelData, setLatestNovelData] = useState<any[]>([]);
  const [historyNovelData, setHistoryNovelData] = useState<any[]>([]);

  // 获取合集下的单品列表
  const getCollectionList = useCallback(
    async (init = false) => {
      try {
        if (!init && (novel?.collectionList?.length ?? 0) >= total) {
          return;
        }

        skip.current = init ? 0 : skip.current + 50;

        const subList = await (freelogApp as any).getCollectionSubList(id, {
          skip: skip.current,
          limit: 50,
          isShowDetailInfo: 1
        });
        const { dataList, totalItem } = subList.data.data;
        setTotal(totalItem);

        if (dataList.length !== 0) {
          const ids = dataList.map((item: any) => item.itemId).join();
          const statusInfo = await (freelogApp as any).getCollectionSubAuth(id, { itemIds: ids });
          if (statusInfo.data.data) {
            (dataList as ExhibitItem[]).forEach((item: any) => {
              const index = statusInfo.data.data.findIndex(
                (resultItem: { itemId: string }) => resultItem.itemId === item.itemId
              );
              if (index !== -1) {
                item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
              }
            });
          }

          setNovel((pre: any) => ({
            ...pre,
            collectionList: pre?.collectionList ? [...pre?.collectionList, ...dataList] : dataList
          }));
        }
      } catch (error) {
        console.error("Failed to get collection list", error);
      }
    },
    [id, novel]
  );

  /** 获取合集的倒序内容 */
  const getCollectionListBySortTypeDesc = async () => {
    const res = await (freelogApp as any).getCollectionSubList(id, {
      sortType: -1,
      skip: 0,
      limit: 50,
      isShowDetailInfo: 1
    });

    setCollectionDataDesc(res.data.data);
  };

  // 最近更新的一话
  const latestNovelItem = useMemo(() => {
    if (novel?.articleInfo?.articleType === 2) {
      return collectionDataDesc?.dataList?.[0];
    }
    return null;
  }, [novel?.articleInfo?.articleType, collectionDataDesc]);

  // 用户是否已点击最近更新一话
  const isClickedLatestNovel = useMemo(() => {
    if (!latestNovelData) return null;
    const existingIndex = latestNovelData.findIndex((i: any) => i.id === id);

    if (existingIndex !== -1) {
      return latestNovelData[existingIndex];
    }

    return null;
  }, [latestNovelData, id]);

  // 当前漫画的阅读历史
  const currentHistoryNovel = useMemo(() => {
    const res = historyNovelData?.find((i: any) => i.id === id);
    return res?.info || [];
  }, [historyNovelData, id]);

  // 记录用户点击最近更新一话
  const handleLatestNovel = async (item: any) => {
    if (latestNovelItem?.itemId === item.itemId) {
      const newLatestNovelData = [...(latestNovelData || [])];
      const existingIndex = newLatestNovelData.findIndex((i: any) => i.id === id);

      if (existingIndex !== -1) {
        newLatestNovelData[existingIndex] = { id, info: item };
      } else {
        newLatestNovelData.push({ id, info: item });
      }

      setLatestNovelData(newLatestNovelData);
      await freelogApp.setUserData("novelLatestViewedHistory", newLatestNovelData);
    }
  };

  // 记录用户阅读历史
  const handleReaderHistory = async (item: any) => {
    const newHistoryNovelData = [...(historyNovelData || [])];
    const existingIndex = newHistoryNovelData.findIndex((i: any) => i.id === id);

    if (existingIndex !== -1) {
      const existingNovel = newHistoryNovelData[existingIndex];

      // 确保info是一个数组
      if (!Array.isArray(existingNovel.info)) {
        existingNovel.info = existingNovel.info ? [existingNovel.info] : [];
      }

      // 检查当前章节是否已存在于记录中
      const chapterIndex = existingNovel.info.findIndex((chapter: any) => {
        return chapter.itemId === item.itemId;
      });

      if (chapterIndex === -1) {
        // 如果章节不存在，添加到数组中
        existingNovel.info.push(item);
      }

      // 更新历史记录
      newHistoryNovelData[existingIndex] = existingNovel;
    } else {
      // 如果漫画ID不存在，创建新记录，将info设为数组
      newHistoryNovelData.push({
        id,
        info: [item]
      });
    }

    setHistoryNovelData(newHistoryNovelData);
    await freelogApp.setUserData("novelViewedHistory", newHistoryNovelData);
  };

  /** 获取小说信息 */
  const getNovelInfo = useCallback(async () => {
    try {
      const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
        freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitSignCount(id),
        freelogApp.getExhibitAuthStatus(id)
      ]);

      const latestViewedResponse = await freelogApp.getUserData("novelLatestViewedHistory");
      setLatestNovelData(latestViewedResponse?.data?.data);

      const novelViewedResponse = await freelogApp.getUserData("novelViewedHistory");
      setHistoryNovelData(novelViewedResponse?.data?.data || []);

      const articleType = exhibitInfo.data.data.articleInfo.articleType;
      if (articleType === 2) {
        getCollectionList(true);
        // 目的：获取合集的倒序内容Add commentMore actions
        getCollectionListBySortTypeDesc();
        setSortOrder(
          (novel?.versionInfo?.exhibitProperty?.catalogueProperty as any)?.collection_sort_list ===
            "collection_sort_descending"
            ? "desc"
            : "asc"
        );
      }

      const bookInfo = {
        ...exhibitInfo.data.data,
        signCount: signCountData.data.data[0]?.count ?? 0,
        defaulterIdentityType: statusInfo.data.data[0]?.defaulterIdentityType ?? null
      };

      setNovel(bookInfo);
    } catch (error) {
      console.error("Failed to get novel info", error);
    }
  }, [id]);

  const getRecentDate = async () => {
    const getRecentDate = await (freelogApp as any).getCollectionSubList(id, {
      skip: skip.current,
      limit: 1,
      sortType: -1
    });

    setCollectionRecentDate(getRecentDate.data.data?.dataList[0]?.createDate);
  };

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    getRecentDate();
    getNovelInfo();
  }, []);

  useEffect(() => {
    if (novel?.collectionList?.length && scrollTop + clientHeight + 1 >= scrollHeight) {
      getCollectionList(false);
    }
  }, [scrollTop, clientHeight, scrollHeight]);

  return (
    <detailContext.Provider
      value={{
        novel,
        setNovel,
        sortOrder,
        setSortOrder,
        latestNovelItem,
        isClickedLatestNovel,
        currentHistoryNovel,
        handleLatestNovel,
        handleReaderHistory
      }}
    >
      <div className="detail-wrapper">
        <Header />
        <DetailBody total={total} collectionRecentDate={collectionRecentDate} />
        <Footer />
        <LoginBtn />
        <ThemeEntrance />
      </div>
    </detailContext.Provider>
  );
};

/** 详情页主体内容 */
const DetailBody = (props: { total: number; collectionRecentDate: string }) => {
  const { total, collectionRecentDate } = props;
  const { inMobile, userData } = useContext(globalContext);
  const {
    novel,
    setNovel,
    sortOrder,
    setSortOrder,
    latestNovelItem,
    isClickedLatestNovel,
    currentHistoryNovel,
    handleLatestNovel,
    handleReaderHistory
  } = useContext(detailContext);
  const collectionList = novel?.collectionList;
  const { isCollected, operateShelf } = useMyShelf(novel?.exhibitId);
  const history = useMyHistory();
  const introContent = useRef<any>();
  const shareWidget = useRef<any>();
  const [introState, setIntroState] = useState(0);
  const [href, setHref] = useState("");
  // const [sortOrder, setSortOrder] = useState("asc");

  /** 移动端分享 */
  const share = () => {
    // 复制链接
    const input: any = document.getElementById("href");
    input.select();
    document.execCommand("Copy");
    showToast("链接复制成功～");
    // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: novel.exhibitId } });
  };

  /** 加载分享插件 */
  const mountShareWidget = async () => {
    if (inMobile) return;

    const container = document.getElementById("share");
    if (!container) return;

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
      container,
      renderWidgetOptions: {
        data: { exhibit: novel, type: "小说", routerType: "detail" }
      }
      // widget_entry: "https://localhost:8201",
    };
    shareWidget.current = await freelogApp.mountArticleWidget(params);
  };

  /** 控制分享弹窗显示 */
  const setShareWidgetShow = (value: boolean) => {
    shareWidget.current?.setData({ show: value });
  };

  /**
   * 切换正序，倒序
   */
  const handleSort = () => {
    // 切换排序顺序
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  useEffect(() => {
    // 使用排序函数
    const compare = (a: any, b: any) => {
      return sortOrder === "asc" ? a.sortId - b.sortId : b.sortId - a.sortId;
    };

    if (collectionList && collectionList.length) {
      setNovel((pre: any) => ({
        ...pre,
        collectionList: collectionList.sort(compare)
      }));
    }
  }, [sortOrder]);

  useEffect(() => {
    setHref(freelogApp.getCurrentUrl());

    return () => {
      if (inMobile) return;
      (async function unmountWidget() {
        await shareWidget.current?.unmount();
      })();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const introHeight = introContent.current?.clientHeight;
    const foldHeight = inMobile ? 120 : 60;
    if (introHeight > foldHeight) setIntroState(1);
    if (novel) mountShareWidget();
    // eslint-disable-next-line
  }, [novel, inMobile]);

  return inMobile ? (
    // mobile
    <div className={`mobile-content ${novel?.articleInfo.status === 2 && "freeze-exhibit"}`}>
      {novel?.articleInfo.status === 2 ? (
        <div className="freeze-exhibit">
          <div className="icon">
            <i className="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
          </div>
          <span className="exceptional-text"> 此作品因违规无法访问 </span>
        </div>
      ) : (
        novel && (
          <>
            {/* 已下架、授权链异常 顶部提示窗 */}
            {(novel.onlineStatus === 0 || ![0, 4].includes(novel.defaulterIdentityType)) && (
              <div className="exceptional-message">
                {novel.onlineStatus === 0 ? "作品已下架，无法访问" : "作品异常，无法访问"}
              </div>
            )}

            {/* 授权链异常提示 */}
            {![0, 4].includes(novel.defaulterIdentityType) && (
              <div className="auth-link-abnormal-tip">
                <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
                <div className="tip-text">作品异常，无法访问</div>
              </div>
            )}
            {/* 书籍信息 */}
            <div className="novel-info">
              <div className="novel-base-info">
                <div className="novel-cover">
                  <>
                    <img
                      className="novel-cover-image"
                      src={novel.coverImages[0]}
                      alt={novel.exhibitTitle}
                    />
                    {novel.onlineStatus === 0 && <div className="offline">已下架</div>}
                  </>
                </div>

                <div className="novel-content">
                  <div className="content-top">
                    <div className="novel-name">{novel.exhibitTitle}</div>

                    <div className="novel-author">
                      {novel?.versionInfo?.exhibitProperty?.author ||
                        novel.articleInfo.articleOwnerName}
                    </div>

                    <div className="tags">
                      <NewTags data={novel.tags || []} />
                    </div>
                  </div>

                  <div className="content-bottom">
                    {(novel?.versionInfo?.exhibitProperty?.collection_word_count ||
                      novel?.versionInfo?.exhibitProperty?.wordCount) && (
                      <div className="word-count">
                        {formatWordCount(
                          collectionList?.length && !!collectionList.length
                            ? novel?.versionInfo?.exhibitProperty?.collection_word_count
                            : novel?.versionInfo?.exhibitProperty?.wordCount
                        )}
                        字
                      </div>
                    )}
                    <div className="sign-count">{novel.signCount}人签约</div>
                    {/* <div className="share-btn" onClick={() => share()}>
                      <span className="share-btn-text">
                        <i className="freelog fl-icon-fenxiang"></i>
                        分享给更多人
                      </span>
                    </div> */}
                    <input id="href" className="hidden-input" value={href} readOnly />
                  </div>
                </div>
              </div>

              <div className="novel-date-info">
                <div className="date-info">创建时间：{formatDate(novel.createDate)}</div>
                <div className="date-info">
                  最近更新：{formatDate(collectionRecentDate || novel.updateDate)}
                </div>
              </div>

              <div className="operate-btns">
                <div
                  className={`btn main-btn mobile
                  ${
                    (![0, 4].includes(novel.defaulterIdentityType) || novel.onlineStatus === 0) &&
                    "disabled"
                  }`}
                  onClick={async () => {
                    if (collectionList?.length) {
                      const res = await freelogApp.getUserData("novelLastViewedHistory");
                      const lastViewed = res?.data?.data || [];
                      const index = lastViewed.findIndex(
                        (i: { id: string }) => i.id === novel.exhibitId
                      );
                      const subId = lastViewed[index]?.subId;

                      history.switchPage(
                        `/reader?collection=${true}&id=${novel.exhibitId}&subId=${
                          subId || collectionList[0].itemId
                        }`
                      );
                    } else {
                      history.switchPage(`/reader?id=${novel.exhibitId}`);
                    }
                  }}
                >
                  立即阅读
                </div>
                <div
                  className={`btn ${isCollected ? "delete" : "collect-btn mobile"}`}
                  onClick={() => operateShelf(novel)}
                >
                  {isCollected ? "移出书架" : "加入书架"}
                </div>
              </div>
            </div>
            {/* 书籍简介 */}
            <div className="novel-intro">
              <div className="intro-title">内容简介</div>

              {novel.exhibitIntro ? (
                <div className={`intro ${introState === 1 ? "fold" : "unfold"}`}>
                  <div className="intro-content" ref={introContent}>
                    {novel.exhibitIntro}
                  </div>

                  {introState === 1 && (
                    <div className="view-all-btn" onClick={() => setIntroState(3)}>
                      ...查看全部
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-intro-tip">暂无简介</div>
              )}
            </div>

            {/* 目录 */}
            {collectionList && !!collectionList.length && (
              <div className="novel-catalogue">
                <div className="title-container">
                  <span className="title">目录</span>
                  <span className="count">({total}章)</span>
                </div>

                <div className="sub-directory-container">
                  {collectionList.map((collectionItem: CollectionList) => {
                    return (
                      <div
                        className={`sub ${
                          (![0, 4].includes(collectionItem.defaulterIdentityType) ||
                            novel.onlineStatus === 0) &&
                          "disabled"
                        }`}
                        key={collectionItem.itemId}
                        onClick={() =>
                          history.switchPage(
                            `/reader?collection=${true}&id=${novel.exhibitId}&subId=${
                              collectionItem.itemId
                            }`
                          )
                        }
                      >
                        <span className="sub-title">
                          {getCollectionItemTitle(novel, collectionItem)}
                        </span>
                        {collectionItem.articleInfo.status === 2 ? (
                          <img className="freeze-lock" src={Freeze} alt="封禁" />
                        ) : novel.onlineStatus === 0 ? (
                          <div className="offline-lock">已下架</div>
                        ) : ![0, 4].includes(collectionItem.defaulterIdentityType) ? (
                          <img className="auth-lock" src={AuthLinkAbnormal} alt="授权链异常" />
                        ) : collectionItem.defaulterIdentityType === 4 ? (
                          <img className="sub-lock" src={Lock} alt="未授权" />
                        ) : (
                          <img src={RightArrow} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {collectionList.length === total && (
                  <div className="tip no-more">— 已加载全部章节 —</div>
                )}
              </div>
            )}
          </>
        )
      )}
    </div>
  ) : (
    // PC
    <div className={`content ${novel?.articleInfo.status === 2 && "freeze-exhibit"}`}>
      {novel?.articleInfo.status === 2 ? (
        <div className="freeze-exhibit">
          <div className="icon">
            <i className="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
          </div>
          <span className="exceptional-text"> 此作品因违规无法访问 </span>
        </div>
      ) : (
        novel && (
          <div className="content-box">
            {/* 已下架、授权链异常 顶部提示窗 */}
            {(novel.onlineStatus === 0 || ![0, 4].includes(novel.defaulterIdentityType)) && (
              <div className="exceptional-message">
                {novel.onlineStatus === 0 ? "作品已下架，无法访问" : "作品异常，无法访问"}
              </div>
            )}

            {/* 授权链异常提示 */}
            {![0, 4].includes(novel.defaulterIdentityType) && (
              <div className="auth-link-abnormal-tip">
                <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
                <div className="tip-text">作品异常，无法访问</div>
              </div>
            )}
            {/* 书籍信息 */}
            <div className="novel-info">
              <div className="novel-cover">
                <>
                  <img
                    className="novel-cover-image"
                    src={novel.coverImages[0]}
                    alt={novel.exhibitTitle}
                  />
                  {novel.onlineStatus === 0 && <div className="offline">已下架</div>}
                </>
              </div>

              <div className="novel-content">
                <div className="auth-link-abnormal-box">
                  {![0, 4].includes(novel.defaulterIdentityType) && (
                    <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
                  )}

                  <div className="novel-name">{novel.exhibitTitle}</div>
                </div>
                <div className="novel-author">
                  {novel?.versionInfo?.exhibitProperty?.author ||
                    novel.articleInfo.articleOwnerName}
                </div>
                <div className="tags">
                  <NewTags data={novel.tags || []} />
                </div>
                <div className="update-date">
                  {novel?.articleInfo?.articleType === 1 ? (
                    <div>最近更新：{formatDate(novel?.articleInfo?.versions?.[0]?.createDate)}</div>
                  ) : novel?.articleInfo?.serializeStatus === 0 ? (
                    <div className="detail-latest-box">
                      <div className="on-going">连载中</div>
                      {/* <div className="update-count">更新至{total}话</div> */}
                      {(novel?.versionInfo?.exhibitProperty?.collection_word_count ||
                        novel?.versionInfo?.exhibitProperty?.wordCount) && (
                        <div className="word-count">
                          {formatWordCount(
                            collectionList?.length && !!collectionList.length
                              ? novel?.versionInfo?.exhibitProperty?.collection_word_count
                              : novel?.versionInfo?.exhibitProperty?.wordCount
                          )}
                          字
                        </div>
                      )}
                      <div className="latest-novel-container">
                        <div className="latest-novel">最近更新：{latestNovelItem?.itemTitle}</div>
                        <div className="latest-novel-time">
                          {formatDate(latestNovelItem?.articleInfo?.firstVersionReleaseDate)}
                        </div>
                      </div>
                    </div>
                  ) : novel?.articleInfo?.serializeStatus === 1 ? (
                    <div className="detail-latest-box">
                      <div className="completed">已完结</div>
                      {/* <div className="update-count">共 {collectionList?.length} 话</div> */}
                      {(novel?.versionInfo?.exhibitProperty?.collection_word_count ||
                        novel?.versionInfo?.exhibitProperty?.wordCount) && (
                        <div className="word-count">
                          {formatWordCount(
                            collectionList?.length && !!collectionList.length
                              ? novel?.versionInfo?.exhibitProperty?.collection_word_count
                              : novel?.versionInfo?.exhibitProperty?.wordCount
                          )}
                          字
                        </div>
                      )}
                      <div className="latest-novel-container">
                        <div className="latest-novel">最近更新：{latestNovelItem?.itemTitle}</div>
                        <div className="latest-novel-time">
                          {formatDate(latestNovelItem?.articleInfo?.firstVersionReleaseDate)}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="btns-box">
                  <div className="operate-btns">
                    <div
                      className={`btn main-btn 
                    ${
                      (![0, 4].includes(novel.defaulterIdentityType) || novel.onlineStatus === 0) &&
                      "disabled"
                    }`}
                      onClick={async () => {
                        if (collectionList?.length) {
                          const res = await freelogApp.getUserData("novelLastViewedHistory");
                          const lastViewed = res?.data?.data || [];
                          const index = lastViewed.findIndex(
                            (i: { id: string }) => i.id === novel.exhibitId
                          );
                          const subId = lastViewed[index]?.subId;
                          const subIdInfo = collectionList.find((i: any) => {
                            if (subId) {
                              return i.itemId === subId;
                            }
                            return i.itemId === collectionList[0].itemId;
                          });
                          handleReaderHistory(subIdInfo);

                          history.switchPage(
                            `/reader?collection=${true}&id=${novel.exhibitId}&subId=${
                              subId || collectionList[0].itemId
                            }`
                          );
                        } else {
                          history.switchPage(`/reader?id=${novel.exhibitId}`);
                        }
                      }}
                    >
                      立即阅读
                    </div>
                    <div
                      className={`btn ${
                        isCollected ? "warning-btn cancel-collect-btn" : "collect-btn"
                      }`}
                      onClick={() => operateShelf(novel)}
                    >
                      {isCollected ? "移出书架" : "加入书架"}
                    </div>
                  </div>

                  <div className="other-btns">
                    {/* {(novel?.versionInfo?.exhibitProperty?.collection_word_count ||
                      novel?.versionInfo?.exhibitProperty?.wordCount) && (
                      <div className="word-count">
                        {formatWordCount(
                          collectionList?.length && !!collectionList.length
                            ? novel?.versionInfo?.exhibitProperty?.collection_word_count
                            : novel?.versionInfo?.exhibitProperty?.wordCount
                        )}
                        字
                      </div>
                    )} */}

                    <div className="sign-count">{novel.signCount}人签约</div>
                    <div
                      className="share-btn"
                      onMouseOver={e => {
                        e.stopPropagation();
                        setShareWidgetShow(true);
                      }}
                      onMouseLeave={e => {
                        e.stopPropagation();
                        setShareWidgetShow(false);
                      }}
                    >
                      <span className="share-btn-text">
                        <i className="freelog fl-icon-fenxiang"></i>
                        分享给更多人
                      </span>

                      <div id="share" className="share-wrapper" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 书籍简介 */}
            <div className="novel-intro">
              <div className="intro-title">内容简介</div>

              {novel.exhibitIntro ? (
                <div className="intro">
                  <div className="intro-content" ref={introContent}>
                    {novel.exhibitIntro}
                  </div>
                </div>
              ) : (
                <div className="no-intro-tip">暂无简介</div>
              )}
            </div>
            {/* 目录 */}
            {collectionList && !!collectionList.length && (
              <div className="novel-catalogue">
                <div className="title-container">
                  <span className="title">目录</span>
                  <span className="count">
                    <span
                      className={`status ${
                        novel?.articleInfo?.serializeStatus === 1 ? "completed" : "ongoing"
                      }`}
                    >
                      {novel?.articleInfo?.serializeStatus === 1 ? "已完结" : "连载中"}
                    </span>
                    {/* 更新至{total}章 */}
                  </span>

                  <div className="sort" onClick={handleSort}>
                    <span>{sortOrder === "asc" ? "正序" : "倒序"}</span>
                    <span className={`triangle ${sortOrder === "asc" ? "asc" : "desc"}`}></span>
                  </div>
                </div>

                {isClickedLatestNovel?.info?.itemId !== latestNovelItem?.itemId && (
                  <div className="latest-tip-box">
                    <div className="latest-title">最近更新</div>
                    <div className="latest-novel">{latestNovelItem?.itemTitle}</div>
                    <span className="time">
                      {formatDate(latestNovelItem?.articleInfo?.firstVersionReleaseDate)}
                    </span>
                  </div>
                )}

                <div className="sub-directory-container">
                  {collectionList.map((collectionItem: CollectionList) => {
                    return (
                      <div
                        className={`sub ${
                          (![0, 4].includes(collectionItem.defaulterIdentityType) ||
                            novel.onlineStatus === 0) &&
                          "disabled"
                        }`}
                        key={collectionItem.itemId}
                        onClick={async () => {
                          await handleLatestNovel(collectionItem);
                          await handleReaderHistory(collectionItem);
                          history.switchPage(
                            `/reader?collection=${true}&id=${novel.exhibitId}&subId=${
                              collectionItem.itemId
                            }`
                          );
                        }}
                      >
                        <span
                          className={`sub-title ${
                            !currentHistoryNovel?.find(
                              (i: any) => i.itemId === collectionItem.itemId
                            ) && "is-latest"
                          }`}
                        >
                          {getCollectionItemTitle(novel, collectionItem)}
                        </span>
                        {collectionItem.articleInfo.status === 2 ? (
                          <img className="freeze-lock" src={Freeze} alt="封禁" />
                        ) : novel.onlineStatus === 0 ? (
                          <div className="offline-lock">已下架</div>
                        ) : ![0, 4].includes(collectionItem.defaulterIdentityType) ? (
                          <img className="auth-lock" src={AuthLinkAbnormal} alt="授权链异常" />
                        ) : collectionItem.defaulterIdentityType === 4 ? (
                          <img className="sub-lock" src={Lock} alt="未授权" />
                        ) : (
                          inMobile && <img src={RightArrow} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {collectionList.length === total && (
                  <div className="tip no-more">— 已加载全部章节 —</div>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
