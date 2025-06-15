import "./new-tags.scss";
import { useMyHistory } from "../../utils/hooks";
import { useContext } from "react";
import { globalContext } from "../../router";

/** 标签组 */
export const NewTags = (props: { data: string[]; hoverColor?: string }) => {
  const { data, hoverColor = "#5D9191" } = props;
  const { inMobile } = useContext(globalContext);
  const history = useMyHistory();

  return (
    <div className="new-tag-wrapper" style={{ "--hover-color": hoverColor } as React.CSSProperties}>
      {data.map(tag => (
        <div
          className={`tag ${inMobile ? "in-mobile" : "in-pc"}`}
          key={tag}
          title={`搜索"${tag}"`}
          onClick={e => {
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
