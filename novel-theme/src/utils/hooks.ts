import { useState, useEffect, useCallback, useContext } from "react";
import { useHistory } from "react-router";
import { getUserData, getExhibitListById, GetExhibitListByIdParams, setUserData, getExhibitAuthStatus, callLogin } from "../api/freelog";
import { showToast } from "../components/toast/toast";
import { globalContext } from "../router";
import { ExhibitItem } from "../api/interface";

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
    setShelfIds(ids || []);

    if (!ids || ids.length === 0) {
      setMyShelf([]);
      return;
    }

    const exhibitIds = ids.join(",");
    const queryParams: GetExhibitListByIdParams = { exhibitIds };
    const list = await getExhibitListById(queryParams);
    if (list.data.data.length !== 0) {
      const idList: string[] = [];
      list.data.data.forEach((item: ExhibitItem) => {
        idList.push(item.exhibitId);
      });
      const ids = idList.join(",");
      const statusInfo = await getExhibitAuthStatus(ids);
      if (statusInfo.data.data) {
        statusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = list.data.data.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          list.data.data[index].isAuth = item.isAuth;
        });
      }
    }
    setMyShelf(list.data.data);
  };

  // 判断当前资源是否已被收藏
  const ifExistInShelf = (exhibitId: string) => {
    const isThisCollected = shelfIds.includes(exhibitId);
    return isThisCollected;
  };

  // 操作收藏（如未收藏则收藏，反之取消收藏）
  const operateShelf = async (exhibit: ExhibitItem) => {
    if (!userData) {
      callLogin();
      return;
    }

    const isThisCollected = ifExistInShelf(exhibit.exhibitId);

    if (isThisCollected) {
      const index = shelfIds.findIndex((item) => item === exhibit.exhibitId);
      shelfIds.splice(index, 1);
    } else {
      shelfIds.push(exhibit.exhibitId);
    }
    const res = await setUserData("shelf", shelfIds);
    if (res.data.msg === "success") {
      showToast(isThisCollected ? `已将书籍从书架中移除～` : `已将书籍加入书架～`);
      getMyShelf();
    } else {
      showToast("收藏失败");
    }
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
 * 搜索历史hook
 */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 获取搜索历史
  const getSearchHistory = async () => {
    const json = localStorage.getItem("searchHistory") || "[]";
    setSearchHistory(JSON.parse(json));
  };

  // 搜索
  const searchWord = (keywords: string) => {
    keywords = keywords.trim();
    if (!keywords) return;
    const index = searchHistory.findIndex((item) => item === keywords);
    if (index !== -1) searchHistory.splice(index, 1);
    if (searchHistory.length === 10) searchHistory.pop();
    searchHistory.unshift(keywords);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    getSearchHistory();
  };

  // 删除搜索词
  const deleteWord = (keywords: string) => {
    const index = searchHistory.findIndex((item) => item === keywords);
    if (index === -1) return;
    searchHistory.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    getSearchHistory();
  };

  // 清空搜索词
  const clearHistory = () => {
    localStorage.setItem("searchHistory", "[]");
    setSearchHistory([]);
  };

  useEffect(() => {
    getSearchHistory();
  }, []);

  return { searchHistory, searchWord, deleteWord, clearHistory };
};

/**
 * 页面滚动相关hook
 */
export const useMyScroll = () => {
  const app = document.getElementById("root");
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  const scroll = useCallback(() => {
    setScrollTop(app?.scrollTop || 0);
    setClientHeight(app?.clientHeight || 0);
    setScrollHeight(app?.scrollHeight || 0);
  }, [setScrollTop, setClientHeight, setScrollHeight, app]);

  const scrollToTop = () => {
    app?.scroll({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    app?.addEventListener("scroll", scroll);
    return () => app?.removeEventListener("scroll", scroll);
  }, [scroll, app]);

  return {
    scrollTop,
    clientHeight,
    scrollHeight,
    scrollToTop,
  };
};

/**
 * 页面路由记录hook
 */
export const useMyHistory = () => {
  const { locationHistory } = useContext(globalContext);
  const history = useHistory();

  const switchPage = (path: string) => {
    history.push(path);
    locationHistory.push(path);
  };

  const back = () => {
    history.goBack();
    locationHistory.pop();
  };

  useEffect(() => {
    if (!locationHistory.length) locationHistory.push(history.location.pathname);
    if (locationHistory.length <= 1 && ["/shelf", "/signedList"].includes(history.location.pathname)) {
      switchPage("/home/全部");
    }
    // eslint-disable-next-line
  }, []);

  return { switchPage, back, locationHistory, pathname: history.location.pathname };
};
