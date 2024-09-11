import ReactDOM from "react-dom";
import "./index.scss";
import reportWebVitals from "./reportWebVitals";
import "./public-path";
import RouterView from "./router";
import mapRoutes from "./utils/map-routes";
import { freelogApp, initFreelogApp } from "freelog-runtime";

reportWebVitals();

window.mount = async () => {
  initFreelogApp();
  /* 路由映射 */
  await freelogApp.mapShareUrl(mapRoutes);
  ReactDOM.render(<RouterView />, document.getElementById("root"));
};

// 👇 将卸载操作放入 unmount 函数，就是上面步骤2中的卸载函数
window.unmount = () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("root"));
};

// 如果不在运行时环境，则直接执行mount渲染
if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}
