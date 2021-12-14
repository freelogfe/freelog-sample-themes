<template>
  <div class="operate-btn-wrapper" :class="theme">
    <slot></slot>
    <i class="iconfont" :class="icon"></i>
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
    color: #999999;
    background-color: #373737;

    &:hover {
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

  .iconfont {
    width: 48px;
    height: 48px;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
