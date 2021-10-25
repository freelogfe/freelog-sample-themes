<template>
  <div class="frame-wrapper p-relative w-100p over-h cur-pointer">
    <img class="w-100p brs-4" v-lazy="data.coverImages[0]" />

    <div class="fs-16 fw-bold mt-10 lh-24">{{ data.presentableTitle }}</div>
  </div>
</template>

<script lang="ts">
export default {
  name: "frame",

  props: ["data"],

  setup() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.frame-wrapper {
}
</style>
