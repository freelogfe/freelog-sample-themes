import { useContext } from "react";
import { callLogin } from "../../api/freelog";
import { globalContext } from "../../router";
import "./login-btn.scss";

export const LoginBtn = () => {
  const { userData, inMobile } = useContext(globalContext);

  return (
    <div
      className={`login-btn-wrapper ${(userData || !inMobile) && "hidden"}`}
      onClick={() => callLogin()}
    >
      登录 / 注册
    </div>
  );
};
