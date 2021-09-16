import "./home.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import { SearchHeader } from "../../components/header/header";
import { getExhibitsList, GetExhibitsListParams } from "../../api/freelog";
import { ExhibitItem } from "../../utils/interface";
import { HomeNovel, ShelfNovel } from "../../components/novel/novel";
import { useMyShelf } from "../../utils/hooks";

export const HomeScreen = (props: any) => {
  const tag = props.match.params.tag;
  const [bookList, setBookList] = useState<ExhibitItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [topBtnShow, setTopBtnShow] = useState(false);
  const [searching, setSearching] = useState(false);
  let skip = useRef(0);
  let loading: any = useRef(false);

  const getBookList = useCallback(
    async (params: Partial<GetExhibitsListParams>, init = false) => {
      if (loading.current) return;

      if (total === bookList.length && !init) return;

      loading.current = true;
      skip.current = init ? 0 : skip.current + 12;
      const queryParams = {
        skip: skip.current.toString(),
        resourceType: "novel",
        limit: "12",
        ...params,
      };
      const list = await getExhibitsList(queryParams);
      const { dataList, totalItem } = list.data.data;
      setBookList((pre) => (init ? dataList : [...pre, ...dataList]));
      setTotal(totalItem);
      loading.current = false;
    },
    [bookList.length, total]
  );

  const scrollEvent = useCallback(() => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight =
      document.documentElement.clientHeight || document.body.clientHeight;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    setTopBtnShow(scrollTop > 300);
    if (scrollTop + clientHeight === scrollHeight) {
      getBookList({});
    }
  }, [getBookList]);

  const backToTop = () => {
    document.documentElement.scroll({ top: 0, behavior: "smooth" });
    document.body.scroll({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (tag === "0") {
      getBookList({}, true);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", scrollEvent);
    return () => window.removeEventListener("scroll", scrollEvent);
  }, [scrollEvent]);

  return (
    <div className="home-wrapper flex-column align-center bg-white">
      <SearchHeader
        search={getBookList}
        defaultTag={tag}
        filter
        setSearching={setSearching}
      ></SearchHeader>
      <HomeBody bookList={bookList} searching={searching}></HomeBody>
      {(total === bookList.length || total === 0) && (
        <div
          className={`tip text-center fs-18 my-30 ${
            searching && total === 0 && "mt-100"
          }`}
        >
          {total === 0 ? "NO DATA" : "END"}
        </div>
      )}
      {topBtnShow && (
        <div
          className="back-top-btn p-fixed w-40 h-40 text-center brs-4 over-h r-20 b-20 cur-pointer transition"
          onClick={backToTop}
        >
          <i className="iconfont fs-26 fc-white">&#xe600;</i>
        </div>
      )}
    </div>
  );
};

const HomeBody = (props: { bookList: ExhibitItem[]; searching: boolean }) => {
  const { bookList, searching } = props;
  const { myShelf, operateShelf } = useMyShelf();
  const history = useHistory();

  return (
    <div className="home-body w-100p mw-1412">
      {myShelf.length !== 0 && !searching && (
        <div className="mt-40">
          <div className="shelf-title w-100p mb-20 flex-row align-center space-between">
            <div className="fs-24">
              我的书架
              <i className="iconfont fs-20 ml-5">&#xe6a3;</i>
            </div>
            <div
              className="more-shelf fs-16 lh-30 ml-20 cur-pointer transition"
              onClick={() => history.push("/shelf")}
            >
              {"查看我的书架 >"}
            </div>
          </div>

          <div className="w-100p flex-row flex-wrap">
            {myShelf
              .filter((_item, index) => index < 4)
              .map((item) => {
                return (
                  <div className="book-box shelf-book" key={item.presentableId}>
                    <ShelfNovel data={item} operateShelf={operateShelf}></ShelfNovel>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {searching ? (
        <div className="hot-title fs-24 mt-40 mb-20">搜索结果</div>
      ) : (
        <div className="hot-title fs-24 mt-40 mb-20">
          热门小说
          <i className="iconfont fs-20 ml-5">&#xe65a;</i>
        </div>
      )}

      <div className="w-100p flex-row flex-wrap">
        {bookList.map((item) => {
          return (
            <div key={item.presentableId} className="book-box">
              <HomeNovel data={item}></HomeNovel>
            </div>
          );
        })}
      </div>
    </div>
  );
};
