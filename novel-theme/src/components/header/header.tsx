import "./header.scss";
import { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { GetExhibitsListParams } from "../../api/freelog";
import { bookTypeList } from "../../api/data";
import CSSTransition from "react-transition-group/CSSTransition";

export const SearchHeader = (props: {
  search: (params: Partial<GetExhibitsListParams>, init: boolean) => void;
  defaultTag?: string;
  filter?: boolean;
  setSearching?: (searching: boolean) => void;
}) => {
  const history = useHistory();
  const [searchKey, setSearchKey] = useState("");
  const [tag, setTag] = useState<string[]>([]);
  const [filterBoxShow, setFilterBoxShow] = useState(false);
  const [search, setSearch] = useState(0);

  const searchList = useCallback(() => {
    const queryParams: Partial<GetExhibitsListParams> = {};
    if (searchKey) queryParams.keywords = searchKey;
    if (tag.length !== 0) queryParams.tags = tag.join(",");
    props.setSearching && props.setSearching(tag.length !== 0);
    props.search(queryParams, true);
  }, [props, searchKey, tag]);

  const selectTag = (value: string = "") => {
    if (value) {
      const index = tag.findIndex((item) => value === item);
      if (index !== -1) {
        tag.splice(index, 1);
        setTag(tag);
      } else {
        setTag([...tag, value]);
      }
    } else {
      setTag([]);
    }
    setSearch((pre) => pre + 1);
  };

  const clearSearch = () => {
    setFilterBoxShow(false);
    setSearchKey("");
    setTag([]);
    setSearch((pre) => pre + 1);
  };

  useEffect(() => {
    if (!props.defaultTag || props.defaultTag === "0") return;
    setFilterBoxShow(true);
    setTag([props.defaultTag]);
    setSearch((pre) => pre + 1);
  }, [props.defaultTag]);

  useEffect(() => {
    if (search === 0) return;
    searchList();
    // eslint-disable-next-line
  }, [search]);

  return (
    <div className="search-header-wrapper p-sticky lt-0 w-100p z-100" style={{ boxShadow: "0 5px 9px #f9f9f9" }}>
      <div className="pt-20 pb-30 flex-column text-center z-1" style={{ backgroundColor: "#ececf0" }}>
        {/* logo */}
        <div
          className={"logo-text fs-26 fc-white fw-bold f-italic flex-row align-center cur-pointer transition"}
          style={{ textShadow: "2px 2px 4px #8aacaa" }}
          onClick={() => (history.location.pathname.startsWith("/home") ? clearSearch() : history.push(`/`))}
        >
          freelog novel
        </div>

        {/* 搜索框 */}
        <div
          className="p-relative w-60p mw-840 h-40 brs-40 bg-white mt-20 flex-row align-center"
          style={{ boxShadow: "0 4px 20px rgb(0 25 104 / 5%)" }}
        >
          <img
            className="w-20 h-20 my-10 mx-15"
            src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/search_magnifier_white.567afaa9.png"
            alt="search"
          />
          <input
            className="search-input flex-1 w-0 h-100p input-none fs-16 fc-black"
            type="text"
            placeholder="搜索"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onKeyUp={(e: { keyCode: number }) => {
              e.keyCode === 13 && setSearch((pre) => pre + 1);
              e.keyCode === 27 && setSearchKey("") && setSearch((pre) => pre + 1);
            }}
          />
          {searchKey && (
            <i
              className="search-clear iconfont fs-24 mx-10 cur-pointer"
              onClick={() => {
                setSearchKey("");
                setSearch((pre) => pre + 1);
              }}
            >
              &#xe8fc;
            </i>
          )}
          <img
            className="search-btn w-32 h-32 m-4 cur-pointer transition"
            src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/search_return_white.0c921c5a.png"
            alt="search"
            onClick={() => setSearch((pre) => pre + 1)}
          />
          {props.filter && (
            <div
              className="filter-btn fc-white p-absolute r--50 t-0 h-40 w-40 text-center cur-pointer transition"
              title="筛选类别"
              onClick={() => setFilterBoxShow((pre) => !pre)}
            >
              <i className="iconfont fs-24">&#xe61b;</i>
            </div>
          )}
        </div>
      </div>

      {/* 筛选框 */}
      <CSSTransition
        in={filterBoxShow}
        classNames="slide-down"
        timeout={{
          enter: 500,
          exit: 300,
        }}
        unmountOnExit
      >
        <div
          className="filter-box p-absolute l-0 t-100p w-100p text-center"
          onMouseLeave={() => setFilterBoxShow(false)}
        >
          <div className="filter-btns mw-840 pt-10 flex-row flex-wrap">
            <div
              className={`category-btn fs-15 px-10 py-2 mx-5 mb-10 brs-4 text-center shrink-0 cur-pointer transition ${
                tag.length === 0 && "active"
              }`}
              onClick={() => selectTag()}
            >
              全部
            </div>

            {bookTypeList.map((item) => {
              return (
                <div
                  className={`category-btn fs-15 px-10 py-2 mx-5 mb-10 brs-4 text-center shrink-0 cur-pointer transition ${
                    tag.includes(item) && "active"
                  }`}
                  key={item}
                  onClick={() => selectTag(item)}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};

export const Header = () => {
  const history = useHistory();

  return (
    <div className="header-wrapper p-fixed lt-0 w-100p h-72 b-box text-center z-100">
      <div className="w-100p mw-1200 h-100p flex-row align-center space-between">
        <i className="iconfont fs-20 fc-white" onClick={() => history.push(`/`)}>
          &#xe699;
        </i>

        <div className="logo fs-22 fw-bold fc-white transition cur-pointer" onClick={() => history.replace(`/`)}>
          freelog novel
        </div>

        <div
          className="my-shelf fs-16 fw-bold fc-white fw-medium transition cur-pointer"
          onClick={() => history.push(`/shelf`)}
        >
          我的书架
        </div>
      </div>
    </div>
  );
};
