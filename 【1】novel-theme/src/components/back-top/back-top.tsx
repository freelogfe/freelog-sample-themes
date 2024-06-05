import "./back-top.scss";
import CSSTransition from "react-transition-group/CSSTransition";
import { useMyScroll } from "../../utils/hooks";
import React, { ReactChild } from "react";

/** 回到顶部控件 */
export const BackTop = (props: { children: ReactChild; onClick?: () => void }) => {
  const { scrollTop, scrollToTop } = useMyScroll();
  const { children, onClick } = props;

  /** 回到顶部 */
  const backToTop = () => {
    onClick && onClick();
    scrollToTop();
  };

  return (
    <CSSTransition in={scrollTop > 300} classNames="fade" timeout={500} unmountOnExit onClick={() => backToTop()}>
      <React.Fragment>
        {children}
      </React.Fragment>
    </CSSTransition>
  );
};
