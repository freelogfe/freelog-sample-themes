import React, { useEffect, useState } from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { HomeScreen } from "../screens/home/home";
import { ShelfScreen } from "../screens/shelf/shelf";
import { SignedListScreen } from "../screens/signed-list/signed-list";
import { DetailScreen } from "../screens/detail/detail";
import { ReaderScreen } from "../screens/reader/reader";
import { getSelfConfig, getCurrentUser } from "../api/freelog";
import { judgeDevice } from "../utils/common";
import { themeList } from "../api/data";

interface Global {
  inMobile: boolean | null;
  userData: UserData | null;
  selfConfig: any;
  theme: Theme;
  locationHistory: string[];
}

interface UserData {
  username: string;
  headImage: string;
  mobile: string;
  isLogin: boolean;
}

interface Theme {
  gradientColor: string;
  deriveColor: string;
}

const history = createBrowserHistory();

export const globalContext = React.createContext<Global>({
  inMobile: null,
  userData: null,
  selfConfig: {},
  theme: { gradientColor: "", deriveColor: "" },
  locationHistory: [],
});

const RouterView = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inMobile, setInMobile] = useState<boolean | null>(null);
  const [selfConfig, setSelfConfig] = useState<any>({});
  const [theme, setTheme] = useState<Theme>({ gradientColor: "", deriveColor: "" });
  const [locationHistory] = useState<string[]>([]);

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
      <Router history={history}>
        <Switch>
          <Route path="/" exact render={() => <Redirect to="/home/全部" />} />
          <Route path="/home/:tags/:keywords?" component={HomeScreen}></Route>
          <Route path="/shelf" component={ShelfScreen}></Route>
          <Route path="/signedList" component={SignedListScreen}></Route>
          <Route path="/detail/:id" component={DetailScreen}></Route>
          <Route path="/reader/:id" component={ReaderScreen}></Route>
        </Switch>
      </Router>
    </globalContext.Provider>
  );
};

export default RouterView;
