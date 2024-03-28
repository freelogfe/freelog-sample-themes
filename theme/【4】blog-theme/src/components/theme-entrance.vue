<!-- 博客主题资源入口 -->

<template>
  <div
    class="theme-entrance-wrapper"
    :class="{ show: !inMobile && selfConfig.entranceShow === '显示' }"
    :style="{ boxShadow: `0px 2px 10px 0px ${theme.deriveColor}40` }"
    @click="toTheme()"
  >
    <i class="freelog fl-icon-shiyongzhuti text-center"></i>
    <div class="text">{{ themeEntrance.label }}</div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { freelogEntrances } from "@/api/data";
import { toRefs } from "vue";

export default {
  name: "ThemeEntrance",

  setup() {
    const themeEntrance = freelogEntrances[2];
    const store = useStore();

    const methods = {
      /** 打开主题资源详情页 */
      toTheme() {
        window.open(themeEntrance.url);
      },
    };

    return {
      themeEntrance,
      ...toRefs(store.state),
      ...methods,
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
  background: var(--gradientColor);
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
    display: flex !important;
  }
}
</style>
