<!-- 阅读页 -->

<template>
  <div class="reader-wrapper" :class="{ 'in-mobile': inMobile }" @mouseover="setWidgetData('show', false)">
    <my-header readerHeader />

    <!-- mobile -->
    <div class="mobile-reader-body" v-if="inMobile">
      <div class="article-info">
        <div class="article-title">{{ articleData?.exhibitTitle }}</div>
        <div class="other-info">
          <div class="info-left">
            <div class="info">{{ formatDate(articleData?.createDate) }}</div>
            <div class="divider"></div>
            <div class="info">{{ articleData?.signCount || 0 }}人已签约</div>
          </div>
          <div class="share-btn" @click="share()">
            <span class="share-btn-text"><i class="freelog fl-icon-fenxiang"></i>分享</span>
          </div>
          <input id="href" class="hidden-input" :value="href" readOnly />
        </div>
        <div class="tags">
          <tags :tags="articleData?.tags" />
        </div>
        <div class="article-content">
          <my-loader v-if="contentLoading" />

          <template v-else>
            <div id="markdown" v-if="articleData?.defaulterIdentityType === 0" />

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
        <div class="recommend-title">热门推荐</div>
        <div class="article-list">
          <my-article :data="item" v-for="item in recommendList" :key="item.presentableId" />
        </div>
      </div>
    </div>

    <!-- PC -->
    <div class="reader-body" v-if="!inMobile">
      <div class="article-card">
        <div class="title-share">
          <div class="article-title">{{ articleData?.exhibitTitle }}</div>
          <div class="share-btn" @mouseover.stop="setWidgetData('show', true)">
            <span class="share-btn-text" :class="{ active: shareShow }">
              <i class="freelog fl-icon-fenxiang"></i>分享
            </span>

            <div id="share" class="share-wrapper" />
          </div>
        </div>
        <div class="other-info">
          <div class="info">{{ formatDate(articleData?.createDate) }}</div>
          <div class="divider"></div>
          <div class="info">{{ articleData?.signCount || 0 }}人已签约</div>
          <div class="tags">
            <tags :tags="articleData?.tags" />
          </div>
        </div>
        <div class="divider"></div>
        <div class="article-content">
          <my-loader v-if="contentLoading" />

          <template v-else>
            <div id="markdown" v-if="articleData?.defaulterIdentityType === 0" />

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
          <div class="recommend-title">热门推荐</div>
          <div class="text-btn" @click="switchPage('/')">更多>></div>
        </div>
        <div class="article-list">
          <my-article :data="item" v-for="item in recommendList" :key="item.presentableId" />
        </div>
      </div>
    </div>

    <my-footer />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, onBeforeUnmount, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { ExhibitItem } from "@/api/interface";
import {
  addAuth,
  getExhibitAuthStatus,
  getExhibitFileStream,
  getExhibitInfo,
  getExhibitSignCount,
  getSubDep,
  mountWidget,
  getCurrentUrl,
  pushMessage4Task,
} from "@/api/freelog";
import { formatDate } from "@/utils/common";
import { useStore } from "vuex";
import { showToast } from "@/utils/common";

