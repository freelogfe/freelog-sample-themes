<!-- 播客主题资源入口 -->

<template>
  <div
    class="theme-entrance-wrapper"
    :class="{
      show:
        $store.state.inMobile === false &&
        ($store.state.selfConfig.options_entranceShow === '显示' ||
          $store.state.selfConfig.entranceShow === '显示')
    }"
    @click="toTheme()"
  >
    <i class="freelog fl-icon-shiyongzhuti text-center"></i>
    <div class="text">{{ themeEntrance.label }}</div>
  </div>
</template>

<script>
import { freelogEntrances } from "@/api/data";

export default {
  name: "theme-entrance",

  data() {
    return {
      themeEntrance: freelogEntrances[2]
    };
  },

  methods: {
    /** 打开主题资源详情页 */
    toTheme() {
      window.open(this.themeEntrance.url);
    }
  }
};
</script>

<style lang="scss" scoped>
.theme-entrance-wrapper {
  position: fixed;
  top: calc((100% - 80px) / 5 * 2);
  right: 5px;
  width: 100px;
  height: 80px;
  background: var(--text-first-color);
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.15);
  border-radius: 20px 0px 0px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-other-color);
  cursor: pointer;
  transition: all 0.2s linear;
  display: none !important;

  .freelog {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text {
    font-size: 14px;
    line-height: 20px;
    font-weight: bold;
    text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.15);
    margin-top: 10px;
  }

  &:hover {
    background: var(--text-second-color);
  }

  &:active {
    background: var(--text-first-color);
  }

  &.show {
    display: flex !important;
  }
}
</style>
