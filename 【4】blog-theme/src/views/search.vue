<template>
  <div class="search-wrapper-pc">
    <div class="search-body">
      <div class="title">"拖拉机"的相关结果</div>
      <div
        class="sort"
        :class="{ disabled: myLoading }"
        @mouseover="sortPopupShow = true"
        @mouseleave="sortPopupShow = false"
        v-if="listData.length"
      >
        {{ createDateSortType === "-1" ? "最新更新" : "最热门" }}
        <i class="freelog fl-icon-zhankaigengduo"></i>

        <transition name="slide-down-scale">
          <div class="sort-popup" v-show="sortPopupShow">
            <div class="sort-popup-body">
              <div class="user-box-btn" @click="sort('-1')">最新更新</div>
              <div class="user-box-btn" @click="sort('1')">最热门</div>
            </div>
          </div>
        </transition>
      </div>
      <template v-if="!loading">
        <div class="article-list">
          <my-article-v2 :data="item" v-for="item in listData" :key="item.presentableId" />
        </div>
        <div className="tip" v-show="total === 0">当前节点暂无任何书籍，请稍后查看</div>
        <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部 —</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs, defineAsyncComponent } from 'vue'
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";

export default {
    name: "home",
    components: {
      "my-article-v2": defineAsyncComponent(() => import("../components/article-v2.vue")),
    },
    setup() {
      const datasOfGetList = useGetList();
      const state = reactive({
        sortPopupShow: false,
        createDateSortType: "-1",
        searchData: {
          sort: "createDate:-1"
        }
      })

      const methods = {
        /** 排序 */
        sort: async (sortType: string) => {

          state.createDateSortType = sortType;
          state.searchData.sort = `createDate:${sortType}`;
          await datasOfGetList.getList(state.searchData, true);
       }
      }

      onMounted(() => {
        methods.sort(state.createDateSortType)
      })

      return {
        ...toRefs(state),
        ...methods,
        ...datasOfGetList
      }
    }
}

</script>

<style lang="scss" scoped>
  .search-wrapper-pc {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 148px;

    .search-body {
      width: 85%;
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
    }
  }
</style>