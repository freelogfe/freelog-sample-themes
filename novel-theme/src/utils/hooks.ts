import { useState, useEffect, useCallback } from "react";
import { getUserData, setUserData } from "../api/freelog";
import { ExhibitItem } from "./interface";

/**
 * 我的书架hook
 */
export const useMyShelf = (id?: string) => {
  const [myShelf, setMyShelf] = useState<string[]>([]);
  const [isCollected, setIsCollected] = useState(false);

  // 获取书架数据
  const getMyShelf = async () => {
    const shelf = await getUserData('shelf');
    setMyShelf(shelf || []);
  };

  // 判断当前资源是否已被收藏
  const ifExistInShelf = (presentableId: string) => {
    const isThisCollected = myShelf.includes(presentableId);
    return isThisCollected;
  };

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  const operateShelf = async (exhibit: ExhibitItem) => {
    let shelf = myShelf;
    const isThisCollected = ifExistInShelf(exhibit.presentableId);

    if (isThisCollected) {
      const index = myShelf.findIndex((item) => item === exhibit.presentableId);
      shelf.splice(index, 1);
    } else {
      shelf.push(exhibit.presentableId);
    }
    await setUserData('shelf', shelf);
    getMyShelf();
  };

  useEffect(() => {
    if (id) setIsCollected(ifExistInShelf(id));
    // eslint-disable-next-line
  }, [id, myShelf]);

  useEffect(() => {
    getMyShelf();
    // eslint-disable-next-line
  }, []);

  return { myShelf, isCollected, operateShelf };
};

/**
 * 获取页面相关信息hook
 */
export const useMyScroll = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  const scroll = useCallback(() => {
    setScrollTop(document.documentElement.scrollTop || document.body.scrollTop);
    setClientHeight(document.documentElement.clientHeight || document.body.clientHeight);
    setScrollHeight(document.documentElement.scrollHeight || document.body.scrollHeight);
  }, [setScrollTop, setClientHeight, setScrollHeight]);

  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, [scroll]);

  return {
    scrollTop,
    clientHeight,
    scrollHeight,
  };
};
