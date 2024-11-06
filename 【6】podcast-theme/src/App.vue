<template>
  <div id="appPodcast" :class="{ pc: $store.state.inMobile === false, mobile: $store.state.inMobile }" v-if="!$store.state.maskLoading">
    <div class="page-wrapper">
      <my-header />
      <keep-alive>
        <router-view class="router-view" :key="$route.path" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <router-view class="router-view" v-if="!$route.meta.keepAlive" />
      <my-footer />
    </div>
    <my-player />
    <theme-entrance />
    <share />
  </div>
  <div style="width: 100vw; height: 100vh;" v-loading="$store.state.maskLoading" v-else></div>
</template>

<script>
import myHeader from "@/components/header";
import myFooter from "@/components/footer";
import myPlayer from "@/components/player";
import themeEntrance from "@/components/theme-entrance";
import share from "@/components/share";
import { widgetApi } from "freelog-runtime";

export default {
  components: {
    myHeader,
    myFooter,
    myPlayer,
    themeEntrance,
    share
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
    /* iphone13 无法获取到安全距离 */
    // setInterval(() => {
    //   const temp = window.getComputedStyle(document.documentElement).getPropertyValue("--sat")
    //   console.log(temp, temp1);
    // }, 3000)
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
  background-color: #222;
  color: #fff;
  font-size: 14px;
  height: 100vh;

  // 解决移动端页面: <meta name="viewport"></meta>标签设置无效, 可无限左右滑动的问题;
  overflow-y: auto;
  overflow-x: hidden;

  &.pc {
    .page-wrapper {
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
    padding-bottom: 238px;

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
</style>
