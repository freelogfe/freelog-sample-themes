import { freelogEntrances } from "../../api/data";
import "./theme-entrance.scss";

export const ThemeEntrance = () => {
  const themeEntrance = freelogEntrances[2];

  return (
    <div
      className="theme-entrance-wrapper p-fixed r-0 flex-column align-center space-between fc-white cur-pointer transition"
      onClick={() => window.open(themeEntrance.url)}
    >
      <i className="freelog fl-icon-shiyongzhuti text-center"></i>
      <div className="text">{themeEntrance.label}</div>
    </div>
  );
};
