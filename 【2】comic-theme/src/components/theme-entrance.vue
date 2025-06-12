<!-- 漫画主题资源入口 -->

<template>
  <div
    class="theme-entrance-wrapper"
    :class="{
      show:
        !inMobile &&
        (selfConfig.options_entranceShow.trim() === '显示' ||
          selfConfig.entranceShow.trim() === '显示')
    }"
    @click="toTheme()"
  >
    <i class="freelog fl-icon-shiyongzhuti"></i>
    <div class="text-wrapper">
      <div class="text">{{ themeEntrance.label }}</div>
      <div class="text2">官方示例主题，可免费使用</div>
    </div>
  </div>
</template>

<script lang="ts">
import { toRefs } from "vue";
import { useStore } from "vuex";
import { freelogEntrances } from "@/api/data";
import { State } from "@/store/index";

export default {
  name: "theme-entrance",

  setup() {
    const themeEntrance = freelogEntrances[2];
    const store = useStore<State>();

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
  background: rgba(231, 148, 159, 0.1);
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: #e7949f;
  cursor: pointer;
  transition: all 0.3s ease;
  display: none !important;

  &:hover {
    transform: translateY(-2px);
    background: rgba(231, 148, 159, 0.2);
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
    font-size: 33px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #e7949f;
  }

  .text-wrapper {
    .text {
      font-size: 14px;
      line-height: 20px;
      font-weight: 600;
      white-space: nowrap;
      color: #e7949f;
    }

    .text2 {
      font-weight: 400;
      font-size: 12px;
      color: #e7949f;
      line-height: 18px;
      margin-top: 6px;
    }
  }
}
</style>
