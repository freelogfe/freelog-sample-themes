import { useContext } from "react";
import { freelogEntrances } from "../../api/data";
import { globalContext } from "../../router";
import "./theme-entrance.scss";

export const ThemeEntrance = () => {
  const themeEntrance = freelogEntrances[2];
  const { inMobile, selfConfig } = useContext(globalContext);

  return (
    <div
      className={`theme-entrance-wrapper ${!inMobile && selfConfig.entranceShow === "显示" && "show"}`}
      onClick={() => window.open(themeEntrance.url)}
    >
      <i className="freelog fl-icon-shiyongzhuti"></i>
      <div className="text">{themeEntrance.label}</div>
    </div>
  );
};
