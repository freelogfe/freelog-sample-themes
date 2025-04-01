<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useGlobalStore } from "@/store/global";

import FreelogHeader from "@/components/header.vue";
import FreelogFooter from "@/components/footer.vue";
import FreelogPlayer from "@/components/player.vue";
import FreelogThemeEntrance from "@/components/theme-entrance.vue";
import FreelogShare from "@/components/share.vue";

const store = useGlobalStore();
const { inMobile } = storeToRefs(store);
</script>

<template>
  <div id="music-theme" :class="{ pc: inMobile === false, mobile: inMobile }">
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

    <FreelogThemeEntrance />
    <FreelogShare />
  </div>
</template>

<style lang="less">
@import "@/assets/css/index.less";

#music-theme {
  position: relative;
  background-color: #101010;
  color: #fff;
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
    padding-bottom: 178px;

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
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    box-sizing: border-box;
  }
}
</style>
