<template>
  <!-- 移动端头部 -->
  <div class="mobile-reader-header-wrapper" :class="{ show: headerShow }" v-if="inMobile">
    <!-- header顶部 -->
    <div class="header-top" :class="{ logon: userData.isLogin }">
      <div class="header-top-left" @click="locationHistory.length === 1 ? switchPage('/home') : routerBack()">
        <img class="back-arrow" src="../assets/images/arrow.png" />
        <div class="back-label">
          {{ locationHistory.length === 1 ? "首页" : "返回" }}
        </div>
      </div>

      <img class="menu" src="../assets/images/menu.png" @click="userBoxShow = true" />
    </div>

    <!-- 展品标题 -->
    <div class="comic-name">{{ comicInfo.exhibitTitle }}</div>

    <!-- 用户弹窗 -->
    <transition name="fade">
      <div id="modal" class="modal" @click="userBoxShow = false" v-if="userBoxShow"></div>
    </transition>
    <transition name="slide-right">
      <div class="user-box-body" v-if="userBoxShow">
        <div class="user-box-top">
          <img
            class="avatar"
            :src="userData?.headImage || require('../assets/images/default-avatar.png')"
            :alt="userData?.username || '未登录'"
            @click="!userData.isLogin && callLogin()"
          />
          <div class="username" @click="!userData.isLogin && callLogin()">
            {{ userData?.username || "未登录" }}
          </div>
          <div class="close-btn" @click="userBoxShow = false">
            <i class="freelog fl-icon-guanbi"></i>
          </div>
        </div>
        <div class="btns">
          <div class="menu-btns">
            <div class="btn" @click="switchPage('/home')">
              <i class="freelog fl-icon-shouye"></i>
              <div class="btn-label">首页</div>
            </div>
            <div
              class="btn"
              @click="
                switchPage('/shelf');
                userBoxShow = false;
              "
              v-if="userData.isLogin"
            >
              <i class="freelog fl-icon-shujia"></i>
              <div class="btn-label">我的收藏</div>
            </div>
            <div
              class="btn"
              @click="
                switchPage('/signedList');
                userBoxShow = false;
              "
              v-if="userData.isLogin"
            >
              <i class="freelog fl-icon-lishi"></i>
              <div class="btn-label">已签约漫画</div>
            </div>
          </div>

          <div class="footer-btn" @click="callLoginOut()" v-if="userData.isLogin">
            <i class="freelog fl-icon-tuichu1"></i>
            <div class="btn-label">退出登录</div>
          </div>
          <div class="footer-btn" v-if="!userData.isLogin">
            <div class="main-btn mobile" @click="callLogin()">立即登录</div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- PC -->
  <div
    class="reader-header-wrapper"
    :class="{ show: headerShow }"
    @mouseenter="changeShow(true)"
    @mouseleave="changeShow(false)"
    v-if="!inMobile"
  >
    <div class="header-body">
      <div class="header-center">
        <span class="comic-name" @click="switchPage('/detail', { id: comicInfo.exhibitId })">
          {{ comicInfo.exhibitTitle }}
        </span>
      </div>

      <div class="header-box">
        <!-- logo -->
        <img
          class="logo"
          :src="selfConfig.logoImage || require('../assets/images/logo.png')"
          @click="switchPage('/home')"
        />

        <div class="header-right">
          <div class="nav-btn" @click="switchPage('/')">
            首页
          </div>
          <div class="nav-btn" @click="switchPage('/shelf')" v-if="userData.isLogin">
            我的收藏
          </div>

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
                  <div
                    class="btn user-box-btn"
                    @click="
                      switchPage('/signedList');
                      userBoxShow = false;
                    "
                  >
                    已签约漫画
                  </div>
                  <div class="btn user-box-btn" @click="callLoginOut()">登出</div>
                </div>
              </div>
            </transition>
          </div>

          <div class="user-btns" v-else>
            <div class="btn header-login-btn" @click="callLogin()">登录</div>
            <div class="btn header-register-btn" @click="register()">注册</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SetupContext, reactive, toRefs, watch } from "vue";
import { useMyRouter } from "../utils/hooks";
import { callLogin, callLoginOut } from "@/api/freelog";
import { useStore } from "vuex";
import { ExhibitItem } from "@/api/interface";

export default {
  name: "reader-header",

  emits: ["changeBarShow"],

  props: ["comicInfo", "show"],

  setup(props: { comicInfo: ExhibitItem; show: boolean }, context: SetupContext<Record<string, any>>) {
    const store = useStore();
    const { switchPage, routerBack } = useMyRouter();

    const data = reactive({
      headerShow: false,
      userBoxShow: false,
      searchPopupShow: false,
      searchHistoryShow: false,
      searchWordCatch: null as number | null,
    });

    const methods = {
      // 注册
      register() {
        window.open("https://user.freelog.com/logon");
      },

      // 改变 header 显示状态
      changeShow(value: boolean) {
        context.emit("changeBarShow", value);
      },
    };

    watch(
      () => props.show,
      (cur) => {
        data.headerShow = cur;
      }
    );

    return {
      callLogin,
      callLoginOut,
      switchPage,
      routerBack,
      ...props,
      ...toRefs(store.state),
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
// 移动端头部
.mobile-reader-header-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 120px;
  padding: 0 20px 30px;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
  transform: translateY(-120px);
  z-index: 1;
  transition: all 0.1s ease;

  &.show {
    transform: translateY(0);
  }

  .header-top {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-top-left {
      display: flex;
      align-items: center;

      .back-arrow {
        width: 7px;
        height: 12px;
      }

      .back-label {
        font-size: 16px;
        color: #ffffff;
        line-height: 22px;
        margin-left: 10px;
      }
    }

    .menu {
      width: 42px;
      height: 32px;
    }
  }

  .comic-name {
    width: 100%;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    line-height: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-top: 10px;
  }

  .modal {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
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
      background: var(--gradientColor);

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
            color: var(--deriveColor);
            background: rgba(93, 145, 145, 0.05);
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
.reader-header-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 70px;
  z-index: 100;

  &.show .header-body {
    transform: translateY(0);
  }

  .header-body {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    transform: translateY(-70px);
    transition: all 0.1s ease;

    .header-center {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .comic-name {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        line-height: 22px;
        cursor: pointer;
      }
    }

    .header-box {
      width: 1160px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .logo {
        position: relative;
        height: 24px;
        cursor: pointer;
      }

      .header-right {
        display: flex;
        align-items: center;

        .nav-btn {
          padding: 0 25px;
          font-size: 14px;
          line-height: 16px;
          font-weight: 600;
          color: #ffffff;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          opacity: 0.8;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            opacity: 1;
          }
        }

        .user-avatar {
          position: relative;
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-left: 25px;

          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.4);
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

                &:last-child {
                  border-radius: 0 0 4px 4px;
                }
              }
            }
          }
        }

        .user-btns {
          display: flex;
          margin-left: 25px;

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
          }

          .header-register-btn {
            margin-left: 10px;
          }
        }
      }
    }
  }
}
</style>
