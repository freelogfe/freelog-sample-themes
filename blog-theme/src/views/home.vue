<template>
  <div class="home-wrapper" @click="sortPopupShow = false">
    <my-header homeHeader :mobileSearching="!!(inMobile && searchData.keywords)" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <div class="header">
        <div class="sort" v-if="!searchData.keywords" @click.stop="sortPopupShow = true">
          {{ createDateSortType === "-1" ? "最新" : "最早" }}
          <i class="freelog fl-icon-zhankaigengduo"></i>

          <transition name="slide-down-scale">
            <div class="sort-popup" @click.stop v-show="sortPopupShow">
              <div class="sort-popup-body">
                <div
                  class="user-box-btn"
                  @click="
                    sort('-1');
                    sortPopupShow = false;
                  "
                >
                  最新
                </div>
                <div
                  class="user-box-btn"
                  @click="
                    sort('1');
                    sortPopupShow = false;
                  "
                >
                  最早
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="box-title" v-if="searchData.keywords">查询到{{ listData.length }}个相关结果</div>

        <div class="filter-btn" @click="filterBoxShow = true">
          <img class="filter-img" src="../assets/images/filter.png" />
          <div class="filter-label">筛选</div>
        </div>
      </div>

      <div class="article-list">
        <my-article :data="item" v-for="item in listData" :key="item.presentableId" />
      </div>

      <div className="tip" v-show="!loading && total === 0">当前节点暂无任何书籍，请稍后查看</div>
      <div className="tip no-more" v-show="!loading && listData.length !== 0 && listData.length === total">
        — 已加载全部书籍 —
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
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <div class="header">
        <div class="search-box-title" v-if="searchData.keywords">查询到{{ listData.length }}个相关结果</div>

        <div class="filter-bar">
          <div class="filter-bar-bg"></div>

          <div class="category-btn" :class="{ active: !searchData.tags }" @click="selectTag()">全部</div>

          <div
            class="category-btn"
            :class="{ active: searchData.tags === item }"
            v-for="item in tagsList"
            :key="item"
            @click="selectTag(item)"
          >
            {{ item }}
          </div>
        </div>

        <div
          class="sort"
          @mouseover="sortPopupShow = true"
          @mouseleave="sortPopupShow = false"
          v-if="!searchData.keywords && !searchData.tags"
        >
          {{ createDateSortType === "-1" ? "最新" : "最早" }}
          <i class="freelog fl-icon-zhankaigengduo"></i>

          <transition name="slide-down-scale">
            <div class="sort-popup" v-show="sortPopupShow">
              <div class="sort-popup-body">
                <div class="user-box-btn" @click="sort('-1')">最新</div>
                <div class="user-box-btn" @click="sort('1')">最早</div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="article-list">
        <my-article :data="item" v-for="item in listData" :key="item.presentableId" />
      </div>

      <div className="tip" v-show="!loading && total === 0">当前节点暂无任何书籍，请稍后查看</div>
      <div className="tip no-more" v-show="!loading && listData.length !== 0 && listData.length === total">
        — 已加载全部书籍 —
      </div>
    </div>

    <my-footer />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { useStore } from "vuex";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "my-article": defineAsyncComponent(() => import("../components/article.vue")),
  },

  setup() {
    const store = useStore();
    const tagsList: string[] = store.state.selfConfig.tags.split(",");
    const { query, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight } = useMyScroll();
    const datasOfGetList = useGetList();

    const data = reactive({
      sortPopupShow: false,
      createDateSortType: "-1",
      searchData: {} as { keywords?: string; tags?: string; sort?: string },
      filterBoxShow: false,
    });

    const methods = {
      // 排序
      sort(sortType: string) {
        if (data.createDateSortType === sortType) return;

        data.createDateSortType = sortType;
        data.searchData.sort = `createDate:${sortType}`;
        datasOfGetList.getList(data.searchData, true);
      },

      // 清除搜索
      clearSearch() {
        data.searchData = {};
        switchPage("/home");
      },

      // 筛选标签
      selectTag(tag: string) {
        const { keywords } = data.searchData;
        const query: { keywords?: string; tags?: string } = {};
        if (tag) query.tags = tag;
        if (keywords) query.keywords = keywords;
        switchPage("/home", query);
      },
    };

    watch(
      () => scrollTop.value,
      (cur) => {
        if (cur + clientHeight.value === scrollHeight.value) {
          datasOfGetList.getList();
        }
      }
    );

    watch(
      () => query.value,
      () => {
        getData();
      }
    );

    // 获取数据
    const getData = () => {
      data.searchData = query.value;
      datasOfGetList.clearData();
      datasOfGetList.getList(data.searchData, true);
    };
    getData();

    return {
      ...store.state,
      tagsList,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  // mobile
  .mobile-home-body {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    padding-bottom: 98px;

    .header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);

      .sort {
        position: relative;
        font-size: 16px;
        line-height: 22px;
        display: flex;
        align-items: center;

        .freelog {
          font-size: 12px;
          width: 12px;
          height: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 5px;
          transform: rotate(90deg);
        }

        .sort-popup {
          position: absolute;
          left: 0;
          top: 100%;
          padding-top: 5px;
          z-index: 1;

          .sort-popup-body {
            width: 118px;
            background: #ffffff;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            padding: 10px 0;

            .user-box-btn {
              width: 100%;
              height: 40px;
              padding: 0 20px;
              box-sizing: border-box;
              font-size: 14px;
              line-height: 40px;
              cursor: pointer;
            }
          }
        }
      }

      .box-title {
        font-size: 16px;
        color: #999999;
        line-height: 22px;
      }

      .filter-btn {
        display: flex;
        align-items: center;

        .filter-img {
          width: 18px;
          height: 18px;
        }

        .filter-label {
          font-size: 16px;
          color: #0f2027;
          line-height: 22px;
          margin-left: 5px;
        }
      }
    }

    .tip {
      width: 100%;
      text-align: center;
      font-size: 16px;
      line-height: 22px;
      color: #999;
      margin-top: 55px;

      &.no-more {
        font-size: 14px;
        line-height: 20px;
        margin: 30px 0;
      }
    }

    .modal {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 101;
    }

    .filter-box-body {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 340px;
      background: #ffffff;
      border-radius: 0px 10px 10px 0px;
      padding: 0 20px;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 101;

      .filter-box-header {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 26px;

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #222222;
          line-height: 22px;
        }

        .close-btn {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 6px;

          .freelog {
            font-size: 12px;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .tags-box {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: 30px;
        padding-left: 12px;
        box-sizing: border-box;

        .tags-box-list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .tag {
          width: fit-content;
          height: 38px;
          border-radius: 38px;
          padding: 9px 15px;
          box-sizing: border-box;
          background: #ebecf0;
          font-size: 14px;
          color: #575e6a;
          line-height: 20px;
          margin: 0 5px 15px;
          cursor: pointer;

          &.active {
            background: #6ea29e;
            color: #fff;
          }
        }
      }
    }
  }

  // PC
  .home-body {
    width: 920px;
    padding-bottom: 148px;

    .header {
      font-size: 30px;
      line-height: 36px;
      margin-bottom: 30px;

      .search-box-title {
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        margin-top: 30px;
      }

      .filter-bar {
        position: relative;
        width: 100%;
        height: 64px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin: 30px 0;

        .filter-bar-bg {
          position: absolute;
          inset: 0;
          background-color: var(--deriveColor);
          opacity: 0.08;
        }

        .category-btn {
          position: relative;
          height: 24px;
          padding: 2px 8px;
          box-sizing: border-box;
          font-size: 14px;
          color: #666;
          line-height: 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s linear;
          z-index: 1;

          &:hover {
            color: var(--deriveColor);
          }

          &:active {
            color: var(--deriveColor);
            opacity: 0.8;
          }

          &.active {
            background-color: var(--deriveColor);
            color: #fff;
          }

          & + .category-btn {
            margin-left: 4px;
          }
        }
      }

      .sort {
        position: relative;
        width: fit-content;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 600;
        color: #222222;
        line-height: 20px;
        cursor: pointer;

        .freelog {
          font-size: 12px;
          width: 12px;
          height: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 5px;
          transform: rotate(90deg);
        }

        .sort-popup {
          position: absolute;
          left: 0;
          top: 100%;
          padding-top: 5px;
          z-index: 1;

          .sort-popup-body {
            width: 118px;
            background: #ffffff;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            padding: 10px 0;

            .user-box-btn {
              width: 100%;
              height: 40px;
              padding: 0 20px;
              box-sizing: border-box;
              font-size: 14px;
              line-height: 40px;
              cursor: pointer;
            }
          }
        }
      }
    }

    .article-list .article-wrapper:first-child {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .tip {
      width: 100%;
      text-align: center;
      font-size: 16px;
      line-height: 22px;
      color: #999;
      margin-top: 55px;

      &.no-more {
        font-size: 14px;
        line-height: 20px;
        margin-top: 30px;
      }
    }
  }
}
</style>
