<template>
  <!-- mobile -->
  <div class="mobile-header-wrapper" :class="{ 'in-home': homeHeader }" v-if="inMobile">
    <!-- header顶部 -->
    <div class="header-top" :class="{ logon: userData }">
      <img
        class="logo"
        :src="selfConfig.logoImage || require('../assets/images/logo.png')"
        @click="switchPage('/')"
        v-if="homeHeader"
      />
      <div class="header-top-left" @click="routerBack()" v-else>
        <img class="back-arrow" src="../assets/images/arrow.png" />
        <div class="back-label">返回</div>
      </div>

      <div class="header-top-right">
        <i class="freelog fl-icon-content" @click="searchPopupShow = true"></i>

        <img
          class="avatar"
          :src="userData.headImage"
          :alt="userData.username"
          @click="userBoxShow = true"
          v-if="userData"
        />
      </div>
    </div>

    <!-- 博客信息 -->
    <template v-if="homeHeader">
      <div class="header-other-info">
        <div class="blogger-avatar">
          <img
            src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fww1.sinaimg.cn%2Fmw690%2F0023tf8yly1gw455iolbrj61o01nznpd02.jpg&refer=http%3A%2F%2Fwww.sina.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641368580&t=f84767185fdb00f5b368b3b34ddad510"
            alt=""
            class="avatar-img"
          />
        </div>
        <div class="sign-count">总签约量：{{ signCount }}人</div>
      </div>

      <div class="header-blog-info">
        <div class="blog-title">
          {{ selfConfig.blogTitle }}
        </div>
        <div class="blog-desc">
          {{ selfConfig.blogIntro }}
        </div>
        <div class="tags">
          <div
            class="tag"
            :class="{ active: tags === item }"
            v-for="item in blogTags"
            :key="item"
            @click="selectTag(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </template>

    <transition name="fade">
      <div id="modal" class="modal" @click="userBoxShow = false" @touchmove.prevent v-if="userBoxShow"></div>
    </transition>

    <transition name="slide-right">
      <div class="user-box-body" @touchmove.prevent v-if="userBoxShow">
        <img class="avatar" :src="userData?.headImage" :alt="userData?.username" />
        <div class="username">{{ userData?.username }}</div>
        <div class="btns">
          <div class="btn" @click="switchPage('/')">
            <div class="btn-content">首页</div>
          </div>
          <div class="btn" @click="callLoginOut()">
            <div class="btn-content">退出登录</div>
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
              @keyup.enter="search()"
              @keyup.esc="searchKey = ''"
            />
            <i class="freelog fl-icon-content"></i>
          </div>

          <div class="text-btn mobile" @click="searchPopupShow = false">取消</div>
        </div>

        <div class="recommend-tags">
          <div class="recommend-tags-title">推荐标签</div>
          <div class="recommend-tags-list">
            <div class="tag" v-for="item in blogTags" :key="item" @click="selectTag(item)">{{ item }}</div>
          </div>
        </div>
      </div>
    </transition>
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
            class="search-input"
            type="text"
            v-model="searchKey"
            @keyup.enter="search()"
            @keyup.esc="searchKey = ''"
          />
          <i class="freelog fl-icon-content"></i>
        </div>
      </div>

      <!-- 已登录用户信息 -->
      <div class="user-avatar" @mouseover="userBoxShow = true" @mouseleave="userBoxShow = false" v-if="userData">
        <div class="username">{{ userData.username }}</div>
        <img class="avatar" :src="userData.headImage" :alt="userData.username" />

        <transition name="slide-down-scale">
          <div class="user-box" v-show="userBoxShow">
            <div class="user-box-body">
              <img class="avatar" :src="userData.headImage" :alt="userData.username" />
              <div class="username">{{ userData.username }}</div>
              <div class="mobile">{{ userData.mobile }}</div>
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

    <template v-if="homeHeader">
      <!-- 博客信息 -->
      <div class="header-blog-info">
        <div class="blogger-avatar">
          <img
            src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fww1.sinaimg.cn%2Fmw690%2F0023tf8yly1gw455iolbrj61o01nznpd02.jpg&refer=http%3A%2F%2Fwww.sina.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641368580&t=f84767185fdb00f5b368b3b34ddad510"
            alt=""
            class="avatar-img"
          />
        </div>

        <div class="info-content">
          <div class="blog-title">
            {{ selfConfig.blogTitle }}
          </div>
          <div class="blog-desc">
            {{ selfConfig.blogIntro }}
          </div>
        </div>
      </div>

      <!-- 其他信息 -->
      <div class="other-info">
        <div class="sign-count">总签约量：{{ signCount }}人</div>
        <div class="blog-tags">
          <div class="tags-label">兴趣领域：</div>
          <div class="tags">
            <div
              class="tag"
              :class="{ active: tags === item }"
              v-for="item in blogTags"
              :key="item"
              @click="selectTag(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from "vue";
