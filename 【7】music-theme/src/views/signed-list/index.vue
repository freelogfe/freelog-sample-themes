<!-- 签约列表页 -->
<template>
  <div class="sign-list-wrapper">
    <list
      :list="store.signedList"
      :loading="!store.signedList"
      title="签约记录"
      noDataTip="暂无任何签约记录"
      statusShow
      authShow
    />
  </div>
</template>

<script>
import list from "@/components/list.vue";
import { useGlobalStore } from "@/store/global";

export default {
  name: "sign-list",

  components: { list },

  data() {
    const store = useGlobalStore();

    return {
      store
    };
  }
};
</script>
