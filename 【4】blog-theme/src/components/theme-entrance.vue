<!-- 博客主题资源入口 -->

<template>
  <div
    class="theme-entrance-wrapper"
    :class="{ show: !inMobile && selfConfig.entranceShow.trim() === '显示' }"
    style="box-shadow:rgba(15, 32, 39, 0.25) 0px 2px 10px 0px;"
    @click="toTheme()"
  >
    <i class="freelog fl-icon-shiyongzhuti text-center"></i>
    <div class="text">{{ themeEntrance.label }}</div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { freelogEntrances } from "@/api/data";
import { computed } from "vue";

export default {
  name: "theme-entrance",

  setup() {
    const themeEntrance = freelogEntrances[2];
    const store = useStore();

    const inMobile = computed(() => {
      return store.state.inMobile
    })

    const selfConfig = computed(() => {
      return store.state.selfConfig
    })

    const methods = {
      /** 打开主题资源详情页 */
      toTheme() {
        window.open(themeEntrance.url);
      },
    };

    return {
      themeEntrance,
      inMobile,
      ...methods,
      selfConfig
    };
  },
};
</script>

<style lang="scss" scoped>
.theme-entrance-wrapper {
  position: fixed;
  top: calc((100% - 80px) / 5 * 2);
  right: 0;
  width: 100px;
  height: 80px;
  padding: 15px 10px;
  box-sizing: border-box;
  background: linear-gradient(315deg, #2C5364, #0F2027);
  border-radius: 20px 0px 0px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s linear;
  display: none !important;

  .freelog {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text {
    font-size: 14px;
    line-height: 20px;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  &.show {
    display: block !important;
  }
}
</style>
