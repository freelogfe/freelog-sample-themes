<template>
  <!-- mobile -->
  <div
    class="mobile-header-wrapper"
    :class="{ 'in-home': homeHeader }"
    v-if="inMobile"
  >
    <!-- header顶部 -->
    <div class="header-top" :class="{ logon: userData }">
      <img
        class="logo"
        :src="selfConfig.logoImage || require('../assets/images/logo.png')"
        @click="switchPage('/home')"
        v-if="homeHeader"
      />
      <div class="header-top-left" @click="routerBack()" v-else>
        <img class="back-arrow" src="../assets/images/arrow.png" />
        <div class="back-label">返回</div>
      </div>

      <div class="header-top-right">
        <i
          class="freelog fl-icon-content"
          @click="searchPopupShow = true"
          v-if="!homeHeader"
        ></i>

        <img
          class="avatar"
          :src="userData.headImage"
          :alt="userData.username"
          @click="userBoxShow = true"
          v-if="userData"
        />
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-box" @click="searchPopupShow = true" v-if="homeHeader">
      <i class="freelog fl-icon-content"></i>
    </div>

    <!-- 用户弹窗 -->
    <transition name="fade">
      <div
        id="modal"
        class="modal"
        @click="userBoxShow = false"
        v-if="userBoxShow"
      ></div>
    </transition>
    <transition name="slide-right">
      <div class="user-box-body" v-if="userBoxShow">
        <img
          class="avatar"
          :src="userData?.headImage"
          :alt="userData?.username"
        />
        <div class="username">{{ userData?.username }}</div>
        <div class="btns">
          <div class="btn" @click="switchPage('/home')">
            <div class="btn-content">首页</div>
          </div>
          <div class="btn" @click="callLoginOut()">
            <div class="btn-content">退出登录</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 搜索页 -->
    <transition name="fade">
      <div class="search-page" v-if="searchPopupShow">
        <div class="search-page-header">
          <div class="search-page-box">
            <input
              class="search-input input-none"
              :class="{ 'in-focus': searchKey }"
              v-model="searchKey"
              @keyup.enter="search()"
              @keyup.esc="searchKey = ''"
            />
            <i class="freelog fl-icon-content"></i>
          </div>

          <div class="cancel-btn" @click="searchPopupShow = false">取消</div>
        </div>

        <div class="recommend-tags">
          <div class="recommend-tags-title">推荐标签</div>
          <div class="recommend-tags-list">
            <div
              class="tag"
              v-for="item in galleryTags"
              :key="item"
              @click="selectTag(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- PC -->
  <div class="header-wrapper" v-if="!inMobile">
    <!-- header顶部 -->
    <div class="header-top">
      <div class="header-top-left">
        <!-- logo -->
        <img
          class="logo"
          :src="selfConfig.logoImage || require('../assets/images/logo.png')"
          @click="switchPage('/home')"
        />

        <!-- 搜索框 -->
        <div class="small-search-box" v-if="!homeHeader">
          <input
            class="search-input input-none"
            v-model="searchKey"
            @keyup.enter="search()"
            @keyup.esc="searchKey = ''"
          />
          <i class="freelog fl-icon-content"></i>
        </div>
      </div>

      <div
        class="user-avatar"
        @mouseover="userBoxShow = true"
        @mouseleave="userBoxShow = false"
        v-if="userData"
      >
        <div class="username">{{ userData.username }}</div>
        <img
          class="avatar"
          :src="userData.headImage"
          :alt="userData.username"
        />

        <transition name="slide-down-scale">
          <div class="user-box" v-if="userBoxShow">
            <div class="user-box-body">
              <img
                class="avatar"
                :src="userData.headImage"
                :alt="userData.username"
              />
              <div class="username">{{ userData.username }}</div>
              <div class="mobile">{{ userData.mobile }}</div>
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

    <!-- 搜索框 -->
    <div class="search-box" v-if="homeHeader">
      <input
        class="search-input input-none"
        :class="{ 'in-focus': searchKey }"
        v-model="searchKey"
        @keyup.enter="search()"
        @keyup.esc="searchKey = ''"
      />
      <i class="freelog fl-icon-content"></i>
      <i
        class="freelog fl-icon-guanbi"
        @click="searchKey = ''"
        v-show="searchKey"
      ></i>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar" v-if="homeHeader">
      <div class="category-btn" :class="{ active: !tags }" @click="selectTag()">
        全部
      </div>

      <div
        class="category-btn"
        :class="{ active: tags === item }"
        v-for="item in galleryTags"
        :key="item"
        @click="selectTag(item)"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from "vue";
import { useMyRouter } from "../utils/hooks";
import { callLogin, callLoginOut } from "@/api/freelog";
import { useStore } from "vuex";

