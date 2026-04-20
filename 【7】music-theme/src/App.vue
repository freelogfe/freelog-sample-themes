<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from "vue";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "@/store/global";
import { freelogApp } from "freelog-runtime";
import type { WidgetController } from "freelog-runtime";

import FreelogHeader from "@/components/header.vue";
import FreelogFooter from "@/components/footer.vue";
import FreelogPlayer from "@/components/player.vue";
import FreelogShare from "@/components/share.vue";

// 扩展 TouchEvent 类型以包含 Safari 特有的 scale 属性
interface SafariTouchEvent extends TouchEvent {
  scale?: number;
}

const store = useGlobalStore();
const { inMobile, maskLoading } = storeToRefs(store);

const shareWidget = ref<WidgetController | null>(null);

const setShareWidgetShow = (value: boolean) => {
  if (inMobile.value) {
    const el = document.getElementById("mobile-share-wrap");
    if (el) el.style.display = value ? "flex" : "none";
  } else {
    shareWidget.value?.setData({ show: value });
  }
};

const mountShareWidget = async () => {
  const container = document.getElementById("app-share");
  if (!container) return;
  if (shareWidget.value) await shareWidget.value.unmount();

  const subDeps = await freelogApp.getSelfDepForTheme();
  const widgetData = subDeps.find(
    (item: { articleName?: string }) => item.articleName === "ZhuC/_Freelog插件-主页分享"
  );
  if (!widgetData) return;

  const { articleId, parentNid, nid } = widgetData;
  const topExhibitId = freelogApp.getTopExhibitId();
  const nodeInfo = freelogApp.nodeInfo as Record<string, unknown>;
  const nodeUrl = new URL(freelogApp.getCurrentUrl()).origin;
  const params = {
    articleId,
    parentNid,
    nid,
    topExhibitId,
    container,
    renderWidgetOptions: {
      iframe: true,
      data: {
        exhibit: {
          ...nodeInfo,
          avatarUrl: `https://image.freelog.cn/avatar/${(nodeInfo as { ownerUserId?: string })?.ownerUserId || ""}`,
          nodeUrl,
          exhibitId: (nodeInfo as { nodeId?: string }).nodeId || topExhibitId,
          exhibitTitle:
            (nodeInfo as { nodeName?: string; nodeShortDescription?: string }).nodeName ||
            (nodeInfo as { nodeShortDescription?: string }).nodeShortDescription
        },
        type: "音乐",
        show: false,
        onClose: () => setShareWidgetShow(false)
      }
    }
  };
  shareWidget.value = await freelogApp.mountArticleWidget(params);
};

const openShare = () => {
  setShareWidgetShow(true);
};

provide("openShare", openShare);

onMounted(() => mountShareWidget());
onBeforeUnmount(async () => {
  await shareWidget.value?.unmount();
});

window.addEventListener(
  "touchmove",
  function (event: SafariTouchEvent) {
    if (event.scale !== undefined && event.scale !== 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);
</script>

<template>
  <div id="music-theme" :class="{ pc: inMobile === false, mobile: inMobile }" v-if="!maskLoading">
    <div class="page-wrapper">
      <FreelogHeader />
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component
            v-if="$route.meta.keepAlive"
            :is="Component"
            class="router-view"
            :key="$route.path"
          />
        </keep-alive>
        <component
          v-if="!$route.meta.keepAlive"
          :is="Component"
          class="router-view"
          :key="$route.path"
        />
      </router-view>
    </div>
    <FreelogFooter />
    <FreelogPlayer />

    <FreelogShare />
  </div>
  <div style="width: 100vw; height: 100vh" v-loading="maskLoading" v-else></div>
  <Teleport to="body">
    <div id="app-share" class="app-share"></div>
  </Teleport>
</template>

<style lang="less">
@import "@/assets/css/index.less";

#music-theme {
  position: relative;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;

  &.pc {
    .page-wrapper {
      box-sizing: border-box;
      padding-bottom: 48px;

      .router-view {
        width: 1280px !important;
      }
    }

    &::-webkit-scrollbar-thumb {
      width: 5px;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.3);
      transition: all 0.2s linear;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #222;
    }
  }

  &.mobile .page-wrapper {
    padding-bottom: 278px;

    .router-view {
      width: 100%;
    }
  }

  .page-wrapper {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

    .router-view {
      flex: 1;
      animation: fade-in 0.5s ease;
    }
  }

  //  播放中标识
  .cover-status {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000000;
    opacity: 0.4;
  }

  //  播放中标识-适用于专辑
  .cover-album-status {
    position: absolute;
    left: 10px;
    bottom: 10px;
    width: fit-content;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px 10px;
    background: var(--bg-second-color);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    box-sizing: border-box;
  }
}

.app-share {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: visible;
  z-index: 1000;
}
</style>
