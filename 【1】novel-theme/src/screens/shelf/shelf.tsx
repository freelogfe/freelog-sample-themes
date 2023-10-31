import "./shelf.scss";
import { Header } from "../../components/header/header";
import { ExhibitItem } from "../../api/interface";
import { Novel } from "../../components/novel/novel";
import { useMyHistory, useMyShelf } from "../../utils/hooks";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { useContext } from "react";
import { globalContext } from "../../router";
import { callLogin } from "../../api/freelog";
import { LoginBtn } from "../../components/login-btn/login-btn";

/** 书架页 */
export const ShelfScreen = () => {
  const { inMobile } = useContext(globalContext);
  const { myShelf, operateShelf } = useMyShelf();

  return (
    <div className={`shelf-wrapper ${inMobile ? "in-mobile" : "in-pc"}`}>
      <Header />
      <ShelfBody shelfList={myShelf} operateShelf={operateShelf} />
      <Footer />
      <LoginBtn />
      <ThemeEntrance />
    </div>
  );
};

/** 书架页主体内容 */
const ShelfBody = (props: { shelfList: ExhibitItem[] | null; operateShelf: (data: ExhibitItem) => void }) => {
  const { userData, inMobile } = useContext(globalContext);
  const { shelfList, operateShelf } = props;
  const history = useMyHistory();

  if (userData?.isLogin && shelfList) {
    return (
      <div className="content">
        <div className="shelf-title">我的书架</div>

        {shelfList.map((item) => {
          return (
            <div className="book-box" key={item.exhibitId}>
              <Novel mode={2} data={item} operateShelf={operateShelf} />
            </div>
          );
        })}

        {shelfList.length === 0 && <div className="tip">暂无数据，快去收藏书籍到书架吧～</div>}

        <div className="add-book-box">
          <div className="add-book-btn" onClick={() => history.switchPage("/home/全部")}>
            <i className="freelog fl-icon-tianjia"></i>
            <span>添加书籍</span>
          </div>
        </div>
      </div>
    );
  } else if (userData?.isLogin === false) {
    return (
      <div className="not-login-content">
        <div className="not-login-tip">此页面需登录浏览，请先登录</div>
        {!inMobile && (
          <div className="main-btn" onClick={() => callLogin()}>
            登录
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
};
