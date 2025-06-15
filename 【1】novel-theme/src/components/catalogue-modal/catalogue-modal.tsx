import React, { useContext, useEffect, useState, useMemo } from "react";
import { freelogApp } from "freelog-runtime";
import { useLocation } from "react-router-dom";
import { globalContext } from "../../router";
import { getUrlParams } from "../../utils/common";
import { useMyHistory, useMyScroll } from "../../utils/hooks";

import Lock from "../../assets/images/mini-lock.png";
import RightArrow from "../../assets/images/right-arrow.png";
import AuthLinkAbnormal from "../../assets/images/auth-link-abnormal.png";
import Freeze from "../../assets/images/freeze.png";
import { CollectionList, ExhibitItem } from "../../api/interface";
import "./catalogue-modal.scss";

export const CatalogueModal = (props: {
  modalStatus: boolean;
  book: ExhibitItem | null;
  collectionList: CollectionList[];
  total: number;
  closeCatalogueModal: () => void;
  getCollectionList: () => void;
  updateSort?: (status: string) => void;
}) => {
  const { book, collectionList, total, closeCatalogueModal, getCollectionList, updateSort } = props;
  const { inMobile } = useContext(globalContext);
  const id = book?.exhibitId;

  const { scrollTop, clientHeight, scrollHeight, scrollToTop } = useMyScroll();
  const history = useMyHistory();
  const location = useLocation();
  const { subId } = getUrlParams(location.search);
  const [sortOrder, setSortOrder] = useState(
    (book?.versionInfo?.exhibitProperty?.catalogueProperty as any)?.collection_sort_list ===
      "collection_sort_descending"
      ? "desc"
      : "asc"
  );
  const [collectionDataDesc, setCollectionDataDesc] = useState<any>(null);
  const [latestNovelData, setLatestNovelData] = useState<any[]>([]);
  const [historyNovelData, setHistoryNovelData] = useState<any[]>([]);

  /**
   * 切换正序，倒序
   */
  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    updateSort && updateSort(sortOrder === "asc" ? "desc" : "asc");
  };

  /** 获取合集的倒序内容 */
  const getCollectionListBySortTypeDesc = async () => {
    const res = await (freelogApp as any).getCollectionSubList(id, {
      sortType: -1,
      skip: 0,
      limit: 50,
      isShowDetailInfo: 1
    });

    setCollectionDataDesc(res.data.data);

    const latestViewedResponse = await freelogApp.getUserData("novelLatestViewedHistory");
    setLatestNovelData(latestViewedResponse?.data?.data);

    const novelViewedResponse = await freelogApp.getUserData("novelViewedHistory");
    setHistoryNovelData(novelViewedResponse?.data?.data || []);
  };

  // 最近更新的一话
  const latestNovelItem = useMemo(() => {
    return collectionDataDesc?.dataList?.[0];
  }, [collectionDataDesc]);

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

  useEffect(() => {
    if (scrollTop + clientHeight === scrollHeight) {
      getCollectionList();
      getCollectionListBySortTypeDesc();
    }
  }, [scrollTop, clientHeight, scrollHeight, getCollectionList]);

  return (
    <React.Fragment>
      <div className="catalogue-modal" onClick={closeCatalogueModal}></div>

      <div
        className={`catalogue-box-body ${!inMobile && "pc"}`}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div className="title-wrapper">
          <span className="title">{book?.exhibitTitle}</span>
          <div className="close-btn" onClick={closeCatalogueModal}>
            <i className="freelog fl-icon-guanbi"></i>
          </div>
        </div>

        {inMobile && (
          <div className="sort" onClick={handleSort}>
            <span>{sortOrder === "asc" ? "正序" : "倒序"}</span>
            <span className={`triangle ${sortOrder === "asc" ? "asc" : "desc"}`}></span>
          </div>
        )}

        {collectionList && !!collectionList.length && (
          <div className="sub-catalogue-wrapper">
            {collectionList.map((collectionItem: CollectionList) => {
              return (
                <div
                  className={`sub ${collectionItem.itemId === subId && "selected"}`}
                  key={collectionItem.itemId}
                  onClick={async () => {
                    await handleLatestNovel(collectionItem);
                    await handleReaderHistory(collectionItem);
                    inMobile
                      ? history.replacePage(
                          `/reader?collection=${true}&id=${id}&subId=${collectionItem.itemId}`
                        )
                      : history.switchPage(
                          `/reader?collection=${true}&id=${id}&subId=${collectionItem.itemId}`
                        );

                    closeCatalogueModal();
                    scrollToTop();
                  }}
                >
                  <span className="sub-title">{collectionItem.itemTitle}</span>
                  {collectionItem.articleInfo.status === 2 ? (
                    <img className="freeze-lock" src={Freeze} alt="封禁" />
                  ) : book?.onlineStatus === 0 ? (
                    <div className="offline-lock">已下架</div>
                  ) : ![0, 4].includes(collectionItem.defaulterIdentityType) ? (
                    <img className="auth-lock" src={AuthLinkAbnormal} alt="授权链异常" />
                  ) : collectionItem.defaulterIdentityType === 4 ? (
                    <img className="sub-lock" src={Lock} alt="未授权" />
                  ) : (
                    inMobile && <img src={RightArrow} alt="右箭头" />
                  )}
                </div>
              );
            })}

            {collectionList.length === total && (
              <div className="tip no-more">— 已加载全部章节 —</div>
            )}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
