<!-- 详情页 -->

<template>
  <div class="detail-wrapper">
    <my-header />

    <!-- mobile -->
    <div class="mobile-content" v-if="inMobile">
      <div
        class="auth-link-abnormal-tip"
        v-if="comicInfo.defaulterIdentityType && ![0, 4].includes(comicInfo.defaulterIdentityType)"
      >
        <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
        <div class="tip-text">授权链异常，无法查看</div>
      </div>

      <!-- 漫画信息 -->
      <div class="comic-info">
        <div class="comic-base-info">
          <div class="comic-cover">
            <img
              class="comic-cover-image"
              :src="comicInfo?.coverImages[0]"
              :alt="comicInfo?.exhibitTitle"
              v-if="comicInfo?.coverImages"
            />
          </div>

          <div class="comic-content">
            <div class="content-top">
              <div class="comic-name">{{ comicInfo?.exhibitTitle }}</div>

              <div class="comic-author">
                {{ comicInfo?.articleInfo?.articleOwnerName }}
              </div>

              <div class="tags">
                <tags :tags="comicInfo?.tags" />
              </div>
            </div>

            <div class="content-bottom">
              <div class="sign-count">{{ comicInfo?.signCount }}人签约</div>
              <div class="share-btn" @click="share()">
                <span class="share-btn-text">
                  <i class="freelog fl-icon-fenxiang"></i>
                  分享给更多人
                </span>
              </div>
              <input id="href" class="hidden-input" :value="href" readOnly />
            </div>
          </div>
        </div>

        <div class="comic-date-info">
          <div class="date-info">创建时间：{{ formatDate(comicInfo?.createDate) }}</div>

          <div class="date-info">最近更新：{{ formatDate(comicInfo?.updateDate) }}</div>
        </div>

        <div class="operate-btns">
          <div
            class="btn main-btn mobile"
            :class="{ disabled: ![0, 4].includes(comicInfo.defaulterIdentityType) }"
            @click="switchPage('/reader', { id: comicInfo?.exhibitId })"
          >
            立即阅读
          </div>
          <div class="btn" :class="isCollected ? 'delete' : 'collect-btn mobile'" @click="operateShelf(comicInfo)">
            {{ isCollected ? "取消收藏" : "加入收藏" }}
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 漫画简介 -->
      <div class="comic-intro">
        <div class="intro-title">内容简介</div>

        <div class="intro" :class="introState === 1 ? 'fold' : 'unfold'" v-if="comicInfo?.exhibitIntro">
          <div ref="introContent" class="intro-content">
            {{ comicInfo?.exhibitIntro }}
          </div>

          <div class="view-all-btn" @click="introState = 3" v-if="introState === 1">...查看全部</div>
        </div>
        <div class="no-intro-tip" v-else>暂无简介</div>
      </div>

      <login-btn />
    </div>

    <!-- PC -->
    <div class="content" @mouseover="setWidgetData('show', false)" v-if="!inMobile">
      <div
        class="auth-link-abnormal-tip"
        v-if="comicInfo.defaulterIdentityType && ![0, 4].includes(comicInfo.defaulterIdentityType)"
      >
        <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
        <div class="tip-text">授权链异常，无法查看</div>
      </div>

      <div class="content-box">
        <!-- 漫画信息 -->
        <div class="comic-info">
          <div class="comic-cover">
            <img
              class="comic-cover-image"
              :src="comicInfo?.coverImages[0]"
              :alt="comicInfo?.exhibitTitle"
              v-if="comicInfo?.coverImages"
            />
          </div>

          <div class="comic-content">
            <div class="comic-name" :title="comicInfo?.exhibitTitle">{{ comicInfo?.exhibitTitle }}</div>

            <div class="comic-author">
              {{ comicInfo?.articleInfo?.articleOwnerName }}
            </div>

            <div class="tags">
              <tags :tags="comicInfo?.tags" />
            </div>

            <div class="create-date">创建时间：{{ formatDate(comicInfo?.createDate) }}</div>

            <div class="update-date">最近更新：{{ formatDate(comicInfo?.updateDate) }}</div>

            <div class="btns-box">
              <div class="operate-btns">
                <div
                  class="btn main-btn"
                  :class="{ disabled: ![0, 4].includes(comicInfo.defaulterIdentityType) }"
                  @click="switchPage('/reader', { id: comicInfo?.exhibitId })"
                >
                  立即阅读
                </div>
                <div class="btn" :class="isCollected ? 'warning-btn' : 'collect-btn'" @click="operateShelf(comicInfo)">
                  {{ isCollected ? "取消收藏" : "加入收藏" }}
                </div>
              </div>

              <div class="other-btns">
                <div class="sign-count">{{ comicInfo?.signCount }}人签约</div>
                <div class="share-btn" @mouseover.stop="setWidgetData('show', true)">
                  <span class="share-btn-text" :class="{ active: shareShow }">
                    <i class="freelog fl-icon-fenxiang"></i>
                    分享给更多人
                  </span>

                  <div id="share" class="share-wrapper" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 漫画简介 -->
        <div class="comic-intro">
          <div class="intro-title">内容简介</div>

          <div class="intro" :class="introState === 1 ? 'fold' : 'unfold'" v-if="comicInfo?.exhibitIntro">
            <div ref="introContent" class="intro-content">
              {{ comicInfo?.exhibitIntro }}
            </div>

            <div class="view-all-btn" @click="introState = 3" v-if="introState === 1">...查看全部</div>
          </div>
          <div class="no-intro-tip" v-else>暂无简介</div>
        </div>
      </div>
    </div>

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { useMyRouter, useMyShelf } from "../utils/hooks";
import { defineAsyncComponent, reactive, ref, toRefs, watch } from "@vue/runtime-core";
import { ExhibitItem } from "@/api/interface";
import {
  getExhibitInfo,
  getExhibitSignCount,
  getExhibitAuthStatus,
  mountWidget,
  getSubDep,
  getCurrentUrl,
  pushMessage4Task,
} from "@/api/freelog";
import { useStore } from "vuex";
import { formatDate, showToast } from "@/utils/common";
import { onBeforeUnmount } from "vue";

