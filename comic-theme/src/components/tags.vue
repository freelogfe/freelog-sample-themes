<template>
  <div class="tags-wrapper w-100p flex-row flex-wrap">
    <div
      class="tag mb-10 brs-3 py-2 b-box text-center cur-pointer transition"
      :class="size"
      v-for="tag in data"
      :key="tag"
      :title="`搜索${tag}漫画`"
      @click="switchPage('/', { tag })"
    >
      {{ tag }}
    </div>
  </div>
</template>

<script lang="ts">
import { useMyRouter } from "@/utils/hooks";

export default {
  name: "tags",

  props: ["data", "size"],

  setup() {
    const { switchPage } = useMyRouter();
    return { switchPage };
  },
};
</script>

<style lang="scss" scoped>
.tag {
  &.large {
    font-size: 14px;
    padding: 0 10px;
    margin-right: 10px;
    margin-bottom: 10px;
    background-color: #9bcaff;
    color: #fff;

    &:hover {
      background-color: #7cb9ff;
    }
  }

  &.small {
    font-size: 12px;
    padding: 0 4px;
    margin-right: 5px;
    margin-bottom: 5px;
    border: 1px solid #ddd;
    color: #aaa;

    &:hover {
      background-color: #fff;
    }
  }
}
</style>
