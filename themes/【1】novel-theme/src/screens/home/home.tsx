import "./home.scss";
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
import CSSTransition from "react-transition-group/CSSTransition";
import { Loader } from "../../components/loader/loader";
import { getUrlParams } from "../../utils/common";

/** 首页 */
export const HomeScreen = (props: any) => {
  const { tags, keywords } = getUrlParams(props.location.search);
  const { inMobile } = useContext(globalContext);
  const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
  const [novelList, setNovelList] = useState<ExhibitItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myloading, setMyloading] = useState(false);
  let skip = useRef(0);

  /** 获取小说列表 */
  const getNovelList = useCallback(
    async (init = false) => {
      if (myloading) return;

      setSearching(!!keywords);

      if (total === novelList.length && !init) return;

      if (init) setLoading(true);
      setMyloading(true);
      skip.current = init ? 0 : skip.current + 30;
      const queryParams: GetExhibitListByPagingParams = {
        articleResourceTypes: "文章",
        skip: skip.current,
        limit: 30,
      };
      if (tags) queryParams.tags = tags;
      if (keywords) queryParams.keywords = keywords;

      const list = await getExhibitListByPaging(queryParams);
      const { dataList, totalItem } = list.data.data;
      if (dataList.length !== 0) {
        const ids = dataList.map((item: ExhibitItem) => item.exhibitId).join();
        const statusInfo = await getExhibitAuthStatus(ids);
        if (statusInfo.data.data) {
          dataList.forEach((item: ExhibitItem) => {
            const index = statusInfo.data.data.findIndex(
              (resultItem: { exhibitId: string }) => resultItem.exhibitId === item.exhibitId
            );
            if (index !== -1) item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
          });
        }
      }
      setNovelList((pre) => (init ? dataList : [...pre, ...dataList]));
      setTotal(totalItem);
      if (init) setLoading(false);
      setMyloading(false);
    },
    // eslint-disable-next-line
    [novelList.length, total, tags, keywords]
  );

  useEffect(() => {
    getNovelList(true);
    // eslint-disable-next-line
  }, [tags, keywords]);

  useEffect(() => {
    if (scrollTop + clientHeight === scrollHeight) getNovelList();
    // eslint-disable-next-line
  }, [scrollTop, clientHeight, scrollHeight]);

  return (
    <div className="home-wrapper">
      <Header homeHeader={!searching} mobileSearching={(inMobile && searching) || false} defaultSearchKey={keywords} />
      <HomeBody
        novelList={novelList}
        searching={searching}
        total={total}
        tags={tags}
        keywords={keywords}
        loading={loading}
        myloading={myloading}
      />
      <Footer />
      <LoginBtn />
      <ThemeEntrance />
    </div>
  );
};

/** 首页主体内容 */
const HomeBody = (props: {
  novelList: ExhibitItem[];
  searching: boolean;
  total: number | null;
  tags: string;
  keywords: string;
  loading: boolean;
  myloading: boolean;
}) => {
  const { novelList, searching, total, tags, keywords, loading, myloading } = props;
  const { inMobile, userData, selfConfig } = useContext(globalContext);
  const tagsList: string[] = selfConfig.tags?.split(",");
  const { myShelf } = useMyShelf();
  const history = useMyHistory();
  const [filterBoxShow, setFilterBoxShow] = useState(false);

  const selectTag = (tag: string) => {
    if (!tag && !keywords) {
      history.switchPage("/home");
      return;
    }

    let url = `/home?`;
    if (tag) url += `tags=${tag}`;
    if (keywords) url += `${tag ? "&" : ""}keywords=${keywords}`;
    history.switchPage(url);
  };

  if (inMobile === true) {
    // mobile
    return (
      <div className="mobile-home-body">
        {!searching && userData?.isLogin && myShelf && myShelf.length !== 0 && (
          <div className="shelf-book-list">
            <div className="shelf-header">
              <div className="box-title">我的书架</div>
              <div className="more-shelf" onClick={() => history.switchPage("/shelf")}>
                全部
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
              <div className="box-title">查询到{novelList.length}个相关结果</div>
              <div className={`text-btn mobile ${myloading && "disabled"}`} onClick={() => setFilterBoxShow(true)}>
                <i className="freelog fl-icon-shaixuan"></i>
                <div className="filter-label">筛选</div>
              </div>
            </div>
          ) : (
            <div className="box-header">
              <div className="box-title">精选小说</div>
              <div className={`text-btn mobile ${myloading && "disabled"}`} onClick={() => setFilterBoxShow(true)}>
                <i className="freelog fl-icon-shaixuan"></i>
                <div className="filter-label">筛选</div>
              </div>
            </div>
          )}

          {loading && <Loader />}

          {!loading &&
            novelList.map((item) => {
              return (
                <div key={item.exhibitId} className="book-box">
                  <Novel data={item}></Novel>
                </div>
              );
            })}

          {!loading && novelList.length === 0 && <div className="tip">当前节点暂无任何书籍，请稍后查看</div>}

          {!loading && novelList.length !== 0 && novelList.length === total && (
            <div className="tip no-more">— 已加载全部书籍 —</div>
          )}
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
                className={`tag ${!tags && "active"}`}
                onClick={() => {
                  setFilterBoxShow(false);
                  selectTag("");
                }}
              >
                全部
              </div>
              <div className="tags-box-list">
                {tagsList.map((item) => (
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
        {!searching && userData?.isLogin && myShelf && myShelf.length !== 0 && (
          <div className="book-list">
            <div className="shelf-header">
              <div className="box-title">我的书架</div>
              <div className="shelf-header-right">
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
            <div className="search-box-title">查询到{novelList.length}个相关结果</div>
          ) : (
            <div className="box-title">精选小说</div>
          )}
          <div className="filter-bar">
            <div className="filter-bar-bg"></div>

            <div
              className={`category-btn ${!tags && "active"} ${myloading && "disabled"}`}
              onClick={() => selectTag("")}
            >
              全部
            </div>

            {tagsList.map((item) => {
              return (
                <div
                  className={`category-btn ${tags === item && "active"} ${myloading && "disabled"}`}
                  key={item}
                  onClick={() => selectTag(item)}
                >
                  {item}
                </div>
              );
            })}
          </div>

          {loading && <Loader />}

          {!loading && (
            <div className="book-list-box">
              {novelList.map((item) => {
                return (
                  <div key={item.exhibitId} className="book-box">
                    <Novel data={item}></Novel>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && novelList.length === 0 && <div className="tip">当前节点暂无任何书籍，请稍后查看</div>}
          {!loading && novelList.length !== 0 && novelList.length === total && (
            <div className="tip no-more">— 已加载全部书籍 —</div>
          )}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
