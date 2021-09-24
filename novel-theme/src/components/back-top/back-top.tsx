import "./back-top.scss";
import CSSTransition from "react-transition-group/CSSTransition";
import { useMyScroll } from "../../utils/hooks";
import { ReactChild } from "react";

export const BackTop = (props: { children: ReactChild; onClick?: () => void }) => {
  const { scrollTop } = useMyScroll();
  const { children, onClick } = props;

  const backToTop = () => {
    onClick && onClick();
    document.documentElement.scroll({ top: 0, behavior: "smooth" });
    document.body.scroll({ top: 0, behavior: "smooth" });
  };

  return (
    <CSSTransition in={scrollTop > 300} classNames="fade" timeout={500} unmountOnExit onClick={() => backToTop()}>
      {children}
    </CSSTransition>
  );
};
