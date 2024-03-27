import ReactDOM from "react-dom";
import "./index.scss";
import reportWebVitals from "./reportWebVitals";
import "./public-path";
import RouterView from "./router";
import { freelogApp } from "freelog-runtime"
// window.FREELOG_RESOURCENAME = "ZhuC/novel-theme";
freelogApp.onLogin(() => {
  freelogApp.reload();
});

reportWebVitals();

// 👇 将渲染操作放入 mount 函数，子应用初始化时会自动执行
window.mount = () => {
  ReactDOM.render(<RouterView />, document.getElementById("root"));
};

// 👇 将卸载操作放入 unmount 函数，就是上面步骤2中的卸载函数
window.unmount = () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("root"));
};

// 如果不在微前端环境，则直接执行mount渲染
if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}