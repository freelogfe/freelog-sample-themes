<!-- 歌单列表页 -->
<template>
  <div class="play-list-wrapper">
    <list
      :list="playListData"
      :loading="datasOfGetList.playListData.loading"
      :total="datasOfGetList.playListData.total"
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
import { scrollManager } from "@/utils/scroll-manager";
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
      store,
      datasOfGetList // 添加到 data 中
    };
  },

  created() {
    this.datasOfGetList.getPlayList(); // 使用实例
  },

  computed: {
    playListData() {
      return this.datasOfGetList.playListData.listData;
    }
  },

  mounted() {
    // 使用全局滚动管理器，避免多组件冲突
    scrollManager.addListener("play-list", this.scroll);

    // 回到顶部
    const app = document.getElementById("app");
    app?.scroll({ top: 0 });
  },

  beforeUnmount() {
    // 移除滚动监听器
    scrollManager.removeListener("play-list");

    // 清理hooks中的防抖定时器
    this.datasOfGetList.cleanup();
  },

  methods: {
    /** 页面滚动 */
    scroll() {
      // 如果正在加载中，直接返回，避免重复请求
      if (this.datasOfGetList.playListData.loading) {
        return;
      }

      const app = document.getElementById("app");
      const scrollTop = app.scrollTop || 0;
      const clientHeight = app.clientHeight || 0;
      const scrollHeight = app.scrollHeight || 0;
      if (scrollTop + clientHeight < scrollHeight - 200) return;

      // 使用hooks中的防抖方法
      this.datasOfGetList.getPlayListWithDebounce();
    }
  }
};
</script>
