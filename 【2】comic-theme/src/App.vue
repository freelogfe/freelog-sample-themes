<template>
  <div v-if="!maskLoading">
    <router-view v-slot="{ Component }">
      <keep-alive include="home">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <div id="modal"></div>
  </div>
  <div style="width: 100vw; height: 100vh" v-loading="maskLoading" v-else></div>
  <Teleport to="body">
    <div id="app-share" class="app-share"></div>
  </Teleport>
</template>

<script lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, toRefs } from "vue";
import { useStore } from "vuex";
import { freelogApp } from "freelog-runtime";
import type { WidgetController } from "freelog-runtime";
import { State } from "@/store/index";

export default {
  setup() {
    const store = useStore<State>();
    const shareWidget = ref<WidgetController | null>(null);
    const inMobile = computed(() => store.state.inMobile);

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
      console.log("widgetData", widgetData);
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
              avatarUrl: `https://image.freelog.cn/avatar/${nodeInfo?.ownerUserId || ""}`,
              nodeUrl,
              exhibitId: nodeInfo.nodeId || topExhibitId,
              exhibitTitle: nodeInfo.nodeName || nodeInfo.nodeShortDescription
            },
            type: "漫画",
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

    return {
      ...toRefs(store.state)
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
</style>
