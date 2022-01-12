<template>
  <!-- mobile -->
  <div class="mobile-header-wrapper" v-if="inMobile">
    <i class="freelog fl-icon-xiaoshuomulu" @click="openDirectory()"></i>

    <img
      class="avatar"
      :src="userData.headImage"
      :alt="userData.username"
      @click="userBoxShow = true"
      v-if="userData"
    />

    <div class="header-login-btn" @click="callLogin()" v-if="!userData">登录</div>

    <!-- 用户弹窗 -->
    <transition name="fade">
      <div id="modal" class="modal" @click="userBoxShow = false" v-if="userBoxShow"></div>
    </transition>
    <transition name="slide-right">
      <div class="user-box-body" v-if="userBoxShow">
        <img class="avatar" :src="userData?.headImage" :alt="userData?.username" />
        <div class="username">{{ userData?.username }}</div>
        <div class="btns">
          <div class="btn" @click="callLoginOut()">
            <div class="btn-content">退出登录</div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- PC -->
  <div class="header-wrapper" v-if="!inMobile">
    <!-- logo -->
    <img class="logo" :src="selfConfig.logoImage || require('../assets/images/logo.png')" />

    <!-- 已登录区域 -->
    <div class="user-avatar" @mouseover="userBoxShow = true" @mouseleave="userBoxShow = false" v-if="userData">
      <div class="username">{{ userData.username }}</div>
      <img class="avatar" :src="userData.headImage" :alt="userData.username" />

      <transition name="slide-down-scale">
        <div class="user-box" v-if="userBoxShow">
          <div class="user-box-body">
            <img class="avatar" :src="userData.headImage" :alt="userData.username" />
            <div class="username">{{ userData.username }}</div>
            <div class="mobile">{{ userData.mobile }}</div>
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

export default {
  name: "my-header",

  emits: ['openDirectory'],

  setup(props: any, context: SetupContext) {
    const store = useStore();

    const data = reactive({
      userBoxShow: false,
      directoryShow: false,
    });

    const methods = {
      // 注册
      register() {
        window.open("http://user.testfreelog.com/logon");
      },

      // 通知父组件打开目录
      openDirectory() {
        context.emit('openDirectory');
      }
    };

    return {
      callLogin,
      callLoginOut,
      ...toRefs(store.state),
      ...toRefs(data),
      ...methods,
    };
  },
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

  .freelog {
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

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid #d1d1d1;
  }

  .header-login-btn {
    height: 32px;
    padding: 0 15px;
    box-sizing: border-box;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 100;

    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 1px solid #d1d1d1;
      margin-top: 40px;
    }

    .username {
      font-size: 16px;
      line-height: 22px;
      color: #222222;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 40px;
    }

    .btns {
      width: 100%;

      .btn {
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;

        &:active {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .btn-content {
          height: 60px;
          font-size: 16px;
          color: #222222;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        &:last-child .btn-content {
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
  z-index: 1;

  .logo {
    height: 24px;
    cursor: pointer;

    .freelog {
      height: 24px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: normal;
      margin-right: 5px;
    }
  }

  .user-avatar {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;

    .username {
      font-size: 14px;
      line-height: 20px;
      color: #222;
    }

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
        }

        .mobile {
          font-size: 14px;
          color: #222222;
          font-weight: bold;
          line-height: 20px;
          margin-top: 8px;
          margin-bottom: 16px;
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
            background: #c127ff;
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
