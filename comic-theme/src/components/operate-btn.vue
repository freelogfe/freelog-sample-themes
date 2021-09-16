<template>
  <div
    class="operate-btn-wrapper mt-self-24 w-48 h-48 brs-50p text-center cur-pointer transition"
    :class="{ [theme]: true, disabled }"
  >
    <i className="iconfont fs-24">{{ icon }}</i>
  </div>
</template>

<script lang="ts">
export default {
  name: "operate-btn",

  props: {
    icon: String,
    theme: String,
    disabled: Boolean,
  },

  setup() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.operate-btn-wrapper {
  &.light {
    color: #9fbee0;
    background-color: #d2e6ff;
    box-shadow: 5px 5px 10px #b3c4d9, -5px -5px 10px #f2ffff;
  }

  &.dark {
    color: #9f9fa3;
    background-color: #3e3e46;
    box-shadow: 5px 5px 10px #222227, -5px -5px 10px #5a5a66;
  }

  &:hover {
    color: #fff;
  }
}
</style>