import { useMyRouter } from "../utils/hooks";
import { callLogin, callLoginOut, getExhibitSignCount, getSelfId } from "@/api/freelog";
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
    let blogTags: string[] = store.state.selfConfig.tags.split(",");
    const { query, switchPage, routerBack } = useMyRouter();

    const data = reactive({
      signCount: 0,
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
        switchPage("/", query);
      },

      // 筛选标签
      selectTag(tag: string) {
        data.tags = tag;
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

    // 获取主题签约数
    const getSignCount = async () => {
      const themeId = await getSelfId();
      const signCountInfo = await getExhibitSignCount(themeId);
      data.signCount = signCountInfo.data.data[0].count;
    };
    getSignCount();

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
      blogTags,
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
  left: 0;
  top: 0;
  width: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  background: var(--gradientColor);
  z-index: 100;

  &.in-home {
    padding: 22px 20px 30px;
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

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-left: 20px;
      }
    }
  }

  .header-other-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 40px;

    .blogger-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .avatar-img {
        height: 100%;
      }
    }

    .sign-count {
      padding: 5px 12px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 18px;
    }
  }

  .header-blog-info {
    margin-top: 20px;

    .blog-title {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      line-height: 26px;
    }

    .blog-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 20px;
      margin-top: 10px;
    }

    .tags {
      width: calc(100% + 8px);
      display: flex;
      flex-wrap: wrap;
      margin-left: -4px;
      margin-top: 15px;

      .tag {
        height: 24px;
        padding: 0 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        background: rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        display: flex;
        align-items: center;
        margin: 0 4px 10px;
        transition: all 0.2s linear;

        &:active,
        &.active {
          background: rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.8);
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

    .search-page-header {
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      padding-left: 20px;
      box-sizing: border-box;
      background-color: #333;

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

      .text-btn {
        font-size: 16px;
        line-height: 22px;
        height: 100%;
        padding: 0 20px;
        display: flex;
        align-items: center;
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
        padding-left: 20px;
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
  position: sticky;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--gradientColor);
  z-index: 100;

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
          transition: all 0.2s linear;
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

          .user-box-btn {
            width: 100%;
            height: 50px;
            line-height: 50px;
            font-size: 14px;
            padding-left: 20px;
            box-sizing: border-box;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 0 0 4px 4px;
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

  .header-blog-info {
    width: 920px;
    display: flex;
    align-items: center;
    margin-top: 35px;

    .blogger-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
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

      .blog-title {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        line-height: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .blog-desc {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 20px;
        margin-top: 10px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }
  }

  .other-info {
    width: 920px;
    padding-left: 130px;
    box-sizing: border-box;
    margin-top: 14px;
    margin-bottom: 30px;

    .sign-count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 20px;
    }

    .blog-tags {
      display: flex;
      margin-top: 15px;

      .tags-label {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 38px;
        margin-right: 5px;
      }

      .tags {
        flex: 1;
        display: flex;
        flex-wrap: wrap;

        .tag {
          height: 38px;
          padding: 0 15px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.08);
          border-radius: 38px;
          display: flex;
          align-items: center;
          margin: 0 5px 10px;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover,
          &.active {
            background: rgba(255, 255, 255, 0.3);
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
  }
}
</style>
