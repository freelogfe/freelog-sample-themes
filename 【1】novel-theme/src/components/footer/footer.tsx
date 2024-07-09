import { useContext } from "react";
import { freelogEntrances } from "../../api/data";
import { globalContext } from "../../router";
import "./footer.scss";

/** 页面脚部 */
export const Footer = () => {
  const { inMobile } = useContext(globalContext);

  if (inMobile === true) {
    // mobile
    return (
      <div className="mobile-footer-wrapper">
        {freelogEntrances
          .filter((_, entrancesIndex) => entrancesIndex < 2)
          .map((item, index) => (
            <div
              className="second-text-btn mobile"
              key={item.label}
              onClick={() => window.open(item.url)}
            >
              {index === 0 ? <i className={item.label}></i> : <span>{item.label}</span>}
            </div>
          ))}
      </div>
    );
  } else if (inMobile === false) {
    // PC
    return (
      <div className="footer-wrapper">
        {freelogEntrances.map((item, index) => (
          <div className="second-text-btn" key={item.label} onClick={() => window.open(item.url)}>
            {index === 0 ? <i className={item.label}></i> : <span>{item.label}</span>}
          </div>
        ))}
      </div>
    );
  } else {
    return <></>;
  }
};
