<template>
  <div
    id="appPodcast"
    :class="{ pc: $store.state.inMobile === false, mobile: $store.state.inMobile }"
    v-if="!$store.state.maskLoading"
  >
    <div class="page-wrapper">
      <my-header />
      <keep-alive>
        <router-view class="router-view" :key="$route.path" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <router-view class="router-view" v-if="!$route.meta.keepAlive" />
      <my-footer />
    </div>
    <my-player />
    <!-- <theme-entrance /> -->
    <share />
    <!-- 主页分享插件挂载点（与单集 share.vue 无关） -->
    <div id="app-share" class="app-share"></div>
  </div>
  <div style="width: 100vw; height: 100vh" v-loading="$store.state.maskLoading" v-else></div>
</template>

<script>
import myHeader from "@/components/header";
import myFooter from "@/components/footer";
import myPlayer from "@/components/player";
// import themeEntrance from "@/components/theme-entrance";
import share from "@/components/share";
import { widgetApi, freelogApp } from "freelog-runtime";

export default {
  components: {
    myHeader,
    myFooter,
    myPlayer,
    // themeEntrance,
    share
  },
  provide() {
    return {
      /** 打开主页分享插件（需在子组件中 inject: ['openShare']） */
      openShare: () => this.setShareWidgetShow(true)
    };
  },
  data() {
    return {
      shareWidget: null
    };
  },
  created() {
    const themeInfo = widgetApi.getData().themeInfo;
    console.log("当前应用版本为:", themeInfo.version, "+++");
  },
  watch: {
    "$route.path"(cur, old) {
      // console.log("$route.path", `当前: ${cur}; 旧: ${old};`);
    }
  },
  mounted() {
    this.mountShareWidget();
    /* iphone13 无法获取到安全距离 */
    // setInterval(() => {
    //   const temp = window.getComputedStyle(document.documentElement).getPropertyValue("--sat")
    //   console.log(temp, temp1);
    // }, 3000)

    window.addEventListener(
      "touchmove",
      function (event) {
        if (event.scale !== undefined && event.scale !== 1) {
          event.preventDefault();
        }
      },
      { passive: false }
    );
  },
  beforeDestroy() {
    if (this.shareWidget && typeof this.shareWidget.unmount === "function") {
      this.shareWidget.unmount().catch(() => {});
    }
  },
  methods: {
    setShareWidgetShow(value) {
      if (this.$store.state.inMobile) {
        const el = document.getElementById("mobile-share-wrap");
        if (el) el.style.display = value ? "flex" : "none";
      } else if (this.shareWidget && typeof this.shareWidget.setData === "function") {
        this.shareWidget.setData({ show: value });
      }
    },
    async mountShareWidget() {
      const container = document.getElementById("app-share");
      if (!container) return;
      if (this.shareWidget && typeof this.shareWidget.unmount === "function") {
        await this.shareWidget.unmount();
      }

      const subDeps = await freelogApp.getSelfDepForTheme();
      const widgetData = subDeps.find(item => item.articleName === "ZhuC/_Freelog插件-主页分享");
      if (!widgetData) return;

      const { articleId, parentNid, nid } = widgetData;
      const topExhibitId = freelogApp.getTopExhibitId();
      const nodeInfo = freelogApp.nodeInfo || {};
      let nodeUrl = "";
      try {
        nodeUrl = new URL(freelogApp.getCurrentUrl()).origin;
      } catch (e) {
        nodeUrl = "";
      }

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
              avatarUrl: `https://image.freelog.cn/avatar/${nodeInfo.ownerUserId || ""}`,
              nodeUrl,
              exhibitId: nodeInfo.nodeId || topExhibitId,
              exhibitTitle: nodeInfo.nodeName || nodeInfo.nodeShortDescription
            },
            show: false,
            onClose: () => this.setShareWidgetShow(false)
          }
        }
        // widget_entry: "https://192.168.2.8:8204"
      };

      this.shareWidget = await freelogApp.mountArticleWidget(params);
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/css";
:root {
  --sat: env(safe-area-inset-top);
}

.el-loading-mask {
  background-color: rgba(0, 0, 0, 0.9) !important;
}

#appPodcast {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  height: 100vh;

  // 解决移动端页面: <meta name="viewport"></meta>标签设置无效, 可无限左右滑动的问题;
  overflow-y: auto;
  overflow-x: hidden;

  &.pc {
    .page-wrapper {
      height: fit-content;
      padding-bottom: 48px;

      .router-view {
        width: 1130px !important;
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

.theme-toggle-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 8px 16px;
  background-color: var(--card-bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}
</style>
