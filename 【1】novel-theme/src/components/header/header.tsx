import "./header.scss";
import MyLogo from "../../assets/images/logo.png";
import MyMenu from "../../assets/images/menu.png";
import DefaultAvatar from "../../assets/images/default-avatar.png";
import BackArrow from "../../assets/images/arrow.png";
import { useState, useEffect, useCallback, useContext } from "react";
import { useMyHistory, useMyLocationHistory, useSearchHistory } from "../../utils/hooks";
import { callLogin, callLoginOut } from "../../api/freelog";
import { globalContext } from "../../router";
import CSSTransition from "react-transition-group/CSSTransition";

/** 页面头部 */
export const Header = (props: {
  homeHeader?: boolean;
  readerHeader?: boolean;
  mobileSearching?: boolean;
  defaultSearchKey?: string;
}) => {
  const history = useMyHistory();
  const { locationHistory } = useMyLocationHistory();
  const { inMobile, userData, selfConfig } = useContext(globalContext);
  const { searchHistory, searchWord, deleteWord, clearHistory } = useSearchHistory();
  const [searchKey, setSearchKey] = useState("");
  const [search, setSearch] = useState(0);
  const [userBoxShow, setUserBoxShow] = useState(false);
  const [searchPopupShow, setSearchPopupShow] = useState(false);
  const [mySearchHistory, setMySearchHistory] = useState<string[]>([]);
  const [searchHistoryShow, setSearchHistoryShow] = useState(false);
  const [searchWordCatch, setSearchWordCatch] = useState<number | null>(null);

  /** 搜索展品列表 */
  const searchList = useCallback(() => {
    let url = `/home`;
    if (searchKey) url += `?keywords=${searchKey}`;
    history.switchPage(url);
  }, [history, searchKey]);

  /** 搜索快捷键 */
  const inputKeyUp = (keycode: number) => {
    switch (keycode) {
      case 13:
        // 回车
        if (searchWordCatch !== null) setSearchKey(mySearchHistory[searchWordCatch]);
        setSearchWordCatch(null);
        setSearchHistoryShow(false);
        setSearch(pre => pre + 1);
        break;
      case 27:
        // esc
        setSearchKey("");
        setSearchWordCatch(null);
        setSearchHistoryShow(true);
        break;
      case 38:
        // 上
        if (searchWordCatch === null || searchWordCatch === 0) {
          setSearchWordCatch(null);
        } else {
          setSearchWordCatch(searchWordCatch - 1);
        }
        break;
      case 40:
        // 下
        setSearchHistoryShow(true);
        if (searchWordCatch === null) {
          setSearchWordCatch(0);
        } else if (searchWordCatch !== mySearchHistory.length - 1) {
          setSearchWordCatch(searchWordCatch + 1);
        }
        break;
      default:
        break;
    }
  };

  /** 根据点击区域判断历史搜索框是否关闭 */
  const ifCloseHistoryPopup = (e: any) => {
    const searchInput = document.getElementById("searchInput");
    const searchHistoryPopup = document.getElementById("searchHistoryPopup");
    if (!searchInput || !searchHistoryPopup) return;
    const clickInput = searchInput.contains(e.target);
    const clickPopup = searchHistoryPopup.contains(e.target);
    if (!clickInput && !clickPopup) {
      setSearchHistoryShow(false);
    } else {
      searchInput.focus();
    }
  };

  useEffect(() => {
    if (search === 0) return;
    searchWord(searchKey);
    searchList();
    // eslint-disable-next-line
  }, [search]);

  useEffect(() => {
    document.body.style.overflowY =
      (userBoxShow || searchPopupShow) && inMobile ? "hidden" : "auto";
  }, [userBoxShow, searchPopupShow, inMobile]);

  useEffect(() => {
    setMySearchHistory(searchHistory.filter(item => item.includes(searchKey)));
  }, [searchHistory, searchKey]);

  useEffect(() => {
    setSearchKey(props.defaultSearchKey || "");
  }, [props.defaultSearchKey]);

  useEffect(() => {
    if (searchHistoryShow) {
      document.addEventListener("click", ifCloseHistoryPopup);
    } else {
      document.removeEventListener("click", ifCloseHistoryPopup);
    }
  }, [searchHistoryShow]);

  if (inMobile === true && !props.mobileSearching) {
    // 移动端头部
    return (
      <div className={`mobile-header-wrapper ${props.homeHeader && "in-home"}`}>
        {/* header顶部 */}
        <div className={`header-top ${userData?.isLogin && "logon"}`}>
          {props.homeHeader ? (
            // logo
            <img
              className="logo"
              src={selfConfig.options_logoImage || selfConfig.logoImage || MyLogo}
              alt="logo"
              referrerPolicy="no-referrer"
              onClick={() => history.switchPage("/home")}
            />
          ) : (
            <div
              className="header-top-left"
              onClick={() =>
                locationHistory.length === 1 ? history.switchPage("/home") : history.back()
              }
            >
              <img className="back-arrow" src={BackArrow} alt="" />
              {locationHistory.length === 1 ? (
                <div className="back-label">首页</div>
              ) : (
                <div className="back-label">返回</div>
              )}
            </div>
          )}

          <div className="header-top-right">
            {!props.homeHeader && !props.readerHeader && (
              <i className="freelog fl-icon-content" onClick={() => setSearchPopupShow(true)}></i>
            )}

            <img className="menu" src={MyMenu} alt="菜单" onClick={() => setUserBoxShow(true)} />
          </div>
        </div>

        {/* 搜索框 */}
        {props.homeHeader && (
          <div className="search-box" onClick={() => setSearchPopupShow(true)}>
            <i className="freelog fl-icon-content"></i>
          </div>
        )}

        <CSSTransition in={userBoxShow} classNames="fade" timeout={200} unmountOnExit>
          <div id="modal" className="modal" onClick={() => setUserBoxShow(false)}></div>
        </CSSTransition>

        <CSSTransition in={userBoxShow} classNames="slide-right" timeout={200} unmountOnExit>
          <div className="user-box-body">
            <div className="user-box-top">
              <img
                className="avatar"
                src={userData?.headImage || DefaultAvatar}
                alt={userData?.username || "未登录"}
                onClick={() => !userData?.isLogin && callLogin()}
              />
              <div className="username" onClick={() => !userData?.isLogin && callLogin()}>
                {userData?.username || "未登录"}
              </div>
              <div className="close-btn" onClick={() => setUserBoxShow(false)}>
                <i className="freelog fl-icon-guanbi"></i>
              </div>
            </div>
            <div className="btns">
              <div className="menu-btns">
                <div
                  className={`btn ${history.pathname.startsWith("/home") && "active"}`}
                  onClick={() =>
                    !history.pathname.startsWith("/home") && history.switchPage("/home")
                  }
                >
                  <i className="freelog fl-icon-shouye"></i>
                  <div className="btn-label">首页</div>
                </div>
                {userData?.isLogin && (
                  <div
                    className={`btn ${history.pathname.startsWith("/shelf") && "active"}`}
                    onClick={() => history.switchPage("/shelf")}
                  >
                    <i className="freelog fl-icon-shujia"></i>
                    <div className="btn-label">我的书架</div>
                  </div>
                )}
                {userData?.isLogin && (
                  <div
                    className={`btn ${history.pathname.startsWith("/signedList") && "active"}`}
                    onClick={() => history.switchPage("/signedList")}
                  >
                    <i className="freelog fl-icon-lishi"></i>
                    <div className="btn-label">已签约书籍</div>
                  </div>
                )}
              </div>
              {userData?.isLogin && (
                <div className="footer-btn" onClick={() => callLoginOut()}>
                  <i className="freelog fl-icon-tuichu1"></i>
                  <div className="btn-label">退出登录</div>
                </div>
              )}
              {!userData?.isLogin && (
                <div className="footer-btn">
                  <div className="main-btn mobile" onClick={() => callLogin()}>
                    立即登录
                  </div>
                </div>
              )}
            </div>
          </div>
        </CSSTransition>

        <CSSTransition in={searchPopupShow} classNames="fade" timeout={200} unmountOnExit>
          <div className="search-page">
            <div className="search-page-header">
              <div className="search-page-box">
                <input
                  className={`search-input input-none ${searchKey && "in-focus"}`}
                  value={searchKey}
                  autoFocus={true}
                  onChange={e => setSearchKey((e.target.value || "").trim())}
                  onKeyUp={(e: { keyCode: number }) => {
                    e.keyCode === 13 && setSearchPopupShow(false);
                    e.keyCode === 13 && setSearch(pre => pre + 1);
                    e.keyCode === 27 && setSearchKey("");
                  }}
                />
                <i className="freelog fl-icon-content"></i>
              </div>

              <div className="cancel-btn" onClick={() => setSearchPopupShow(false)}>
                取消
              </div>
            </div>

            {searchHistory.length !== 0 && (
              <div className="search-history-box">
                <div className="search-history-box-title">
                  <div className="title">搜索记录</div>
                  <div className="text-btn" onClick={() => clearHistory()}>
                    清空
                  </div>
                </div>
                <div className="search-history-box-list">
                  {searchHistory.map(item => (
                    <div
                      className="tag"
                      key={item}
                      onClick={() => {
                        setSearchPopupShow(false);
                        setSearchKey(item);
                        setSearch(pre => pre + 1);
                      }}
                    >
                      {item}
                      <i
                        className="freelog fl-icon-guanbi"
                        onClick={e => {
                          e.stopPropagation();
                          deleteWord(item);
                        }}
                      ></i>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CSSTransition>
      </div>
    );
  } else if (inMobile === true && props.mobileSearching) {
    // 移动端首页搜索头部
    return (
      <div className="mobile-search-header-wrapper">
        <div className="search-page-box">
          <input
            className={`search-input input-none ${searchKey && "in-focus"}`}
            value={searchKey}
            maxLength={100}
            onChange={e => {
              setSearchKey((e.target.value || "").trim());
              !e.target.value && history.switchPage("/home");
              !e.target.value && setSearchPopupShow(true);
            }}
            onKeyUp={(e: { keyCode: number }) => {
              e.keyCode === 13 && setSearch(pre => pre + 1);
            }}
          />
          <i className="freelog fl-icon-content"></i>
        </div>

        <div className="cancel-btn" onClick={() => history.switchPage("/home")}>
          取消
        </div>
      </div>
    );
  } else if (inMobile === false) {
    // PC
    return (
      <div className="header-wrapper">
        <div className="header-box">
          <div className="header-left">
            {/* logo */}
            <img
              className="logo"
              src={selfConfig.options_logoImage || selfConfig.logoImage || MyLogo}
              alt="logo"
              onClick={() => history.switchPage("/home")}
            />

            {/* 搜索框 */}
            <div className="small-search-box">
              <input
                id="searchInput"
                className={`search-input input-none ${searchKey && "in-focus"}`}
                value={searchKey}
                maxLength={100}
                onChange={e => {
                  setSearchKey((e.target.value || "").trim());
                  setSearchHistoryShow(true);
                  setSearchWordCatch(null);
                }}
                onKeyUp={(e: { keyCode: number }) => inputKeyUp(e.keyCode)}
                onFocus={() => setSearchHistoryShow(true)}
              />
              <i className="freelog fl-icon-content"></i>
              {searchKey && (
                <i
                  className="freelog fl-icon-guanbi text-btn clear-btn"
                  onClick={() => {
                    setSearchKey("");
                    setSearch(pre => pre + 1);
                  }}
                ></i>
              )}

              <CSSTransition
                in={searchHistoryShow && mySearchHistory.length !== 0}
                classNames="fade-in"
                timeout={200}
                unmountOnExit
              >
                <div id="searchHistoryPopup" className="search-history">
                  <div className="history-list">
                    {mySearchHistory.map((item, index) => (
                      <div
                        className={`history-item ${searchWordCatch === index && "catch"}`}
                        key={item}
                        onClick={() => {
                          setSearchKey(item);
                          setSearch(pre => pre + 1);
                        }}
                        onMouseMove={() => setSearchWordCatch(index)}
                        onMouseLeave={() => setSearchWordCatch(null)}
                      >
                        <div className="item-word">{item}</div>
                        <i
                          className="freelog fl-icon-guanbi delete-btn"
                          onClick={e => {
                            e.stopPropagation();
                            deleteWord(item);
                          }}
                        ></i>
                      </div>
                    ))}
                  </div>

                  <div className="text-btn" onClick={() => clearHistory()}>
                    清空搜索记录
                  </div>
                </div>
              </CSSTransition>
            </div>
          </div>

          <div className="header-right">
            <div className="nav-btn" onClick={() => history.switchPage("/home")}>
              首页
            </div>
            {userData?.isLogin && (
              <div className="nav-btn" onClick={() => history.switchPage("/shelf")}>
                我的书架
              </div>
            )}

            {userData?.isLogin ? (
              <div
                className="user-avatar"
                onMouseOver={() => setUserBoxShow(true)}
                onMouseLeave={() => setUserBoxShow(false)}
              >
                <img className="avatar" src={userData.headImage} alt={userData.username} />

                <CSSTransition
                  in={userBoxShow}
                  classNames="slide-down-scale"
                  timeout={200}
                  unmountOnExit
                >
                  <div className="user-box">
                    <div className="user-box-body">
                      <img className="avatar" src={userData.headImage} alt={userData.username} />
                      <div className="username">{userData.username}</div>
                      <div
                        className="btn user-box-btn"
                        onClick={() => history.switchPage("/signedList")}
                      >
                        已签约书籍
                      </div>
                      <div className="btn user-box-btn" onClick={() => callLoginOut()}>
                        登出
                      </div>
                    </div>
                  </div>
                </CSSTransition>
              </div>
            ) : (
              <div className="user-btns">
                <div
                  className="btn header-login-btn"
                  onClick={(e: any) => {
                    callLogin();
                    e.stopPropagation();
                    return false;
                  }}
                >
                  登录
                </div>
                <div
                  className="btn header-register-btn"
                  onClick={() => {
                    if (process.env.NODE_ENV === "development") {
                      window.open("https://user.testfreelog.com/logon");
                    } else {
                      window.open("https://user.freelog.com/logon");
                    }
                  }}
                >
                  注册
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
