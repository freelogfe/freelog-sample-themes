<!-- 头部 -->
<template>
  <div class="header-wrapper">
    <!-- mobile -->
    <div
      class="mobile-header-wrapper"
      :class="{ home: currentPath === '/home', search: currentPath === '/search-list' }"
      v-if="$store.state.inMobile"
    >
      <!-- 非搜索页头部 -->
      <template v-if="currentPath !== '/search-list'">
        <div class="header-left" @click="back()">
          <template v-if="currentPath !== '/home'">
            <img class="back-arrow" src="../assets/images/arrow.png" />
            <div class="back-label">
              {{ $store.state.locationHistory.length === 1 ? "首页" : "返回" }}
            </div>
          </template>
        </div>

        <div class="header-right">
          <i class="freelog fl-icon-content" @click="toPage('/search-list')"></i>

          <img class="menu" src="../assets/images/menu.png" @click="userBoxShow = true" />
        </div>
      </template>

      <!-- 搜索页头部 -->
      <template v-if="currentPath === '/search-list'">
        <div class="search-box">
          <input
            ref="searchInput"
            class="search-input input-none"
            :class="{ 'in-focus': searchKey }"
            v-model="searchKey"
            @input="searchKeyInput()"
            @keyup.enter="search()"
            @keyup.esc="
              searchKey = '';
              searchHistoryShow = true;
            "
          />
          <i class="freelog fl-icon-content"></i>
          <i
            class="freelog fl-icon-guanbi"
            @click="
              searchKey = '';
              searchHistoryShow = true;
            "
            v-show="searchKey"
          ></i>
        </div>
        <div class="cancel-btn" @click="back()">取消</div>

        <transition name="fade">
          <div class="search-history" v-if="searchHistoryShow">
            <div class="search-history-title">
              <div class="title">搜索记录</div>
              <div class="clear-btn" @click="clearHistory()">清空</div>
            </div>
            <div class="search-history-list">
              <div class="tag" v-for="item in searchHistory" :key="item" @click="selectTag(item)">
                {{ item }}
                <i class="freelog fl-icon-guanbi" @click.stop="deleteWord(item)"></i>
              </div>
            </div>
          </div>
        </transition>
      </template>

      <!-- 用户弹窗 -->
      <transition name="fade">
        <div id="modal" class="modal" @click="userBoxShow = false" v-if="userBoxShow"></div>
      </transition>
      <transition name="slide-right">
        <div class="user-box-body" v-if="userBoxShow">
          <div class="user-box-top">
            <img
              class="avatar"
              :src="userData.headImage || require('../assets/images/default-user-avatar.png')"
              :alt="userData.username || '未登录'"
              @click="!userData.isLogin && callLogin()"
            />
            <div class="username" @click="!userData.isLogin && callLogin()">
              {{ userData.username || "未登录" }}
            </div>
            <i class="freelog fl-icon-guanbi close-btn" @click="userBoxShow = false"></i>
          </div>
          <div class="btns">
            <div class="menu-btns">
              <template v-for="item in menuBtnList">
                <div
                  class="btn"
                  :class="{ active: currentPath === item.path }"
                  @click="toPage(item.path)"
                  v-if="!item.hidden"
                >
                  <i class="freelog" :class="item.icon"></i>
                  <div class="btn-label">{{ item.label }}</div>
                </div>
              </template>
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
    <div class="pc-header-wrapper" v-if="$store.state.inMobile === false">
      <div class="header-left">
        <div
          class="btn"
          :class="{ active: currentPath === item.value }"
          v-for="item in tabList"
          :key="item.value"
          @click="toPage(item.value)"
          v-if="item.value !== '/collection-list' || userData.isLogin"
        >
          {{ item.label }}
        </div>
      </div>

      <div class="header-right">
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
          />
          <i class="freelog fl-icon-content"></i>
          <i class="freelog fl-icon-guanbi text-btn" @click="searchKey = ''" v-show="searchKey"></i>

          <transition name="fade">
            <div
              ref="searchHistoryPopup"
              class="search-history"
              v-if="searchHistoryShow && mySearchHistory.length !== 0"
            >
              <div
                class="history-item"
                :class="{ catch: searchWordCatch === index }"
                v-for="(item, index) in mySearchHistory"
                :key="item"
                @click="clickSearchHistory(item)"
                @mousemove="searchWordCatch = index"
                @mouseleave="searchWordCatch = null"
              >
                <div class="item-word">{{ item }}</div>
                <i class="freelog fl-icon-guanbi" @click.stop="deleteSearchHistory(item)"></i>
              </div>

              <div class="text-btn" @click="clearHistory()">清空搜索记录</div>
            </div>
          </transition>
        </div>

        <el-popover
          popper-class="header-user-box"
          placement="bottom-end"
          trigger="hover"
          :visible-arrow="false"
          transition="slide-down-scale"
          v-model="userBoxShow"
          v-if="userData.isLogin"
        >
          <img class="avatar" :src="userData.headImage" :alt="userData.username" />
          <div class="username">{{ userData.username }}</div>
          <div
            class="btn user-box-btn"
            @click="
              userBoxShow = false;
              $router.myPush('/signed-list');
            "
          >
            签约记录
          </div>
          <div class="btn user-box-btn" @click="callLoginOut()">登出</div>

          <img class="avatar" :src="userData.headImage" :alt="userData.username" slot="reference" />
        </el-popover>

        <div class="user-btns" v-if="userData.isLogin === false">
          <div class="btn normal-btn" @click="callLogin()">登录</div>
          <div class="btn header-register-btn" @click="register()">注册</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { callLogin, callLoginOut } from "@/api/freelog";

