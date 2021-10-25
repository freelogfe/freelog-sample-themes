<template>
  <div class="header-wrapper p-sticky lt-0 w-100p h-60 flex-row align-center space-between b-box z-100">
    <div class="logo fs-20 fw-bold f-italic cur-pointer" @click="clearSearch()">freelog blog</div>

    <!-- 搜索框 -->
    <div class="search-box p-relative w-100p mw-200 h-30 brs-30 ml-50 flex-row align-center">
      <img
        class="p-absolute l-0 w-16 h-16 px-10"
        src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/search_magnifier_white.567afaa9.png"
        alt="search"
      />
      <input
        class="search-input w-100p h-100p brs-30 input-none fc-black transition"
        type="text"
        placeholder="搜索"
        v-model="searchKey"
        @keyup.enter="search()"
        @keyup.esc="clearSearch()"
      />
      <i
        class="search-clear p-absolute r-0 iconfont fs-18 mx-10 brs-10 over-h cur-pointer"
        v-show="searchKey"
        @click="clearSearch()"
      >
        &#xe8fc;
      </i>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, SetupContext, watchEffect } from "vue";
import { useMyRouter } from "../utils/hooks";
import { GetExhibitsListParams } from "../api/freelog";

export default {
  name: "my-header",

  props: ["getList", "searchData"],

  emits: ["search"],

  setup(
    props: {
      getList: (params: Partial<GetExhibitsListParams>, init?: boolean) => void;
      searchData: { keywords?: string; tags?: string };
    },
    context: SetupContext<Record<string, any>>
  ) {
    const data = reactive({
      searchKey: "",
      tags: "",
    });
    const { switchPage, routerBack } = useMyRouter();

    const methods = {
      // 搜索
      search() {
        const { searchKey } = data;
        const params: { keywords?: string; tags?: string } = {};
        if (searchKey) params.keywords = searchKey;
        if (data.tags) params.tags = data.tags;

        context.emit("search", params);
        props.getList(params, true);
      },

      // 清除搜索
      clearSearch() {
        data.searchKey = "";
        data.tags = "";
        this.search();
      },
    };

    watchEffect(() => {
      data.searchKey = props.searchData.keywords || "";
      data.tags = props.searchData.tags || "";
    });

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
  padding: 0 72px;

  .logo {
    color: #dddddd;
    white-space: nowrap;

    &:hover {
      color: #fff;
    }
  }

  .search-box {
    .search-input {
      padding: 0 40px !important;
      background-color: #eeeeee !important;

      &:hover,
      &:focus {
        background-color: #fff !important;
      }
    }

    .search-clear {
      color: #24232e;
      transition: all 0.3s ease;

      &:hover {
        color: #0d0c22;
      }
    }

    .search-btn {
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }

    .filter-btn {
      text-shadow: 0 2px 2px #8eb9eb;

      &:hover {
        text-shadow: 0 2px 2px #6280a1;
      }
    }
  }
}

@media (max-width: 1200px) {
  .header-wrapper {
    padding: 0 32px !important;
  }
}

@media (max-width: 768px) {
  .header-wrapper {
    padding: 0 20px !important;
  }
}
</style>
