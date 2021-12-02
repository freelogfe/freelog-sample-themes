import { useContext } from "react";
import { freelogEntrances } from "../../api/data";
import { globalContext } from "../../router";
import "./theme-entrance.scss";

export const ThemeEntrance = () => {
  const themeEntrance = freelogEntrances[2];
  const { inMobile, selfConfig } = useContext(globalContext);

  return (
    <div
      className={`theme-entrance-wrapper p-fixed r-0 flex-column align-center space-between fc-white cur-pointer transition ${
        !inMobile && selfConfig.entranceShow !== "0" && "show"
      }`}
      onClick={() => window.open(themeEntrance.url)}
    >
      <i className="freelog fl-icon-shiyongzhuti text-center"></i>
      <div className="text">{themeEntrance.label}</div>
    </div>
  );
};
