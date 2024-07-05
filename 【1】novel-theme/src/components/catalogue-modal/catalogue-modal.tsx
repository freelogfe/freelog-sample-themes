import React, { useContext } from "react";
import { globalContext } from "../../router";
import Lock from "../../assets/images/mini-lock.png";
import RightArrow from "../../assets/images/right-arrow.png";
import "./catalogue-modal.scss";

export const CatalogueModal = (props: {
  modalStatus: boolean;
  closeCatalogueModal: () => void;
}) => {
  const { inMobile } = useContext(globalContext);

  return (
    <React.Fragment>
      <div>
        <div className="catalogue-modal" onClick={props.closeCatalogueModal}></div>

        <div className={`catalogue-box-body ${!inMobile && "pc"}`}>
          <div className="title-wrapper">
            <span className="title">XX的孩子</span>
            <div className="close-btn" onClick={props.closeCatalogueModal}>
              <i className="freelog fl-icon-guanbi"></i>
            </div>
          </div>
          <div className="sub-catalogue-wrapper">
            <div className="sub">
              <div className="sub-title">第一话</div>
              {/* TODO 使用变量 */}
              {true ? (
                <img src={RightArrow} />
              ) : (
                <img className="sub-lock" src={Lock} alt="未授权" />
              )}
            </div>
            <div className="sub">
              <span className="sub-title">第一话</span>
            </div>
            <div className="sub">
              <span className="sub-title">第一话</span>
            </div>
            <div className="sub">
              <span className="sub-title">第一话</span>
            </div>
            <div className="sub">
              <span className="sub-title">第一话</span>
            </div>
            <div className="sub">
              <span className="sub-title">第一话</span>
            </div>

            <div className="tip no-more">— 已加载全部章节 —</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
