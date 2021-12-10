import { useContext } from "react";
import { freelogEntrances } from "../../api/data";
import { globalContext } from "../../router";
import "./theme-entrance.scss";

export const ThemeEntrance = () => {
  const themeEntrance = freelogEntrances[2];
  const { inMobile, selfConfig, theme } = useContext(globalContext);

  return (
    <div
      className={`theme-entrance-wrapper ${!inMobile && selfConfig.entranceShow === "显示" && "show"}`}
      style={{ boxShadow: `0px 2px 10px 0px ${theme.deriveColor}40` }}
      onClick={() => window.open(themeEntrance.url)}
    >
      <i className="freelog fl-icon-shiyongzhuti"></i>
      <div className="text">{themeEntrance.label}</div>
    </div>
  );
};
