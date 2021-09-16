import { useState, useEffect } from "react";
import { CollectExhibitItem, ExhibitItem } from "./interface";

/**
 * 我的书架hook
 */
export const useMyShelf = (id?: string) => {
  const [myShelf, setMyShelf] = useState<CollectExhibitItem[]>([]);
  const [isCollected, setIsCollected] = useState(false);

  // 获取书架数据
  const getMyShelf = () => {
    const myShelfData = JSON.parse(localStorage.getItem("myShelf") || "[]");
    setMyShelf(myShelfData);
  };

  // 判断当前资源是否已被收藏
  const ifExistInShelf = (presentableId: string) => {
    const isThisCollected = myShelf.some(
      (item: CollectExhibitItem) => item.presentableId === presentableId
    );
    return isThisCollected;
  };

  // 更新书架数据以及收藏情况
  const update = (presentableId: string) => {
    getMyShelf();
    setIsCollected(ifExistInShelf(presentableId));
  };

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  const operateShelf = (exhibit: ExhibitItem | CollectExhibitItem) => {
    const isThisCollected = ifExistInShelf(exhibit.presentableId);

    if (isThisCollected) {
      const index = myShelf.findIndex(
        (item: CollectExhibitItem) =>
          item.presentableId === exhibit?.presentableId
      );
      setMyShelf(myShelf.splice(index, 1));
    } else {
      const { presentableId, coverImages, presentableTitle, username } =
        exhibit as ExhibitItem;
      const data: CollectExhibitItem = {
        presentableId,
        presentableTitle,
        cover: coverImages[0] || "",
        username,
      };
      setMyShelf([...myShelf, data]);
    }
    localStorage.setItem("myShelf", JSON.stringify(myShelf));
    update(exhibit.presentableId);
  };

  useEffect(() => {
    update(id || "");
    // eslint-disable-next-line
  }, [id]);

  return { myShelf, isCollected, operateShelf };
};
