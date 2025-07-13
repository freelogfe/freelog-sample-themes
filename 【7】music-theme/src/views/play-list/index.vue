<!-- 专辑列表页 -->
<template>
  <div class="play-list-wrapper">
    <list
      :list="playListData"
      :loading="loading"
      :total="total"
      :musicAlbumTab="false"
      activeTab="PlayList"
      title="所有歌单"
      noMoreTip="已加载全部"
      noDataTip="暂无任何歌单"
    />
  </div>
</template>

<script>
import { freelogApp } from "freelog-runtime";
import { useGlobalStore } from "@/store/global";
import { useGetList } from "@/utils/hooks";
import list from "@/components/list.vue";

export default {
  name: "play-list",

  components: {
    list
  },

  data() {
    const store = useGlobalStore();
    const datasOfGetList = useGetList(); // 在这里创建一个实例

    return {
      listData: [],
      loading: false,
      myLoading: false,
      total: null,
      store,
      datasOfGetList // 添加到 data 中
    };
  },

  watch: {
    "store.authIdList": {
      handler(cur) {
        cur.forEach(id => {
          const item = this.listData.find(data => data.exhibitId === id);
          if (item) {
            item.defaulterIdentityType = 0;
          }
        });
      },
      deep: true // 深度监听
    }
  },

  created() {
    this.datasOfGetList.getPlayList(); // 使用实例
  },

  computed: {
    playListData() {
      return this.datasOfGetList.playListData.listData;
    }
  },

  activated() {
    const app = document.getElementById("app");
    app.addEventListener("scroll", this.scroll);

    /** 回到顶部 */
    const scrollToTop = () => {
      app?.scroll({ top: 0 });
    };
    scrollToTop();
  },

  deactivated() {
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

      this.datasOfGetList.getPlayList();
    }
  }
};
</script>
