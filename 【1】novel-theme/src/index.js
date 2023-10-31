import ReactDOM from "react-dom";
import "./index.scss";
import reportWebVitals from "./reportWebVitals";
import "./public-path";
import RouterView from "./router";

window.FREELOG_RESOURCENAME = "ZhuC/novel-theme";
window.freelogApp.onLogin(() => {
  window.location.reload();
});

reportWebVitals();

export async function bootstrap() {
  console.log("react app bootstraped");
}

export async function mount() {
  ReactDOM.render(<RouterView />, document.getElementById("root"));
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector("#root") : document.getElementById("root"));
}

if (!window.__POWERED_BY_FREELOG__) {
  bootstrap().then(mount);
}
