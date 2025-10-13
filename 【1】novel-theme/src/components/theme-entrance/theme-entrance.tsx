import { useContext } from "react";
import { freelogEntrances } from "../../api/data";
import { globalContext } from "../../router";
import "./theme-entrance.scss";

export const ThemeEntrance = () => {
  const themeEntrance = freelogEntrances[2];
  const { inMobile, selfConfig } = useContext(globalContext);

  return (
    <div
      className={`theme-entrance-wrapper 
      ${
        !inMobile &&
        (selfConfig.options_entranceShow?.trim() === "显示" ||
          selfConfig.entranceShow?.trim() === "显示") &&
        "show"
      }`}
      onClick={() => window.open(themeEntrance.url)}
    >
      <i className="freelog fl-icon-shiyongzhuti"></i>
      <div className="text-wrapper">
        <div className="text">{themeEntrance.label}</div>
        <div className="text2">官方示例主题，可免费使用</div>
      </div>
    </div>
  );
};
