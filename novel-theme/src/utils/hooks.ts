import { useState, useEffect, useCallback, useContext } from "react";
import { useHistory } from "react-router";
import {
  getUserData,
  searchExhibits,
  SearchExhibitsParams,
  setUserData,
} from "../api/freelog";
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
  const history = useHistory();
  const myHistory = useMyHistory();

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
      const index = shelfIds.findIndex(
        (item) => item === exhibit.presentableId
      );
      shelfIds.splice(index, 1);
    } else {
      shelfIds.push(exhibit.presentableId);
    }
    const res = await setUserData("shelf", shelfIds);
    if (res.data.msg === "success") {
      showToast(
        isThisCollected ? `已将书籍从书架中移除～` : `已将书籍加入书架～`
      );
      getMyShelf();
    } else {
      showToast("收藏失败");
    }
  };

  useEffect(() => {
    if (!userData && history.location.pathname === "/shelf") {
      myHistory.switchPage("/");
      return;
    }
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
 * 页面滚动相关hook
 */
export const useMyScroll = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  const scroll = useCallback(() => {
    setScrollTop(document.documentElement.scrollTop || document.body.scrollTop);
    setClientHeight(
      document.documentElement.clientHeight || document.body.clientHeight
    );
    setScrollHeight(
      document.documentElement.scrollHeight || document.body.scrollHeight
    );
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

/**
 * 页面路由记录hook
 */
export const useMyHistory = () => {
  const { locationHistory } = useContext(globalContext);
  const history = useHistory();

  const switchPage = (path: string) => {
    if (path === "/") path = "/home/全部";
    const pathname = path.split("/")[1];
    const index = locationHistory.findIndex((item) => item.includes(pathname));
    if (index !== -1) {
      locationHistory.splice(index);
      history.replace(path);
    } else {
      history.push(path);
    }
    locationHistory.push(path);
  };

  const back = () => {
    history.goBack();
    locationHistory.pop();
  };

  useEffect(() => {
    const { pathname } = history.location;
    if (pathname !== "/home/全部" && locationHistory.length === 1)
      locationHistory.push(pathname);
  }, [locationHistory, history.location]);

  return { switchPage, back, locationHistory };
};
