<template>
  <!-- 移动端头部 -->
  <div class="mobile-header-wrapper" :class="{ 'in-home': homeHeader }" v-if="inMobile && !mobileSearching">
    <!-- header顶部 -->
    <div class="header-top" :class="{ logon: userData.isLogin }">
      <img
        class="logo"
        :src="selfConfig.logoImage || require('../assets/images/logo.png')"
        @click="switchPage('/')"
        v-if="homeHeader"
      />
      <div class="header-top-left" @click="locationHistory.length === 1 ? switchPage('/home') : routerBack()" v-else>
        <img class="back-arrow" src="../assets/images/arrow.png" />
        <div class="back-label">{{ locationHistory.length === 1 ? "首页" : "返回" }}</div>
      </div>

      <div class="header-top-right">
        <i class="freelog fl-icon-content" @click="searchPopupShow = true" v-if="!readerHeader"></i>

        <img class="menu" src="../assets/images/menu.png" @click="userBoxShow = true" />
      </div>
    </div>

    <!-- 博客信息 -->
    <template v-if="homeHeader">
      <div class="header-other-info">
        <div class="blogger-avatar">
          <img :src="nodeLogo || require('../assets/images/default-avatar.png')" alt="博主头像" class="avatar-img" />
        </div>
        <!-- <div class="sign-count">总签约量：{{ signCount }}人</div> -->
      </div>

      <div class="header-blog-info">
        <div class="blog-title">{{ nodeTitle }}</div>
        <div class="blog-desc" v-html="nodeShortDescription"></div>
      </div>
    </template>

    <transition name="fade">
      <div id="modal" class="modal" @click="userBoxShow = false" @touchmove.prevent v-if="userBoxShow"></div>
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
            <div
              class="btn"
              :class="{ active: route.path === '/home' }"
              @click="route.path !== '/home' && switchPage('/home')"
            >
              <i class="freelog fl-icon-shouye"></i>
              <div class="btn-label">首页</div>
            </div>
            <div
              class="btn"
              :class="{ active: route.path === '/signedList' }"
              @click="
                switchPage('/signedList');
                userBoxShow = false;
              "
              v-if="userData.isLogin"
            >
              <i class="freelog fl-icon-lishi"></i>
              <div class="btn-label">已签约文章</div>
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

    <transition name="fade">
      <div class="search-page" v-if="searchPopupShow">
        <div class="search-page-header">
          <div class="search-page-box">
            <input
              class="search-input input-none"
              :class="{ 'in-focus': searchKey }"
              v-model="searchKey"
              :autofocus="true"
              @input="searchKeyInput()"
              @keyup.enter="
                searchWord(searchKey);
                search();
              "
              @keyup.esc="searchKey = ''"
            />
            <i class="freelog fl-icon-content"></i>
          </div>

          <div class="cancel-btn" @click="searchPopupShow = false">取消</div>
        </div>

        <div class="search-history-box" v-if="searchHistory.length !== 0">
          <div class="search-history-box-title">
            <div class="title">搜索记录</div>
            <div class="text-btn" @click="clearHistory()">清空</div>
          </div>
          <div class="search-history-box-list">
            <div class="tag" v-for="item in searchHistory" :key="item" @click="selectTag(item)">
              {{ item }}
              <i class="freelog fl-icon-guanbi" @click.stop="deleteWord(item)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- 移动端首页搜索头部 -->
  <div class="mobile-search-header-wrapper" v-if="inMobile && mobileSearching">
    <div class="search-page-box">
      <input
        class="search-input input-none"
        :class="{ 'in-focus': searchKey }"
        v-model="searchKey"
        @input="searchKeyInput(true)"
        @keyup.enter="
          searchWord(searchKey);
          search();
        "
      />
      <i class="freelog fl-icon-content"></i>
    </div>

    <div class="cancel-btn" @click="switchPage('/home')">取消</div>
  </div>

  <!-- PC -->
  <div class="header-wrapper" v-if="!inMobile">
    <div class="header-top">
      <div class="header-top-left">
        <!-- logo -->
        <img
          class="logo"
          :src="selfConfig.logoImage || require('../assets/images/logo.png')"
          @click="switchPage('/')"
        />

        <!-- 搜索框 -->
        <div class="search-box">
          <input
            ref="searchInput"
            class="search-input input-none"
            :class="{ 'in-focus': searchKey }"
            v-model="searchKey"
            @input="searchKeyInput()"
            @keyup="inputKeyUp($event)"
            @focus="searchHistoryShow = true"
            @blur="searchHistoryShow = false"
          />
          <i class="freelog fl-icon-content"></i>
          <i
            class="freelog fl-icon-guanbi text-btn"
            @click="
              searchKey = '';
              search();
            "
            v-show="searchKey"
          ></i>

          <transition name="fade">
            <div class="search-history" v-if="searchHistoryShow && mySearchHistory.length !== 0">
              <div
                class="history-item"
                :class="{ catch: searchWordCatch === index }"
                v-for="(item, index) in mySearchHistory"
                :key="item"
                @click="clickSearchHistory(item)"
                @mousemove="searchWordCatch = index"
              >
                <div class="item-word">{{ item }}</div>
                <i class="freelog fl-icon-guanbi" @click.stop="deleteSearchHistory(item)"></i>
              </div>

              <div class="text-btn" @click="clearHistory()">清空搜索记录</div>
            </div>
          </transition>
        </div>
      </div>

      <div class="header-top-right">
        <div class="nav-btn" @click="switchPage('/')">首页</div>
        <!-- 已登录用户信息 -->
        <div
          class="user-avatar"
          @mouseover="userBoxShow = true"
          @mouseleave="userBoxShow = false"
          v-if="userData.isLogin"
        >
          <img class="avatar" :src="userData.headImage" :alt="userData.username" />

          <transition name="slide-down-scale">
            <div class="user-box" v-show="userBoxShow">
              <div class="user-box-body">
                <img class="avatar" :src="userData.headImage" :alt="userData.username" />
                <div class="username">{{ userData.username }}</div>
                <div
                  class="user-box-btn"
                  @click="
                    switchPage('/signedList');
                    userBoxShow = false;
                  "
                >
                  已签约文章
                </div>
                <div class="user-box-btn" @click="callLoginOut()">登出</div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 登录相关按钮 -->
        <div class="user-btns" v-else>
          <div class="btn header-login-btn" @click="callLogin()">登录</div>
          <div class="btn header-register-btn" @click="register()">注册</div>
        </div>
      </div>
    </div>

    <template v-if="homeHeader">
      <!-- 博客信息 -->
      <div class="header-blog-info">
        <div class="blogger-avatar">
          <img :src="nodeLogo || require('../assets/images/default-avatar.png')" alt="博主头像" class="avatar-img" />
        </div>

        <div class="info-content">
          <div class="title-signcount">
            <div class="blog-title">{{ nodeTitle }}</div>
            <!-- <div class="sign-count">总签约量：{{ signCount }}人</div> -->
          </div>
          <div class="blog-desc" v-html="nodeShortDescription"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, reactive, ref, toRefs, watch } from "vue";
