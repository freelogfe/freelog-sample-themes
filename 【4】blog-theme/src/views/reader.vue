<!-- 阅读页 -->

<template>
  <div class="reader-wrapper" :class="{ 'in-mobile': inMobile }">
    <div v-if="articleData?.articleInfo?.status === 1">
      <!-- mobile -->
      <div class="mobile-reader-body" v-if="inMobile">
        <div class="article-info">
          <div class="article-cover">
            <img :src="articleData?.coverImages[0]" alt="">
          </div>
          <div class="article-title">{{ articleData?.exhibitTitle }}</div>
          <div class="other-info">
            <div class="info-left">
              <div class="info">{{ formatDate(articleData?.createDate) }}</div>
            </div>
            <div class="share-btn" @click="share()">
              <span class="share-btn-text"><i class="freelog fl-icon-fenxiang"></i>分享</span>
            </div>
            <input id="href" class="hidden-input" :value="href" readOnly />
          </div>
          <div class="tags" v-if="articleData?.tags?.length">
            <tags :tags="articleData?.tags" />
          </div>
          <div class="article-content">
            <my-loader v-if="contentLoading" />

            <template v-else>
              <div id="markdown" v-if="articleData?.defaulterIdentityType === 0"></div>
              <template v-else-if="articleData?.defaulterIdentityType">
                <div class="auth-box" v-if="articleData?.defaulterIdentityType !== 4">
                  <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
                  <div class="auth-link-tip">授权链异常，无法查看</div>
                  <div class="home-btn" @click="switchPage('/home')">进入首页</div>
                </div>

                <div class="lock-box" v-else-if="articleData?.defaulterIdentityType === 4 || userData.isLogin === false">
                  <img class="lock" src="../assets/images/lock.png" />
                  <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
                  <div class="get-btn" @click="getAuth()">获取授权</div>
                </div>
              </template>
            </template>
          </div>
        </div>

        <div class="recommend">
          <div class="recommend-title">推荐</div>
          <div class="article-list">
            <my-article-v2 :data="item" v-for="item in recommendList" :key="item.exhibitId" />
          </div>
        </div>
      </div>

      <!-- PC -->
      <div class="reader-body" v-if="!inMobile">
        <div class="article-cover">
          <img :src="articleData?.coverImages[0]" alt="">
        </div>
        <div class="article-card">
          <div class="title-share">
            <div class="article-title">{{ articleData?.exhibitTitle }}</div>
            <div
              class="share-btn"
              @mouseenter.stop="setShareWidgetShow(true)"
              @mouseleave.stop="setShareWidgetShow(false)"
            >
              <span class="share-btn-text" :class="{ active: shareShow }">
                <i class="freelog fl-icon-fenxiang"></i>分享
              </span>

              <div id="share" class="share-wrapper" />
            </div>
          </div>
          <div class="other-info">
            <div class="info">{{ formatDate(articleData?.createDate) }}</div>
          </div>
          <div class="tags" v-if="articleData?.tags?.length">
            <tags :tags="articleData?.tags" />
          </div>
          <div class="article-content">
            <my-loader v-if="contentLoading" />

            <template v-else>
              <div class="markdown-area" v-if="articleData?.defaulterIdentityType === 0">
                <div class="markdown-wrapper">
                  <div class="divider"></div>
                  <div id="markdown" :ref="(el) => { markdownRef = el }"></div>
                </div>

                <div class="category-wrapper">
                  <div class="divider"></div>
                  <div class="data">
                    <div class="title-directory-box">
                      <div class="title-directory">
                        <div
                          class="directory-item"
                          :class="{
                            active: currentTitle === item.innerText,
                            second: item.nodeName === 'H2',
                            third: item.nodeName === 'H3',
                          }"
                          :title="item.innerText"
                          v-for="item in directoryList"
                          :key="item.id"
                          @click="jumpToTitle(item.innerText)"
                        >
                          <span>{{ item.innerText }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <template v-else-if="articleData?.defaulterIdentityType">
                <div class="auth-box" v-if="articleData?.defaulterIdentityType !== 4">
                  <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
                  <div class="auth-link-tip">授权链异常，无法查看</div>
                  <div class="home-btn" @click="switchPage('/home')">进入首页</div>
                </div>

                <div class="lock-box" v-else-if="articleData?.defaulterIdentityType === 4 || userData.isLogin === false">
                  <img class="lock" src="../assets/images/lock.png" />
                  <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
                  <div class="get-btn" @click="getAuth()">获取授权</div>
                </div>
              </template>
            </template>
          </div>
        </div>

        <div class="recommend">
          <div class="recommend-header">
            <div class="recommend-title">相关推荐</div>
            <div class="text-btn" @click="switchPage('/')">更多>></div>
          </div>
          <div class="article-list">
            <my-article-v2 :data="item" v-for="item in recommendList" :key="item.exhibitId" />
          </div>
        </div>
      </div>
    </div>
    <div class="reader-weigui" v-else>
      <!-- mobile -->
      <div class="detail-weigui-mobile" v-if="inMobile">
        <div class="mobile">
          <div class="info">
            <div class="info-header">
              <div ref="cover" class="cover-area">
                <img class="cover" :src="articleData?.coverImages[0]" v-if="articleData?.coverImages[0]" />
                <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
              </div>
              <div class="title-area">
                <img
                  class="auth-link-abnormal"
                  src="../assets/images/auth-link-abnormal.png"
                  v-if="authLinkAbnormal"
                />
                <i
                  class="freelog fl-icon-suoding lock"
                  @click.stop="getAuth()"
                  v-if="articleData?.defaulterIdentityType && articleData?.defaulterIdentityType >= 4"
                ></i>
                <div class="title" :content="articleData?.exhibitTitle">
                  <span>{{ articleData?.exhibitTitle }}</span>
                </div>
              </div>
            </div>
            <div class="info-area">
              <div class="info-item">
                <i class="freelog fl-icon-gengxinshijian"></i>
                <div class="item-value">{{ relativeTime(articleData?.updateDate) }}</div>
              </div>
              <div class="info-item">
                <i class="freelog fl-icon-yonghu"></i>
                <div class="item-value">{{ signCount(articleData?.signCount) }}</div>
              </div>
            </div>
          </div>
          <span class="freelog fl-icon-ziyuanweiguitishi_wendang weigui-icon"></span>
        </div>
      </div>
      <!-- pc -->
      <div v-else class="detail-weigui-pc">
        <div class="pc">
          <span class="freelog fl-icon-ziyuanweiguitishi_wendang weigui-icon"></span>
          <div class="info">
            <div ref="cover" class="cover-area">
              <img class="cover" :src="articleData?.coverImages[0]" />
            </div>
            <img
              class="auth-link-abnormal"
              src="../assets/images/auth-link-abnormal.png"
              v-if="authLinkAbnormal"
            />
            <i class="freelog fl-icon-suoding lock" @click.stop="getAuth()" v-if="articleData?.defaulterIdentityType && articleData?.defaulterIdentityType >= 4"></i>
            <div class="title" :content="articleData?.exhibitTitle">
              <span>{{ articleData?.exhibitTitle }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, nextTick, onBeforeUnmount, reactive, toRefs, watch, ref, computed } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { ExhibitItem } from "@/api/interface";
import { formatDate, relativeTime, signCount } from "@/utils/common";
import { useStore } from "vuex";
import { showToast } from "@/utils/common";
import { WidgetController, freelogApp } from "freelog-runtime";

export default {
  name: "reader",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    "my-article-v2": defineAsyncComponent(() => import("../components/article-v2.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue"))
  },

  setup() {
    const store = useStore();
    const { query, switchPage, getCurrentPath } = useMyRouter();
    const datasOfGetList = useGetList();
    const { scrollTo } = useMyScroll();
    console.log("query", query.value);
    
    const markdownRef = ref(null) as any
    const data = reactive({
      contentLoading: false,
      articleData: null as ExhibitItem | null,
      contentInfo: null as { content: string; exhibitInfo: ExhibitItem } | null,
      recommendList: [] as ExhibitItem[],
      shareShow: false,
      href: "",
      shareWidget: null as WidgetController | null,
      markdownWidget: null as WidgetController | null,
      timeId: 0,
      directoryList: [] as Array<any>,
      currentTitle: null as any
    });

    const authLinkAbnormal = computed(() => {
      return ![0, 4].includes(data.articleData?.defaulterIdentityType as any)
    })

    const inMobile = computed(() => {
      return store.state.inMobile
    })

    const userData = computed(() => {
      return store.state.userData
    })

    const methods = {
      /** 移动端分享 */
      share() {
        const input: any = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: data.articleData?.exhibitId } });
      },

      /** 获取授权 */
      async getAuth() {
        const { id } = query.value;
        const authResult = await freelogApp.addAuth(id, { immediate: true });
        const { status } = authResult;
        if (status === 0) {
          getData();
          refreshAuth();
        }
      },

      /** 控制分享弹窗显示 */
      setShareWidgetShow(value: boolean) {
        data.shareWidget?.setData({ show: value });
      },

      /** 跳到标题位置 */
      jumpToTitle(title: string) {
        data.currentTitle = title
        const el: any = data.directoryList.find((item) => item.innerText === title);
        if (!el) return;
        scrollTo(800)
        const markdownApp = document.getElementById("markdown")
        markdownApp!.scrollTo({
          top: el.offsetTop,
          behavior: "smooth"
        });
      },

      /** 处理滚动 */
      handleScroll(e: any) {
        for (let index = 0; index < data.directoryList.length; index++) {
          const element = data.directoryList[index];
          if (e.target.scrollTop <= element.offsetTop) {
            data.currentTitle = element.innerText
            break
          }
        }
      }
    };

    /** 获取文章信息与内容 */
    const getData = async () => {
      scrollTo(0, "auto");

      data.contentLoading = true;
      const { id } = query.value;

      const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
        freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitSignCount(id),
        freelogApp.getExhibitAuthStatus(id),
      ]);
      const { defaulterIdentityType } = statusInfo.data.data[0];
      data.articleData = {
        ...exhibitInfo.data.data,
        signCount: signCountData.data.data[0].count,
        defaulterIdentityType,
      };
      
      data.href = freelogApp.getCurrentUrl();
      nextTick(() => {
        mountShareWidget();
      });

      if (defaulterIdentityType === 0) {
        // 已签约并且授权链无异常
        
        const info = await freelogApp.getExhibitFileStream(id);

        if (!info) {
          data.contentLoading = false;
          return;
        }

        data.contentInfo = {
          content: info.data,
          exhibitInfo: exhibitInfo.data.data,
        };
      } else if (defaulterIdentityType === 4) {
        // 标的物未签约，自动弹出授权弹窗
        methods.getAuth();
      }

      data.contentLoading = false;
      nextTick(() => {
        mountMarkdownWidget();
      });
      await datasOfGetList.getList({ limit: 30 }, true);
      
      const recommendList = datasOfGetList.listData.value.filter((item) => item.exhibitId !== id);
      data.recommendList = recommendList;
    };

    /** 刷新授权状态 */
    const refreshAuth = () => {
      const { authIds } = store.state;
      authIds.push(data.articleData?.exhibitId);
      store.commit("setData", { key: "authIds", value: authIds });
    };

    /** 加载分享插件 */
    const mountShareWidget = async () => {
      
      if (store.state.inMobile) return;

      const container = document.getElementById("share");
      if (!container) return;

      if (data.shareWidget) await data.shareWidget.unmount();

      const subDeps = await freelogApp.getSelfDependencyTree();
      console.log("subDeps", subDeps);
      
      const widgetData = subDeps.find((item) => item.articleName === "ZhuC/Freelog插件-展品分享");
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
          data: { exhibit: data.articleData, type: "博客", routerType: "content" },
        },
        // widget_entry: "https://localhost:8201",
      };
      data.shareWidget = await freelogApp.mountArticleWidget(params);
    };

    /** 加载 markdown 插件 */
    const mountMarkdownWidget = async () => {
      const container = document.getElementById("markdown");
      if (!container) return;

      const subDeps = await freelogApp.getSelfDependencyTree();
      const widgetData = subDeps.find((item) => item.articleName === "ZhuC/Freelog插件-markdown解析");
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
          data: { exhibitInfo: data.contentInfo?.exhibitInfo, content: data.contentInfo?.content },
        },
        // widget_entry: "https://localhost:8202",
      };
      data.markdownWidget = await freelogApp.mountArticleWidget(params);      
      data.timeId = setInterval(() => {
        const articleDoms = document.querySelector('#markdown-widget-app')?.children[0] && 
          document.querySelector('#markdown-widget-app')?.children[0]?.children
        if (articleDoms) {
          clearInterval(data.timeId)
          const doms = Array.from(articleDoms)
          data.directoryList = doms.filter((item: any) => ["H1", "H2", "H3"].includes(item.nodeName));
        }
      }, 1500)
    };

    watch(
      () => query.value,
      () => {
        const path = getCurrentPath();
        if (!path.startsWith("/reader")) return;

        data.articleData = null;
        data.contentInfo = null;
        data.recommendList = [];
        getData();
      }
    );


    watch(
      markdownRef,
      (cur) => {
        markdownRef.value && markdownRef.value.addEventListener('scroll', methods.handleScroll)
      }
    )

    onBeforeUnmount(async () => {
      await data.shareWidget?.unmount();
      await data.markdownWidget?.unmount();
      markdownRef.value && markdownRef.value.removeEventListener('scroll', methods.handleScroll)
    });

    getData();

    return {
      switchPage,
      formatDate,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
      markdownRef,
      signCount,
      relativeTime,
      authLinkAbnormal,
      inMobile,
      userData
    };
  },
};
</script>

