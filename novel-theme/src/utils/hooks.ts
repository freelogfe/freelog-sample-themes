import { useState, useEffect, useCallback, useContext } from "react";
import { getUserData, searchExhibits, SearchExhibitsParams, setUserData } from "../api/freelog";
import { showToast } from "../components/toast/toast";
import { globalContext } from "../router";
import { ExhibitItem } from "./interface";

/**
 * 我的书架hook
 */
export const useMyShelf = (id?: string) => {
  const { userData } = useContext(globalContext);
  const [shelfIds, setShelfIds] = useState<string[]>([]);
  const [myShelf, setMyShelf] = useState<ExhibitItem[]>([]);
  const [isCollected, setIsCollected] = useState(false);

  // 获取书架数据
  const getMyShelf = async () => {
    // 用户未登录
    if (!userData) return;

    const ids = await getUserData("shelf");
    setShelfIds(ids);

    if (!ids || ids.length === 0) {
      setMyShelf([]);
      return;
    }

    const presentableIds = ids.join(",");
    const queryParams: SearchExhibitsParams = { presentableIds };
    const list = await searchExhibits(queryParams);
    setMyShelf(list.data.data);
  };

  // 判断当前资源是否已被收藏
  const ifExistInShelf = (presentableId: string) => {
    const isThisCollected = shelfIds.includes(presentableId);
    return isThisCollected;
  };

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  const operateShelf = async (exhibit: ExhibitItem) => {
    const isThisCollected = ifExistInShelf(exhibit.presentableId);

    if (isThisCollected) {
      const index = shelfIds.findIndex((item) => item === exhibit.presentableId);
      shelfIds.splice(index, 1);
    } else {
      shelfIds.push(exhibit.presentableId);
    }
    await setUserData("shelf", shelfIds);
    showToast(isThisCollected ? `已将书籍从书架中移除～` : `已将书籍加入书架～`);
    getMyShelf();
  };

  useEffect(() => {
    getMyShelf();
    // eslint-disable-next-line
  }, [id, userData]);

  useEffect(() => {
    if (id) setIsCollected(ifExistInShelf(id));
    // eslint-disable-next-line
  }, [id, myShelf]);

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
