import { useState, useEffect, useCallback, useContext } from "react";
import { useHistory } from "react-router";
import { callLogin } from "../api/freelog";
import { showToast } from "../components/toast/toast";
import { globalContext } from "../router";
import { ExhibitItem } from "../api/interface";
import { freelogApp } from "freelog-runtime";

/** 书架 hook */
export const useMyShelf = (id?: string) => {
  const { userData } = useContext(globalContext);
  const [shelfIds, setShelfIds] = useState<string[]>([]);
  const [myShelf, setMyShelf] = useState<ExhibitItem[] | null>(null);
  const [isCollected, setIsCollected] = useState(false);

  /** 获取书架数据 */
  const getMyShelf = async () => {
    // 用户未登录
    if (!userData?.isLogin) return;

    const res = await freelogApp.getUserData("shelf");
    const ids = res?.data?.data || [];
    setShelfIds(ids || []);

    if (!ids || ids.length === 0) {
      setMyShelf([]);
      return;
    }

    const exhibitIds = ids.join();
    const [list, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds }),
      freelogApp.getExhibitAuthStatus(exhibitIds)
    ]);
    ids.forEach((id: string) => {
      const book = list.data.data.find(item => item.exhibitId === id) as ExhibitItem;
      if (!book) return;
      const statusItem = statusList.data.data.find(
        (item: { exhibitId: string }) => item.exhibitId === id
      );
      book.defaulterIdentityType = statusItem?.defaulterIdentityType;
    });
    setMyShelf(list.data.data);
  };

  /** 判断当前资源是否已被收藏 */
  const ifExistInShelf = (exhibitId: string) => {
    const isThisCollected = shelfIds.includes(exhibitId);
    return isThisCollected;
  };

  /** 操作收藏（如未收藏则收藏，反之取消收藏） */
  const operateShelf = async (exhibit: ExhibitItem) => {
    if (!userData?.isLogin) {
      callLogin();
      return;
    }

    const isThisCollected = ifExistInShelf(exhibit.exhibitId);

    if (isThisCollected) {
      const index = shelfIds.findIndex(item => item === exhibit.exhibitId);
      shelfIds.splice(index, 1);
    } else {
      shelfIds.push(exhibit.exhibitId);
    }
    const res = await freelogApp.setUserData("shelf", shelfIds);
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
  }, [id, userData?.isLogin]);

  useEffect(() => {
    if (id) setIsCollected(ifExistInShelf(id));
    // eslint-disable-next-line
  }, [id, myShelf]);

  return { myShelf, isCollected, operateShelf };
};

/** 签约列表 hook */
export const useMySignedList = () => {
  interface SignedItem {
    subjectId: string;
  }

  const { userData } = useContext(globalContext);
  const [mySignedList, setMySignedList] = useState<ExhibitItem[] | null>(null);

  /** 获取签约展品列表 */
  const getMySignedList = async (keywords = "") => {
    // 用户未登录
    if (!userData?.isLogin) return;

    const signedList = await freelogApp.getSignStatistics({ keywords });
    const ids: string = signedList?.data?.data.map((item: SignedItem) => item.subjectId).join();

    if (!ids) {
      setMySignedList([]);
      return;
    }

    const [list, statusList] = await Promise.all([
      freelogApp.getExhibitListById({ exhibitIds: ids }),
      freelogApp.getExhibitAuthStatus(ids)
    ]);
    list.data.data.forEach((item: ExhibitItem) => {
      const statusItem = statusList.data.data.find(
        (status: { exhibitId: string }) => status.exhibitId === item.exhibitId
      );
      item.defaulterIdentityType = statusItem?.defaulterIdentityType;
    });

    setMySignedList(
      list.data.data.filter((item: ExhibitItem) => !item.articleInfo.resourceType.includes("主题"))
    );
  };

  useEffect(() => {
    getMySignedList();
    // eslint-disable-next-line
  }, [userData?.isLogin]);

  return { mySignedList, getMySignedList };
};

/** 搜索历史 hook */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  /** 获取搜索历史 */
  const getSearchHistory = async () => {
    const json = localStorage.getItem("searchHistory") || "[]";
    setSearchHistory(JSON.parse(json));
  };

  /** 搜索 */
  const searchWord = (keywords = "") => {
    keywords = keywords.trim();
    if (!keywords) return;
    const index = searchHistory.findIndex(item => item === keywords);
    if (index !== -1) searchHistory.splice(index, 1);
    if (searchHistory.length === 10) searchHistory.pop();
    searchHistory.unshift(keywords);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    getSearchHistory();
  };

  /** 删除搜索词 */
  const deleteWord = (keywords: string) => {
    const index = searchHistory.findIndex(item => item === keywords);
    if (index === -1) return;
    searchHistory.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    getSearchHistory();
  };

  /** 清空搜索词 */
  const clearHistory = () => {
    localStorage.setItem("searchHistory", "[]");
    setSearchHistory([]);
  };

  useEffect(() => {
    getSearchHistory();
  }, []);

  return { searchHistory, searchWord, deleteWord, clearHistory };
};

/** 页面滚动 hook */
export const useMyScroll = () => {
  const app = document.getElementById("root");
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  /** 页面滚动 */
  const scroll = useCallback(() => {
    setScrollTop(app?.scrollTop || 0);
    setClientHeight(app?.clientHeight || 0);
    setScrollHeight(app?.scrollHeight || 0);
  }, [setScrollTop, setClientHeight, setScrollHeight, app]);

  /** 回到顶部 */
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
    scrollToTop
  };
};

/** 路由 hook */
export const useMyHistory = () => {
  const history = useHistory();

  /** 跳转页面 */
  const switchPage = (path: string) => {
    history.push(path);
  };

  /** 替换当前页面 */
  const replacePage = (path: string) => {
    history.replace(path);
  };

  /** 页面返回 */
  const back = () => {
    history.goBack();
  };

  return { switchPage, replacePage, back, pathname: history.location.pathname };
};

/** 路由历史 hook */
export const useMyLocationHistory = () => {
  const { locationHistory } = useContext(globalContext);
  const history = useHistory();

  useEffect(() => {
    if (!locationHistory.length) {
      locationHistory.push(history.location.pathname);
      return;
    }

    if (history.action === "PUSH") {
      locationHistory.push(history.location.pathname);
    } else if (history.action === "POP") {
      locationHistory.pop();
    }
    // eslint-disable-next-line
  }, [history]);

  return { locationHistory };
};
