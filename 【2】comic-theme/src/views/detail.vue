<!-- 详情页 -->

<template>
  <div class="detail-wrapper">
    <my-header />

    <!-- mobile -->
    <div
      class="mobile-content"
      :class="` ${comicInfo?.articleInfo?.status === 2 && 'freeze-exhibit'}`"
      v-if="inMobile"
    >
      <template v-if="comicInfo?.articleInfo?.status === 2">
        <div class="freeze-exhibit">
          <div class="icon">
            <i
              class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            ></i>
          </div>
          <span className="exceptional-text"> 此作品因违规无法访问 </span>
        </div></template
      >
      <template v-else>
        <!-- 已下架、授权链异常 顶部提示窗  -->
        <div
          className="exceptional-message"
          v-if="
            comicInfo.onlineStatus === 0 ||
            ![0, 4, undefined].includes(comicInfo?.defaulterIdentityType)
          "
        >
          {{ comicInfo.onlineStatus === 0 ? "作品已下架，无法访问" : "作品异常，无法访问" }}
        </div>

        <div
          class="auth-link-abnormal-tip"
          v-if="
            comicInfo.defaulterIdentityType && ![0, 4].includes(comicInfo.defaulterIdentityType)
          "
        >
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
          <div class="tip-text">作品异常，无法访问</div>
        </div>

        <!-- 漫画信息 -->
        <div class="comic-info">
          <div class="comic-base-info">
            <div class="comic-cover">
              <div class="comic-cover-image-wrap">
                <img
                  class="comic-cover-image"
                  :src="comicInfo?.coverImages[0]"
                  :alt="comicInfo?.exhibitTitle"
                  v-if="comicInfo?.coverImages"
                />
                <div v-if="comicInfo.onlineStatus === 0" class="offline">已下架</div>
              </div>
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

            <div class="date-info">
              最近更新：{{
                comicInfo.articleInfo?.articleType === 1
                  ? formatDate(comicInfo?.articleInfo?.versions[0]?.createDate)
                  : formatDate(latestComicItem?.articleInfo?.firstVersionReleaseDate)
              }}
            </div>
          </div>

          <div class="operate-btns">
            <div
              class="btn main-btn mobile"
              :class="{
                disabled:
                  ![0, 4].includes(comicInfo.defaulterIdentityType ?? -1) ||
                  comicInfo.onlineStatus === 0 ||
                  (comicInfo.articleInfo?.articleType === 2 && !listData.length)
              }"
              @click="handleToReader"
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

        <div class="divider" v-if="comicInfo?.articleInfo?.articleType === 2"></div>

        <!-- 目录 -->
        <template v-if="comicInfo?.articleInfo?.articleType === 2">
          <div class="comic-catalogue" v-if="listData.length">
            <div class="title-container">
              <span class="title">目录</span>
            </div>

            <div class="sub-directory-container">
              <div
                class="sub"
                :class="
                  (![0, 4].includes(item.defaulterIdentityType) || comicInfo.onlineStatus === 0) &&
                  'disabled'
                "
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
                  v-if="item.articleInfo?.status === 2"
                  class="freeze-lock"
                  src="../assets/images/freeze.png"
                  alt="封禁"
                />
                <div v-else-if="comicInfo.onlineStatus === 0" className="offline-lock">已下架</div>
                <img
                  v-else-if="![0, 4].includes(item.defaulterIdentityType)"
                  class="auth-lock"
                  src="../assets/images/auth-link-abnormal.png"
                  alt="授权链异常"
                />
                <img
                  v-else-if="item.defaulterIdentityType === 4"
                  class="sub-lock"
                  src="../assets/images/mini-lock.png"
                  alt="未授权"
                />
                <img v-else src="../assets/images/right-arrow.png" alt="" />
              </div>
            </div>

            <div className="tip no-more" v-if="listData.length === total">— 已加载全部章节 —</div>
          </div>

          <div v-else class="comic-catalogue">
            <div class="title-container">
              <span class="title">目录</span>
            </div>
            <div class="no-update">未更新章节，暂时无法阅读</div>
          </div>
        </template>

        <login-btn />
      </template>
    </div>

    <!-- PC -->
    <div
      class="content"
      :class="` ${comicInfo?.articleInfo?.status === 2 && 'freeze-exhibit'}`"
      v-if="!inMobile"
    >
      <template v-if="comicInfo?.articleInfo?.status === 2">
        <div class="freeze-exhibit">
          <div class="icon">
            <i
              class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            ></i>
          </div>
          <span className="exceptional-text"> 此作品因违规无法访问 </span>
        </div>
      </template>

      <template v-else>
        <!-- 已下架、授权链异常 顶部提示窗  -->
        <div
          className="exceptional-message"
          v-if="
            comicInfo.onlineStatus === 0 ||
            ![0, 4, undefined].includes(comicInfo?.defaulterIdentityType)
          "
        >
          {{ comicInfo.onlineStatus === 0 ? "作品已下架，无法访问" : "作品异常，无法访问" }}
        </div>

        <div
          class="auth-link-abnormal-tip"
          v-if="
            comicInfo.defaulterIdentityType && ![0, 4].includes(comicInfo.defaulterIdentityType)
          "
        >
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
          <div class="tip-text">作品异常，无法访问</div>
        </div>

        <div class="content-box">
          <!-- 漫画信息 -->
          <div class="comic-info">
            <div class="comic-cover">
              <div class="comic-cover-image-wrap">
                <img
                  class="comic-cover-image"
                  :src="comicInfo?.coverImages[0]"
                  :alt="comicInfo?.exhibitTitle"
                  v-if="comicInfo?.coverImages"
                />
                <div v-if="comicInfo.onlineStatus === 0" class="offline">已下架</div>
              </div>
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

              <div class="update-date">
                <div v-if="comicInfo.articleInfo?.articleType === 1">
                  最近更新：{{ formatDate(comicInfo?.articleInfo?.versions[0]?.createDate) }}
                </div>

                <div v-else-if="comicInfo.articleInfo?.serializeStatus === 0">
                  <span class="on-going"> 连载中 </span>

                  最近更新：
                  <span class="latest-comic">{{ latestComicItem?.itemTitle }}</span>
                  {{ formatDate(latestComicItem?.articleInfo?.firstVersionReleaseDate) }}
                </div>

                <div v-else-if="comicInfo.articleInfo?.serializeStatus === 1">
                  <span class="completed"> 已完结 </span>
                  共 {{ listData.length }} 话
                </div>
              </div>

              <div class="btns-box">
                <div class="operate-btns">
                  <div
                    class="btn main-btn"
                    :class="{
                      disabled:
                        ![0, 4].includes(comicInfo.defaulterIdentityType ?? -1) ||
                        comicInfo.onlineStatus === 0 ||
                        (comicInfo.articleInfo.articleType === 2 && !listData.length)
                    }"
                    @click="handleToReader"
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
          <div class="comic-intro">
            <div class="intro-title">内容简介</div>

            <div class="intro" v-if="comicInfo?.exhibitIntro">
              <div ref="introContent" class="intro-content">
                {{ comicInfo?.exhibitIntro }}
              </div>
            </div>
            <div class="no-intro-tip" v-else>暂无简介</div>
          </div>

          <!-- 目录 -->
          <template v-if="comicInfo?.articleInfo?.articleType === 2">
            <div class="comic-catalogue" v-if="listData.length">
              <div class="title-container">
                <span class="title">目录</span>
                <span class="count">
                  {{ comicInfo.articleInfo?.serializeStatus === 1 ? "已完结" : "连载中" }}
                  · 共{{ total }}话
                </span>

                <div class="sort" @click="handleSort">
                  <span>{{ sortOrder === "asc" ? "正序" : "倒序" }}</span>
                  <span class="triangle" :class="sortOrder === 'asc' ? 'asc' : 'desc'"></span>
                </div>
              </div>

              <div
                class="latest-tip-box"
                v-if="isClickedLatestComic?.info?.itemId !== latestComicItem.itemId"
              >
                <div class="latest-title">最近更新</div>
                <div class="latest-comic">{{ latestComicItem?.itemTitle }}</div>
                <span class="time">
                  {{ formatDate(latestComicItem?.articleInfo?.firstVersionReleaseDate) }}
                </span>
              </div>

              <div class="sub-directory-container">
                <div
                  class="sub"
                  :class="
                    (![0, 4].includes(item.defaulterIdentityType) ||
                      comicInfo.onlineStatus === 0) &&
                    'disabled'
                  "
                  v-for="item in listData"
                  :key="item.itemId"
                  @click="
                    () => {
                      handleLatestComic(item);
                      switchPage('/reader', {
                        id: comicInfo?.exhibitId,
                        collection: true,
                        subId: item.itemId
                      });
                    }
                  "
                >
                  <span
                    class="sub-title"
                    :class="
                      latestComicItem?.itemId === item.itemId &&
                      isClickedLatestComic?.info?.itemId !== item.itemId &&
                      'is-latest'
                    "
                  >
                    {{ item.itemTitle }}
                  </span>
                  <img
                    v-if="item.articleInfo?.status === 2"
                    class="freeze-lock"
                    src="../assets/images/freeze.png"
                    alt="封禁"
                  />
                  <div v-else-if="comicInfo.onlineStatus === 0" className="offline-lock">
                    已下架
                  </div>
                  <img
                    v-else-if="![0, 4].includes(item.defaulterIdentityType)"
                    class="auth-lock"
                    src="../assets/images/auth-link-abnormal.png"
                    alt="授权链异常"
                  />
                  <img
                    v-else-if="item.defaulterIdentityType === 4"
                    class="sub-lock"
                    src="../assets/images/mini-lock.png"
                    alt="未授权"
                  />
                </div>
              </div>

              <div className="tip no-more" v-if="listData.length === total">— 已加载全部章节 —</div>
            </div>

            <div v-else class="comic-catalogue">
              <div class="title-container">
                <span class="title">目录</span>
              </div>
              <div class="no-update">未更新章节，暂时无法阅读</div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { computed, onBeforeUnmount } from "vue";
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
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
    const { id } = query.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const introContent = ref<any>();
    const sortOrder = ref<string>("asc"); // 默认排序为正序

    const data = reactive({
      comicInfo: {} as ExhibitItem,
      shareShow: false,
      introState: 0,
      href: "",
      shareWidget: null as WidgetController | null
    });
    const latestComicData = ref<{ id: number; info: CollectionList[] }[]>([]);

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
      },

      /** 立即阅读 */
      async handleToReader() {
        if (collectionData.listData.length) {
          try {
            const res = await freelogApp.getUserData("comicLastViewedHistory");
            const lastViewed = res?.data?.data || [];
            const index = lastViewed.findIndex(
              (i: { id: string }) => i.id === data.comicInfo?.exhibitId
            );
            const subId = lastViewed[index]?.subId;
            switchPage("/reader", {
              id: data.comicInfo?.exhibitId,
              collection: true,
              subId: subId || collectionData.listData[0].itemId
            });
          } catch (error) {
            console.error("Error fetching user data", error);
          }
        } else {
          switchPage("/reader", { id: data.comicInfo?.exhibitId });
        }
      },

      /**
       * 切换正序，倒序
       */
      handleSort() {
        // 切换排序顺序
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";

        // 使用排序函数
        const compare = (a: any, b: any) => {
          return sortOrder.value === "asc" ? a.sortId - b.sortId : b.sortId - a.sortId;
        };

        // 根据当前排序顺序更新数据
        collectionData.listData.sort(compare);
      }
    };

    /** 获取漫画信息 */
    const getComicInfo = async (id: string) => {
      const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
        freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitSignCount(id),
        freelogApp.getExhibitAuthStatus(id)
      ]);

      const latestViewedResponse = await freelogApp.getUserData("comicLatestViewedHistory");
      latestComicData.value = latestViewedResponse?.data?.data;

      const articleType = exhibitInfo.data.data.articleInfo.articleType;
      if (articleType === 2) {
        getCollectionList(true);

        sortOrder.value =
          (exhibitInfo.data.data.versionInfo?.exhibitProperty?.catalogueProperty as any)
            ?.collection_sort_list === "collection_sort_descending"
            ? "desc"
            : "asc";
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
      let { total, listData, skip } = collectionData;

      if (!init && listData.length >= total) return;
      skip = init ? 0 : collectionData.skip + 50;

      const subList = await (freelogApp as any).getCollectionSubList(id, {
        skip,
        limit: 50
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

    // 记录用户点击最近更新一话
    const handleLatestComic = (item: any) => {
      if (latestComicItem?.value?.itemId === item.itemId) {
        if (!latestComicData.value) {
          latestComicData.value = [];
        }

        const existingIndex = latestComicData.value.findIndex((i: any) => i.id === id);

        if (existingIndex !== -1) {
          latestComicData.value[existingIndex] = { id, info: item };
        } else {
          latestComicData.value.push({ id, info: item });
        }

        freelogApp.setUserData("comicLatestViewedHistory", latestComicData.value);
      }
    };

    // 最近更新的一话
    const latestComicItem = computed(() => {
      if (data.comicInfo?.articleInfo?.articleType === 2) {
        const items = [...collectionData.listData].sort(
          (a: any, b: any) =>
            new Date(b.articleInfo?.latestVersionReleaseDate).getTime() -
            new Date(a.articleInfo?.latestVersionReleaseDate).getTime()
        );

        return items[0];
      }

      return null;
    });

    // 用户是否已点击最近更新一话
    const isClickedLatestComic = computed(() => {
      if (!latestComicData.value) return null;
      const existingIndex = latestComicData.value.findIndex((i: any) => i.id === id);
      if (existingIndex !== -1) {
        return latestComicData.value[existingIndex];
      }
      return null;
    });

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
      ...methods,
      sortOrder,
      latestComicItem,
      handleLatestComic,
      isClickedLatestComic
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/detail";
</style>
