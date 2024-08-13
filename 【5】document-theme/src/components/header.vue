<!-- 页面头部 -->

<template>
  <!-- mobile -->
  <div class="mobile-header-wrapper" v-if="inMobile">
    <div class="header-left">
      <i
        class="freelog fl-icon-xiaoshuomulu"
        @click="openDirectory()"
        v-if="route.path === '/reader'"
      ></i>

      <div
        class="back-btn"
        @click="locationHistory.length === 1 ? switchPage('/reader') : routerBack()"
        v-else
      >
        <img class="back-arrow" src="../assets/images/arrow.png" />
        <div class="back-label">
          {{ locationHistory.length === 1 ? "首页" : "返回" }}
        </div>
      </div>
    </div>

    <!-- logo -->
    <img
      class="logo"
      :src="selfConfig.logoImage || require('../assets/images/logo.png')"
      referrerpolicy="no-referrer"
    />

    <div class="header-right">
      <img
        class="avatar"
        :src="userData.headImage"
        :alt="userData.username"
        @click="userBoxShow = true"
        v-if="userData.isLogin"
      />

      <div class="header-login-btn" @click="callLogin()" v-if="!userData.isLogin">登录</div>
    </div>

    <!-- 用户弹窗 -->
    <transition name="fade">
      <div id="modal" class="modal" @click="userBoxShow = false" v-if="userBoxShow"></div>
    </transition>
    <transition name="slide-right">
      <div class="user-box-body" v-if="userBoxShow">
        <div class="user-box-top">
          <img class="avatar" :src="userData.headImage" :alt="userData.username" />
          <div class="username">
            {{ userData.username }}
          </div>
          <div class="close-btn" @click="userBoxShow = false">
            <i class="freelog fl-icon-guanbi"></i>
          </div>
        </div>
        <div class="btns">
          <div class="menu-btns">
            <div
              class="btn"
              :class="{ active: route.path === '/reader' }"
              @click="route.path !== '/reader' && switchPage('/reader')"
            >
              <i class="freelog fl-icon-shouye"></i>
              <div class="btn-label">首页</div>
            </div>
            <div
              class="btn"
              :class="{ active: route.path === '/signedList' }"
              @click="switchPage('/signedList')"
            >
              <i class="freelog fl-icon-lishi"></i>
              <div class="btn-label">已签约文档</div>
            </div>
          </div>

          <div class="footer-btn" @click="callLoginOut()">
            <i class="freelog fl-icon-tuichu1"></i>
            <div class="btn-label">退出登录</div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- PC -->
  <div class="header-wrapper" v-if="!inMobile">
    <!-- logo -->
    <img
      class="logo"
      :src="selfConfig.logoImage || require('../assets/images/logo.png')"
      @click="switchPage('/reader')"
    />

    <!-- 已登录区域 -->
    <div
      class="user-avatar"
      @mouseover="userBoxShow = true"
      @mouseleave="userBoxShow = false"
      v-if="userData.isLogin"
    >
      <img class="avatar" :src="userData.headImage" :alt="userData.username" />

      <transition name="slide-down-scale">
        <div class="user-box" v-if="userBoxShow">
          <div class="user-box-body">
            <img class="avatar" :src="userData.headImage" :alt="userData.username" />
            <div class="username">{{ userData.username }}</div>
            <div class="btn" @click="switchPage('/signedList')">已签约文档</div>
            <div class="btn" @click="callLoginOut()">登出</div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 未登录区域 -->
    <div class="user-btns" v-else>
      <div class="btn header-login-btn" @click="callLogin()">登录</div>
      <div class="btn header-register-btn" @click="register()">注册</div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, SetupContext, toRefs } from "vue";
import { callLogin, callLoginOut } from "@/api/freelog";
import { useStore } from "vuex";
import { useMyLocationHistory, useMyRouter } from "../utils/hooks";

export default {
  name: "my-header",

  emits: ["openDirectory"],

  setup(_: any, context: SetupContext) {
    const store = useStore();
    const { route, switchPage, routerBack } = useMyRouter();

    const data = reactive({
      userBoxShow: false,
      directoryShow: false
    });

    const methods = {
      /** 注册 */
      register() {
        window.open("https://user.freelog.com/logon");
      },

      /** 通知父组件打开目录 */
      openDirectory() {
        context.emit("openDirectory");
      }
    };

    useMyLocationHistory();

    return {
      callLogin,
      callLoginOut,
      ...toRefs(store.state),
      route,
      switchPage,
      routerBack,
      ...toRefs(data),
      ...methods
    };
  }
};
</script>

