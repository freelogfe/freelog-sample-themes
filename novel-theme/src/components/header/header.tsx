import "./header.scss";
import { useState, useEffect, useCallback, useContext } from "react";
import { useHistory } from "react-router-dom";
import { callLogin, callLoginOut } from "../../api/freelog";
import { bookTypeList } from "../../api/data";
import { globalContext } from "../../router";
import CSSTransition from "react-transition-group/CSSTransition";

export const Header = (props: { homeHeader?: boolean; defaultTag?: string; defaultSearchKey?: string }) => {
  const history = useHistory();
  const [tag, setTag] = useState("全部");
  const [searchKey, setSearchKey] = useState(props.defaultSearchKey || "");
  const [search, setSearch] = useState(0);
  const [userBoxShow, setUserBoxShow] = useState(false);
  const { userData } = useContext(globalContext);

  const searchList = useCallback(() => {
    let url = `/home/${tag}`;
    if (searchKey) url += `/${searchKey}`;
    history.push(url);
  }, [history, searchKey, tag]);

  const selectTag = (value: string) => {
    setTag(value);
    setSearch((pre) => pre + 1);
  };

  useEffect(() => {
    if (props.defaultTag) setTag(props.defaultTag);
  }, [props.defaultTag]);

  useEffect(() => {
    if (search === 0) return;
    searchList();
    // eslint-disable-next-line
  }, [search]);

  return (
    <div className="header-wrapper p-sticky lt-0 w-100p b-box flex-column align-center z-100">
      {/* header顶部 */}
      <div className="header-top flex-row align-center space-between">
        <div className="flex-row align-center">
          {/* logo */}
          {/* <img className="logo cur-pointer" src={myLogo} onClick={() => history.replace(`/`)} /> */}
          <div className="fc-18 lh-24 fc-white cur-pointer" onClick={() => history.replace(`/`)}>
            freelog 读书
          </div>

          {/* 搜索框 */}
          {!props.homeHeader && (
            <div className="small-search-box bg-white text-center over-h">
              <i className="freelog fl-icon-content"></i>
              <input
                className="search-input flex-1 h-100p input-none"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                onKeyUp={(e: { keyCode: number }) => {
                  e.keyCode === 13 && setSearch((pre) => pre + 1);
                  e.keyCode === 27 && setSearchKey("") && setSearch((pre) => pre + 1);
                }}
              />
              {searchKey && (
                <i
                  className="freelog fl-icon-guanbi cur-pointer transition"
                  onClick={() => {
                    setSearchKey("");
                    setSearch((pre) => pre + 1);
                  }}
                ></i>
              )}
            </div>
          )}
        </div>

        {userData ? (
          <div
            className="p-relative flex-row align-center cur-pointer"
            onMouseOver={() => setUserBoxShow(true)}
            onMouseLeave={() => setUserBoxShow(false)}
          >
            <div className="username fc-white">{userData.username}</div>
            <img className="avatar brs-50p" src={userData.headImage} alt={userData.username} />

            <CSSTransition in={userBoxShow} classNames="slide-down-scale" timeout={200} unmountOnExit>
              <div className="user-box p-absolute r-0 t-100p">
                <div className="user-box-body flex-column align-center">
                  <img className="avatar brs-50p" src={userData.headImage} alt={userData.username} />
                  <div className="username fw-bold">{userData.username}</div>
                  <div className="mobile fw-bold">{userData.mobile}</div>
                  <div className="btn w-100p" onClick={() => history.push("/shelf")}>
                    我的书架
                  </div>
                  <div className="btn w-100p" onClick={() => callLoginOut()}>
                    登出
                  </div>
                </div>
              </div>
            </CSSTransition>
          </div>
        ) : (
          <div className="flex-row">
            <div className="login-btn b-box text-center cur-pointer" onClick={() => callLogin()}>
              登录
            </div>
            <div
              className="register-btn fc-white fw-bold b-box text-center cur-pointer"
              onClick={() => window.open("http://user.testfreelog.com/logon")}
            >
              注册
            </div>
          </div>
        )}
      </div>

      {/* 搜索框 */}
      {props.homeHeader && (
        <div className="search-box w-100p bg-white text-center over-h shrink-0">
          <i className="freelog fl-icon-content"></i>
          <input
            className="search-input flex-1 h-100p input-none"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onKeyUp={(e: { keyCode: number }) => {
              e.keyCode === 13 && setSearch((pre) => pre + 1);
              e.keyCode === 27 && setSearchKey("") && setSearch((pre) => pre + 1);
            }}
          />
          {searchKey && (
            <i
              className="freelog fl-icon-guanbi cur-pointer transition"
              onClick={() => {
                setSearchKey("");
                setSearch((pre) => pre + 1);
              }}
            ></i>
          )}
        </div>
      )}

      {/* 筛选栏 */}
      {props.homeHeader && (
        <div className="filter-bar flex-row flex-wrap">
          <div
            className={`category-btn cur-pointer transition ${tag === "全部" && "active"}`}
            onClick={() => selectTag("全部")}
          >
            全部
          </div>

          {bookTypeList.map((item) => {
            return (
              <div
                className={`category-btn cur-pointer transition ${tag === item && "active"}`}
                key={item}
                onClick={() => selectTag(item)}
              >
                {item}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