import { useMyLocationHistory, useMyRouter, useSearchHistory } from "../utils/hooks";
import { callLogin, callLoginOut, getNodeInfo } from "@/api/freelog";
import { useStore } from "vuex";

export default {
  name: "my-header",

  props: {
    homeHeader: {
      type: Boolean,
      default: false,
    },
    readerHeader: {
      type: Boolean,
      default: false,
    },
    mobileSearching: {
      type: Boolean,
      default: false,
    },
  },

  setup(props: { homeHeader: boolean }) {
    const nodeInfo = getNodeInfo();
    const store = useStore();
    const { query, route, switchPage, routerBack } = useMyRouter();
    const { searchHistory, searchWord, deleteWord, clearHistory } = useSearchHistory();
    const searchInput = ref();
    const mySearchHistory = computed(() => searchHistory.value.filter((item) => item.includes(data.searchKey)));

    const data = reactive({
      signCount: 0,
      searchKey: "",
      tags: "",
      userBoxShow: false,
      searchPopupShow: false,
      searchHistoryShow: false,
      searchWordCatch: null as number | null,
    });

    const methods = {
      // 输入搜索词
      searchKeyInput(inHomeSearch = false) {
        data.searchKey = (data.searchKey || "").trim();
        data.searchHistoryShow = true;
        data.searchWordCatch = null;
        if (inHomeSearch) {
          !data.searchKey && switchPage("/home");
          data.searchPopupShow = !data.searchKey;
        }
      },

      // 点击历史搜索词
      clickSearchHistory(item: string) {
        data.searchKey = item;
        searchWord(data.searchKey);
        this.search();
        data.searchHistoryShow = false;
      },

      // 删除历史搜索词
      deleteSearchHistory(item: string) {
        searchInput.value.focus();
        deleteWord(item);
      },

      // 搜索
      search() {
        data.searchPopupShow = false;
        const { searchKey } = data;
        const query: { keywords?: string } = {};
        if (searchKey) query.keywords = searchKey;
        switchPage("/home", query);
      },

      // 筛选标签
      selectTag(item: string) {
        data.searchPopupShow = false;
        data.searchKey = item;
        this.search();
      },

      // 搜索框键盘事件
      inputKeyUp(e: { keyCode: any }) {
        switch (e.keyCode) {
          case 13:
            // 回车
            if (data.searchWordCatch !== null) {
              data.searchKey = mySearchHistory.value[data.searchWordCatch];
            }
            data.searchWordCatch = null;
            data.searchHistoryShow = false;
            searchWord(data.searchKey);
            this.search();
            break;
          case 27:
            // esc
            data.searchKey = "";
            data.searchWordCatch = null;
            data.searchHistoryShow = true;
            break;
          case 38:
            // 上
            if (data.searchWordCatch === null || data.searchWordCatch === 0) {
              data.searchWordCatch = null;
            } else {
              data.searchWordCatch = data.searchWordCatch - 1;
            }
            break;
          case 40:
            // 下
            data.searchHistoryShow = true;
            if (data.searchWordCatch === null) {
              data.searchWordCatch = 0;
            } else if (data.searchWordCatch !== mySearchHistory.value.length - 1) {
              data.searchWordCatch = data.searchWordCatch + 1;
            }
            break;
          default:
            break;
        }
      },

      // 注册
      register() {
        window.open("https://user.freelog.com/logon");
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
    useMyLocationHistory();

    return {
      ...props,
      ...nodeInfo,
      callLogin,
      callLoginOut,
      switchPage,
      routerBack,
      ...toRefs(store.state),
      route,
      searchInput,
      searchHistory,
      mySearchHistory,
      searchWord,
      deleteWord,
      clearHistory,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
// 移动端头部
.mobile-header-wrapper {
  width: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  background: var(--gradientColor);

  &.in-home {
    padding: 20px 20px 40px;
  }

  .header-top {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
      height: 24px;
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
      flex: 1;
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

      .menu {
        width: 42px;
        height: 32px;
        margin-left: 30px;
      }
    }
  }

  .header-other-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 38px;

    .blogger-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .avatar-img {
        height: 100%;
      }
    }

    .sign-count {
      padding: 5px 8px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 18px;
    }
  }

  .header-blog-info {
    margin-top: 20px;

    .blog-title {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      line-height: 30px;
    }

    .blog-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 20px;
      margin-top: 10px;
    }
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

  .search-page {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 1;

    .search-page-header {
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      padding-left: 20px;
      box-sizing: border-box;
      background: var(--gradientColor);
      margin-bottom: 20px;

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
          width: 0;
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
        padding: 0 20px;
        display: flex;
        align-items: center;
        color: #fff;

        &:active {
          opacity: 0.6;
        }
      }
    }

    .search-history-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      & + .search-history-box {
        margin-top: 25px;
      }

      .search-history-box-title {
        width: 100%;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        padding: 0 20px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;

        .clear-btn {
          color: #5d9191;
        }
      }

      .search-history-box-list {
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

          .freelog {
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
          }
        }
      }
    }
  }
}

