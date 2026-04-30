import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { HomeScreen } from "../screens/home/home";
import { ShelfScreen } from "../screens/shelf/shelf";
import { SignedListScreen } from "../screens/signed-list/signed-list";
import { DetailScreen } from "../screens/detail/detail";
import { ReaderScreen } from "../screens/reader/reader";
import { judgeDevice } from "../utils/common";
import { themeList } from "../api/data";
import { freelogApp } from "freelog-runtime";
import type { WidgetController } from "freelog-runtime";
import { ShareContext } from "../contexts/share-context";
import { globalContext, Theme, UserData } from "../contexts/global-context";

export { globalContext } from "../contexts/global-context";

const history = createBrowserHistory();

const routeList = [
  { name: "home", path: "/home", component: HomeScreen },
  { name: "shelf", path: "/shelf", component: ShelfScreen },
  { name: "signedList", path: "/signedList", component: SignedListScreen },
  { name: "detail", path: "/detail", component: DetailScreen },
  { name: "reader", path: "/reader", component: ReaderScreen }
];

const RouterView = () => {
  const [inMobile, setInMobile] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selfConfig, setSelfConfig] = useState<any>({});
  const [nodeInfo, setNodeInfo] = useState<any>({});
  const [theme, setTheme] = useState<Theme>({ gradientColor: "", deriveColor: "" });
  const [locationHistory] = useState<string[]>([]);

  const shareWidgetRef = useRef<WidgetController | null>(null);
  const inMobileRef = useRef<boolean | null>(null);
  useEffect(() => {
    inMobileRef.current = inMobile;
  }, [inMobile]);

  const setShareWidgetShow = useCallback((value: boolean) => {
    if (inMobileRef.current) {
      const el = document.getElementById("mobile-share-wrap");
      if (el) el.style.display = value ? "flex" : "none";
    } else {
      shareWidgetRef.current?.setData({ show: value });
    }
  }, []);

  const openShare = useCallback(() => setShareWidgetShow(true), [setShareWidgetShow]);

  /** 初始化全局数据 */
  const initGlobalData = async () => {
    const userData: any = freelogApp.getCurrentUser();
    const selfConfig: any = freelogApp.getSelfPropertyForTheme();
    const nodeInfo = await freelogApp.nodeInfo;
    const theme = themeList[selfConfig.options_theme || selfConfig.theme];
    setUserData(userData ? Object.assign(userData, { isLogin: true }) : { isLogin: false });
    setSelfConfig(selfConfig);
    setInMobile(judgeDevice());
    setTheme(theme);
    setNodeInfo(nodeInfo);

    const root = document.getElementById("root");
    root?.setAttribute(
      "style",
      `--gradientColor: ${theme?.gradientColor}; --deriveColor: ${theme?.deriveColor}`
    );
  };

  useEffect(() => {
    initGlobalData();
  }, []);

  useEffect(() => {
    const run = async () => {
      const container = document.getElementById("app-share");
      if (!container) return;
      if (shareWidgetRef.current) await shareWidgetRef.current.unmount();

      const subDeps = await freelogApp.getSelfDepForTheme();
      const widgetData = subDeps.find(
        (item: { articleName?: string }) =>
          item.articleName === "ZhuC/_Freelog插件-主页分享" ||
          item.articleName === "ZhuC/Freelog插件-主页分享"
      );
      if (!widgetData) return;

      const { articleId, parentNid, nid } = widgetData;
      const topExhibitId = freelogApp.getTopExhibitId();
      const nodeInfo = freelogApp.nodeInfo as any;
      const nodeUrl = new URL(freelogApp.getCurrentUrl()).origin;
      const params = {
        articleId,
        parentNid,
        nid,
        topExhibitId,
        container,
        renderWidgetOptions: {
          iframe: true,
          data: {
            exhibit: {
              ...nodeInfo,
              avatarUrl: `https://image.freelog.cn/avatar/${nodeInfo?.ownerUserId || ""}`,
              nodeUrl,
              exhibitId: nodeInfo.nodeId || topExhibitId,
              exhibitTitle: nodeInfo.nodeName || nodeInfo.nodeShortDescription
            },
            type: "小说",
            show: false,
            onClose: () => setShareWidgetShow(false)
          }
        }
      };
      shareWidgetRef.current = await freelogApp.mountArticleWidget(params);
    };
    run();
    return () => {
      void shareWidgetRef.current?.unmount();
      shareWidgetRef.current = null;
    };
  }, [setShareWidgetShow]);

  return (
    <globalContext.Provider
      value={{ inMobile, userData, selfConfig, theme, locationHistory, nodeInfo }}
    >
      <ShareContext.Provider value={{ openShare }}>
        {createPortal(<div id="app-share" className="app-share" />, document.body)}
        <Router history={history}>
          <Switch>
            <Route path="/" exact render={() => <Redirect to="/home" />} />
            {routeList.map(route => (
              <Route path={route.path} component={route.component} key={route.name}></Route>
            ))}
            <Route path="*" exact render={() => <Redirect to="/home" />} />
          </Switch>
        </Router>
      </ShareContext.Provider>
    </globalContext.Provider>
  );
};

export default RouterView;
