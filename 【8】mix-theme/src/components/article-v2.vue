<template>
  <div class="article-wrapper-v2" ref="containerRef" :class="{ 'in-pc': !inMobile }">
    <div class="cover-wrapper" @click="clickArticle">
      <div class="article-cover" :style="`height:${imgHeight}px;`">
        <img
          class="cover"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          :src="
            data?.coverImages?.[0] ||
            data?.articleInfo?.coverImages?.[0] ||
            '//static.testfreelog.com/static/default_cover.png'
          "
          :alt="data.exhibitTitle || data.itemTitle"
        />
      </div>
      <div class="offline" v-if="data.onlineStatus === 0 && inSignedList">已下架</div>

      <!-- 专栏状态 -->
      <div class="column-status-wrapper" v-if="[2, 3].includes(data.articleInfo?.articleType)">
        <span>专栏</span>
        <span class="divider"></span>
        <!-- <span
          class="status"
          :class="data.articleInfo?.serializeStatus === 1 ? 'completed' : 'ongoing'"
        >
          {{ data.articleInfo?.serializeStatus === 1 ? "完结" : "更新中" }}
        </span> -->
        <span>{{ data?.collectionList?.totalItem }}</span>
      </div>
    </div>
    <div class="article-info">
      <div class="author-avatar">
        <img
          :src="`https://image.freelog.cn/avatar/${
            data.articleInfo.articleOwnerId || data.userId
          }`"
          alt="头像"
        />
      </div>
      <span class="author-name">
        {{
          data.articleInfo?.articleType === 3
            ? data.articleInfo.articleOwnerName || nodeInfo?.ownerUserName
            : data.articleInfo.articleOwnerName
        }}
      </span>
      <span class="date">
        {{
          formatDate(data?.articleInfo?.versions?.[0]?.createDate) ||
          formatDate(data?.articleInfo?.firstVersionReleaseDate) ||
          formatDate(data?.createDate)
        }}
      </span>
    </div>
    <div class="article-title">
      <span
        class="freelog fl-icon-jinzhi weigui-icon"
        v-if="data?.articleInfo?.status === 2"
        title="此作品因违规无法访问"
      ></span>
      <span
        class="freelog fl-icon-warningxiaochicun auth-link-abnormal"
        v-if="![0, 4].includes(data.defaulterIdentityType)"
        title="作品异常，无法访问"
      ></span>
      <span
        class="freelog fl-icon-suoding lock"
        v-if="!inSignedList && data.defaulterIdentityType >= 4"
        title="获取授权"
      ></span>
      <span class="tag is-auth" v-if="inSignedList && data.defaulterIdentityType < 4">已授权</span>
      <span class="tag not-auth" v-if="inSignedList && data.defaulterIdentityType >= 4"
        >未授权</span
      >
      <div class="title-container">
        <span
          class="title"
          ref="titleRef"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          @click="clickArticle()"
          @mouseenter="handleTitleHover"
          @mouseleave="showTitleTooltip = false"
        >
          {{ data.exhibitTitle || data.itemTitle }}
        </span>
        <div
          class="title-tooltip"
          :class="{ 'show-left': titleTooltipLeft }"
          v-show="showTitleTooltip"
        >
          {{ data.exhibitTitle || data.itemTitle }}
        </div>
      </div>
    </div>
    <div class="article-intro-container" v-if="data.exhibitIntro || data.articleInfo?.intro">
      <div
        class="article-intro"
        ref="introRef"
        :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
        @mouseenter="handleIntroHover"
        @mouseleave="showIntroTooltip = false"
      >
        {{ data.exhibitIntro || data.articleInfo?.intro || "" }}
      </div>
      <div
        class="intro-tooltip"
        :class="{ 'show-left': introTooltipLeft }"
        v-show="showIntroTooltip"
      >
        {{ data.exhibitIntro || data.articleInfo?.intro }}
      </div>
    </div>
    <div class="tags" v-if="data?.tags?.length || data?.articleInfo?.articleTags?.length">
      <tags
        :tags="data?.tags || data?.articleInfo?.articleTags"
        :maxWidthObj="{ isVaild: false, maxWidth: 80 }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { formatDate } from "@/utils/common";
import { defineAsyncComponent, onMounted, ref, computed, nextTick } from "vue";
import { useMyRouter } from "@/utils/hooks";
import { ExhibitItem } from "../api/interface";
import { useStore } from "vuex";
import { freelogApp } from "freelog-runtime";

export default {
  name: "my-article-v2",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue"))
  },

  props: ["data", "inSignedList"],

  setup(props: { data: ExhibitItem }) {
    const store = useStore();
    const { switchPage } = useMyRouter();
    const containerRef = ref(null) as any;
    const imgHeight = ref(200);
    const showTitleTooltip = ref(false);
    const titleRef = ref(null) as any;
    const titleTooltipLeft = ref(false);
    const showIntroTooltip = ref(false);
    const introRef = ref(null) as any;
    const introTooltipLeft = ref(false);

    const inMobile = computed(() => {
      return store.state.inMobile;
    });

    const nodeInfo = freelogApp.nodeInfo;

    /** 点击文章组件 */
    const clickArticle = () => {
      const { exhibitId, itemId } = props.data;

      const isColumn = [2, 3].includes(props.data.articleInfo?.articleType);
      const isComic =
        props.data.articleInfo?.resourceType.includes("漫画") ||
        props.data.articleInfo?.resourceType.includes("连载漫画");

      // 根据类型确定路由路径
      let routePath = "";
      if (isComic) {
        routePath = "/comic-detail";
      } else {
        routePath = isColumn ? "/column-detail" : "/reader";
      }

      // 统一处理参数
      const params: { id: string; itemId?: string } = { id: exhibitId };
      if (itemId) {
        params.itemId = itemId;
      }

      switchPage(routePath, params);
    };

    /** 处理标题悬停事件 */
    const handleTitleHover = () => {
      if (titleRef.value && !inMobile.value) {
        // 检查文本是否溢出
        const isOverflowing = titleRef.value.scrollHeight > titleRef.value.clientHeight;
        if (isOverflowing) {
          // 先重置位置
          titleTooltipLeft.value = false;
          showTitleTooltip.value = true;
          // 使用 nextTick 确保 DOM 已更新后再计算位置
          nextTick(() => {
            const tooltip = titleRef.value?.parentElement?.querySelector(".title-tooltip");
            if (tooltip && containerRef.value) {
              const containerRect = containerRef.value.getBoundingClientRect();
              const tooltipRect = tooltip.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              // 如果 tooltip 会超出视口右侧，则显示在左侧
              titleTooltipLeft.value = containerRect.right + tooltipRect.width + 10 > viewportWidth;
            }
          });
        } else {
          showTitleTooltip.value = false;
        }
      }
    };

    /** 处理简介悬停事件 */
    const handleIntroHover = () => {
      if (introRef.value && !inMobile.value) {
        // 检查文本是否溢出
        const isOverflowing = introRef.value.scrollHeight > introRef.value.clientHeight;
        if (isOverflowing) {
          // 先重置位置
          introTooltipLeft.value = false;
          showIntroTooltip.value = true;
          // 使用 nextTick 确保 DOM 已更新后再计算位置
          nextTick(() => {
            const tooltip = introRef.value?.parentElement?.querySelector(".intro-tooltip");

            if (tooltip && containerRef.value) {
              const containerRect = containerRef.value.getBoundingClientRect();
              const tooltipRect = tooltip.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              // 如果 tooltip 会超出视口右侧，则显示在左侧
              introTooltipLeft.value = containerRect.right + tooltipRect.width + 10 > viewportWidth;
            }
          });
        } else {
          showIntroTooltip.value = false;
        }
      }
    };

    onMounted(() => {
      if (containerRef.value) {
        imgHeight.value = 0.68 * containerRef.value.offsetWidth;

        window.addEventListener("resize", () => {
          if (containerRef.value) {
            imgHeight.value = 0.68 * containerRef.value.offsetWidth;
          }
        });
      }
    });

    return {
      clickArticle,
      formatDate,
      containerRef,
      imgHeight,
      inMobile,
      showTitleTooltip,
      titleRef,
      titleTooltipLeft,
      handleTitleHover,
      showIntroTooltip,
      introRef,
      introTooltipLeft,
      handleIntroHover,
      nodeInfo
    };
  }
};
</script>

<style scoped lang="scss">
.article-wrapper-v2 {
  &.in-pc {
    min-width: 295px;
    max-width: 370px;
  }

  .cover-wrapper {
    cursor: pointer;
    overflow: hidden;
    border-radius: 5px;
    position: relative;
    border: 1px solid #e5e7eb; /* 将border移到这里 */

    .article-cover {
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
        border-radius: 5px;
      }
    }

    .column-status-wrapper {
      position: absolute;
      left: 8px;
      bottom: 8px;
      width: fit-content;
      height: 28px;
      background: rgba(0, 0, 0, 0.6);
      padding: 0px 12px;
      border-radius: 15px;
      font-weight: 600;
      font-size: 12px;
      color: #ffffff;
      line-height: 28px;
      box-sizing: border-box;
      display: flex;
      align-items: center; // 垂直居中

      .divider {
        width: 1px;
        height: 12px;
        background: rgba(255, 255, 255, 0.2);
        margin: 0 5px;
      }

      .status {
        margin-right: 5px;

        &.completed {
          color: #e9a923;
        }

        &.ongoing {
          color: #42c28c;
        }
      }
    }

    &:hover {
      .article-cover img {
        transform: scale(110%);
      }

      & ~ .article-title .title {
        text-decoration: underline;
      }
    }
    .offline {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 20px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 0px 0px 4px 0px;
      font-size: 10px;
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  // .date {
  //   font-weight: 400;
  //   font-size: 12px;
  //   color: #555555;
  //   line-height: 18px;
  //   margin-top: 15px;
  // }
  .article-info {
    display: flex;
    align-items: center;
    margin-top: 15px;

    .author-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      img {
        width: 100%;
        height: 100%;
      }
    }

    .author-name {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
      margin-left: 5px;
    }

    .date {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
      margin-left: auto;
    }
  }
  .article-title {
    font-weight: 600;
    font-size: 16px;
    color: #222222;
    line-height: 22px;
    margin-top: 10px;
    // overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    padding-left: 1px;
    display: flex;
    align-items: center;

    .weigui-icon {
      margin-right: 5px;
      color: #ee4040;
      font-size: 16px;
    }

    .auth-link-abnormal {
      flex-shrink: 0;
      font-size: 16px;
      margin-right: 5px;
      color: #ffc704;
    }

    .lock {
      flex-shrink: 0;
      font-size: 16px;
      margin-right: 5px;
      color: #999999;
    }

    .title-container {
      position: relative;
      display: inline-block;
    }

    .title {
      max-width: 100%;
      cursor: pointer;
      transition: all 0.2s linear;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;

      &:hover {
        opacity: 1;
        text-decoration: underline;
      }

      &:active {
        opacity: 0.6;
      }
    }

    .title-tooltip {
      position: absolute;
      width: 300px;
      max-width: 300px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.6);
      color: #ffffff;
      font-size: 12px;
      line-height: 18px;
      border-radius: 6px;
      padding: 10px;
      z-index: 10;
      top: -5px;
      left: calc(100% + 10px);
      margin-top: 5px;
      word-wrap: break-word;
      overflow: hidden;

      &.show-left {
        left: auto;
        right: calc(100% + 10px);
      }
    }

    .tag {
      flex-shrink: 0;
      width: 56px;
      height: 22px;
      border-radius: 22px;
      margin-right: 5px;
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .is-auth {
      background: #42c28c;
    }

    .not-auth {
      background: #e9a923;
    }
  }
  .article-intro-container {
    position: relative;
    margin-top: 10px;
  }
  .article-intro {
    font-weight: 400;
    font-size: 14px;
    color: #666666;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  .intro-tooltip {
    position: absolute;
    width: 300px;
    max-width: 300px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.6);
    color: #ffffff;
    font-size: 12px;
    line-height: 18px;
    border-radius: 6px;
    padding: 10px;
    z-index: 10;
    top: -5px;
    left: calc(100% + 10px);
    margin-top: 5px;
    word-wrap: break-word;
    overflow: hidden;

    &.show-left {
      left: auto;
      right: calc(100% + 10px);
    }
  }
  .tags {
    margin-top: 10px;
    height: 24px;
    // overflow: hidden;
  }
}
</style>
