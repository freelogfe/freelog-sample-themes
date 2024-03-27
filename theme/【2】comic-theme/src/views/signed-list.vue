<!-- 签约列表页 -->

<template>
  <div class="signed-list-wrapper" :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }">
    <my-header />

    <div class="content" v-if="userData.isLogin && mySignedList">
      <div class="content-header">
        <div class="signed-list-title">已签约漫画</div>

        <div class="search-box">
          <input class="search-input input-none" v-model="searchKey" placeholder="搜索" @keyup="search($event)" />
          <i class="freelog fl-icon-content"></i>
        </div>
      </div>

      <div class="comic-box" v-for="item in mySignedList" :key="item.exhibitId">
        <comic :mode="3" :data="item" />
      </div>
      <div class="tip" v-if="mySignedList.length === 0">暂无数据，快去签约漫画吧～</div>
    </div>

    <div class="not-login-content" v-if="userData.isLogin === false">
      <div class="not-login-tip">此页面需登录浏览，请先登录</div>
      <div class="main-btn" @click="callLogin()" v-if="!inMobile">登录</div>
    </div>

    <my-footer />

    <login-btn />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs } from "@vue/runtime-core";
import { useMySignedList } from "../utils/hooks";
import { useStore } from "vuex";
import { callLogin } from "@/api/freelog";

export default {
  name: "signed-list",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "login-btn": defineAsyncComponent(() => import("../components/login-btn.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    comic: defineAsyncComponent(() => import("../components/comic.vue")),
  },

  setup() {
    const store = useStore();
    const { mySignedList, getMySignedList } = useMySignedList();

    const data = reactive({
      searchKey: "",
    });

    const methods = {
      /** 搜索列表 */
      search(e: { keyCode: number }) {
        if (e.keyCode === 13) {
          getMySignedList(data.searchKey);
        } else if (e.keyCode === 27) {
          data.searchKey = "";
        }
      },
    };

    return { callLogin, ...toRefs(store.state), mySignedList, ...toRefs(data), ...methods };
  },
};
</script>

<style lang="scss" scoped>
.signed-list-wrapper {
  position: relative;
  min-height: 100vh;

  // mobile
  &.in-mobile {
    padding-bottom: 98px;
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

      .comic-box {
        width: 100%;

        &:last-child ::v-deep .comic-content {
          border-bottom: none;
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

    .content {
      width: 1160px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .content-header {
        width: 920px;
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

      .comic-box {
        width: 920px;

        & + .comic-box {
          margin-top: 20px;
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
</style>
