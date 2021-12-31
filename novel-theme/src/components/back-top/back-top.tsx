import "./back-top.scss";
import CSSTransition from "react-transition-group/CSSTransition";
import { useMyScroll } from "../../utils/hooks";
import { ReactChild } from "react";

export const BackTop = (props: { children: ReactChild; onClick?: () => void }) => {
  const { scrollTop, scrollToTop } = useMyScroll();
  const { children, onClick } = props;

  const backToTop = () => {
    onClick && onClick();
    scrollToTop();
  };

  return (
    <CSSTransition in={scrollTop > 300} classNames="fade" timeout={500} unmountOnExit onClick={() => backToTop()}>
      {children}
    </CSSTransition>
  );
};
