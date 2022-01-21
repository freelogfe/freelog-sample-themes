import { useContext, useEffect } from "react";
import { globalContext } from "../../router";
import CSSTransition from "react-transition-group/CSSTransition";
import "./directory.scss";
import { ExhibitItem } from "../../api/interface";

export const Directory = (props: {
  book: ExhibitItem | null;
  directoryShow: boolean;
  setDirectoryShow: (show: boolean) => void;
}) => {
  const { book, directoryShow, setDirectoryShow } = props;
  const { inMobile } = useContext(globalContext);
  const directoryList = Array.from(
    { length: 12 },
    () => book?.exhibitTitle || "章节名称"
  );

  useEffect(() => {
    document.body.style.overflowY = directoryShow ? "hidden" : "auto";
  }, [directoryShow]);

  return inMobile ? (
    // mobile
    <div>
      <CSSTransition
        in={directoryShow}
        classNames="fade"
        timeout={200}
        unmountOnExit
      >
        <div className="modal" onClick={() => setDirectoryShow(false)}></div>
      </CSSTransition>

      <CSSTransition
        in={directoryShow}
        classNames="slide-right"
        timeout={200}
        unmountOnExit
      >
        <div className="mobile-directory-wrapper">
          <div className="directory-header">
            <div className="directory-title">{book?.exhibitTitle}</div>
            <i
              className="close-btn freelog fl-icon-guanbi"
              onClick={() => setDirectoryShow(false)}
            ></i>
          </div>

          <div className="directory-list">
            {directoryList.map((item, index) => {
              return (
                <div className="directory-item" key={item + index}>
                  <div className="item-content">
                    <div className={`item-title ${index === 0 && "active"}`}>
                      {item}
                    </div>
                    <i className="freelog fl-icon-zhankaigengduo"></i>
                  </div>
                </div>
              );
            })}

            <div className="no-more">— 已加载全部章节 —</div>
          </div>
        </div>
      </CSSTransition>
    </div>
  ) : (
    // PC
    <CSSTransition
      in={directoryShow}
      classNames="fade"
      timeout={200}
      unmountOnExit
    >
      <div
        className="directory-wrapper"
        onClick={() => setDirectoryShow(false)}
      >
        <div className="directory-popup" onClick={(e) => e.stopPropagation()}>
          <div className="directory-header">
            <div className="directory-title">{book?.exhibitTitle}</div>
            <i
              className="close-btn freelog fl-icon-guanbi"
              onClick={() => setDirectoryShow(false)}
            ></i>
          </div>

          {directoryList.map((item, index) => {
            return (
              <div className="directory-item" key={item + index}>
                <div className="item-title">{item}</div>
                <div className="item-status">已授权</div>
              </div>
            );
          })}

          <div className="no-more">— 已加载全部章节 —</div>
        </div>
      </div>
    </CSSTransition>
  );
};