export default {
  name: "my-header",

  data() {
    return {
      searchKey: "",
      searchHistory: [],
      userBoxShow: false,
      searchHistoryShow: false,
      searchWordCatch: null,
      tabList: [
        { value: "/home", label: "首页" },
        // { value: "/album-list", label: "专辑" },
        { value: "/voice-list", label: "声音" },
        { value: "/collection-list", label: "收藏" },
      ],
    };
  },

  watch: {
    "$route.path"(cur) {
      this.$nextTick(() => {
        const { inMobile, routerMode } = this.$store.state;
        if (cur !== "/search-list" || !inMobile) return;
        this.searchHistoryShow = routerMode === 1 || routerMode !== 2;
        if (routerMode === 1) this.$refs.searchInput.focus();
      });
    },

    searchHistoryShow(cur) {
      if (cur) {
        document.addEventListener("click", this.ifCloseHistoryPopup);
      } else {
        document.removeEventListener("click", this.ifCloseHistoryPopup);
      }
    },
  },

  computed: {
    /** 用户数据 */
    userData() {
      return this.$store.state.userData;
    },

    /** 当前路由 */
    currentPath() {
      return this.$route.path;
    },

    /** 搜索历史选项 */
    mySearchHistory() {
      return this.searchHistory.filter((item) => item.includes(this.searchKey));
    },

    /** 菜单按钮群 */
    menuBtnList() {
      return [
        { icon: "fl-icon-shouye", label: "首页", path: "/home" },
        // { icon: "fl-icon-zhuanji", label: "专辑", path: "/album-list" },
        { icon: "fl-icon-danji", label: "声音", path: "/voice-list" },
        {
          icon: "fl-icon-shoucangxiaoshuo",
          label: "我的收藏",
          hidden: !this.userData.isLogin,
          path: "/collection-list",
        },
        { icon: "fl-icon-lishi", label: "签约记录", hidden: !this.userData.isLogin, path: "/signed-list" },
      ];
    },
  },

  created() {
    this.searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  },

  methods: {
    callLogin,
    callLoginOut,

    /** 返回 */
    back() {
      const ONLY_PAGE = this.$store.state.locationHistory.length === 1;
      if (ONLY_PAGE) {
        this.$router.myPush("/home");
      } else {
        this.$router.back();
      }
    },

    /** 切换tab页 */
    toPage(path) {
      this.$router.myPush(path);
      this.searchKey = "";
      this.userBoxShow = false;
    },

    /** 输入搜索词 */
    searchKeyInput() {
      this.searchKey = (this.searchKey || "").trim();
      this.searchHistoryShow = true;
      this.searchWordCatch = null;
    },

    /** 点击历史搜索词 */
    clickSearchHistory(item) {
      this.searchKey = item;
      this.search();
    },

    /** 删除历史搜索词 */
    deleteSearchHistory(item) {
      this.deleteWord(item);
    },

    /** 搜索 */
    search() {
      if (!this.searchKey) {
        this.$router.myPush({ path: "/home" });
        return;
      }

      this.searchWord();
      this.$store.commit("setData", { key: "searchKey", value: this.searchKey });
      this.searchHistoryShow = false;
      if (!this.$store.state.inMobile) this.$router.myPush({ path: "/search-list" });
    },

    /** 搜索历史关键词 */
    selectTag(item) {
      this.searchKey = item;
      this.search();
    },

    /** 搜索框键盘事件 */
    inputKeyUp(e) {
      switch (e.keyCode) {
        case 13:
          // 回车
          if (this.searchWordCatch !== null) {
            this.searchKey = this.mySearchHistory[this.searchWordCatch];
          }
          this.searchWordCatch = null;
          this.searchWord();
          this.search();
          break;
        case 27:
          // esc
          this.searchKey = "";
          this.searchWordCatch = null;
          this.searchHistoryShow = true;
          break;
        case 38:
          // 上
          if (this.searchWordCatch === null || this.searchWordCatch === 0) {
            this.searchWordCatch = null;
          } else {
            this.searchWordCatch = this.searchWordCatch - 1;
          }
          break;
        case 40:
          // 下
          this.searchHistoryShow = true;
          if (this.searchWordCatch === null) {
            this.searchWordCatch = 0;
          } else if (this.searchWordCatch !== this.mySearchHistory.length - 1) {
            this.searchWordCatch = this.searchWordCatch + 1;
          }
          break;
        default:
          break;
      }
    },

    /** 注册 */
    register() {
      window.open("https://user.freelog.com/logon");
    },

    /** 搜索 */
    searchWord() {
      const keywords = this.searchKey.trim();
      if (!keywords) return;
      const index = this.searchHistory.findIndex((item) => item === keywords);
      if (index !== -1) this.searchHistory.splice(index, 1);
      if (this.searchHistory.length === 10) this.searchHistory.pop();
      this.searchHistory.unshift(keywords);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    /** 删除搜索词 */
    deleteWord(keywords) {
      const index = this.searchHistory.findIndex((item) => item === keywords);
      if (index === -1) return;
      this.searchHistory.splice(index, 1);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    /** 清空搜索词 */
    clearHistory() {
      localStorage.setItem("searchHistory", "[]");
      this.searchHistory = [];
    },

    /** 根据点击区域判断历史搜索框是否关闭 */
    ifCloseHistoryPopup(e) {
      if (!this.$refs.searchInput || !this.$refs.searchHistoryPopup) return;
      const clickInput = this.$refs.searchInput.contains(e.target);
      const clickPopup = this.$refs.searchHistoryPopup.contains(e.target);
      if (!clickInput && !clickPopup) {
        this.searchHistoryShow = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.header-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;

  // mobile
  .mobile-header-wrapper {
    width: 100%;
    height: 60px;
    padding: 0 15px;
    box-sizing: border-box;
    background-color: #1c1c1c;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 200;

    &.home {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      background-color: rgba(28, 28, 28, var(--opacity));
    }

    &.search {
      padding-right: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      color: #ffffff;

      &:active {
        color: rgba(255, 255, 255, 0.6);
      }

      .back-arrow {
        width: 7px;
        height: 12px;
      }

      .back-label {
        font-size: 16px;
        margin-left: 5px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;

      .fl-icon-content {
        width: 40px;
        height: 40px;
        color: #fff;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .menu {
        width: 42px;
        height: 32px;
        margin-left: 20px;
        color: #fff;
      }

      .fl-icon-content:active,
      .menu:active {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .search-box {
      position: relative;
      flex: 1;
      height: 42px;
      display: flex;
      align-items: center;

      .search-input {
        height: 42px;
        border-radius: 42px;
        flex: 1;
        font-size: 16px;
        color: #222;
        padding: 0 44px !important;
        background: #ffffff;
      }

      .fl-icon-content {
        position: absolute;
        left: 15px;
        font-size: 14px;
        color: #8e8e93;
      }

      .fl-icon-guanbi {
        position: absolute;
        right: 15px;
        font-size: 10px;
        color: #8e8e93;
        margin-top: 2px;

        &:active {
          color: rgba(142, 142, 147, 0.6);
        }
      }
    }

    .cancel-btn {
      height: 100%;
      padding: 0 15px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #ffffff;
      line-height: 22px;

      &:active {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .search-history {
      position: fixed;
      left: 0;
      right: 0;
      top: 60px;
      bottom: 0;
      padding: 0 15px;
      box-sizing: border-box;
      background-color: #222;
      display: flex;
      flex-direction: column;
      align-items: center;

      .search-history-title {
        width: 100%;
        height: 60px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
          color: rgba(255, 255, 255, 0.4);
        }

        .clear-btn {
          color: #2784ff;

          &:active {
            color: rgba(39, 132, 255, 0.6);
          }
        }
      }

      .search-history-list {
        width: 100%;
        display: flex;
        flex-wrap: wrap;

        .tag {
          height: 38px;
          border-radius: 38px;
          padding: 0 15px;
          display: flex;
          align-items: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          background-color: rgba(255, 255, 255, 0.1);
          margin-right: 10px;
          margin-bottom: 15px;

          &:active {
            color: rgba(255, 255, 255, 0.4);
            background-color: rgba(255, 255, 255, 0.06);
          }

          .freelog {
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: scale(0.8);
            margin-left: 10px;

            &:active {
              color: rgba(255, 255, 255, 0.24);
            }
          }
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
    }

    .user-box-body {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: calc(100% - 50px);
      background: #222;
      border-radius: 0px 10px 10px 0px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .user-box-top {
        position: relative;
        width: 100%;
        height: 194px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);

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
          right: 20px;
          top: 20px;
          width: 32px;
          height: 32px;
          font-size: 12px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
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
            color: #fff;
            display: flex;
            align-items: center;

            &.active,
            &:active {
              background-color: rgba(255, 255, 255, 0.05);
            }

            & + .btn {
              margin-top: 10px;
            }

            .freelog {
              font-size: 18px;
              margin: 0 10px;
            }

            .btn-label {
              font-size: 16px;
            }
          }
        }

        .footer-btn {
          width: 100%;
          height: 102px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: #fff;
          display: flex;
          align-items: center;

          .freelog {
            font-size: 18px;
            margin: 0 10px;
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
            background-color: #2784ff;

            &:active {
              background-color: rgba(39, 132, 255, 0.6);
            }
          }
        }
      }
    }
  }

  // PC
  .pc-header-wrapper {
    width: 1130px;
    height: 98px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;

      .btn {
        position: relative;
        line-height: 38px;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        opacity: 0.4;
        transition: all 0.2s ease-out;
        cursor: pointer;
        transform: perspective(1px) translateZ(0);

        &:before {
          content: "";
          position: absolute;
          z-index: -1;
          left: 51%;
          right: 51%;
          bottom: 0;
          background-color: #fff;
          opacity: 1;
          height: 2px;
          border-radius: 2px;
          transition: all 0.2s ease-out;
        }

        &:hover {
          opacity: 0.8;
        }

        &.active {
          opacity: 0.8;

          &::before {
            left: 0;
            right: 0;
          }
        }

        & + .btn {
          margin-left: 40px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;

      .search-box {
        position: relative;
        width: 300px;
        height: 38px;
        display: flex;
        align-items: center;
        margin-right: 30px;

        .search-input {
          height: 38px;
          border-radius: 38px;
          flex: 1;
          font-size: 14px;
          color: #222;
          padding: 0 39px !important;
          background-color: rgba(255, 255, 255, 0.06) !important;
          transition: all 0.2s linear;

          &:hover {
            background-color: rgba(255, 255, 255, 0.12) !important;
          }

          &:focus,
          &.in-focus {
            background-color: #fff !important;

            & ~ .fl-icon-content {
              color: rgb(142, 142, 147, 0.6);
            }
          }
        }

        .fl-icon-content {
          position: absolute;
          left: 15px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgb(142, 142, 147, 0.3);
        }

        .fl-icon-guanbi {
          position: absolute;
          right: 15px;
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
          background: rgba(0, 0, 0, 0.2) !important;
          backdrop-filter: blur(25px);
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
              background: rgba(0, 0, 0, 0.5);

              .freelog {
                opacity: 1;
              }
            }

            .item-word {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
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

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid #d1d1d1;
        cursor: pointer;
      }

      .user-btns {
        display: flex;

        .btn {
          height: 38px;
          padding: 0 20px;
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
</style>

<style lang="scss">
.header-user-box {
  width: 240px;
  background: rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(25px);
  border: none !important;
  padding: 0 !important;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2) !important;
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
    color: #fff;
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
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
