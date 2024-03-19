import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
// import { createBrowserHistory } from "history";
import { HomeScreen } from "../screens/home/home";
import { ShelfScreen } from "../screens/shelf/shelf";
import { SignedListScreen } from "../screens/signed-list/signed-list";
import { DetailScreen } from "../screens/detail/detail";
import { ReaderScreen } from "../screens/reader/reader";
import { getSelfConfig, getCurrentUser } from "../api/freelog";
import { judgeDevice } from "../utils/common";
import { themeList } from "../api/data";

/** 全局数据 */
interface Global {
  inMobile: boolean | null;
  userData: UserData | null;
  selfConfig: any;
  theme: Theme;
  locationHistory: string[];
}

/** 当前登录用户数据 */
interface UserData {
  username: string;
  headImage: string;
  mobile: string;
  isLogin: boolean;
}

/** 主题数据 */
interface Theme {
  gradientColor: string;
  deriveColor: string;
}

// const history = createBrowserHistory();

const routeList = [
  { name: "home", path: "/home", component: HomeScreen },
  { name: "shelf", path: "/shelf", component: ShelfScreen },
  { name: "signedList", path: "/signedList", component: SignedListScreen },
  { name: "detail", path: "/detail", component: DetailScreen },
  { name: "reader", path: "/reader", component: ReaderScreen },
];

export const globalContext = React.createContext<Global>({
  inMobile: null,
  userData: null,
  selfConfig: {},
  theme: { gradientColor: "", deriveColor: "" },
  locationHistory: [],
});

const RouterView = () => {
  const [inMobile, setInMobile] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selfConfig, setSelfConfig] = useState<any>({});
  const [theme, setTheme] = useState<Theme>({ gradientColor: "", deriveColor: "" });
  const [locationHistory] = useState<string[]>([]);

  /** 初始化全局数据 */
  const initGlobalData = async () => {
    const userData = await getCurrentUser();
    const selfConfig = await getSelfConfig();
    const theme = themeList[selfConfig.theme];
    setUserData(userData ? Object.assign(userData, { isLogin: true }) : { isLogin: false });
    setSelfConfig(selfConfig);
    setInMobile(judgeDevice());
    setTheme(theme);

    const root = document.getElementById("root");
    root?.setAttribute("style", `--gradientColor: ${theme.gradientColor}; --deriveColor: ${theme.deriveColor}`);
  };
  useEffect(() => {
    initGlobalData();
  }, []);

  return (
    <globalContext.Provider value={{ inMobile, userData, selfConfig, theme, locationHistory }}>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact render={() => <Redirect to="/home" />} />
          {routeList.map((route) => (
            <Route path={route.path} component={route.component} key={route.name}></Route>
          ))}
          <Route path="*" exact render={() => <Redirect to="/home" />} />
        </Switch>
      </BrowserRouter>
    </globalContext.Provider>
  );
};

export default RouterView;
