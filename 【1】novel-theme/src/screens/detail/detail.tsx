import React, { useContext, useRef } from "react";
import "./detail.scss";
import AuthLinkAbnormal from "../../assets/images/auth-link-abnormal.png";
import { useState, useEffect, useCallback } from "react";
import { Header } from "../../components/header/header";
import { ExhibitItem } from "../../api/interface";
import { formatDate, getUrlParams } from "../../utils/common";
import { Tags } from "../../components/tags/tags";
import { useMyHistory, useMyShelf } from "../../utils/hooks";
import { Footer } from "../../components/footer/footer";
import { ThemeEntrance } from "../../components/theme-entrance/theme-entrance";
import { LoginBtn } from "../../components/login-btn/login-btn";
import { globalContext } from "../../router";
import { showToast } from "../../components/toast/toast";
import { freelogApp } from "freelog-runtime";

const detailContext = React.createContext<any>({});

/** 详情页 */
export const DetailScreen = (props: any) => {
  const { id } = getUrlParams(props.location.search);
  const [novel, setNovel] = useState<ExhibitItem | null>(null);

  /** 获取小说信息 */
  const getNovelInfo = useCallback(async () => {
    const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
      freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
      freelogApp.getExhibitSignCount(id),
      freelogApp.getExhibitAuthStatus(id)
    ]);
    const bookInfo = {
      ...exhibitInfo.data.data,
      signCount: signCountData.data.data[0].count,
      defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType
    };

    setNovel(bookInfo);
  }, [id]);

  useEffect(() => {
    document.documentElement.scroll({ top: 0 });
    document.body.scroll({ top: 0 });

    getNovelInfo();
    // eslint-disable-next-line
  }, []);

  return (
    <detailContext.Provider value={{ novel }}>
      <div className="detail-wrapper">
        <Header />
        <DetailBody />
        <Footer />
        <LoginBtn />
        <ThemeEntrance />
      </div>
    </detailContext.Provider>
  );
};

