import "./shelf.scss";
import { Header } from "../../components/header/header";
import { useHistory } from "react-router-dom";
import { ExhibitItem } from "../../utils/interface";
import { Novel } from "../../components/novel/novel";
import { useMyShelf } from "../../utils/hooks";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";

export const ShelfScreen = () => {
  const { myShelf, operateShelf } = useMyShelf();

  return (
    <div className="shelf-wrapper flex-column align-center">
      <Header></Header>

      <ShelfBody shelfList={myShelf} operateShelf={operateShelf} />

      <Footer />

      <ThemeEntrance />
    </div>
  );
};

const ShelfBody = (props: { shelfList: ExhibitItem[]; operateShelf: (data: ExhibitItem) => void }) => {
  const { shelfList, operateShelf } = props;
  const history = useHistory();

  return (
    <div className="content flex-column align-center">
      <div className="bread-crumbs w-100p">我的书架</div>

      {shelfList.map((item) => {
        return (
          <div className="book-box" key={item.presentableId}>
            <Novel data={item} operateShelf={operateShelf} />
          </div>
        );
      })}

      {shelfList.length === 0 && <div className="tip w-100p text-align-center">暂无数据，快去收藏书籍到书架吧～</div>}

      <div className="add-book-box">
        <div
          className="add-book-btn flex-row align-center fw-bold cur-pointer transition"
          onClick={() => history.push(`/`)}
        >
          <i className="freelog fl-icon-tianjia text-center"></i>
          <span>添加书籍</span>
        </div>
      </div>
    </div>
  );
};
