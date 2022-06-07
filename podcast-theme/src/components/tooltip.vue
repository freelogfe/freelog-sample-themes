<!-- 悬停提示 -->
<template>
  <el-tooltip
    :popper-class="popperClass"
    effect="dark"
    placement="bottom-start"
    :visible-arrow="false"
    :open-delay="300"
    :content="content"
  >
    <slot />
  </el-tooltip>
</template>

<script>
export default {
  name: "my-tooltip",

  props: {
    popperClass: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>
