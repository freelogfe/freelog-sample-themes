<!-- 阅读页功能操作按钮 -->

<template>
  <div class="operate-btn-wrapper" :class="theme">
    <slot></slot>
    <i class="freelog" :class="icon"></i>
  </div>
</template>

<script lang="ts">
export default {
  name: "operate-btn",

  props: {
    icon: String,
    theme: String,
  },
};
</script>

<style lang="scss" scoped>
.operate-btn-wrapper {
  min-width: 48px;
  height: 48px;
  border-radius: 48px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s linear;

  &.dark {
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(55, 55, 55, 1);

    &:hover {
      background-color: rgba(55, 55, 55, 0.7);
      box-shadow: 0px 2px 10px 0px rgba(255, 255, 255, 0.4);
    }
  }

  &.light {
    color: #232f43;
    background-color: #fff;

    &:hover {
      box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.2);
    }
  }

  & + .operate-btn-wrapper {
    margin-top: 10px;
  }

  .freelog {
    width: 48px;
    height: 48px;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
