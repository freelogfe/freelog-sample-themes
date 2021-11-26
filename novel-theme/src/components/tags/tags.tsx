import "./tags.scss";
import { useHistory } from "react-router-dom";

export const Tags = (props: { data: string[]; size: string }) => {
  const { data, size } = props;
  const history = useHistory();

  return (
    <div className="w-100p flex-row flex-wrap">
      {data.map((tag) => (
        <div
          className={`tag brs-3 py-2 b-box text-center cur-pointer transition ${size}`}
          key={tag}
          title={`搜索“${tag}”`}
          onClick={(e) => {
            e.stopPropagation();
            history.push(`/home/${tag}`);
          }}
        >
          {tag}
        </div>
      ))}
    </div>
  );
};
