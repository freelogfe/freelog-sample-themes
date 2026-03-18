<template>
  <div v-if="!maskLoading" class="app-container" :class="{ isIOS: isIOS }">
    <my-header />
    <div class="app-wrapper" :class="{ inMobile: inMobile }">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
    <my-footer />
    <login-btn />
    <div id="modal"></div>
  </div>
  <div v-else class="maskLoading">
    <span class="freelog fl-icon-loading"></span>
  </div>
  <Teleport to="body">
    <div id="app-share" class="app-share"></div>
  </Teleport>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, onMounted, onBeforeUnmount, ref, provide } from "vue";
import { widgetApi, freelogApp } from "freelog-runtime";
import { useStore } from "vuex";
import type { WidgetController } from "freelog-runtime";

export default {
  components: {
    "my-header": defineAsyncComponent(() => import("./components/header.vue")),
    "login-btn": defineAsyncComponent(() => import("./components/login-btn.vue")),
    "my-footer": defineAsyncComponent(() => import("./components/footer.vue"))
  },
  setup() {
    const store = useStore();
    const shareWidget = ref<WidgetController | null>(null);

    const maskLoading = computed(() => store.state.maskLoading);
    const inMobile = computed(() => store.state.inMobile);
    const isIOS = computed(() => store.state.isIOS);

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
        (item: any) => item.articleName === "ZhuC/Freelog插件-展品分享"
      );
      if (!widgetData) return;

      const { articleId, parentNid, nid } = widgetData;
      const topExhibitId = freelogApp.getTopExhibitId();
      const nodeInfo = freelogApp.nodeInfo;
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
              exhibitId: (nodeInfo as any).nodeId || topExhibitId,
              exhibitTitle: (nodeInfo as any).nodeName || nodeInfo.nodeShortDescription
            },
            type: "博客",
            show: false,
            routerType: "detail",
            onClose: () => setShareWidgetShow(false)
          }
        },
        widget_entry: "https://localhost:8204"
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

    return { maskLoading, inMobile, isIOS };
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
