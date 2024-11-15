import React, { useContext, useEffect, useState } from "react";
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
  const [sortOrder, setSortOrder] = useState("asc");

  /**
   * 切换正序，倒序
   */
  const handleSort = () => {
    // 切换排序顺序
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  useEffect(() => {
    updateSort && updateSort(sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    if (scrollTop + clientHeight === scrollHeight) {
      getCollectionList();
    }
  }, [scrollTop, clientHeight, scrollHeight]);

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
                  onClick={() => {
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
                    inMobile && <img src={RightArrow} />
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