// 移动端首页搜索头部
.mobile-search-header-wrapper {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 20px;
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
      width: 0;
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
    padding: 0 20px;
    display: flex;
    align-items: center;
    color: #fff;

    &:active {
      opacity: 0.6;
    }
  }
}

// PC
.header-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--gradientColor);

  .header-top {
    width: 920px;
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

      .search-box {
        position: relative;
        width: 240px;
        height: 32px;
        display: flex;
        align-items: center;
        margin-left: 40px;

        .search-input {
          height: 32px;
          border-radius: 32px;
          flex: 1;
          font-size: 14px;
          color: #222;
          padding: 0 34px !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
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
          left: 10px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
        }

        .fl-icon-guanbi {
          position: absolute;
          right: 10px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }

        .search-history {
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          margin-top: 5px;
          min-height: 170px;
          background-color: #fff;
          background: #ffffff;
          box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          padding: 4px;
          padding-bottom: 50px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;

          .history-item {
            width: 100%;
            height: 34px;
            border-radius: 4px;
            padding: 0 11px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s linear;

            &.catch,
            &:hover {
              background: rgba(0, 0, 0, 0.03);

              .freelog {
                opacity: 1;
              }
            }

            .item-word {
              font-size: 12px;
              color: #222222;
            }

            .freelog {
              width: 10px;
              height: 10px;
              font-size: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #999;
              cursor: pointer;
              transition: all 0.2s linear;
              opacity: 0;

              &:hover {
                color: #a9a9ad;
              }
            }
          }

          .text-btn {
            position: absolute;
            bottom: 12px;
            font-size: 12px;
            line-height: 18px;
          }
        }
      }
    }

    .header-top-right {
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
          box-sizing: border-box;
        }

        .user-box {
          position: absolute;
          right: 0;
          top: 100%;
          padding-top: 10px;
          cursor: default;
          z-index: 1;

          .user-box-body {
            width: 240px;
            background: #ffffff;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            overflow: hidden;
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

            .user-box-btn {
              width: 100%;
              height: 50px;
              line-height: 50px;
              font-size: 14px;
              padding-left: 20px;
              box-sizing: border-box;
              border-top: 1px solid rgba(0, 0, 0, 0.05);
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

  .header-blog-info {
    width: 920px;
    display: flex;
    align-items: center;
    margin-top: 50px;
    margin-bottom: 70px;

    .blogger-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .avatar-img {
        height: 100%;
      }
    }

    .info-content {
      flex: 1;
      width: 0;
      margin-left: 30px;

      .title-signcount {
        width: 100%;
        display: flex;
        align-items: center;

        .blog-title {
          max-width: 100%;
          font-size: 28px;
          font-weight: 600;
          color: #ffffff;
          line-height: 34px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .sign-count {
          flex-shrink: 0;
          height: 28px;
          line-height: 28px;
          padding: 0 8px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          margin-left: 15px;
        }
      }

      .blog-desc {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 20px;
        margin-top: 16px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }
  }
}
</style>