<style lang="scss" scoped>
// mobile
.mobile-header-wrapper {
  position: sticky;
  top: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  padding: 0 15px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.1);
  z-index: 1;

  .header-left {
    width: 70px;

    .fl-icon-xiaoshuomulu {
      width: 42px;
      height: 32px;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #222;
      border-radius: 4px;
      border: 1px solid #dfdfdf;
    }

    .back-btn {
      display: flex;
      align-items: center;

      .back-arrow {
        width: 7px;
        height: 12px;
      }

      .back-label {
        font-size: 16px;
        color: #222;
        margin-left: 10px;
      }
    }
  }

  .logo {
    height: 20px;
  }

  .header-right {
    width: 70px;
    display: flex;
    justify-content: flex-end;

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid #d1d1d1;
    }

    .header-login-btn {
      width: fit-content;
      height: 32px;
      width: 58px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      background: #2784ff;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;

      &:active {
        opacity: 0.8;
      }
    }
  }

  .modal {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .user-box-body {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 340px;
    background: #ffffff;
    border-radius: 0px 10px 10px 0px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 101;

    .user-box-top {
      position: relative;
      width: 100%;
      height: 194px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2784ff 0%, #42c28c 100%);

      .avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.4);
      }

      .username {
        font-size: 16px;
        line-height: 22px;
        color: #fff;
        font-weight: bold;
        margin-top: 20px;
      }

      .close-btn {
        position: absolute;
        right: 31px;
        top: 31px;
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .freelog {
          font-size: 12px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .btns {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 25px 20px 0;
      box-sizing: border-box;

      .menu-btns {
        flex: 1;

        .btn {
          width: 100%;
          height: 52px;
          border-radius: 4px;
          color: #222;
          background-color: #fff;
          display: flex;
          align-items: center;

          &.active,
          &:active {
            color: #2784ff;
            background: rgba(39, 132, 255, 0.05);
          }

          & + .btn {
            margin-top: 10px;
          }

          .freelog {
            font-size: 16px;
            margin: 0 11px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-label {
            font-size: 16px;
          }
        }
      }

      .footer-btn {
        width: 100%;
        height: 102px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        color: #222;
        display: flex;
        align-items: center;

        .freelog {
          font-size: 16px;
          margin: 0 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-label {
          font-size: 16px;
        }

        .main-btn {
          width: 100%;
          height: 48px;
          border-radius: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }
      }
    }
  }
}

// PC
.header-wrapper {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  padding: 0 30px;
  box-sizing: border-box;
  background-color: #fff;
  box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 1;

  .logo {
    height: 24px;
    cursor: pointer;
  }

  .user-avatar {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;

    .avatar {
      width: 32px;
      height: 32px;
      margin-left: 10px;
      border-radius: 50%;
      border: 1px solid #d1d1d1;
    }

    .user-box {
      position: absolute;
      right: 0;
      top: 100%;
      padding-top: 10px;
      cursor: default;
      z-index: 100;

      .user-box-body {
        width: 240px;
        background: #ffffff;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1px solid #d1d1d1;
          margin-top: 20px;
        }

        .username {
          font-size: 16px;
          line-height: 22px;
          color: #222222;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 20px;
        }

        .btn {
          width: 100%;
          height: 50px;
          line-height: 50px;
          font-size: 14px;
          padding-left: 20px;
          box-sizing: border-box;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          color: #222;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            color: #fff;
            background: #2784ff;
          }

          &:active {
            opacity: 0.8 !important;
          }

          &:last-child {
            border-radius: 0 0 4px 4px;
          }
        }
      }
    }
  }

  .user-btns {
    display: flex;

    .btn {
      height: 32px;
      padding: 0 15px;
      box-sizing: border-box;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 0.6;
      }
    }

    .header-login-btn {
      color: #333;
      background: #f7f7f7;
    }

    .header-register-btn {
      color: #fff;
      background: #2784ff;
      margin-left: 10px;
    }
  }
}

@media (min-width: 1600px) {
  .header-top {
    width: 1540px !important;
  }
}
</style>