export default {
  name: "detail",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "login-btn": defineAsyncComponent(() => import("../components/login-btn.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage, routerBack } = useMyRouter();
    const { id } = query.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const introContent = ref<any>();

    const data = reactive({
      comicInfo: {} as ExhibitItem,
      shareShow: false,
      introState: 0,
      href: "",
      shareWidget: null as any,
    });

    const methods = {
      /** 移动端分享 */
      share() {
        const input: any = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: data.comicInfo.exhibitId } });
      },

      /** 通知插件更新数据 */
      setWidgetData(key: string, value: any) {
        if (data.shareWidget && data.shareWidget.getApi().setData) {
          data.shareWidget.getApi().setData(key, value);
        }
      },
    };

    /** 获取漫画信息 */
    const getComicInfo = async (id: string) => {
      const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
        getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        getExhibitSignCount(id),
        getExhibitAuthStatus(id),
      ]);
      data.comicInfo = {
        ...exhibitInfo.data.data,
        signCount: signCountData.data.data[0].count,
        defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType,
      };
      data.href = getCurrentUrl();
      mountShareWidget();
    };

    /** 加载分享插件 */
    const mountShareWidget = async () => {
      if (store.state.inMobile) return;

      const themeData = await getSubDep();
      const widget = themeData.subDep.find((item: any) => item.name === "ZhuC/Freelog插件-展品分享");
      if (!widget) return;
      data.shareWidget = await mountWidget({
        widget,
        container: document.getElementById("share"),
        topExhibitData: themeData,
        config: { exhibit: data.comicInfo, type: "漫画" },
      });
    };

    watch(
      () => introContent.value,
      () => {
        const introHeight = introContent.value.clientHeight;
        const foldHeight = store.state.inMobile ? 120 : 60;
        if (introHeight > foldHeight) data.introState = 1;
      }
    );

    onBeforeUnmount(async () => {
      await data.shareWidget?.unmount();
    });

    getComicInfo(id);

    return {
      formatDate,
      ...toRefs(store.state),
      switchPage,
      routerBack,
      isCollected,
      operateShelf,
      introContent,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/detail";
</style>
