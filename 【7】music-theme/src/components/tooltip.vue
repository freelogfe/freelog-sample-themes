<!-- 悬停提示 -->
<template>
  <el-tooltip
    :popper-class="popperClass"
    effect="dark"
    placement="bottom-start"
    :show-arrow="false"
    :show-after="3000"
    :content="content"
  >
    <slot />
  </el-tooltip>
</template>

<script>
export default {
  name: "my-tooltip",

  props: {
    /** 组件类名 */
    popperClass: {
      type: String,
      default: ""
    },
    /** 内容 */
    content: {
      type: String,
      default: ""
    }
  },

  methods: {}
};
</script>
