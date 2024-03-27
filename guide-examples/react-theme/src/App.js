import logo from './logo.svg';
import './App.css';

function App() {
  let app = null;
  // 加载自身依赖的插件
  const mountSubWidget = async () => {
    const subData = await window.freelogApp.getSubDep();
    subData.subDep.some(async (sub, index) => {
      if (index === 1) return true;
      app = await window.freelogApp.mountWidget({
        widget: sub,
        container: document.getElementById("freelog-single2"),
        topExhibitData: subData,
        widget_entry: "http://localhost:7001"
      });
    });
  }
  const add = () => {
    app.getApi().changeMe()
  }
  // 加载展品类型的插件
  const mountExhibitWidget = async () => {
    const res = await window.freelogApp.getExhibitListByPaging({
      articleResourceTypes: "插件",
      isLoadVersionProperty: 1,
    });
    const widgets = res.data.data.dataList;
    widgets.some(async (widget, index) => {
      if (index === 1) return true;
      // widget.exhibitId = widget.exhibitId + '111'
      app = await window.freelogApp.mountWidget(
        widget,
        document.getElementById("freelog-single"),
        null,
        null,
        null,
        "http://localhost:7001"
      );
    });
  }
  mountExhibitWidget()
  return (
    <div className="App">
      <button onClick={add}>点我加1</button>
      <div id="freelog-single"></div>
    </div>
  );
}
export default App;
