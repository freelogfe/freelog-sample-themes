import ReactDOM from "react-dom";
import "./index.scss";
// import reportWebVitals from "./reportWebVitals";
import RouterView from "./router";
import { freelogApp } from "freelog-runtime"

window.FREELOG_RESOURCENAME = "ZhuC/novel-theme";
freelogApp.onLogin(() => {
  freelogApp.reload();
});



if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = () => {
    ReactDOM.render(<RouterView />, document.getElementById("root"));
  };
  window.__WUJIE_UNMOUNT = () => {
    ReactDOM.unmountComponentAtNode(document.getElementById("root"));
  };
} else {
  ReactDOM.render(<RouterView />, document.getElementById("root"));
}