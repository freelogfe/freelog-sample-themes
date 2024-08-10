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
            :class="{ disabled: ![0, 4].includes(comicInfo.defaulterIdentityType ?? -1) }"
            @click="
              listData.length
                ? switchPage('/reader', {
                    id: comicInfo?.exhibitId,
                    collection: true,
                    subId: listData[0].itemId
                  })
                : switchPage('/reader', { id: comicInfo?.exhibitId })
            "
          >
            立即阅读
          </div>
          <div
            class="btn"
            :class="isCollected ? 'delete' : 'collect-btn mobile'"
            @click="operateShelf(comicInfo)"
          >
            {{ isCollected ? "取消收藏" : "加入收藏" }}
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 漫画简介 -->
      <div class="comic-intro">
        <div class="intro-title">内容简介</div>

        <div
          class="intro"
          :class="introState === 1 ? 'fold' : 'unfold'"
          v-if="comicInfo?.exhibitIntro"
        >
          <div ref="introContent" class="intro-content">
            {{ comicInfo?.exhibitIntro }}
          </div>

          <div class="view-all-btn" @click="introState = 3" v-if="introState === 1">
            ...查看全部
          </div>
        </div>
        <div class="no-intro-tip" v-else>暂无简介</div>
      </div>

      <div class="divider" v-if="listData.length"></div>

      <!-- 目录 -->
      <div class="comic-catalogue" v-if="listData.length">
        <div class="title-container">
          <span class="title">目录</span>
        </div>

        <div class="sub-directory-container">
          <div
            class="sub"
            v-for="item in listData"
            :key="item.itemId"
            @click="
              switchPage('/reader', {
                id: comicInfo?.exhibitId,
                collection: true,
                subId: item.itemId
              })
            "
          >
            <span class="sub-title">{{ item.itemTitle }}</span>
            <img
              v-if="[0, 4].includes(item.defaulterIdentityType)"
              src="../assets/images/right-arrow.png"
              alt=""
            />
            <img v-else class="sub-lock" src="../assets/images/mini-lock.png" alt="未授权" />
          </div>
        </div>

        <div className="tip no-more">— 已加载全部章节 —</div>
      </div>

      <login-btn />
    </div>

    <!-- PC -->
    <div class="content" v-if="!inMobile">
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
            <div class="comic-name" :title="comicInfo?.exhibitTitle">
              {{ comicInfo?.exhibitTitle }}
            </div>

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
                  :class="{ disabled: ![0, 4].includes(comicInfo.defaulterIdentityType ?? -1) }"
                  @click="
                    listData.length
                      ? switchPage('/reader', {
                          id: comicInfo?.exhibitId,
                          collection: true,
                          subId: listData[0].itemId
                        })
                      : switchPage('/reader', { id: comicInfo?.exhibitId })
                  "
                >
                  立即阅读
                </div>
                <div
                  class="btn"
                  :class="isCollected ? 'warning-btn' : 'collect-btn'"
                  @click="operateShelf(comicInfo)"
                >
                  {{ isCollected ? "取消收藏" : "加入收藏" }}
                </div>
              </div>

              <div class="other-btns">
                <div class="sign-count">{{ comicInfo?.signCount }}人签约</div>
                <div
                  class="share-btn"
                  @mouseenter.stop="setShareWidgetShow(true)"
                  @mouseleave.stop="setShareWidgetShow(false)"
                >
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
        <div class="comic-intro" :class="listData.length && 'need-border'">
          <div class="intro-title">内容简介</div>
          <div
            class="intro"
            :class="introState === 1 ? 'fold' : 'unfold'"
            v-if="comicInfo?.exhibitIntro"
          >
            <div ref="introContent" class="intro-content">
              {{ comicInfo?.exhibitIntro }}
            </div>

            <div class="view-all-btn" @click="introState = 3" v-if="introState === 1">
              ...查看全部
            </div>
          </div>
          <div class="no-intro-tip" v-else>暂无简介</div>
        </div>

        <!-- 目录 -->
        <div class="comic-catalogue" v-if="listData.length">
          <div class="title-container">
            <span class="title">目录</span>
            <span class="count">({{ listData.length }}话)</span>
          </div>

          <div class="sub-directory-container">
            <div
              class="sub"
              v-for="item in listData"
              :key="item.itemId"
              @click="
                switchPage('/reader', {
                  id: comicInfo?.exhibitId,
                  collection: true,
                  subId: item.itemId
                })
              "
            >
              <span class="sub-title">{{ item.itemTitle }}</span>
              <img
                v-if="![0, 4].includes(item.defaulterIdentityType)"
                class="sub-lock"
                src="../assets/images/mini-lock.png"
                alt="未授权"
              />
            </div>
          </div>

          <div className="tip no-more">— 已加载全部章节 —</div>
        </div>
      </div>
    </div>

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { defineAsyncComponent, reactive, ref, toRefs, watch } from "@vue/runtime-core";
import { WidgetController, freelogApp } from "freelog-runtime";
import { useMyRouter, useMyShelf, useMyScroll } from "@/utils/hooks";
import { formatDate, showToast } from "@/utils/common";
import { ExhibitItem, CollectionList } from "@/api/interface";
import { State } from "@/store/index";

