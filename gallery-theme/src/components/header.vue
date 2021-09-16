<template>
  <div class="header-wrapper p-sticky lt-0 w-100p h-60 flex-row align-center space-between px-40 b-box z-100">
    <div class="fs-20 fc-white fw-bold f-italic cur-pointer">freelog gallery</div>
    <div>search</div>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "vue";
import { useMyRouter } from "../utils/hooks";

export default {
  name: "my-header",

  props: ["getList", "defaultTag"],

  setup(props: any, context: any) {
    const data = reactive({
      searchKey: "",
    });

    const { switchPage, routerBack } = useMyRouter();

    const methods = {
      // 搜索
      search() {
        const { searchKey } = data;
        const params: { keywords?: string; tags?: string } = {};
        if (searchKey) params.keywords = searchKey;

        context.emit("search", Object.keys(params).length !== 0);
        props.getList(params, true);
      },

      // 清除搜索
      clearSearch() {
        data.searchKey = "";
        this.search();
      },
    };

    return {
      ...toRefs(data),
      ...methods,
      switchPage,
      routerBack,
    };
  },
};
</script>

<style lang="scss" scoped>
.header-wrapper {
  background-color: #0d0c22;
}
</style>
