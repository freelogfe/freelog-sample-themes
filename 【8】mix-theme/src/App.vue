<template>
  <div v-if="!maskLoading" class="app-container" :class="{ isIOS: isIOS }">
    <my-header v-if="$route.path !== '/comic-reader'" />
    <div class="app-wrapper" :class="{ inMobile: inMobile }">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
    <my-footer v-if="$route.path !== '/comic-reader'" />
    <!-- <theme-entrance /> -->
    <login-btn />
    <div id="modal"></div>
  </div>
  <div class="maskLoading" v-else>
    <span class="freelog fl-icon-loading"></span>
  </div>
  <Teleport to="body">
    <div id="app-share" class="app-share"></div>
  </Teleport>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, provide, ref } from "vue";
import { widgetApi, freelogApp } from "freelog-runtime";
import type { WidgetController } from "freelog-runtime";
import { useStore } from "vuex";

export default {
  components: {
    "my-header": defineAsyncComponent(() => import("./components/header.vue")),
    // "theme-entrance": defineAsyncComponent(() => import("./components/theme-entrance.vue")),
    "login-btn": defineAsyncComponent(() => import("./components/login-btn.vue")),
    "my-footer": defineAsyncComponent(() => import("./components/footer.vue"))
  },
  setup() {
    const store = useStore();
    const shareWidget = ref<WidgetController | null>(null);

    const maskLoading = computed(() => {
      return store.state.maskLoading;
    });

    const inMobile = computed(() => {
      return store.state.inMobile;
    });

    const isIOS = computed(() => {
      return store.state.isIOS;
    });

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
      const nodeInfo = freelogApp.nodeInfo as any;
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
              avatarUrl: `https://image.freelog.com/avatar/${nodeInfo?.ownerUserId || ""}`,
              nodeUrl,
              exhibitId: nodeInfo.nodeId || topExhibitId,
              exhibitTitle: nodeInfo.nodeName || nodeInfo.nodeShortDescription
            },
            type: "博客",
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

    const themeInfo = widgetApi.getData()?.themeInfo;
    console.log("当前应用版本为:", themeInfo?.version, "+++");

    return {
      maskLoading,
      inMobile,
      isIOS
    };
  }
};
</script>

<style lang="scss">
@import "@/assets/css";

.app-share {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: visible;
  z-index: 1000;
}

.app-container {
  &.isIOS {
    padding-bottom: 80px;
  }
}

.app-wrapper {
  min-height: calc(100vh - 148px);

  &.inMobile {
    min-height: calc(100vh - 158px);
  }
}

.maskLoading {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.6),
    rgba(0, 0, 0, 0.4),
    rgba(0, 0, 0, 0.2)
  );
  span {
    color: rgba(255, 255, 255, 0.6);
    animation: loading 1s linear infinite;
  }
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
