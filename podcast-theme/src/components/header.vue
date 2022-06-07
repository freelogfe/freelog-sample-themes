<!-- 头部 -->
<template>
  <div class="header-wrapper">
    <template v-if="!$store.state.inMobile">
      <div class="pc-header-wrapper">
        <div class="header-left">
          <div
            class="btn"
            :class="{ active: $route.path === `/${item.value}` }"
            v-for="item in tabList"
            :key="item.value"
            @click="toPage(item.value)"
            v-if="item.value !== 'collection-list' || $store.state.userData.isLogin"
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

          <el-popover
            popper-class="header-user-box"
            placement="bottom-end"
            trigger="hover"
            :visible-arrow="false"
            transition="slide-down-scale"
            v-model="userBoxShow"
            v-if="$store.state.userData.isLogin"
          >
            <img class="avatar" :src="$store.state.userData.headImage" :alt="$store.state.userData.username" />
            <div class="username">{{ $store.state.userData.username }}</div>
            <div class="mobile">{{ $store.state.userData.mobile }}</div>
            <div
              class="btn user-box-btn"
              @click="
                userBoxShow = false;
                $router.push('/signed-list');
              "
            >
              签约记录
            </div>
            <div class="btn user-box-btn" @click="callLoginOut()">登出</div>

            <img
              class="avatar"
              :src="$store.state.userData.headImage"
              :alt="$store.state.userData.username"
              slot="reference"
            />
          </el-popover>

          <div class="user-btns" v-if="$store.state.userData.isLogin === false">
            <div class="btn normal-btn" @click="callLogin()">登录</div>
            <div class="btn header-register-btn" @click="register()">注册</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { callLogin, callLoginOut } from "@/api/freelog";

export default {
  name: "my-header",

  data() {
    return {
      searchKey: this.$store.state.userData.isLogin,
      searchHistory: [],
      userBoxShow: false,
      searchPopupShow: false,
      searchHistoryShow: false,
      searchWordCatch: null,
      tabList: [
        { value: "home", label: "首页" },
        // { value: "album-list", label: "专辑" },
        { value: "voice-list", label: "声音" },
        { value: "collection-list", label: "收藏" },
      ],
    };
  },

  watch: {
    // watch(
    //   () => query.value,
    //   () => {
    //     initHeaderSearch();
    //   }
    // );
  },

  computed: {
    /** 搜索历史选项 */
    mySearchHistory() {
      return this.searchHistory.filter((item) => item.includes(this.searchKey));
    },
  },

  created() {
    this.searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    this.initHeaderSearch();
    // this.useMyLocationHistory();
  },

  methods: {
    callLogin,
    callLoginOut,

    // 切换tab页
    toPage(router) {
      const path = `/${router}`;
      this.$router.push(path);
    },

    // 输入搜索词
    searchKeyInput(inHomeSearch = false) {
      this.searchKey = (this.searchKey || "").trim();
      this.searchHistoryShow = true;
      this.searchWordCatch = null;
      if (inHomeSearch) {
        !this.searchKey && this.$router.push("/home");
        this.searchPopupShow = !this.searchKey;
      }
    },

    // 点击历史搜索词
    clickSearchHistory(item) {
      this.searchKey = item;
      this.searchWord(this.searchKey);
      this.search();
    },

    // 删除历史搜索词
    deleteSearchHistory(item) {
      this.$refs.searchInput.focus();
      this.deleteWord(item);
      this.searchHistoryShow = true;
    },

    // 搜索
    search() {
      this.searchPopupShow = false;
      if (!this.searchKey) return;
      
      this.$router.push({ path: "/search-list" });
      this.$store.commit("setData", { key: "searchKey", value: this.searchKey });
    },

    // 搜索历史关键词
    selectTag(item) {
      this.searchPopupShow = false;
      this.searchKey = item;
      this.search();
    },

    // 搜索框键盘事件
    inputKeyUp(e) {
      switch (e.keyCode) {
        case 13:
          // 回车
          if (this.searchWordCatch !== null) {
            this.searchKey = this.mySearchHistory[this.searchWordCatch];
          }
          this.searchWordCatch = null;
          this.searchHistoryShow = false;
          this.searchWord(this.searchKey);
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

    // 注册
    register() {
      window.open("http://user.freelog.com/logon");
    },

    // 初始化头部搜索相关数据
    initHeaderSearch() {
      const { keywords } = this.$route.query;
      this.searchKey = keywords || "";
    },

    // 搜索
    searchWord(keywords) {
      keywords = keywords.trim();
      if (!keywords) return;
      const index = this.searchHistory.findIndex((item) => item === keywords);
      if (index !== -1) this.searchHistory.splice(index, 1);
      if (this.searchHistory.length === 10) this.searchHistory.pop();
      this.searchHistory.unshift(keywords);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    // 删除搜索词
    deleteWord(keywords) {
      const index = this.searchHistory.findIndex((item) => item === keywords);
      if (index === -1) return;
      this.searchHistory.splice(index, 1);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    // 清空搜索词
    clearHistory() {
      localStorage.setItem("searchHistory", "[]");
      this.searchHistory = [];
    },
  },
};
</script>

<style lang="scss" scoped>
.header-wrapper {
  display: flex;
  justify-content: center;

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
  }

  .mobile {
    font-size: 14px;
    color: #fff;
    font-weight: bold;
    line-height: 20px;
    margin-top: 8px;
    margin-bottom: 15px;
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
