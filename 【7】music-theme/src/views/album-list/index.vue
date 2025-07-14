<!-- 专辑列表页 -->
<template>
  <div class="album-list-wrapper">
    <list
      :list="datasOfGetList.listData.listData"
      :loading="datasOfGetList.listData.loading"
      :total="datasOfGetList.listData.total"
      :musicAlbumTab="false"
      activeTab="Album"
      title="所有专辑"
      noMoreTip="已加载全部"
      noDataTip="暂无任何专辑"
    />
  </div>
</template>

<script>
import { freelogApp } from "freelog-runtime";
import { useGlobalStore } from "@/store/global";
import list from "@/components/list.vue";
import { useGetList } from "@/utils/hooks";

export default {
  name: "album-list",

  components: {
    list
  },

  data() {
    const store = useGlobalStore();
    const datasOfGetList = useGetList();

    return {
      store,
      datasOfGetList
    };
  },

  watch: {
    "store.authIdList": {
      handler(cur) {
        cur.forEach(id => {
          const item = this.datasOfGetList.listData.listData.find(data => data.exhibitId === id);
          if (item) {
            item.defaulterIdentityType = 0;
          }
        });
      },
      deep: true // 深度监听
    }
  },

  created() {
    /** 回到顶部 */
    const app = document.getElementById("app");
    app.addEventListener("scroll", this.scroll);

    const scrollToTop = () => {
      app?.scroll({ top: 0 });
    };
    scrollToTop();

    // 获取专辑列表
    this.datasOfGetList.getList({
      articleResourceTypes: "音乐专辑",
      sort: `createDate:-1`
    });
  },

  unmounted() {
    const app = document.getElementById("app");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 页面滚动 */
    scroll() {
      const app = document.getElementById("app");
      const scrollTop = app.scrollTop || 0;
      const clientHeight = app.clientHeight || 0;
      const scrollHeight = app.scrollHeight || 0;
      if (scrollTop + clientHeight < scrollHeight - 200) return;

      this.datasOfGetList.getList({
        articleResourceTypes: "音乐专辑",
        sort: `createDate:-1`
      });
    }
  }
};
</script>
