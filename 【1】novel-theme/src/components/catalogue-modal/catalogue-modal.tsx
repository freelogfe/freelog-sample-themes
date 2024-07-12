import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { freelogApp } from "freelog-runtime";
import { globalContext } from "../../router";
import { useMyHistory, useMyScroll } from "../../utils/hooks";

import Lock from "../../assets/images/mini-lock.png";
import RightArrow from "../../assets/images/right-arrow.png";
import { CollectionList, ExhibitItem } from "../../api/interface";
import "./catalogue-modal.scss";

export const CatalogueModal = (props: {
  modalStatus: boolean;
  closeCatalogueModal: () => void;
  book: ExhibitItem | null;
}) => {
  const { book, closeCatalogueModal } = props;
  const { inMobile } = useContext(globalContext);
  const id = book?.exhibitId;

  const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
  const history = useMyHistory();

  const [total, setTotal] = useState<number>(0);
  const [collectionList, setCollectionList] = useState<CollectionList[]>([]);
  const skip = useRef(0);

  // 获取合集下的单品列表
  const getCollectionList = useCallback(
    async (init = false, currentCollection?: CollectionList[] | null, currentTotal?: number) => {
      try {
        if (currentCollection && currentCollection.length >= Number(currentTotal)) {
          return;
        }

        skip.current = init ? 0 : skip.current + 30;

        const subList = await freelogApp.getCollectionSubList(id, {
          skip: skip.current,
          limit: 30
        });
        const { dataList, totalItem } = subList.data.data;
        setTotal(totalItem);

        if (dataList.length !== 0) {
          const ids = dataList.map(item => item.itemId).join();
          const statusInfo = await freelogApp.getCollectionSubAuth(id, { itemIds: ids });
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
          return dataList;
        }
      } catch (error) {
        console.error("Failed to get collection list", error);
        return [];
      }
    },
    [id]
  );

  useEffect(() => {
    if (scrollTop + clientHeight === scrollHeight) {
      (async () => {
        const dataList = await getCollectionList(false, collectionList, total);
        if (Array.isArray(dataList)) {
          setCollectionList((pre: any) => [...pre, ...dataList]);
        }
      })();
    }
  }, [scrollTop, clientHeight, scrollHeight]);

  useEffect(() => {
    const fetchData = async () => {
      const dataList = await getCollectionList(true);
      setCollectionList(dataList);
    };

    fetchData();
  }, []);

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
                  className="sub"
                  key={collectionItem.itemId}
                  onClick={() => {
                    history.switchPage(
                      `/reader?collection=${true}&id=${id}&subId=${collectionItem.itemId}`
                    );
                    closeCatalogueModal();
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