export default {
  name: "detail",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "login-btn": defineAsyncComponent(() => import("../components/login-btn.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    tags: defineAsyncComponent(() => import("../components/tags.vue"))
  },

  setup() {
    const store = useStore<State>();
    const { query, switchPage, routerBack } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
    const { id } = query.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const introContent = ref<any>();

    const data = reactive({
      comicInfo: {} as ExhibitItem,
      shareShow: false,
      introState: 0,
      href: "",
      shareWidget: null as WidgetController | null
    });

    const collectionData = reactive({
      listData: [] as CollectionList[],
      total: 0,
      skip: 0
    });

    const methods = {
      /** 移动端分享 */
      share() {
        const input: any = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: data.comicInfo.exhibitId } });
      },

      /** 控制分享弹窗显示 */
      setShareWidgetShow(value: boolean) {
        data.shareWidget?.setData({ show: value });
      }
    };

    /** 获取漫画信息 */
    const getComicInfo = async (id: string) => {
      const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
        freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitSignCount(id),
        freelogApp.getExhibitAuthStatus(id)
      ]);

      const articleType = exhibitInfo.data.data.articleInfo.articleType;
      if (articleType === 2) {
        getCollectionList(true);
      }

      const { count } = signCountData.data.data[0];
      const { defaulterIdentityType = -1 } = statusInfo.data.data[0];
      data.comicInfo = {
        ...exhibitInfo.data.data,
        signCount: count,
        defaulterIdentityType
      };
      data.href = freelogApp.getCurrentUrl();

      mountShareWidget();
    };

    /** 加载分享插件 */
    const mountShareWidget = async () => {
      if (store.state.inMobile) return;

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
          data: { exhibit: data.comicInfo, type: "漫画", routerType: "detail" }
        }
        // widget_entry: "https://localhost:8201",
      };
      data.shareWidget = await freelogApp.mountArticleWidget(params);
    };

    const getCollectionList = async (init = false) => {
      const { total, listData, skip } = collectionData;

      if (!init && total >= listData.length) return;
      collectionData.skip = init ? 0 : collectionData.skip + 30;

      const subList = await (freelogApp as any).getCollectionSubList(id, {
        skip,
        limit: 30
      });
      const { dataList, totalItem } = subList.data.data;
      collectionData.total = totalItem;

      if (dataList.length !== 0) {
        const ids = dataList.map((item: any) => item.itemId).join();
        const statusInfo = await (freelogApp as any).getCollectionSubAuth(id, { itemIds: ids });
        if (statusInfo.data.data) {
          (dataList as CollectionList[]).forEach(item => {
            const index = statusInfo.data.data.findIndex(
              (resultItem: { itemId: string }) => resultItem.itemId === item.itemId
            );
            if (index !== -1) {
              item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
            }
          });
        }
      }
      collectionData.listData = init ? dataList : [...listData, ...dataList];
    };

    watch(
      () => introContent.value,
      () => {
        const introHeight = introContent.value.clientHeight;
        const foldHeight = store.state.inMobile ? 120 : 60;
        if (introHeight > foldHeight) data.introState = 1;
      }
    );

    watch(
      () => scrollTop.value,
      cur => {
        if (cur + clientHeight.value !== scrollHeight.value) return;
        getCollectionList();
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
      ...toRefs(collectionData),
      ...methods
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/detail";
</style>
