<!-- 首页 -->
<template>
  <div class="home-wrapper">
    <my-header :homeHeader="!searching" :mobileSearching="!!(inMobile && searching)" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <div
        class="shelf-comic-list"
        v-if="!searching && userData?.isLogin && myShelf && myShelf.length !== 0"
      >
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div class="more-shelf" @click="switchPage('/shelf')">
            全部
            <i class="freelog fl-icon-zhankaigengduo"></i>
          </div>
        </div>

        <div class="comic-list-box">
          <div class="comic-box" v-for="item in myShelf" :key="item.exhibitId">
            <comic :mode="4" :data="item" />
          </div>
        </div>
      </div>

      <div class="comic-list">
        <div class="search-box-title" v-if="searching">
          <div class="box-title">查询到{{ listData.length }}个相关结果</div>
          <div
            class="text-btn mobile"
            :class="{ disabled: myLoading }"
            @click="filterBoxShow = true"
          >
            <i className="freelog fl-icon-shaixuan"></i>
            <div class="filter-label">筛选</div>
          </div>
        </div>
        <div class="box-header" v-else>
          <div class="box-title">精选漫画</div>
          <div
            class="text-btn mobile"
            :class="{ disabled: myLoading }"
            @click="filterBoxShow = true"
          >
            <i className="freelog fl-icon-shaixuan"></i>
            <div class="filter-label">筛选</div>
          </div>
        </div>

        <my-loader v-if="loading" />

        <template v-if="!loading">
          <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
            <comic :data="item" />
          </div>

          <div class="tip" v-if="listData.length === 0">当前节点暂无任何漫画，请稍后查看</div>

          <div class="tip no-more" v-if="listData.length !== 0 && listData.length === total">
            — 已加载全部漫画 —
          </div>
        </template>
      </div>

      <transition name="fade">
        <div id="modal" class="modal" v-if="filterBoxShow" @click="filterBoxShow = false"></div>
      </transition>
      <transition name="slide-right">
        <div class="filter-box-body" v-if="filterBoxShow">
          <div class="filter-box-header">
            <div class="header-title">按标签筛选</div>
            <div class="close-btn" @click="filterBoxShow = false">
              <i class="freelog fl-icon-guanbi"></i>
            </div>
          </div>
          <div class="tags-box">
            <div
              class="tag"
              :class="{ active: !searchData.tags }"
              @click="
                filterBoxShow = false;
                selectTag();
              "
            >
              全部
            </div>
            <div class="tags-box-list">
              <div
                class="tag"
                :class="{ active: searchData.tags === item }"
                v-for="item in tagsList"
                :key="item"
                @click="
                  filterBoxShow = false;
                  selectTag(item);
                "
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </transition>

      <login-btn />
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <div
        class="comic-list"
        v-if="!searching && userData?.isLogin && myShelf && myShelf.length !== 0"
      >
        <div class="shelf-header">
          <div class="box-title">我的收藏</div>
          <div class="shelf-header-right">
            <div class="text-btn" @click="switchPage('/shelf')">管理收藏</div>
          </div>
        </div>

        <div class="comic-list-box">
          <div
            class="comic-box"
            v-for="item in myShelf.filter((_, index) => index < 6)"
            :key="item.exhibitId"
          >
            <comic :data="item" />
          </div>
        </div>
      </div>

      <div class="comic-list">
        <div class="search-box-title" v-if="searching">查询到{{ listData.length }}个相关结果</div>
        <div class="box-title" v-else>精选漫画</div>

        <div class="filter-bar">
          <div class="filter-bar-bg"></div>

          <div
            class="category-btn"
            :class="{ active: !searchData.tags, disabled: myLoading }"
            @click="selectTag()"
          >
            全部
          </div>

          <div
            class="category-btn"
            :class="{ active: searchData.tags === item, disabled: myLoading }"
            v-for="item in tagsList"
            :key="item"
            @click="selectTag(item)"
          >
            {{ item }}
          </div>
        </div>

        <my-loader v-if="loading" />

        <template v-if="!loading">
          <div class="comic-list-box">
            <div class="comic-box" v-for="item in listData" :key="item.exhibitId">
              <comic :data="item" />
            </div>
          </div>

          <div class="tip" v-if="listData.length === 0">当前节点暂无任何漫画，请稍后查看</div>

          <div class="tip no-more" v-if="listData.length !== 0 && listData.length === total">
            — 已加载全部漫画 —
          </div>
        </template>
      </div>
    </div>

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineAsyncComponent,
  onActivated,
  onDeactivated,
  reactive,
  toRefs,
  watch
} from "vue";
import { useStore } from "vuex";
import { useGetList, useMyRouter, useMyScroll, useMyShelf } from "@/utils/hooks";
import { State } from "@/store/index";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "login-btn": defineAsyncComponent(() => import("../components/login-btn.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    comic: defineAsyncComponent(() => import("../components/comic.vue"))
  },

  setup() {
    const store = useStore<State>();
    const tagsList: string[] = (store.state.selfConfig.options_tags || store.state.selfConfig.tags)
      ?.split(",")
      ?.map((tag: string) => tag.trim()) // 去掉每个字符串的前后空格
      ?.filter(Boolean);
    const { query, route, router, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
    useMyShelf();
    const datasOfGetList = useGetList();

    const data = reactive({
      searchData: {} as { keywords?: string; tags?: string },
      filterBoxShow: false
    });

    /** 是否搜索中 */
    const searching = computed(() => {
      return !!data.searchData.keywords;
    });

    const methods = {
      /** 清除搜索 */
      clearSearch() {
        data.searchData = {};
        switchPage("/home");
      },

      /** 筛选标签 */
      selectTag(tag = "") {
        const { keywords } = data.searchData;
        const query: { keywords?: string; tags?: string } = {};
        if (tag) query.tags = tag;
        if (keywords) query.keywords = keywords;
        switchPage("/home", query);
      }
    };

    /** 获取展品列表 */
    const getData = async () => {
      data.searchData = query.value;
      datasOfGetList.clearData();
      datasOfGetList.getList(data.searchData, true);
    };

    watch(
      () => scrollTop.value,
      cur => {
        if (route.path !== "/home") return;
        if (cur + clientHeight.value !== scrollHeight.value) return;

        datasOfGetList.getList();
      }
    );

    watch(
      () => query.value,
      () => {
        if (route.path !== "/home") return;
        if (
          data.searchData.keywords === query.value.keywords &&
          data.searchData.tags === query.value.tags
        ) {
          return;
        }

        getData();
      }
    );

    onActivated(() => {
      if (router.options.history.state.replaced) {
        const homeScrollTop = sessionStorage.getItem("homeScroll");
        scrollTo(Number(homeScrollTop), "auto");

        const { authIds } = store.state;
        if (authIds.length === 0) return;

        authIds.forEach((id: string) => {
          const index = datasOfGetList.listData.value.findIndex(item => item.exhibitId === id);
          if (index !== -1) {
            datasOfGetList.listData.value[index].defaulterIdentityType = 0;
          }
        });
        store.commit("setData", { key: "authIds", value: [] });
      } else {
        getData();
      }
    });

    onDeactivated(() => {
      sessionStorage.setItem("homeScroll", String(scrollTop.value));
    });

    getData();

    return {
      tagsList,
      ...toRefs(store.state),
      switchPage,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
      searching
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/home";
</style>
