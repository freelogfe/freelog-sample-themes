import { useContext } from "react";
import { callLogin } from "../../api/freelog";
import { globalContext } from "../../router";
import "./login-btn.scss";

export const LoginBtn = () => {
  const { userData, inMobile, theme } = useContext(globalContext);

  return (
    <div
      className={`login-btn-wrapper main-btn mobile ${(userData || !inMobile) && "hidden"}`}
      style={{ boxShadow: `0px 2px 10px 0px ${theme.deriveColor}40` }}
      onClick={() => callLogin()}
    >
      登录 / 注册
    </div>
  );
};
