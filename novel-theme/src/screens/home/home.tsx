import "./home.scss";
import MyFilter from "../../assets/images/filter.png";
import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { Header } from "../../components/header/header";
import { getExhibitAuthStatus, getExhibitListByPaging, GetExhibitListByPagingParams } from "../../api/freelog";
import { ExhibitItem } from "../../api/interface";
import { Novel } from "../../components/novel/novel";
import { useMyHistory, useMyScroll, useMyShelf } from "../../utils/hooks";
import { globalContext } from "../../router";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { Footer } from "../../components/footer/footer";
import { LoginBtn } from "../../components/login-btn/login-btn";
import { bookTypeList } from "../../api/data";
import CSSTransition from "react-transition-group/CSSTransition";

export const HomeScreen = (props: any) => {
  const { tags, keywords } = props.match.params;
  const { inMobile } = useContext(globalContext);
  const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
  const [bookList, setBookList] = useState<ExhibitItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  let skip = useRef(0);
  let loading: any = useRef(false);

  const getBookList = useCallback(
    async (init = false) => {
      if (loading.current) return;

      setSearching(!!keywords);

      if (total === bookList.length && !init) return;

      loading.current = true;
      skip.current = init ? 0 : skip.current + 30;
      const queryParams: GetExhibitListByPagingParams = {
        omitArticleResourceType: "theme",
        skip: skip.current,
        limit: 30,
      };
      if (tags !== "全部") queryParams.tags = tags;
      if (keywords) queryParams.keywords = keywords;

      const list = await getExhibitListByPaging(queryParams);
      const { dataList, totalItem } = list.data.data;
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
      setBookList((pre) => (init ? dataList : [...pre, ...dataList]));
      setTotal(totalItem);
      loading.current = false;
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
        mobileSearching={(inMobile && searching) || false}
        defaultSearchKey={keywords}
      />

      <HomeBody bookList={bookList} searching={searching} total={total} tags={tags} keywords={keywords} />

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
  const [filterBoxShow, setFilterBoxShow] = useState(false);

  const selectTag = (tag: string) => {
    let url = `/home/${tag}`;
    if (keywords) url += `/${keywords}`;
    history.switchPage(url);
  };

  if (inMobile === true) {
    // mobile
    return (
      <div className="mobile-home-body">
        {!searching && userData && myShelf.length !== 0 && (
          <div className="shelf-book-list">
            <div className="shelf-header">
              <div className="box-title">我的书架</div>
              <div className="more-shelf" onClick={() => history.switchPage("/shelf")}>
                全部{myShelf.length}
                <i className="freelog fl-icon-zhankaigengduo"></i>
              </div>
            </div>

            <div className="book-list-box">
              {myShelf.map((item) => {
                return (
                  <div className="book-box" key={item.exhibitId}>
                    <Novel mode={4} data={item}></Novel>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="book-list">
          {searching ? (
            <div className="search-box-title">
              <div className="box-title">查询到{bookList.length}个相关结果</div>
              <div className="filter-btn" onClick={() => setFilterBoxShow(true)}>
                <img className="filter-img" src={MyFilter} alt="" />
                <div className="filter-label">筛选</div>
              </div>
            </div>
          ) : (
            <div className="box-header">
              <div className="box-title">精选小说</div>
              <div className="filter-btn" onClick={() => setFilterBoxShow(true)}>
                <img className="filter-img" src={MyFilter} alt="" />
                <div className="filter-label">筛选</div>
              </div>
            </div>
          )}

          {bookList.map((item) => {
            return (
              <div key={item.exhibitId} className="book-box">
                <Novel data={item}></Novel>
              </div>
            );
          })}

          {bookList.length === 0 && <div className="tip">当前节点暂无任何书籍，请稍后查看</div>}

          {bookList.length !== 0 && bookList.length === total && <div className="tip no-more">— 已加载全部书籍 —</div>}
        </div>

        <CSSTransition in={filterBoxShow} classNames="fade" timeout={200} unmountOnExit>
          <div id="modal" className="modal" onClick={() => setFilterBoxShow(false)}></div>
        </CSSTransition>
        <CSSTransition in={filterBoxShow} classNames="slide-right" timeout={200} unmountOnExit>
          <div className="filter-box-body">
            <div className="filter-box-header">
              <div className="header-title">按标签筛选</div>
              <div className="close-btn" onClick={() => setFilterBoxShow(false)}>
                <i className="freelog fl-icon-guanbi"></i>
              </div>
            </div>
            <div className="tags-box">
              <div
                className={`tag ${tags === "全部" && "active"}`}
                onClick={() => {
                  setFilterBoxShow(false);
                  selectTag("全部");
                }}
              >
                全部
              </div>
              <div className="tags-box-list">
                {bookTypeList.map((item) => (
                  <div
                    className={`tag ${tags === item && "active"}`}
                    key={item}
                    onClick={() => {
                      setFilterBoxShow(false);
                      selectTag(item);
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CSSTransition>
      </div>
    );
  } else if (inMobile === false) {
    // PC
    return (
      <div className="home-body">
        {!searching && userData && myShelf.length !== 0 && (
          <div className="book-list">
            <div className="shelf-header">
              <div className="box-title">我的书架</div>
              <div className="shelf-header-right">
                <div className="shelf-length">全部{myShelf.length}</div>
                <div className="text-btn" onClick={() => history.switchPage("/shelf")}>
                  管理书架
                </div>
              </div>
            </div>

            <div className="book-list-box">
              {myShelf.map((item) => {
                return (
                  <div className="book-box" key={item.exhibitId}>
                    <Novel data={item}></Novel>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="book-list">
          {searching ? (
            <div className="search-box-title">查询到{bookList.length}个相关结果</div>
          ) : (
            <div className="box-title">精选小说</div>
          )}

          <div className="filter-bar">
            <div className="filter-bar-bg"></div>

            <div className={`category-btn ${tags === "全部" && "active"}`} onClick={() => selectTag("全部")}>
              全部
            </div>

            {bookTypeList.map((item) => {
              return (
                <div className={`category-btn ${tags === item && "active"}`} key={item} onClick={() => selectTag(item)}>
                  {item}
                </div>
              );
            })}
          </div>

          <div className="book-list-box">
            {bookList.map((item) => {
              return (
                <div key={item.exhibitId} className="book-box">
                  <Novel data={item}></Novel>
                </div>
              );
            })}
          </div>

          {bookList.length === 0 && <div className="tip">当前节点暂无任何书籍，请稍后查看</div>}

          {bookList.length !== 0 && bookList.length === total && <div className="tip no-more">— 已加载全部书籍 —</div>}
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
};
