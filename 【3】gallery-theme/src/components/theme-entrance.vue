<!-- 图库主题资源入口 -->

<template>
  <div
    class="theme-entrance-wrapper"
    :class="{
      show:
        !inMobile &&
        (selfConfig.options_entranceShow === '显示' || selfConfig.entranceShow === '显示')
    }"
    :style="{ boxShadow: `0px 2px 10px 0px ${theme.deriveColor}40` }"
    @click="toTheme()"
  >
    <i class="freelog fl-icon-shiyongzhuti text-center"></i>
    <div class="text-wrapper">
      <div class="text">{{ themeEntrance.label }}</div>
      <div class="text2">官方示例主题，可免费使用</div>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { freelogEntrances } from "@/api/data";
import { toRefs } from "vue";

export default {
  name: "theme-entrance",

  setup() {
    const themeEntrance = freelogEntrances[2];
    const store = useStore();

    const methods = {
      /** 打开主题资源详情页 */
      toTheme() {
        window.open(themeEntrance.url);
      }
    };

    return {
      themeEntrance,
      ...toRefs(store.state),
      ...methods
    };
  }
};
</script>

<style lang="scss" scoped>
.theme-entrance-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 250px;
  height: 84px;
  padding: 20px 30px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #b620e0 0%, #ff9e3d 100%);
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s linear;
  display: none !important;
  z-index: 1;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &.show {
    display: flex !important;
  }

  .freelog {
    width: 33px;
    height: 33px;
    font-size: 33px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #ffffff;
  }

  .text-wrapper {
    .text {
      font-size: 14px;
      line-height: 20px;
      font-weight: 600;
      white-space: nowrap;
      color: #ffffff;
    }

    .text2 {
      font-weight: 400;
      font-size: 12px;
      color: #ffffff;
      line-height: 18px;
      margin-top: 6px;
    }
  }
}
</style>
