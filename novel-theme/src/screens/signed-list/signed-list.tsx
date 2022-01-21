import "./signed-list.scss";
import { Header } from "../../components/header/header";
import { ExhibitItem } from "../../api/interface";
import { Novel } from "../../components/novel/novel";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { useContext, useEffect, useRef, useState } from "react";
import { globalContext } from "../../router";
import { GetExhibitListByPagingParams, getExhibitAuthStatus, getSignStatistics } from "../../api/freelog";

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
  const [signedList, setSignedList] = useState<ExhibitItem[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [search, setSearch] = useState(0);
  let loading: any = useRef(false);

  const getBookList = async () => {
    if (loading.current) return;

    loading.current = true;
    const queryParams: GetExhibitListByPagingParams = {
      omitArticleResourceType: "theme",
      skip: 0,
      limit: 100,
    };
    if (searchKey) queryParams.keywords = searchKey;

    const list = await getSignStatistics();
    console.error(list)
    const { dataList } = list.data.data;
    if (dataList.length !== 0) {
      const idList: string[] = [];
      dataList.forEach((item: ExhibitItem) => {
        idList.push(item.exhibitId);
      });
      const ids = idList.join(",");
      const statusInfo = await getExhibitAuthStatus(ids);
      if (statusInfo.data.data) {
        statusInfo.data.data.forEach((item: { exhibitId: string; isAuth: boolean }) => {
          const index = dataList.findIndex((listItem: ExhibitItem) => listItem.exhibitId === item.exhibitId);
          dataList[index].isAuth = item.isAuth;
        });
      }
    }
    setSignedList(dataList);
    loading.current = false;
    // eslint-disable-next-line
  };

  useEffect(() => {
    getBookList();
    // eslint-disable-next-line
  }, [search]);

  return (
    <div className="content">
      <div className="content-header">
        <div className="signed-list-title">已签约书籍</div>

        <div className="search-box">
          <input
            className="search-input input-none"
            value={searchKey}
            placeholder="支持搜索书籍名称"
            onChange={(e) => setSearchKey(e.target.value)}
            onKeyUp={(e: { keyCode: number }) => {
              e.keyCode === 13 && setSearch((pre) => pre + 1);
              e.keyCode === 27 && setSearchKey("");
            }}
          />
          <i className="freelog fl-icon-content"></i>
        </div>
      </div>

      {signedList.map((item) => {
        return (
          <div className="book-box" key={item.exhibitId}>
            <Novel mode={3} data={item} />
          </div>
        );
      })}

      {signedList.length === 0 && <div className="tip">暂无数据，快去签约书籍吧～</div>}
    </div>
  );
};
