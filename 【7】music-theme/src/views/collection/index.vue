<!-- 收藏列表页 -->
<template>
  <div class="collect-list-wrapper">
    <list :list="store.collectionList" :loading="!store.collectionList" title="收藏" statusShow />
  </div>
</template>

<script>
import { useGlobalStore } from "@/store/global";
import list from "@/components/list.vue";

export default {
  name: "collect-list",

  components: { list },

  data() {
    const store = useGlobalStore();

    return {
      store
    };
  }
};
</script>

<style lang="less">
.collect-list-wrapper {
  .album-wrap {
    padding: 0 !important;
  }
}
</style>
