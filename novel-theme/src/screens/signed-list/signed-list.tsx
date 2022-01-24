import "./signed-list.scss";
import { Header } from "../../components/header/header";
import { Novel } from "../../components/novel/novel";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { useContext, useState } from "react";
import { globalContext } from "../../router";
import { useMySignedList } from "../../utils/hooks";

export const SignedListScreen = () => {
  const { inMobile } = useContext(globalContext);

  return (
    <div className={`signed-list-wrapper ${inMobile ? "in-mobile" : "in-pc"}`}>
      <Header />

      <SignedListBody />

      <Footer />

      <ThemeEntrance />
    </div>
  );
};

const SignedListBody = () => {
  const { mySignedList, getMySignedList } = useMySignedList();
  const [searchKey, setSearchKey] = useState("");

  return (
    <div className="content">
      <div className="content-header">
        <div className="signed-list-title">已签约书籍</div>

        <div className="search-box">
          <input
            className="search-input input-none"
            value={searchKey}
            placeholder="支持搜索书籍名称"
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
};