<style lang="scss" scoped>
.reader-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 148px;
  box-sizing: border-box;

  &.in-mobile {
    background: rgba(0, 0, 0, 0.03);
    padding-bottom: 98px;
  }

  // mobile
  .mobile-reader-body {
    width: 100%;

    .article-info {
      width: 100%;
      min-height: calc(100vh - 64px);
      background: #ffffff;
      padding: 20px;
      box-sizing: border-box;

      .article-cover {
        width: 100%;
        margin-bottom: 30px;
        img {
          width: 100%;
        }
      }

      .article-title {
        font-size: 20px;
        font-weight: 600;
        color: #222222;
        line-height: 28px;
      }

      .other-info {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;

        .info-left {
          display: flex;
          align-items: center;

          .info {
            font-size: 12px;
            line-height: 18px;
            color: #999999;
          }

          .divider {
            width: 1px;
            height: 14px;
            background: rgba(0, 0, 0, 0.15);
            margin: 0 10px;
          }
        }

        .share-btn {
          position: relative;
          display: flex;
          align-items: center;
          margin-left: 20px;

          .share-btn-text {
            font-size: 12px;
            line-height: 18px;
            color: #999999;

            &:active {
              color: #666666;
            }

            .fl-icon-fenxiang {
              font-size: 14px;
              margin-right: 5px;
            }
          }
        }

        .hidden-input {
          position: absolute;
          z-index: -1;
        }
      }

      .tags {
        margin-top: 12px;
        overflow: hidden;
      }

      .article-content {
        font-size: 18px;
        color: #222222;
        line-height: 32px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        padding-top: 20px;
        margin-top: 20px;

        .auth-box {
          width: 100%;
          padding: 110px 0;
          display: flex;
          flex-direction: column;
          align-items: center;

          .auth-link-abnormal {
            width: 72px;
            height: 72px;
          }

          .auth-link-tip {
            font-size: 16px;
            color: #222222;
            line-height: 22px;
            margin-top: 30px;
          }

          .home-btn {
            padding: 9px 20px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 20px;
            background-color: #f2f2f2;
            color: #666;
            margin-top: 30px;
            cursor: pointer;

            &:hover {
              opacity: 0.8;
            }

            &:active {
              opacity: 0.6;
            }
          }
        }

        .lock-box {
          width: 100%;
          padding: 110px 0;
          display: flex;
          flex-direction: column;
          align-items: center;

          .lock {
            width: 48px;
            height: 48px;
          }

          .lock-tip {
            font-size: 16px;
            color: #999999;
            line-height: 22px;
            margin-top: 30px;
          }

          .get-btn {
            padding: 9px 20px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 20px;
            font-weight: bold;
            background-color: #2784ff;
            color: #fff;
            margin-top: 30px;
            cursor: pointer;

            &:hover {
              background-color: #529dff;
            }

            &:active {
              background-color: #2376e5;
            }
          }
        }
      }
    }

    .recommend {
      width: 100%;
      padding: 30px 20px;
      box-sizing: border-box;
      margin-top: 5px;
      background-color: #fff;

      .recommend-title {
        font-size: 16px;
        font-weight: 600;
        color: #222222;
        line-height: 22px;
        margin-bottom: 30px;
      }

      .article-list {
        margin-top: 5px;
        .article-wrapper-v2 {
          margin-bottom: 30px;
        }
        .article-wrapper-v2:last-child {
          border-bottom: none;
          margin-bottom: 0px;
        }
      }
    }
  }

  // PC
  .reader-body {
    width: 965px;

    .article-cover {
      width: 965px;
      height: 654px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .article-card {
      width: 100%;
      box-sizing: border-box;
      padding-top: 50px;

      .title-share {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .article-title {
          font-size: 36px;
          font-weight: 600;
          color: #222222;
          line-height: 46px;
        }

        .share-btn {
          flex-shrink: 0;
          position: relative;
          display: flex;
          align-items: center;
          margin-left: 30px;
          cursor: pointer;

          .share-btn-text {
            padding: 9px 15px;
            border: 1px solid #666666;
            border-radius: 4px;
            font-size: 14px;
            line-height: 20px;
            color: #222;
            transition: all 0.2s linear;

            &:hover,
            &.active {
              opacity: 0.8;
            }

            &:active {
              opacity: 0.6;
            }

            .fl-icon-fenxiang {
              margin-right: 6px;
            }
          }

          .share-wrapper {
            position: absolute;
            right: 0;
            top: 100%;
            z-index: 1
          }
        }
      }

      .other-info {
        height: 24px;
        margin-top: 12px;
        display: flex;
        align-items: center;

        .info {
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 400;
          color: #666666;
          line-height: 18px;
        }

        .divider {
          width: 1px;
          height: 14px;
          background: rgba(0, 0, 0, 0.15);
          margin: 0 10px;
        }

      }

      .tags {
        margin-top: 15px;
      }

      .article-content {
        font-size: 14px;
        color: #222222;
        line-height: 24px;

        .markdown-area {
          display: flex;

          .divider {
            margin: 30px 0px;
            height: 1px;
            background-color: rgba(0,0,0,0.1);
          }

          .markdown-wrapper {
            width: 725px;
            margin-right: auto;

            #markdown-widget-app .markdown-wrapper {
              background-color: transparent;
            }
            #markdown {
              position: relative;
              z-index: 0;
              max-height: calc(100vh - 130px);
              overflow: auto;
              
              /* 滚动条轨道样式 */
              &::-webkit-scrollbar {
                width: 8px; /* 设置滚动条宽度 */
              }
              
              /* 滚动条滑块样式 */
              &::-webkit-scrollbar-thumb {
                background-color: #e4e4e4; /* 设置滑块背景颜色 */
                border-radius: 4px; /* 设置滑块圆角 */
              }
              
              /* 滚动条轨道hover状态样式 */
              &::-webkit-scrollbar-track:hover {
                background-color: #f1f1f1; /* 设置轨道hover状态时的背景颜色 */
              }
              
              /* 滚动条滑块hover状态样式 */
              &::-webkit-scrollbar-thumb:hover {
                background-color: #555; /* 设置滑块hover状态时的背景颜色 */
              }
            }
          }
          .category-wrapper {
            width: 200px;
            .data {
              .title-directory-box {
                position: sticky;
                top: 70px;
                height: calc(100vh - 130px);
                box-sizing: border-box;
                background-color: #fff;

                .title-directory {
                  width: 100%;
                  height: fit-content;
                  max-height: 100%;
                  overflow-y: auto;

                  &::-webkit-scrollbar {
                    width: 0;
                  }

                  .directory-item {
                    width: 100%;
                    padding: 0 8px;
                    box-sizing: border-box;
                    font-size: 14px;
                    color: #999999;
                    line-height: 20px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    cursor: pointer;
                    transition: all 0.2s linear;

                    &.second {
                      padding-left: 50px;
                    }

                    &.third {
                      padding-left: 70px;
                    }

                    &:hover,
                    &.active {
                      color: #2784ff;
                    }

                    & + .directory-item {
                      margin-top: 15px;
                    }
                  }
                }
              }
            }
          }
        }

        .auth-box {
          width: 100%;
          padding: 110px 0;
          display: flex;
          flex-direction: column;
          align-items: center;

          .auth-link-abnormal {
            width: 72px;
            height: 72px;
          }

          .auth-link-tip {
            font-size: 16px;
            color: #222222;
            line-height: 22px;
            margin-top: 30px;
          }

          .home-btn {
            padding: 9px 20px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 20px;
            background-color: #f2f2f2;
            color: #666;
            margin-top: 30px;
            cursor: pointer;

            &:hover {
              opacity: 0.8;
            }

            &:active {
              opacity: 0.6;
            }
          }
        }

        .lock-box {
          width: 100%;
          padding: 110px 0;
          display: flex;
          flex-direction: column;
          align-items: center;

          .lock {
            width: 48px;
            height: 48px;
          }

          .lock-tip {
            font-size: 16px;
            color: #999999;
            line-height: 22px;
            margin-top: 30px;
          }

          .get-btn {
            padding: 9px 20px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 20px;
            font-weight: bold;
            background-color: #2784ff;
            color: #fff;
            margin-top: 30px;
            cursor: pointer;

            &:hover {
              background-color: #529dff;
            }

            &:active {
              background-color: #2376e5;
            }
          }
        }
      }
    }

    .recommend {
      margin-top: 50px;

      .recommend-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .recommend-title {
          font-size: 14px;
          font-weight: 600;
          color: #222222;
          line-height: 20px;
        }

        .text-btn {
          font-size: 14px;
          line-height: 20px;
        }
      }

      .article-list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
        margin-top: 15px;

        .article-wrapper:first-child {
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .reader-weigui {
    .detail-weigui-mobile {
      .mobile {
        text-align: center;
        .info {
          padding-top: 30px;
          padding-bottom: 187px;

          .info-header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;

            .cover-area {
              position: relative;
              width: 48px;
              height: 48px;
              background: #222;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-sizing: border-box;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              z-index: 1;
              margin-right: 20px;
              .cover {
                height: 100%;
              }
            }
        
            .title-area {
              display: flex;
              align-items: center;
              justify-content: center;
        
              .auth-link-abnormal {
                width: 16px;
                height: 16px;
                margin-right: 5px;
              }
        
              .lock {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.6);
                margin-right: 5px;
              }
        
              .title {
                font-size: 18px;
                font-weight: 600;
                color: #222;
                line-height: 24px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
        
          }

          .info-area {
            color: rgba(255, 255, 255, 0.4);
            display: flex;
            justify-content: center;
            margin-top: 10px;
      
            .info-item {
              display: flex;
              align-items: center;
      
              & + .info-item {
                margin-left: 10px;
              }
      
              .freelog {
                font-size: 14px;
              }
      
              .item-value {
                font-size: 12px;
                line-height: 18px;
                margin-left: 5px;
              }
            }
          }
        }
        .weigui-icon {
          font-size: 165px;
          opacity: 0.4;
        }
      }
    }

    .detail-weigui-pc {
      height: calc(100vh - 146px);
      display: flex;
      justify-content: center;
      align-items: center;
  
      .pc {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 348px;
  
        .weigui-icon {
          font-size: 220px;
          opacity: 0.4;
        }
  
        .info {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 450px;
          margin-top: 40px;
  
          .cover-area {
            position: relative;
            width: 48px;
            height: 48px;
            background: #222;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
            margin-right: 20px;
            .cover {
              height: 100%;
            }
          }
  
          .auth-link-abnormal {
            width: 20px;
            height: 20px;
            margin-right: 10px;
          }
  
          .lock {
            font-size: 20px;
            color: rgba(255, 255, 255, 0.8);
            margin-right: 10px;
            cursor: pointer;
          }
  
          .type-mark {
            padding: 6px 15px;
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            font-size: 14px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.4);
            line-height: 20px;
          }
  
          .title {
            color: #222;
            font-size: 20px;
            font-weight: 600;
            line-height: 56px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-left: 10px;
          }
  
        }
      }
    }
  }
}
</style>
