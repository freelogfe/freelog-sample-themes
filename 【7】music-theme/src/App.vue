<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useGlobalStore } from "@/store/global";

import myHeader from "@/components/header.vue";

const { store } = useGlobalStore();
const { inMobile } = storeToRefs(store);
</script>

<template>
  <div id="music-theme" :class="{ pc: inMobile === false, mobile: inMobile }">
    <div class="page-wrapper">
      <myHeader />
      <RouterView />
    </div>
  </div>
</template>

<style lang="less">
@import "@/assets/css/index.less";

#music-theme {
  background-color: #222;
  color: #fff;
  font-size: 14px;

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
}
</style>
