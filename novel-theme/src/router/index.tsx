import React, { useEffect } from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { HomeScreen } from "../screens/home/home";
import { ShelfScreen } from "../screens/shelf/shelf";
import { DetailScreen } from "../screens/detail/detail";
import { ReaderScreen } from "../screens/reader/reader";
import { getSelfConfig, getUser } from "../api/freelog";

interface global {
  userData: userData | null;
  records: any[];
  selfConfig: any;
}

interface userData {
  username: string;
  headImage: string;
  mobile: string;
}

export const history = createBrowserHistory();

const globalData: global = { userData: null, records: [], selfConfig: {} };
export const globalContext = React.createContext<global>(globalData);

const RouterView = () => {
  const initGlobalData = async () => {
    globalData.userData = getUser();
    globalData.selfConfig = await getSelfConfig();
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
