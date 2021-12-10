import "./header.scss";
import MyLogo from "../../assets/images/logo.png";
import BackArrow from "../../assets/images/arrow.png";
import { useState, useEffect, useCallback, useContext } from "react";
import { useMyHistory } from "../../utils/hooks";
import { callLogin, callLoginOut } from "../../api/freelog";
import { bookTypeList } from "../../api/data";
import { globalContext } from "../../router";
import CSSTransition from "react-transition-group/CSSTransition";

export const Header = (props: {
  currentPage?: string;
  homeHeader?: boolean;
  defaultTag?: string;
  defaultSearchKey?: string;
}) => {
  const history = useMyHistory();
  const { inMobile, userData, selfConfig } = useContext(globalContext);
  const [tag, setTag] = useState("全部");
  const [searchKey, setSearchKey] = useState("");
  const [search, setSearch] = useState(0);
  const [userBoxShow, setUserBoxShow] = useState(false);
  const [searchPopupShow, setSearchPopupShow] = useState(false);

  const searchList = useCallback(() => {
    let url = `/home/${tag}`;
    if (searchKey) url += `/${searchKey}`;
    history.switchPage(url);
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

  useEffect(() => {
    document.body.style.overflowY = (userBoxShow || searchPopupShow) && inMobile ? "hidden" : "auto";
  }, [userBoxShow, searchPopupShow, inMobile]);

  useEffect(() => {
    setSearchKey(props.defaultSearchKey || "");
  }, [props.defaultSearchKey]);

  return inMobile ? (
    // mobile
    <div className={`mobile-header-wrapper ${props.homeHeader && "in-home"}`}>
      {/* header顶部 */}
      <div className={`header-top ${userData && "logon"}`}>
        {props.homeHeader ? (
          // logo
          <img
            className="logo"
            src={selfConfig.logoImage || MyLogo}
            alt="logo"
            onClick={() => history.switchPage(`/`)}
          />
        ) : (
          <div className="header-top-left" onClick={() => history.back()}>
            <img className="back-arrow" src={BackArrow} alt="" />
            <div className="back-label">返回</div>
          </div>
        )}

        <div className="header-top-right">
          {!props.homeHeader && <i className="freelog fl-icon-content" onClick={() => setSearchPopupShow(true)}></i>}

          {userData && (
            <img
              className="avatar"
              src={userData.headImage}
              alt={userData.username}
              onClick={() => setUserBoxShow(true)}
            />
          )}
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
          <img className="avatar" src={userData?.headImage} alt={userData?.username} />
          <div className="username">{userData?.username}</div>
          <div className="btns">
            <div className="btn" onClick={() => history.switchPage("/")}>
              <div className="btn-content">首页</div>
            </div>
            <div className="btn" onClick={() => history.switchPage("/shelf")}>
              <div className="btn-content">我的书架</div>
            </div>
            <div className="btn" onClick={() => callLoginOut()}>
              <div className="btn-content">退出登录</div>
            </div>
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
                onChange={(e) => setSearchKey(e.target.value)}
                onKeyUp={(e: { keyCode: number }) => {
                  e.keyCode === 13 && setSearchPopupShow(false);
                  e.keyCode === 13 && setSearch((pre) => pre + 1);
                  e.keyCode === 27 && setSearchKey("");
                }}
              />
              <i className="freelog fl-icon-content"></i>
            </div>

            <div className="text-btn mobile" onClick={() => setSearchPopupShow(false)}>
              取消
            </div>
          </div>

          <div className="recommend-tags">
            <div className="recommend-tags-title">推荐标签</div>
            <div className="recommend-tags-list">
              {bookTypeList.map((item) => (
                <div
                  className="tag"
                  key={item}
                  onClick={() => {
                    setSearchPopupShow(false);
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
  ) : (
    // PC
    <div className="header-wrapper">
      {/* header顶部 */}
      <div className="header-top">
        <div className="header-top-left">
          {/* logo */}
          <img
            className="logo"
            src={selfConfig.logoImage || MyLogo}
            alt="logo"
            onClick={() => history.switchPage(`/`)}
          />

          {/* 搜索框 */}
          {!props.homeHeader && (
            <div className="small-search-box">
              <input
                className="search-input input-none"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                onKeyUp={(e: { keyCode: number }) => {
                  e.keyCode === 13 && setSearch((pre) => pre + 1);
                  e.keyCode === 27 && setSearchKey("");
                }}
              />
              <i className="freelog fl-icon-content"></i>
            </div>
          )}
        </div>

        {userData ? (
          <div
            className="user-avatar"
            onMouseOver={() => setUserBoxShow(true)}
            onMouseLeave={() => setUserBoxShow(false)}
          >
            <div className="username">{userData.username}</div>
            <img className="avatar" src={userData.headImage} alt={userData.username} />

            <CSSTransition in={userBoxShow} classNames="slide-down-scale" timeout={200} unmountOnExit>
              <div className="user-box">
                <div className="user-box-body">
                  <img className="avatar" src={userData.headImage} alt={userData.username} />
                  <div className="username">{userData.username}</div>
                  <div className="mobile">{userData.mobile}</div>
                  <div className="btn user-box-btn" onClick={() => history.switchPage("/shelf")}>
                    我的书架
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
            <div className="btn header-login-btn" onClick={() => callLogin()}>
              登录
            </div>
            <div className="btn header-register-btn" onClick={() => window.open("http://user.testfreelog.com/logon")}>
              注册
            </div>
          </div>
        )}
      </div>

      {/* 搜索框 */}
      {props.homeHeader && (
        <div className="search-box">
          <input
            className={`search-input input-none ${searchKey && "in-focus"}`}
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onKeyUp={(e: { keyCode: number }) => {
              e.keyCode === 13 && setSearch((pre) => pre + 1);
              e.keyCode === 27 && setSearchKey("");
            }}
          />
          <i className="freelog fl-icon-content"></i>
          {searchKey && (
            <i
              className="freelog fl-icon-guanbi"
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
        <div className="filter-bar">
          <div className={`category-btn ${tag === "全部" && "active"}`} onClick={() => selectTag("全部")}>
            全部
          </div>

          {bookTypeList.map((item) => {
            return (
              <div className={`category-btn ${tag === item && "active"}`} key={item} onClick={() => selectTag(item)}>
                {item}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
