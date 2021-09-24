import "./novel.scss";
import { ExhibitItem } from "../../utils/interface";
import { useHistory } from "react-router-dom";
import { getResourceName } from "../../utils/common";
import { Tags } from "../tags/tags";
import LazyLoad from "react-lazyload";

export const HomeNovel = (props: { data: ExhibitItem }) => {
  const { data } = props;
  const history = useHistory();

  return (
    <div
      className="home-novel-wrapper w-100p h-100p b-box brs-6 cur-pointer transition"
      onClick={() => history.push("/detail/" + data.presentableId)}
      title={data.presentableTitle}
    >
      <LazyLoad offset={100} once>
        <div className="book-cover p-relative over-h text-center">
          <img
            className="h-100p"
            src={data.coverImages[0]}
            alt={data.presentableTitle}
          />
          <div className="book-shadow"></div>
        </div>
      </LazyLoad>

      <div className="book-info flex-column">
        <div
          className="book-name w-100p lh-27 fw-bold text-ellipsis"
          style={{ color: "#0d141e" }}
        >
          {data.presentableTitle}
        </div>

        <div className="book-author w-100p lh-21 text-ellipsis">
          <span className="fs-12" style={{ color: "#858c96" }}>
            {getResourceName(data.resourceInfo.resourceName, 0)}
          </span>
        </div>

        <div className="mt-10">
          <Tags data={data.tags} size="small" />
        </div>
      </div>
    </div>
  );
};

export const ShelfNovel = (props: {
  data: ExhibitItem;
  operateShelf: (data: ExhibitItem) => void;
}) => {
  const { data, operateShelf } = props;
  const history = useHistory();

  return (
    <div
      className="shelf-novel-wrapper p-relative w-100p h-100p b-box brs-6 cur-pointer transition"
      onClick={() => history.push("/detail/" + data.presentableId)}
      title={data.presentableTitle}
    >
      <LazyLoad offset={100} once>
        <div className="book-cover p-relative over-h text-center">
          <img
            className="h-100p"
            src={data.coverImages[0]}
            alt={data.presentableTitle}
          />
          <div className="book-shadow"></div>
        </div>
      </LazyLoad>

      <div className="book-info flex-1 w-0 flex-column">
        <div
          className="book-name w-100p lh-27 fw-bold text-2-ellipsis"
          style={{ color: "#0d141e" }}
        >
          {data.presentableTitle}
        </div>

        <div className="book-author w-100p lh-21 text-ellipsis">
          <span className="fs-12" style={{ color: "#858c96" }}>
            {data.username}
          </span>
        </div>
      </div>

      <i
        className="collect-icon iconfont fs-18 h-30 text-center ml-10 transition"
        title="取消收藏"
        onClick={(e) => {
          e.stopPropagation();
          operateShelf(data);
        }}
      >
        &#xe658;
      </i>
    </div>
  );
};