export default {
  name: "my-header",

  props: {
    homeHeader: {
      type: Boolean,
      default: false,
    },
  },

  setup(props: { homeHeader: boolean }) {
    const store = useStore();
    let galleryTags: string[] = store.state.selfConfig.tags.split(",");
    const { query, switchPage, routerBack } = useMyRouter();

    const data = reactive({
      searchKey: "",
      tags: "",
      userBoxShow: false,
      searchPopupShow: false,
    });

    const methods = {
      // 搜索
      search() {
        data.searchPopupShow = false;
        const { searchKey, tags } = data;
        const query: { keywords?: string; tags?: string } = {};
        if (searchKey) query.keywords = searchKey;
        if (tags) query.tags = data.tags;
        switchPage("/home", query);
      },

      // 筛选标签
      selectTag(tag: string) {
        data.tags = tag || "";
        this.search();
      },

      // 注册
      register() {
        window.open("http://user.testfreelog.com/logon");
      },
    };

    watch(
      () => query.value,
      () => {
        initHeaderSearch();
      }
    );

    // 初始化头部搜索相关数据
    const initHeaderSearch = () => {
      const { keywords, tags } = query.value;
      data.searchKey = keywords || "";
      data.tags = tags || "";
    };
    initHeaderSearch();

    return {
      ...props,
      callLogin,
      callLoginOut,
      switchPage,
      routerBack,
      ...store.state,
      galleryTags,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
// mobile
.mobile-header-wrapper {
  width: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  background: var(--gradientColor);

  &.in-home {
    padding: 22px 15px;

    .header-top {
      justify-content: center;

      &.logon {
        justify-content: space-between;

        .header-top-right {
          flex: 1;
        }
      }
    }
  }

  .header-top {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
      height: 24px;

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
        margin-left: 10px;
      }
    }

    .header-top-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-left: 10px;

      .fl-icon-content {
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-left: 20px;
      }
    }
  }

  .search-box {
    width: 100%;
    height: 42px;
    border-radius: 42px;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    margin-top: 22px;

    .fl-icon-content {
      width: 14px;
      height: 14px;
      font-size: 14px;
      margin-left: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
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

  .search-page {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 100;

    .search-page-header {
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      padding-left: 15px;
      box-sizing: border-box;
      background: var(--gradientColor);

      .search-page-box {
        position: relative;
        flex: 1;
        height: 42px;
        border-radius: 42px;
        display: flex;
        align-items: center;
        overflow: hidden;

        .search-input {
          height: 100%;
          flex: 1;
          font-size: 16px;
          color: #222;
          background-color: rgba(255, 255, 255, 0.1) !important;
          padding: 0 44px !important;
          transition: all 0.2s linear;

          &:active {
            background-color: rgba(255, 255, 255, 0.18) !important;
          }

          &:focus,
          &.in-focus {
            background-color: #fff !important;

            & ~ .fl-icon-content {
              color: #8e8e93;
            }
          }
        }

        .fl-icon-content {
          position: absolute;
          left: 15px;
          width: 14px;
          height: 14px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.2s linear;
        }
      }

      .cancel-btn {
        font-size: 16px;
        line-height: 22px;
        height: 100%;
        padding: 0 15px;
        display: flex;
        align-items: center;
        color: #fff;

        &:active {
          opacity: 0.6;
        }
      }
    }

    .recommend-tags {
      width: 100%;
      padding: 20px 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;

      .recommend-tags-title {
        width: 100%;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        padding-left: 15px;
        box-sizing: border-box;
      }

      .recommend-tags-list {
        width: 340px;
        margin-top: 20px;
        display: flex;
        flex-wrap: wrap;

        .tag {
          height: 38px;
          padding: 0 15px;
          border-radius: 38px;
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #575e6a;
          background-color: #ebecf0;
          margin: 0 5px 15px;

          &:active {
            background-color: #dcdee2;
          }
        }
      }
    }
  }
}

// PC
.header-wrapper {
  width: 100%;
  padding: 0 140px;
  background: var(--gradientColor);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;

  .header-top {
    width: 1230px;
    height: 70px;
    padding: 19px 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-top-left {
      display: flex;
      align-items: center;

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

      .small-search-box {
        position: relative;
        width: 240px;
        height: 32px;
        border-radius: 32px;
        display: flex;
        align-items: center;
        overflow: hidden;
        margin-left: 40px;

        .search-input {
          height: 100%;
          flex: 1;
          font-size: 14px;
          color: #222;
          padding: 0 34px !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
          transition: all 0.2s linear;

          &:hover {
            background-color: rgba(255, 255, 255, 0.18) !important;
          }

          &:focus {
            background-color: #fff !important;

            & ~ .fl-icon-content {
              color: #8e8e93;
            }
          }
        }

        .fl-icon-content {
          position: absolute;
          left: 10px;
          width: 14px;
          height: 14px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
        }
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
        color: #fff;
      }

      .avatar {
        width: 32px;
        height: 32px;
        margin-left: 10px;
        border-radius: 50%;
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
      }

      .header-register-btn {
        margin-left: 10px;
      }
    }
  }

  .search-box {
    position: relative;
    width: 100%;
    max-width: 700px;
    height: 38px;
    border-radius: 38px;
    display: flex;
    align-items: center;
    overflow: hidden;
    flex-shrink: 0;
    margin-top: 16px;
    margin-bottom: 25px;

    .search-input {
      height: 100%;
      flex: 1;
      font-size: 14px;
      color: #222;
      background-color: rgba(255, 255, 255, 0.1) !important;
      padding: 0 39px !important;
      transition: all 0.2s linear;

      &:hover {
        background-color: rgba(255, 255, 255, 0.18) !important;
      }

      &:focus,
      &.in-focus {
        background-color: #fff !important;

        & ~ .fl-icon-content {
          color: #8e8e93;
        }
      }
    }

    .fl-icon-content {
      position: absolute;
      left: 15px;
      width: 14px;
      height: 14px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.2s linear;
    }

    .fl-icon-guanbi {
      position: absolute;
      right: 15px;
      width: 14px;
      height: 14px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8e8e93;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s linear;

      &:hover {
        color: #a9a9ad;
      }
    }
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 27px;

    .category-btn {
      height: 24px;
      line-height: 24px;
      border-radius: 24px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      padding: 0 8px;
      background-color: transparent;
      cursor: pointer;
      transition: all 0.2s linear;

      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }

      &.active {
        background-color: #ffffff;
        color: #666;
      }

      & + .category-btn {
        margin-left: 4px;
      }
    }
  }
}

@media (min-width: 1600px) {
  .header-top {
    width: 1540px !important;
  }
}
</style>
