<!-- 签约列表页 -->

<template>
  <div class="signed-list-wrapper" :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }">
    <div class="content" v-if="userData.isLogin && mySignedList">
      <div class="content-header">
        <div class="signed-list-title">签约记录</div>

        <div class="search-box">
          <input class="search-input input-none" v-model="searchKey" placeholder="搜索" @keyup="search($event)" />
          <i class="freelog fl-icon-content"></i>
        </div>
      </div>

      <div
        class="sort"
        :class="{ disabled: loading }"
        @mouseover="sortPopupShow = true"
        @mouseleave="sortPopupShow = false"
        v-if="!inMobile && mySignedList.length"
      >
        {{ createDateSortType === "desc" ? "最新签约" : "最早签约" }}
        <i class="freelog fl-icon-zhankaigengduo"></i>

        <transition name="slide-down-scale">
          <div class="sort-popup" v-show="sortPopupShow">
            <div class="sort-popup-body">
              <div class="user-box-btn" @click="sort('desc')">最新签约</div>
              <div class="user-box-btn" @click="sort('asce')">最早签约</div>
            </div>
          </div>
        </transition>
      </div>

      <div class="article-box">
        <my-article-v2 :inSignedList="true" :data="item" v-for="item in mySignedList" :key="item.exhibitId" />
      </div>
      <div class="tip" v-if="mySignedList.length === 0">暂无数据，快去签约博客吧～</div>
    </div>

    <div class="not-login-content" v-if="userData.isLogin === false">
      <div class="not-login-tip">此页面需登录浏览，请先登录</div>
      <div class="main-btn" @click="callLogin()" v-if="!inMobile">登录</div>
    </div>
    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs, computed } from "@vue/runtime-core";
import { useMySignedList } from "../utils/hooks";
import { useStore } from "vuex";
import { callLogin } from "@/api/freelog";

export default {
  name: "signed-list",

  components: {
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    "my-article-v2": defineAsyncComponent(() => import("../components/article-v2.vue")),
  },

  setup() {
    const store = useStore();
    const { loading, mySignedList, getMySignedList } = useMySignedList();

    const data = reactive({
      searchKey: "",
      sortPopupShow: false,
      createDateSortType: "desc",
    });

    const inMobile = computed(() => {
      return store.state.inMobile
    })

    const userData = computed(() => {
      return store.state.userData
    })

    const methods = {
      /** 搜索签约列表 */
      search(e: { keyCode: number }) {
        if (e.keyCode === 13) {
          getMySignedList(data.searchKey, 'desc');
        } else if (e.keyCode === 27) {
          data.searchKey = "";
        }
      },
      /** 排序(纯前端) */
      sort: async (sort: "asce" | "desc") => {
        data.createDateSortType = sort
        getMySignedList(data.searchKey, sort);
      }
    };

    return { 
      callLogin,
      mySignedList, 
      loading, 
      ...toRefs(data), 
      ...methods,
      inMobile,
      userData
    };
  },
};
</script>

<style lang="scss" scoped>
.signed-list-wrapper {
  position: relative;
  min-height: 100vh;

  // mobile
  &.in-mobile {
    padding-bottom: 128px;
    box-sizing: border-box;

    .content {
      width: 100%;

      .content-header {
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;

        .signed-list-title {
          width: 100%;
          height: 100px;
          line-height: 100px;
          font-size: 34px;
          color: #222222;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .search-box {
          display: none;
        }
      }

      .article-box {
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;

        .article-wrapper-v2 {
          margin-bottom: 30px;

          &:last-child {
            margin-bottom: 0px;
          }
        }
      }


    }
  }

  // PC
  &.in-pc {
    padding-bottom: 148px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    .content {
      min-width: 965px;
      max-width: 1600px;
      width: 85%;

      .content-header {
        width: 100%;
        height: 116px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .signed-list-title {
          font-size: 30px;
          color: #222222;
          line-height: 36px;
        }

        .search-box {
          position: relative;
          width: 220px;
          height: 38px;
          border-radius: 38px;
          display: flex;
          align-items: center;
          overflow: hidden;

          .search-input {
            height: 100%;
            flex: 1;
            font-size: 14px;
            color: #222;
            padding: 0 38px;
            background: #f7f7f7;
          }

          .fl-icon-content {
            position: absolute;
            left: 12px;
            width: 14px;
            height: 14px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8e8e93;
          }
        }
      }

      .article-box {
        width: 920px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
      }

      .sort {
        width: 920px;
        margin-top: 10px;
        margin-bottom: 30px;
        position: relative;
        font-size: 16px;
        line-height: 22px;
        display: flex;
        align-items: center;
        justify-content: flex-start;

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
  }

  .tip {
    width: 100%;
    font-size: 16px;
    line-height: 22px;
    color: #999;
    text-align: center;
    margin-top: 60px;
  }

  .not-login-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .not-login-tip {
      margin-top: 100px;
      font-size: 16px;
      color: #999999;
      line-height: 22px;
    }

    .main-btn {
      width: fit-content;
      height: 32px;
      padding: 0 15px;
      box-sizing: border-box;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 30px;
    }
  }
  
}

@media screen and (min-width: 1300px) {
  .article-box {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}

</style>
