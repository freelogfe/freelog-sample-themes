import { useContext, useMemo } from "react";
import { freelogEntrances } from "../../api/data";
import { globalContext } from "../../contexts/global-context";
import { ShareContext } from "../../contexts/share-context";
import "./home-float-menu.scss";

const themeEntrance = freelogEntrances[2];

/** PC 首页右下角：使用此主题 / 分享节点（与 comic-theme 主页分享能力对齐） */
export const HomeFloatMenu = () => {
  const { openShare } = useContext(ShareContext);
  const { selfConfig } = useContext(globalContext);

  const showThemeEntrance = useMemo(() => {
    return (
      selfConfig?.entranceShow?.trim() === "显示" ||
      selfConfig?.options_entranceShow?.trim() === "显示"
    );
  }, [selfConfig]);

  const menuList = useMemo(
    () =>
      [
        {
          icon: "freelog fl-icon-shiyongzhuti",
          label: "使用此主题",
          desc: "官方示例主题, 可免费使用",
          action: "theme" as const
        },
        {
          icon: "freelog fl-icon-fenxiang",
          label: "分享节点",
          desc: "点击下载二维码, 分享你的节点",
          action: "share" as const
        }
      ].filter(item => item.action !== "theme" || showThemeEntrance),
    [showThemeEntrance]
  );

  return (
    <div className="home-float-menu">
      {menuList.map(item => (
        <div
          className="home-float-menu-item"
          key={item.label}
          onClick={() => {
            if (item.action === "theme") {
              window.open(themeEntrance.url);
            } else {
              openShare();
            }
          }}
        >
          <div className="menu-content">
            <span className="menu-label">{item.label}</span>
            <span className="menu-desc">{item.desc}</span>
          </div>
          <i className={`${item.icon} menu-icon`} />
        </div>
      ))}
    </div>
  );
};