/** 详情页主体内容 */
const DetailBody = () => {
  const { inMobile } = useContext(globalContext);
  const { novel } = useContext(detailContext);
  const { isCollected, operateShelf } = useMyShelf(novel?.exhibitId);
  const history = useMyHistory();
  const introContent = useRef<any>();
  const shareWidget = useRef<any>();
  const [introState, setIntroState] = useState(0);
  const [href, setHref] = useState("");

  /** 移动端分享 */
  const share = () => {
    // 复制链接
    const input: any = document.getElementById("href");
    input.select();
    document.execCommand("Copy");
    showToast("链接复制成功～");
    // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: novel.exhibitId } });
  };

  /** 加载分享插件 */
  const mountShareWidget = async () => {
    if (inMobile) return;

    const container = document.getElementById("share");
    if (!container) return;

    const subDeps = await freelogApp.getSelfDependencyTree();
    const widgetData = subDeps.find(item => item.articleName === "ZhuC/Freelog插件-展品分享");
    if (!widgetData) return;

    const { articleId, parentNid, nid } = widgetData;
    const topExhibitId = freelogApp.getTopExhibitId();

    const params = {
      articleId,
      parentNid,
      nid,
      topExhibitId,
      container,
      renderWidgetOptions: {
        data: { exhibit: novel, type: "小说", routerType: "detail" }
      }
      // widget_entry: "https://localhost:8201",
    };
    shareWidget.current = await freelogApp.mountArticleWidget(params);
  };

  /** 控制分享弹窗显示 */
  const setShareWidgetShow = (value: boolean) => {
    shareWidget.current?.setData({ show: value });
  };

  useEffect(() => {
    setHref(freelogApp.getCurrentUrl());

    return () => {
      if (inMobile) return;
      (async function unmountWidget() {
        await shareWidget.current.unmount();
      })();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const introHeight = introContent.current?.clientHeight;
    const foldHeight = inMobile ? 120 : 60;
    if (introHeight > foldHeight) setIntroState(1);
    if (novel) mountShareWidget();
    // eslint-disable-next-line
  }, [novel, inMobile]);

  return inMobile ? (
    // mobile
    <div className="mobile-content">
      {/* 授权链异常提示 */}
      {novel && (
        <>
          {![0, 4].includes(novel.defaulterIdentityType) && (
            <div className="auth-link-abnormal-tip">
              <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
              <div className="tip-text">授权链异常，无法查看</div>
            </div>
          )}
          {/* 书籍信息 */}
          <div className="novel-info">
            <div className="novel-base-info">
              <div className="novel-cover">
                <img
                  className="novel-cover-image"
                  src={novel.coverImages[0]}
                  alt={novel.exhibitTitle}
                />
              </div>

              <div className="novel-content">
                <div className="content-top">
                  <div className="novel-name">{novel.exhibitTitle}</div>

                  <div className="novel-author">{novel.articleInfo.articleOwnerName}</div>

                  <div className="tags">
                    <Tags data={novel.tags || []} />
                  </div>
                </div>

                <div className="content-bottom">
                  <div className="sign-count">{novel.signCount}人签约</div>
                  <div className="share-btn" onClick={() => share()}>
                    <span className="share-btn-text">
                      <i className="freelog fl-icon-fenxiang"></i>
                      分享给更多人
                    </span>
                  </div>
                  <input id="href" className="hidden-input" value={href} readOnly />
                </div>
              </div>
            </div>

            <div className="novel-date-info">
              <div className="date-info">创建时间：{formatDate(novel.createDate)}</div>

              <div className="date-info">最近更新：{formatDate(novel.updateDate)}</div>
            </div>

            <div className="operate-btns">
              <div
                className={`btn main-btn mobile
                ${![0, 4].includes(novel.defaulterIdentityType) && "disabled"}`}
                onClick={() => history.switchPage(`/reader?id=${novel.exhibitId}`)}
              >
                立即阅读
              </div>
              <div
                className={`btn ${isCollected ? "delete" : "collect-btn mobile"}`}
                onClick={() => operateShelf(novel)}
              >
                {isCollected ? "移出书架" : "加入书架"}
              </div>
            </div>
          </div>
          {/* 书籍简介 */}
          <div className="novel-intro">
            <div className="intro-title">内容简介</div>

            {novel.exhibitIntro ? (
              <div className={`intro ${introState === 1 ? "fold" : "unfold"}`}>
                <div className="intro-content" ref={introContent}>
                  {novel.exhibitIntro}
                </div>

                {introState === 1 && (
                  <div className="view-all-btn" onClick={() => setIntroState(3)}>
                    ...查看全部
                  </div>
                )}
              </div>
            ) : (
              <div className="no-intro-tip">暂无简介</div>
            )}
          </div>
        </>
      )}
    </div>
  ) : (
    // PC
    <div className="content">
      {novel && (
        <div className="content-box">
          {/* 授权链异常提示 */}
          {![0, 4].includes(novel.defaulterIdentityType) && (
            <div className="auth-link-abnormal-tip">
              <img className="auth-link-abnormal" src={AuthLinkAbnormal} alt="授权链异常" />
              <div className="tip-text">授权链异常，无法查看</div>
            </div>
          )}
          {/* 书籍信息 */}
          <div className="novel-info">
            <div className="novel-cover">
              <img
                className="novel-cover-image"
                src={novel.coverImages[0]}
                alt={novel.exhibitTitle}
              />
            </div>

            <div className="novel-content">
              <div className="novel-name">{novel.exhibitTitle}</div>

              <div className="novel-author">{novel.articleInfo.articleOwnerName}</div>

              <div className="tags">
                <Tags data={novel.tags || []} />
              </div>

              <div className="create-date">创建时间：{formatDate(novel.createDate)}</div>

              <div className="update-date">最近更新：{formatDate(novel.updateDate)}</div>

              <div className="btns-box">
                <div className="operate-btns">
                  <div
                    className={`btn main-btn 
                    ${![0, 4].includes(novel.defaulterIdentityType) && "disabled"}`}
                    onClick={() => history.switchPage(`/reader?id=${novel.exhibitId}`)}
                  >
                    立即阅读
                  </div>
                  <div
                    className={`btn ${isCollected ? "warning-btn" : "collect-btn"}`}
                    onClick={() => operateShelf(novel)}
                  >
                    {isCollected ? "移出书架" : "加入书架"}
                  </div>
                </div>

                <div className="other-btns">
                  <div className="sign-count">{novel.signCount}人签约</div>
                  <div
                    className="share-btn"
                    onMouseOver={e => {
                      e.stopPropagation();
                      setShareWidgetShow(true);
                    }}
                    onMouseLeave={e => {
                      e.stopPropagation();
                      setShareWidgetShow(false);
                    }}
                  >
                    <span className="share-btn-text">
                      <i className="freelog fl-icon-fenxiang"></i>
                      分享给更多人
                    </span>

                    <div id="share" className="share-wrapper" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 书籍简介 */}
          <div className="novel-intro">
            <div className="intro-title">内容简介</div>

            {novel.exhibitIntro ? (
              <div className={`intro ${introState === 1 ? "fold" : "unfold"}`}>
                <div className="intro-content" ref={introContent}>
                  {novel.exhibitIntro}
                </div>

                {introState === 1 && (
                  <div className="view-all-btn" onClick={() => setIntroState(3)}>
                    ...查看全部
                  </div>
                )}
              </div>
            ) : (
              <div className="no-intro-tip">暂无简介</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
