import React, { useEffect } from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { HomeScreen } from "../screens/home/home";
import { ShelfScreen } from "../screens/shelf/shelf";
import { DetailScreen } from "../screens/detail/detail";
import { ReaderScreen } from "../screens/reader/reader";
import { getSelfConfig, getCurrentUser } from "../api/freelog";
import { judgeDevice } from "../utils/common";
import { themeList } from "../api/data";

interface Global {
  userData: UserData | null;
  locationHistory: string[];
  selfConfig: any;
  inMobile: boolean;
  theme: Theme;
}

interface UserData {
  username: string;
  headImage: string;
  mobile: string;
}

interface Theme {
  gradientColor: string;
  deriveColor: string;
}

const history = createBrowserHistory();

const globalData: Global = {
  userData: null,
  locationHistory: ["/home/全部"],
  selfConfig: {},
  inMobile: false,
  theme: { gradientColor: "", deriveColor: "" },
};
export const globalContext = React.createContext<Global>(globalData);

const RouterView = () => {
  const initGlobalData = async () => {
    globalData.userData = await getCurrentUser();
    globalData.selfConfig = await getSelfConfig();
    globalData.inMobile = judgeDevice();
    const theme = themeList[globalData.selfConfig.theme];
    globalData.theme = theme;
    const root = document.getElementById("root");
    root?.setAttribute("style", `--gradientColor: ${globalData.theme.gradientColor}; --deriveColor: ${globalData.theme.deriveColor}`);
  };

  useEffect(() => {
    initGlobalData();
  }, []);

  return (
    <globalContext.Provider value={globalData}>
      <Router history={history}>
        <Switch>
          <Route path="/" exact render={() => <Redirect to="/home/全部" />} />
          <Route path="/home/:tags/:keywords?" component={HomeScreen}></Route>
          <Route path="/shelf" component={ShelfScreen}></Route>
          <Route path="/detail/:id" component={DetailScreen}></Route>
          <Route path="/reader/:id" component={ReaderScreen}></Route>
        </Switch>
      </Router>
    </globalContext.Provider>
  );
};

export default RouterView;
