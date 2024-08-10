import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { globalContext } from "../../router";
import { getUrlParams } from "../../utils/common";
import { useMyHistory, useMyScroll } from "../../utils/hooks";

import Lock from "../../assets/images/mini-lock.png";
import RightArrow from "../../assets/images/right-arrow.png";
import { CollectionList, ExhibitItem } from "../../api/interface";
import "./catalogue-modal.scss";

export const CatalogueModal = (props: {
  modalStatus: boolean;
  book: ExhibitItem | null;
  collectionList: CollectionList[];
  total: number;
  closeCatalogueModal: () => void;
  getCollectionList: () => void;
}) => {
  const { book, collectionList, total, closeCatalogueModal, getCollectionList } = props;
  const { inMobile } = useContext(globalContext);
  const id = book?.exhibitId;

  const { scrollTop, clientHeight, scrollHeight, scrollToTop } = useMyScroll();
  const history = useMyHistory();
  const location = useLocation();
  const { subId } = getUrlParams(location.search);

  useEffect(() => {
    if (scrollTop + clientHeight === scrollHeight) {
      getCollectionList();
    }
  }, [scrollTop, clientHeight, scrollHeight]);

  return (
    <React.Fragment>
      <div className="catalogue-modal" onClick={closeCatalogueModal}></div>

      <div className={`catalogue-box-body ${!inMobile && "pc"}`}>
        <div className="title-wrapper">
          <span className="title">{book?.exhibitTitle}</span>
          <div className="close-btn" onClick={closeCatalogueModal}>
            <i className="freelog fl-icon-guanbi"></i>
          </div>
        </div>
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
                  {![0, 4].includes(collectionItem.defaulterIdentityType) ? (
                    <img className="sub-lock" src={Lock} alt="未授权" />
                  ) : (
                    inMobile && <img src={RightArrow} alt="" />
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
