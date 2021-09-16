<template>
  <div class="header-wrapper p-sticky lt-0 w-100p z-100">
    <div class="header-body pt-20 pb-30 flex-column text-center z-1">
      <!-- logo -->
      <div
        class="logo-text fs-26 fc-white fw-bold f-italic cur-pointer transition"
        @click="currentPath !== '/' ? switchPage('/') : clearSearch()"
      >
        freelog comic
      </div>

      <!-- 搜索框 -->
      <div class="search-box p-relative w-60p mw-840 h-40 brs-40 bg-white mt-20 flex-row align-center">
        <img
          class="w-20 h-20 py-10 px-15"
          src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/search_magnifier_white.567afaa9.png"
          alt="search"
        />
        <input
          class="search-input flex-1 w-0 h-100p input-none fs-16 fc-black"
          type="text"
          placeholder="搜索"
          v-model="searchKey"
          @keyup.enter="search()"
          @keyup.esc="
            searchKey = '';
            search();
          "
        />
        <i
          class="search-clear iconfont fs-24 mx-10 cur-pointer"
          v-show="searchKey"
          @click="
            searchKey = '';
            search();
          "
        >
          &#xe8fc;
        </i>
        <img
          class="search-btn w-32 h-32 p-4 cur-pointer transition"
          src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/search_return_white.0c921c5a.png"
          alt="search"
          @click="search()"
        />
        <div
          class="filter-btn p-absolute r--50 t-0 h-40 w-40 text-center cur-pointer transition"
          title="筛选类别"
          @click="filterBoxShow = !filterBoxShow"
          v-show="currentPath !== '/shelf'"
        >
          <i class="iconfont fs-24 fc-white">
            &#xe61b;
          </i>
        </div>
      </div>
    </div>

    <!-- 筛选框 -->
    <transition name="slide-down">
      <div
        class="filter-box p-absolute l-0 t-100p w-100p text-center"
        @mouseleave="filterBoxShow = false"
        v-if="filterBoxShow"
      >
        <div class="filter-btns mw-840 pt-10 flex-row flex-wrap">
          <div
            class="category-btn fs-15 px-10 py-2 mx-5 mb-10 brs-4 text-center shrink-0 cur-pointer transition"
            :class="{ active: tag.length === 0 }"
            @click="
              tag = [];
              search();
            "
          >
            全部
          </div>
          <div
            class="category-btn fs-15 px-10 py-2 mx-5 mb-10 brs-4 text-center shrink-0 cur-pointer transition"
            :class="{ active: tag.includes(item) }"
            v-for="item in comicTypeList"
            :key="item"
            @click="selectTag(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from "vue";
import { comicTypeList } from "../api/data";
import { useMyRouter } from "../utils/hooks";

export default {
  name: "my-header",

  props: ["getList", "defaultTag"],

  setup(props: any, context: any) {
    const data = reactive({
      filterBoxShow: false,
      searchKey: "",
      tag: [] as string[],
      currentPath: "",
    });

    const { switchPage, routerBack, getCurrentPath } = useMyRouter();

    const methods = {
      // 选择标签
      selectTag(tag: string) {
        const index = data.tag.findIndex((item) => tag === item);
        if (index !== -1) {
          data.tag.splice(index, 1);
        } else {
          data.tag.push(tag);
        }
        this.search();
      },

      // 搜索
      search() {
        const { searchKey, tag } = data;
        const params: { keywords?: string; tags?: string } = {};
        if (searchKey) params.keywords = searchKey;
        if (tag.length !== 0) params.tags = tag.join(",");

        context.emit("search", Object.keys(params).length !== 0);
        props.getList(params, true);
      },

      // 清除搜索
      clearSearch() {
        data.filterBoxShow = false;
        data.searchKey = "";
        data.tag = [];
        this.search();
      },
    };

    watch(
      () => props.defaultTag,
      () => {
        if (!props.defaultTag) return;

        data.tag = [props.defaultTag];
        data.filterBoxShow = true;
        methods.search();
      },
      { immediate: true }
    );

    data.currentPath = getCurrentPath();

    return {
      ...toRefs(data),
      ...methods,
      switchPage,
      routerBack,
      comicTypeList,
    };
  },
};
</script>

<style lang="scss" scoped>
.header-wrapper {
  box-shadow: 0 5px 9px #f9f9f9;

  .header-body {
    background-color: #9ac9ff;

    .logo-text:hover {
      text-shadow: 2px 2px 4px #6280a1;
    }

    .search-box {
      box-shadow: 0 5px 5px #8eb9eb;

      .search-clear {
        color: #9ac9ff;
        transition: all 0.3s ease;

        &:hover {
          color: #6cb1ff;
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

  .filter-box {
    background-color: rgba(154, 201, 255, 0.95);
    box-shadow: 0 5px 9px #f9f9f9;
    border-radius: 0 0 10px 10px;

    .filter-btns {
      width: 60%;

      .category-btn {
        color: #fff;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(255, 255, 255, 0.5);
          color: rgba(68, 155, 255, 0.8);
        }

        &.active {
          background-color: #ffffff;
          color: #449bff;
        }
      }
    }
  }
}

@media (max-width: 600px) {
  .filter-btns {
    width: 90% !important;
  }
}
</style>
