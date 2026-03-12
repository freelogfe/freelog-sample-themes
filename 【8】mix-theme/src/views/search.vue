<template>
  <div class="search-wrapper-pc" v-if="!inMobile">
    <div class="search-body">
      <div class="title">"{{ keywrodTxt ? keywrodTxt : query.tags }}"的相关结果</div>
      <div
        class="sort"
        :class="{ disabled: myLoading }"
        @mouseover="sortPopupShow = true"
        @mouseleave="sortPopupShow = false"
        v-if="listData.length"
      >
        {{ createDateSortType === "-1" ? "最新发布" : "最早发布" }}
        <i class="freelog fl-icon-zhankaigengduo"></i>

        <transition name="slide-down-scale">
          <div class="sort-popup" v-show="sortPopupShow">
            <div class="sort-popup-body">
              <div class="user-box-btn" @click="sort('-1')">最新发布</div>
              <div class="user-box-btn" @click="sort('1')">最早发布</div>
            </div>
          </div>
        </transition>
      </div>
      <template v-if="!loading">
        <div class="article-list">
          <my-article-v2 :data="item" v-for="item in availableListData" :key="item.exhibitId" />
        </div>
        <div className="tip" v-show="total === 0 || availableListData.length === 0">抱歉, 暂未找到相关结果</div>
        <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部 —</div>
      </template>
    </div>
  </div>
  <div class="search-wrapper-mobile" v-else>
    <div class="search-body">
      <div class="title">查询到{{ availableListData.length || 0 }}个相关结果</div>
      <div class="article-list" v-if="!loading">
        <my-article-v2 :data="item" v-for="item in availableListData" :key="item.exhibitId" />
      </div>
      <div class="all-ready" v-show="total === 0 || availableListData.length === 0">抱歉, 暂未找到相关结果</div>
      <div class="all-ready" v-show="listData.length !== 0 && listData.length === total">— 已加载全部 —</div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs, defineAsyncComponent, computed, watch } from 'vue'
import { useGetList, useMyRouter } from "../utils/hooks";
import { useStore } from "vuex";

export default {
    name: "home",
    components: {
      "my-article-v2": defineAsyncComponent(() => import("../components/article-v2.vue")),
    },
    setup() {
      const datasOfGetList = useGetList();
      const { query } = useMyRouter() 
      const store = useStore();

      const state = reactive({
        sortPopupShow: false,
        createDateSortType: "-1",
        searchData: {
          sort: "createDate:-1",
          keywords: "",
          tags: ""
        },
        keywrodTxt: ""
      })

      const inMobile = computed(() => {
        return store.state.inMobile
      })

      const availableListData = computed(() => {
        return datasOfGetList.listData.value.filter((ele: any) => ele.articleInfo.status === 1 && [0, 4].includes(ele.defaulterIdentityType!)) 
      })

      const methods = {
        /** 排序 */
        sort: async (sortType: string) => {
          state.createDateSortType = sortType;
          state.searchData.sort = `createDate:${sortType}`;
          state.searchData.keywords = query.value.keywords
          state.searchData.tags = query.value.tags
          await datasOfGetList.getList(state.searchData, true);
          state.keywrodTxt = query.value.keywords 
        }
      }

      onMounted(() => {
        methods.sort(state.createDateSortType)
      })

      watch(query, () => {
        methods.sort(state.createDateSortType)
      })

      return {
        ...toRefs(state),
        ...methods,
        ...datasOfGetList,
        query,
        availableListData,
        inMobile
      }
    }
}

</script>

<style lang="scss" scoped>
  .search-wrapper-pc {
    display: flex;
    justify-content: center;
    align-items: center;

    .search-body {
      width: 90%;
      .title {
        margin-top: 30px;
        font-weight: 600;
        font-size: 36px;
        color: #222222;
        line-height: 56px;
      }

      .sort {
        margin: 40px 0px;
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

      .article-list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
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
          margin: 100px 0px;
        }
      }
    }
  }
  .search-wrapper-mobile {
    .search-body {
      .title {
        height: 47px;
        background: #F7F7F7;
        line-height: 47px;
        font-weight: 400;
        font-size: 12px;
        color: #999999;
        padding-left: 20px;
        margin-top: 9px;
      }

      .article-list {
        padding: 30px 20px 0px;
        .article-wrapper-v2 {
          margin-bottom: 30px;
          &:last-child {
            margin-bottom: 0px;
          }
        }
      }

      .all-ready {
        font-weight: 400;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        text-align: center;
        padding: 50px 0px;
      }
    }
  }

  @media screen and (min-width: 1300px) {
    .search-wrapper-pc {
      .article-list {
        grid-template-columns: repeat(4, 1fr) !important;
      }
    }
  }
</style>