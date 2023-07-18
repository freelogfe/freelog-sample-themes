import "./novel.scss";
import Lock from "../../assets/images/mini-lock.png";
import AuthLinkAbnormal from "../../assets/images/auth-link-abnormal.png";
import { ExhibitItem } from "../../api/interface";
import { useMyHistory } from "../../utils/hooks";
import { Tags } from "../tags/tags";
import { useContext } from "react";
import { globalContext } from "../../router";
import { showToast } from "../toast/toast";

/** 小说 */
export const Novel = (props: {
  mode?: number; // 1-首页默认样式 2-书架样式 3-签约记录样式 4-移动端首页书架样式
  data: ExhibitItem;
  operateShelf?: (data: ExhibitItem) => void;
}) => {
  const { mode = 1, data, operateShelf } = props;
  const { inMobile } = useContext(globalContext);
  const history = useMyHistory();

  /** 跳转页面 */
  const toPath = (path: string) => {
    if (![0, 4].includes(data.defaulterIdentityType)) {
      showToast("授权链异常，无法查看");
      return;
    }

    history.switchPage(path + data.exhibitId);
  };

  return mode === 4 ? (
    // 移动端书架小说组件
    <div className="mobile-shelf-novel-wrapper" onClick={() => toPath("/detail/")}>
      <div className="book-cover-box">
        <img
          className={`book-cover ${![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"}`}
          src={data.coverImages[0]}
          alt={data.exhibitTitle}
        />
        {data.onlineStatus === 0 && <div className="offline">已下架</div>}
      </div>

      <div className="book-name" title={data.exhibitTitle}>
        {![0, 4].includes(data.defaulterIdentityType) && (
          <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
        )}
        <div className={`name ${![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"}`}>
          {data.exhibitTitle}
        </div>
      </div>

      <div className={`book-author ${![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"}`}>
        {data.articleInfo.articleOwnerName}
      </div>
    </div>
  ) : (
    // 普通小说组件
    <div className={`novel-wrapper ${inMobile ? "in-mobile" : "in-pc"}`} onClick={() => toPath("/detail/")}>
      <div className="novel-content">
        <div className="book-cover-box">
          <img
            className={`book-cover ${![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"}`}
            src={data.coverImages[0]}
            alt={data.exhibitTitle}
          />
          {data.onlineStatus === 0 && <div className="offline">已下架</div>}
        </div>

        <div className={`book-info ${mode === 3 && inMobile && "auth-book"}`}>
          <div className="book-name-box" title={data.exhibitTitle}>
            {![0, 4].includes(data.defaulterIdentityType) && (
              <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
            )}
            {mode !== 3 && data.defaulterIdentityType >= 4 && <img className="lock" src={Lock} alt="未授权" />}
            <div className={`book-name ${![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"}`}>
              {data.exhibitTitle}
            </div>
            {mode === 3 && data.defaulterIdentityType < 4 && !inMobile && <div className="tag is-auth">已授权</div>}
            {mode === 3 && data.defaulterIdentityType >= 4 && !inMobile && <div className="tag not-auth">未授权</div>}
          </div>

          <div className={`book-author ${![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"}`}>
            {data.articleInfo.articleOwnerName}
          </div>

          {!(mode === 3 && inMobile) && (
            <div className={`tags ${![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"}`}>
              <Tags data={data.tags} />
            </div>
          )}

          {mode === 3 && inMobile && (
            <div className={`auth-tag ${data.defaulterIdentityType < 4 ? "is-auth" : "not-auth"}`}>
              {data.defaulterIdentityType < 4 ? "已授权" : "未授权"}
            </div>
          )}
        </div>

        {!(mode === 3 && inMobile) && (
          <i
            className={`freelog fl-icon-zhankaigengduo ${
              ![0, 4].includes(data.defaulterIdentityType) && "opacity-40p"
            }`}
          ></i>
        )}

        {[2, 3].includes(mode) && (
          <div
            className={`main-btn btn ${![0, 4].includes(data.defaulterIdentityType) && "disabled"}`}
            onClick={(e) => {
              e.stopPropagation();
              toPath("/reader/");
            }}
          >
            立即阅读
          </div>
        )}

        {mode === 2 && (
          <div
            className="warning-btn btn"
            onClick={(e) => {
              e.stopPropagation();
              operateShelf && operateShelf(data);
            }}
          >
            移出书架
          </div>
        )}
      </div>
    </div>
  );
};
