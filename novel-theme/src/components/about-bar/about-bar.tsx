import { useState } from "react";
import "./about-bar.scss";
import CSSTransition from "react-transition-group/CSSTransition";

export const AboutBar = () => {
  const [aboutShow, setAboutShow] = useState(false);
  const openWeb = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url);
  };

  return (
    <div>
      <div
        className={`about-btn p-fixed l-0 b-5 brs-50p text-center fc-white cur-pointer z-1 ${aboutShow ? "active" : ""}`}
        onClick={() => setAboutShow(!aboutShow)}
      >
        about
      </div>

      <CSSTransition in={aboutShow} classNames="fade" timeout={500} unmountOnExit>
        <div
          className="about-bar-wrapper p-fixed lb-0 w-100p pr-26 b-box flex-row align-center justify-end"
          onClick={() => setAboutShow(false)}
        >
          <div className="cur-pointer" onClick={(e) => openWeb(e, "http://console.testfreelog.com")}>
            关于freelog
          </div>
          <div
            className="ml-50 cur-pointer"
            onClick={(e) => openWeb(e, "http://console.testfreelog.com/resource/details/60ef9c4ea11650002e840fcd")}
          >
            关于此主题
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};
