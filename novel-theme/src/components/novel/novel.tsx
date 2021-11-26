import "./novel.scss";
import { ExhibitItem } from "../../utils/interface";
import { useHistory } from "react-router-dom";
import { getResourceName } from "../../utils/common";
import { Tags } from "../tags/tags";
import LazyLoad from "react-lazyload";

export const Novel = (props: { data: ExhibitItem; operateShelf?: (data: ExhibitItem) => void }) => {
  const { data, operateShelf } = props;
  const history = useHistory();

  return (
    <div
      className="home-novel-wrapper w-100p h-100p p-10 b-box flex-row align-center space-between cur-pointer transition"
      onClick={() => history.push("/detail/" + data.presentableId)}
    >
      <div className="flex-1 flex-row align-center">
        <LazyLoad offset={100} once>
          <div className="book-cover over-h text-center">
            <img className="h-100p" src={data.coverImages[0]} alt={data.presentableTitle} />
          </div>
        </LazyLoad>

        <div className="flex-1 w-0">
          <div className="book-name w-100p fw-bold text-ellipsis" title={data.presentableTitle}>
            {data.presentableTitle}
          </div>

          <div className="book-author w-100p text-ellipsis">{getResourceName(data.resourceInfo.resourceName, 0)}</div>

          <div className="tags">
            <Tags data={data.tags} size="small" />
          </div>
        </div>
      </div>

      {operateShelf && (
        <div className="flex-row">
          <div
            className="read-btn btn text-center fc-white fw-bold cur-pointer"
            onClick={(e) => {
              e.stopPropagation();
              history.push(`/reader/${data?.presentableId}`);
            }}
          >
            立即阅读
          </div>
          <div
            className="delete-btn btn text-center fw-bold cur-pointer"
            onClick={(e) => {
              e.stopPropagation();
              operateShelf(data);
            }}
          >
            移出书架
          </div>
        </div>
      )}
    </div>
  );
};
