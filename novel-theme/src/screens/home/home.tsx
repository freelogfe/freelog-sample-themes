import "./home.scss";
import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { Header } from "../../components/header/header";
import { getExhibitsList, GetExhibitsListParams } from "../../api/freelog";
import { ExhibitItem } from "../../utils/interface";
import { Novel } from "../../components/novel/novel";
import { useMyHistory, useMyScroll, useMyShelf } from "../../utils/hooks";
import { globalContext } from "../../router";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { Footer } from "../../components/footer/footer";
import { LoginBtn } from "../../components/login-btn/login-btn";

export const HomeScreen = (props: any) => {
  const { tags, keywords } = props.match.params;
  const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
  const [bookList, setBookList] = useState<ExhibitItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  let skip = useRef(0);
  let loading: any = useRef(false);

  const getBookList = useCallback(
    async (init = false) => {
      if (loading.current) return;

      if (total === bookList.length && !init) return;

      loading.current = true;
      skip.current = init ? 0 : skip.current + 30;
      const queryParams: GetExhibitsListParams = {
        skip: skip.current,
        resourceType: "novel",
        limit: "30",
      };
      if (tags !== "全部") queryParams.tags = tags;
      if (keywords) queryParams.keywords = keywords;

      const list = await getExhibitsList(queryParams);
      const { dataList, totalItem } = list.data.data;
      setBookList((pre) => (init ? dataList : [...pre, ...dataList]));
      setTotal(totalItem);
      loading.current = false;
      if (tags !== "全部" || keywords) {
        setSearching(true);
      } else {
        setSearching(false);
      }
    },
    [bookList.length, total, tags, keywords]
  );

  useEffect(() => {
    if (scrollTop + clientHeight === scrollHeight && scrollTop) getBookList();
  }, [scrollTop, clientHeight, scrollHeight, getBookList]);

  useEffect(() => {
    getBookList(true);
    // eslint-disable-next-line
  }, [tags, keywords]);

  return (
    <div className="home-wrapper">
      <Header
        homeHeader={true}
        defaultTag={tags}
        defaultSearchKey={keywords}
      ></Header>

      <HomeBody
        bookList={bookList}
        searching={searching}
        total={total}
        tags={tags}
        keywords={keywords}
      ></HomeBody>

      <Footer />

      <LoginBtn />

      <ThemeEntrance />
    </div>
  );
};

const HomeBody = (props: {
  bookList: ExhibitItem[];
  searching: boolean;
  total: number | null;
  tags: string;
  keywords: string;
}) => {
  const { bookList, searching, total, tags, keywords } = props;
  const { inMobile, userData } = useContext(globalContext);
  const { myShelf } = useMyShelf();
  const history = useMyHistory();

  return inMobile ? (
    // mobile
    <div className="mobile-home-body">
      {!searching && (
        <div className="shelf-book-list">
          <div className="shelf-header">
            <div className="box-title">我的书架</div>
            {userData && myShelf.length !== 0 && (
              <div
                className="more-shelf"
                onClick={() => history.switchPage("/shelf")}
              >
                全部{myShelf.length}
                <i className="freelog fl-icon-zhankaigengduo"></i>
              </div>
            )}
          </div>

          {myShelf.length !== 0 && (
            <div className="book-list-box">
              {myShelf.map((item) => {
                return (
                  <div className="book-box" key={item.presentableId}>
                    <Novel inMobileShelf={true} data={item}></Novel>
                  </div>
                );
              })}
            </div>
          )}

          {!userData && <div className="tip">登录后查看我的书架</div>}
          {userData && myShelf.length === 0 && (
            <div className="tip">暂无数据，快去收藏书籍到书架吧～</div>
          )}
        </div>
      )}

      <div className="book-list">
        {searching ? (
          <div className="search-title">
            <div>
              “{keywords}
              {keywords && tags !== "全部" && "+"}
              {tags !== "全部" ? tags : ""}”的搜索结果
              <span className="search-book-total">({bookList.length})</span>
            </div>
            <div
              className="clear-search-btn"
              onClick={() => history.switchPage("/")}
            >
              清空搜索条件
            </div>
          </div>
        ) : (
          <div className="box-title">精选小说</div>
        )}

        {bookList.map((item) => {
          return (
            <div key={item.presentableId} className="book-box">
              <Novel data={item}></Novel>
            </div>
          );
        })}

        {bookList.length === 0 && (
          <div className="tip">当前节点暂无任何书籍，请稍后查看</div>
        )}

        {bookList.length !== 0 && bookList.length === total && (
          <div className="tip no-more">— 已加载全部书籍 —</div>
        )}
      </div>
    </div>
  ) : (
    // PC
    <div className="home-body">
      {!searching && (
        <div className="book-list">
          <div className="shelf-header">
            <div className="box-title">我的书架</div>
            {userData && (
              <div
                className="more-shelf"
                onClick={() => history.switchPage("/shelf")}
              >
                管理书架
              </div>
            )}
          </div>

          {myShelf.length !== 0 && (
            <div className="book-list-box">
              {myShelf.map((item) => {
                return (
                  <div className="book-box" key={item.presentableId}>
                    <Novel data={item}></Novel>
                  </div>
                );
              })}
            </div>
          )}

          {!userData && <div className="tip">登录后查看我的书架</div>}
          {userData && myShelf.length === 0 && (
            <div className="tip">暂无数据，快去收藏书籍到书架吧～</div>
          )}
          {userData && myShelf.length !== 0 && (
            <div className="tip shelf-tip">
              <span>已收藏 {myShelf.length} 本书籍</span>
              <span
                className="view-all-btn cur-pointer transition"
                onClick={() => history.switchPage("/shelf")}
              >
                查看全部
              </span>
            </div>
          )}
        </div>
      )}

      <div className="book-list">
        <div className="box-title">
          {searching ? (
            <div className="search-box-title">
              “{keywords}
              {keywords && tags !== "全部" && "+"}
              {tags !== "全部" ? tags : ""}”的搜索结果
              <span className="search-book-total">({bookList.length})</span>
              <div
                className="clear-search-btn"
                onClick={() => history.switchPage("/")}
              >
                清空搜索条件
              </div>
            </div>
          ) : (
            <div>精选小说</div>
          )}
        </div>

        <div className="book-list-box">
          {bookList.map((item) => {
            return (
              <div key={item.presentableId} className="book-box">
                <Novel data={item}></Novel>
              </div>
            );
          })}
        </div>

        {bookList.length === 0 && (
          <div className="tip">当前节点暂无任何书籍，请稍后查看</div>
        )}

        {bookList.length !== 0 && bookList.length === total && (
          <div className="tip no-more">— 已加载全部书籍 —</div>
        )}
      </div>
    </div>
  );
};
