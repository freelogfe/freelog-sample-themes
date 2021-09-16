import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { HomeScreen } from "../screens/home/home";
import { ShelfScreen } from "../screens/shelf/shelf";
import { DetailScreen } from "../screens/detail/detail";
import { ReaderScreen } from "../screens/reader/reader";

export const history = createBrowserHistory();

const RouterView = () => {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact render={() => <Redirect to="/home/0" />} />
        <Route path="/home/:tag" component={HomeScreen}></Route>
        <Route path="/shelf" component={ShelfScreen}></Route>
        <Route path="/detail/:id" component={DetailScreen}></Route>
        <Route path="/reader/:id" component={ReaderScreen}></Route>
      </Switch>
    </Router>
  );
};

export default RouterView;
