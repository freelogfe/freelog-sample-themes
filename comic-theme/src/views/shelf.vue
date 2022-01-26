<template>
  <div class="shelf-wrapper" :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }">
    <my-header />

    <div class="content" v-if="userData.isLogin && myShelf">
      <div class="shelf-title">我的漫画</div>

      <div class="comic-box" v-for="item in myShelf" :key="item.exhibitId">
        <comic :mode="2" :data="item" :operateShelf="operateShelf" />
      </div>

      <div class="tip" v-if="myShelf.length === 0">暂无数据，快去寻找漫画来收藏吧～</div>

      <div class="add-comic-box">
        <div class="add-comic-btn" @click="switchPage(`/`)">
          <i class="freelog fl-icon-tianjia"></i>
          <span>添加漫画</span>
        </div>
      </div>
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
import { defineAsyncComponent, toRefs } from "@vue/runtime-core";
import { useMyRouter, useMyShelf } from "../utils/hooks";
import { useStore } from "vuex";
import { callLogin } from "@/api/freelog";

export default {
  name: "shelf",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "login-btn": defineAsyncComponent(() => import("../components/login-btn.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    comic: defineAsyncComponent(() => import("../components/comic.vue")),
  },

  setup() {
    const store = useStore();
    const { switchPage } = useMyRouter();
    const { operateShelf } = useMyShelf();

    return {
      callLogin,
      ...toRefs(store.state),
      switchPage,
      operateShelf,
    };
  },
};
</script>

<style lang="scss" scoped>
.shelf-wrapper {
  position: relative;
  min-height: 100vh;

  // mobile
  &.in-mobile {
    padding-bottom: 98px;
    box-sizing: border-box;

    .shelf-title {
      display: none;
    }

    .content {
      width: 100%;

      .comic-box {
        width: 100%;
      }

      .add-comic-box {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 30px;

        .add-comic-btn:active {
          color: #222;
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

      .shelf-title {
        width: 920px;
        font-size: 30px;
        color: #222222;
        line-height: 36px;
        margin: 40px 0;
      }

      .comic-box {
        width: 920px;

        & + .comic-box {
          margin-top: 20px;
        }
      }

      .add-comic-box {
        width: 920px;
        display: flex;
        justify-content: center;

        .add-comic-btn {
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            color: #539dff;
          }

          &:active {
            color: #2376e5;
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
    margin-top: 100px;
  }

  .content {
    width: 1160px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .add-comic-btn {
      width: fit-content;
      font-size: 16px;
      font-weight: bold;
      color: #666666;
      line-height: 22px;
      display: flex;
      align-items: center;
      margin-top: 30px;

      .fl-icon-tianjia {
        width: 16px;
        height: 16px;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
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
