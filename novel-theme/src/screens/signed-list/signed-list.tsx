import "./signed-list.scss";
import { Header } from "../../components/header/header";
import { Novel } from "../../components/novel/novel";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { useContext, useState } from "react";
import { globalContext } from "../../router";
import { useMySignedList } from "../../utils/hooks";
import { callLogin } from "../../api/freelog";
import { LoginBtn } from "../../components/login-btn/login-btn";

export const SignedListScreen = () => {
  const { inMobile } = useContext(globalContext);

  return (
    <div className={`signed-list-wrapper ${inMobile ? "in-mobile" : "in-pc"}`}>
      <Header />

      <SignedListBody />

      <Footer />

      <LoginBtn />

      <ThemeEntrance />
    </div>
  );
};

const SignedListBody = () => {
  const { userData, inMobile } = useContext(globalContext);
  const { mySignedList, getMySignedList } = useMySignedList();
  const [searchKey, setSearchKey] = useState("");

  if (userData?.isLogin && mySignedList) {
    return (
      <div className="content">
        <div className="content-header">
          <div className="signed-list-title">已签约书籍</div>

          <div className="search-box">
            <input
              className="search-input input-none"
              value={searchKey}
              placeholder="搜索"
              onChange={(e) => setSearchKey((e.target.value || "").trim())}
              onKeyUp={(e: { keyCode: number }) => {
                e.keyCode === 13 && getMySignedList(searchKey);
                e.keyCode === 27 && setSearchKey("");
              }}
            />
            <i className="freelog fl-icon-content"></i>
          </div>
        </div>

        {mySignedList.map((item) => {
          return (
            <div className="book-box" key={item.exhibitId}>
              <Novel mode={3} data={item} />
            </div>
          );
        })}

        {!mySignedList.length && <div className="tip">暂无数据，快去签约书籍吧～</div>}
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
    return <div></div>;
  }
};
