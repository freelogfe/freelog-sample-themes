import "./shelf.scss";
import { Header } from "../../components/header/header";
import { ExhibitItem } from "../../api/interface";
import { Novel } from "../../components/novel/novel";
import { useMyHistory, useMyShelf } from "../../utils/hooks";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { BreadCrumbs } from "../../components/breadcrumbs/breadcrumbs";
import { useContext } from "react";
import { globalContext } from "../../router";

export const ShelfScreen = () => {
  const { inMobile } = useContext(globalContext);
  const { myShelf, operateShelf } = useMyShelf();

  return (
    <div className={`shelf-wrapper ${inMobile ? "in-mobile" : "in-pc"}`}>
      <Header currentPage="我的书架"></Header>

      <ShelfBody shelfList={myShelf} operateShelf={operateShelf} />

      <Footer />

      <ThemeEntrance />
    </div>
  );
};

const ShelfBody = (props: { shelfList: ExhibitItem[]; operateShelf: (data: ExhibitItem) => void }) => {
  const { shelfList, operateShelf } = props;
  const history = useMyHistory();

  return (
    <div className="content">
      <BreadCrumbs />

      {shelfList.map((item) => {
        return (
          <div className="book-box" key={item.exhibitId}>
            <Novel data={item} operateShelf={operateShelf} />
          </div>
        );
      })}

      {shelfList.length === 0 && <div className="tip">暂无数据，快去收藏书籍到书架吧～</div>}

      <div className="add-book-box">
        <div className="add-book-btn" onClick={() => history.switchPage(`/`)}>
          <i className="freelog fl-icon-tianjia"></i>
          <span>添加书籍</span>
        </div>
      </div>
    </div>
  );
};
