import "./tags.scss";
import { useMyHistory } from "../../utils/hooks";
import { useContext } from "react";
import { globalContext } from "../../router";

/** 标签组 */
export const Tags = (props: { data: string[] }) => {
  const { data } = props;
  const { inMobile } = useContext(globalContext);
  const history = useMyHistory();

  return (
    <div className="tag-wrapper">
      {data.map((tag) => (
        <div
          className={`tag ${inMobile ? "in-mobile" : "in-pc"}`}
          key={tag}
          title={`搜索“${tag}”`}
          onClick={(e) => {
            e.stopPropagation();
            history.switchPage(`/home?tags=${tag}`);
          }}
        >
          {tag}
        </div>
      ))}
    </div>
  );
};