export default {
  name: "reader",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    "my-article": defineAsyncComponent(() => import("../components/article.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage, getCurrentPath } = useMyRouter();
    const datasOfGetList = useGetList();
    const { scrollTo } = useMyScroll();

    const data = reactive({
      contentLoading: false,
      articleData: null as ExhibitItem | null,
      contentInfo: null as { content: string; exhibitInfo: ExhibitItem } | null,
      recommendList: [] as ExhibitItem[],
      shareShow: false,
      href: "",
      shareWidget: null as any,
      markdownWidget: null as any,
    });

    const methods = {
      /** 移动端分享 */
      share() {
        const input: any = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: data.articleData?.exhibitId } });
      },

      /** 获取授权 */
      async getAuth() {
        const { id } = query.value;
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) {
          getData();
          refreshAuth();
        }
      },

      /** 通知插件更新数据 */
      setWidgetData(key: string, value: any) {
        if (data.shareWidget && data.shareWidget.getApi().setData) {
          data.shareWidget.getApi().setData(key, value);
        }
      },
    };

    /** 获取文章信息与内容 */
    const getData = async () => {
      data.contentLoading = true;
      const { id } = query.value;

      const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
        getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        getExhibitSignCount(id),
        getExhibitAuthStatus(id),
      ]);
      data.articleData = {
        ...exhibitInfo.data.data,
        signCount: signCountData.data.data[0].count,
        defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType,
      } as ExhibitItem;

      data.href = getCurrentUrl();
      mountShareWidget();

      if (data.articleData.defaulterIdentityType === 0) {
        // 已签约并且授权链无异常
        const info: any = await getExhibitFileStream(id);
        if (!info) {
          data.contentLoading = false;
          return;
        }

        data.contentInfo = {
          content: info.data,
          exhibitInfo: exhibitInfo.data.data,
        };
      } else if (data.articleData.defaulterIdentityType === 4) {
        // 标的物未签约，自动弹出授权弹窗
        methods.getAuth();
      }

      data.contentLoading = false;
      if (data.articleData.defaulterIdentityType === 0) mountMarkdownWidget();
      await datasOfGetList.getList({ limit: 4 }, true);
      const recommendList = datasOfGetList.listData.value.filter((item: ExhibitItem) => item.exhibitId !== id);
      data.recommendList = recommendList.filter((_: any, index: number) => index < 4);
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

      if (data.shareWidget) await data.shareWidget.unmount();
      const themeData = await getSubDep();
      const widget = themeData.subDep.find((item: any) => item.name === "ZhuC/Freelog插件-展品分享");
      if (!widget) return;
      // eslint-disable-next-line require-atomic-updates
      data.shareWidget = await mountWidget({
        widget,
        container: document.getElementById("share"),
        topExhibitData: themeData,
        config: { exhibit: data.articleData, type: "博客" },
      });
    };

    /** 加载 markdown 插件 */
    const mountMarkdownWidget = async () => {
      const themeData = await getSubDep();
      const widget = themeData.subDep.find((item: any) => item.name === "ZhuC/Freelog插件-markdown解析");
      if (!widget) return;
      data.markdownWidget = await mountWidget({
        widget,
        container: document.getElementById("markdown"),
        topExhibitData: themeData,
        config: { exhibitInfo: data.contentInfo?.exhibitInfo, content: data.contentInfo?.content },
      });
    };

    watch(
      () => query.value,
      () => {
        const path = getCurrentPath();
        if (!path.startsWith("/reader")) return;

        scrollTo(0, "auto");
        data.articleData = null;
        data.contentInfo = null;
        data.recommendList = [];
        getData();
      }
    );

    onBeforeUnmount(async () => {
      await data.shareWidget?.unmount();
      await data.markdownWidget?.unmount();
    });

    getData();

    return {
      ...toRefs(store.state),
      switchPage,
      formatDate,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
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
  background: #fafbfc;

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
        height: 24px;
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
      padding: 20px 20px 0;
      box-sizing: border-box;
      margin-top: 5px;
      background-color: #fff;

      .recommend-title {
        font-size: 16px;
        font-weight: 600;
        color: #222222;
        line-height: 22px;
      }

      .article-list {
        margin-top: 5px;

        .article-wrapper:last-child {
          border-bottom: none;
        }
      }
    }
  }

  // PC
  .reader-body {
    width: 920px;
    padding-top: 30px;

    .article-card {
      width: 100%;
      min-height: calc(100vh - 130px);
      background: #ffffff;
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      padding: 25px 30px;
      box-sizing: border-box;

      .title-share {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .article-title {
          font-size: 24px;
          font-weight: 600;
          color: #222222;
          line-height: 30px;
        }

        .share-btn {
          position: relative;
          display: flex;
          align-items: center;
          margin-left: 30px;
          cursor: pointer;

          .share-btn-text {
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
          color: #999999;
        }

        .divider {
          width: 1px;
          height: 14px;
          background: rgba(0, 0, 0, 0.15);
          margin: 0 10px;
        }

        .tags {
          margin-left: 20px;
          height: 24px;
          overflow: hidden;
        }
      }

      .divider {
        width: 100%;
        height: 1px;
        background-color: rgba(0, 0, 0, 0.1);
        margin: 25px 0;
      }

      .article-content {
        font-size: 14px;
        color: #222222;
        line-height: 24px;

        #markdown {
          position: relative;
          z-index: 0;
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
        margin-top: 15px;

        .article-wrapper:first-child {
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
