<!-- 主题入口按钮 -->
<template>
  <div
    class="theme-entrance-wrapper"
    :class="{ show: $store.state.inMobile === false && $store.state.selfConfig.entranceShow === '显示' }"
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
      themeEntrance: freelogEntrances[2],
    };
  },

  methods: {
    // 跳转主题详情页
    toTheme() {
      window.open(this.themeEntrance.url);
    },
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
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.15);
  border-radius: 20px 0px 0px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
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
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }

  &.show {
    display: flex !important;
  }
}
</style>
