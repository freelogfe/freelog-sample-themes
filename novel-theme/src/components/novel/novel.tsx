import "./novel.scss";
import Lock from "../../assets/images/mini-lock.png";
import { ExhibitItem } from "../../api/interface";
import { useMyHistory } from "../../utils/hooks";
import { Tags } from "../tags/tags";
import LazyLoad from "react-lazyload";
import { useContext } from "react";
import { globalContext } from "../../router";

export const Novel = (props: {
  inMobileShelf?: boolean;
  data: ExhibitItem;
  operateShelf?: (data: ExhibitItem) => void;
}) => {
  const { inMobileShelf, data, operateShelf } = props;
  const { inMobile } = useContext(globalContext);
  const history = useMyHistory();

  return inMobileShelf ? (
    // 移动端书架小说组件
    <div className="mobile-shelf-novel-wrapper" onClick={() => history.switchPage("/detail/" + data.exhibitId)}>
      <LazyLoad offset={100} once>
        <div className="book-cover-box">
          <img className="book-cover" src={data.coverImages[0]} alt={data.exhibitName} />
        </div>
      </LazyLoad>

      <div className="book-name" title={data.exhibitName}>
        {data.exhibitName}
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
        <LazyLoad offset={100} once>
          <div className="book-cover-box">
            <img className="book-cover" src={data.coverImages[0]} alt={data.exhibitName} />
          </div>
        </LazyLoad>

        <div className="book-info">
          <div className="book-name" title={data.exhibitName}>
            {!data.isAuth && <img className="lock" src={Lock} alt="未授权" />}
            {data.exhibitName}
          </div>

          <div className="book-author">{data.articleInfo.articleOwnerName}</div>

          <div className="tags">
            <Tags data={data.tags} />
          </div>
        </div>

        <i className="freelog fl-icon-zhankaigengduo"></i>

        {operateShelf && (
          <div
            className="read-btn btn"
            onClick={(e) => {
              e.stopPropagation();
              history.switchPage(`/reader/${data?.exhibitId}`);
            }}
          >
            立即阅读
          </div>
        )}

        {operateShelf && (
          <div
            className="delete-btn btn"
            onClick={(e) => {
              e.stopPropagation();
              operateShelf(data);
            }}
          >
            移出书架
          </div>
        )}
      </div>
    </div>
  );
};
