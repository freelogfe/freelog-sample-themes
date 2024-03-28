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
  name: "MyTooltip",

  props: {
    /** 组件类名 */
    popperClass: {
      type: String,
      default: "",
    },
    /** 内容 */
    content: {
      type: String,
      default: "",
    },
  },

  methods: {},
};
</script>
