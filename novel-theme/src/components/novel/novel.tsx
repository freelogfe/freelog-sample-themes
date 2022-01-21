import "./novel.scss";
import Lock from "../../assets/images/mini-lock.png";
import { ExhibitItem } from "../../api/interface";
import { useMyHistory } from "../../utils/hooks";
import { Tags } from "../tags/tags";
import { useContext } from "react";
import { globalContext } from "../../router";

export const Novel = (props: {
  mode?: number; // 1-默认首页 2-书架 3-签约记录 4-移动端首页书架
  data: ExhibitItem;
  operateShelf?: (data: ExhibitItem) => void;
}) => {
  const { mode = 1, data, operateShelf } = props;
  const { inMobile } = useContext(globalContext);
  const history = useMyHistory();

  return mode === 4 ? (
    // 移动端书架小说组件
    <div className="mobile-shelf-novel-wrapper" onClick={() => history.switchPage("/detail/" + data.exhibitId)}>
      <div className="book-cover-box">
        <img className="book-cover" src={data.coverImages[0]} alt={data.exhibitTitle} />
        {data.onlineStatus === 0 && <div className="offline">已下架</div>}
      </div>

      <div className="book-name" title={data.exhibitTitle}>
        {data.exhibitTitle}
      </div>

      <div className="book-author">{data.articleInfo.articleOwnerName}</div>
    </div>
  ) : (
    // 普通小说组件
    <div
      className={`novel-wrapper ${inMobile ? "in-mobile" : "in-pc"}`}
      onClick={() => history.switchPage("/detail/" + data.exhibitId)}
    >
      <div className="novel-content">
        <div className="book-cover-box">
          <img className="book-cover" src={data.coverImages[0]} alt={data.exhibitTitle} />
          {data.onlineStatus === 0 && <div className="offline">已下架</div>}
        </div>

        <div className={`book-info ${mode === 3 && inMobile && "auth-book"}`}>
          <div className="book-name-box" title={data.exhibitTitle}>
            {mode !== 3 && !data.isAuth && <img className="lock" src={Lock} alt="未授权" />}
            <div className="book-name">{data.exhibitTitle}</div>
            {mode === 3 && data.isAuth && !inMobile && <div className="tag is-auth">已授权</div>}
            {mode === 3 && !data.isAuth && !inMobile && <div className="tag not-auth">未授权</div>}
          </div>

          <div className="book-author">{data.articleInfo.articleOwnerName}</div>

          {!(mode === 3 && inMobile) && (
            <div className="tags">
              <Tags data={data.tags} />
            </div>
          )}

          {mode === 3 && inMobile && (
            <div className={`auth-tag ${data.isAuth ? "is-auth" : "not-auth"}`}>
              {data.isAuth ? "已授权" : "未授权"}
            </div>
          )}
        </div>

        {!(mode === 3 && inMobile) && <i className="freelog fl-icon-zhankaigengduo"></i>}

        {[2, 3].includes(mode) && (
          <div
            className="main-btn btn"
            onClick={(e) => {
              e.stopPropagation();
              history.switchPage(`/reader/${data?.exhibitId}`);
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
