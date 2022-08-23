<template>
  <div
    class="reader-wrapper"
    :class="{
      'in-mobile': inMobile,
      light: theme === 'light',
      dark: theme === 'dark',
    }"
    @click="clickPage()"
  >
    <my-header :readerHeader="true" v-if="(inMobile && mobileBarShow) || !inMobile" />

    <my-loader v-if="loading" />

    <!-- mobile -->
    <template v-if="!loading && inMobile">
      <div class="mobile-body-wrapper">
        <img class="content" :src="content" v-if="comicInfo.defaulterIdentityType === 0 && content" />

        <div class="auth-box" v-if="comicInfo.defaulterIdentityType && comicInfo.defaulterIdentityType !== 4">
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
          <div class="auth-link-tip">授权链异常，无法查看</div>
          <div class="home-btn" @click="switchPage('/home')">进入首页</div>
        </div>

        <div class="lock-box" v-if="comicInfo.defaulterIdentityType === 4 || userData.isLogin === false">
          <img class="lock" src="../assets/images/lock.png" alt="未授权" />
          <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
          <div class="get-btn" @click="getAuth()">获取授权</div>
        </div>
      </div>

      <transition name="fade-down">
        <div class="mobile-operater-wrapper" @touchmove.prevent v-if="mobileBarShow">
          <!-- <div class="operater-btn">
            <i class="freelog fl-icon-zhankaigengduo"></i>
            <div class="operater-btn-label">上一话</div>
          </div>

          <div class="operater-btn" @click="directoryShow = true">
            <i class="freelog fl-icon-xiaoshuomulu"></i>
            <div class="operater-btn-label">目录</div>
          </div>

          <div class="operater-btn" @click="operateShelf(comicInfo)">
            <i
              class="freelog"
              :class="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'"
            ></i>
            <div class="operater-btn-label">{{ isCollected ? "取消收藏" : "加入收藏" }}</div>
          </div>

          <div class="operater-btn">
            <i class="freelog fl-icon-zhankaigengduo"></i>
            <div class="operater-btn-label">下一话</div>
          </div> -->

          <div class="single-btn" @click="operateShelf(comicInfo)">
            <i
              class="freelog"
              :class="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'"
            ></i>
            <div class="operater-btn-label">
              {{ isCollected ? "取消收藏" : "加入收藏" }}
            </div>
          </div>
        </div>
      </transition>
    </template>

    <!-- PC -->
    <template v-if="!loading && !inMobile">
      <div class="body-wrapper" :class="theme">
        <div class="breadcrumbs-wrapper">
          <div class="breadcrumbs-item">
            <div class="second-text-btn" @click="switchPage('/detail', { id: comicInfo.exhibitId })">
              {{ comicInfo.exhibitTitle }}
              <!-- {{comicInfo.exhibitTitle}} > -->
            </div>
          </div>

          <!-- <div class="breadcrumbs-item">
            <div class="current-page">
              {{ comicInfo.exhibitTitle }}
            </div>
          </div> -->
        </div>

        <div class="content-box">
          <img class="content" :src="content" v-if="comicInfo.defaulterIdentityType === 0 && content" />

          <div class="auth-box" v-if="comicInfo.defaulterIdentityType && comicInfo.defaulterIdentityType !== 4">
            <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
            <div class="auth-link-tip">授权链异常，无法查看</div>
            <div class="home-btn" @click="switchPage('/home')">进入首页</div>
          </div>

          <div class="lock-box" v-if="comicInfo.defaulterIdentityType === 4 || userData.isLogin === false">
            <img class="lock" src="../assets/images/lock.png" alt="未授权" />
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth()">获取授权</div>
          </div>
        </div>

        <!-- <div class="footer-bar">
          <div class="footer-btn invalid">上一话</div>
          <div class="footer-btn" @click="switchPage('/detail', { id: comicInfo.exhibitId })">
            漫画详情
          </div>
          <div class="footer-btn invalid">下一话</div>
        </div> -->
      </div>

      <div class="operater-wrapper">
        <div class="operater-btns-box">
          <!-- <operate-btn
            icon="fl-icon-xiaoshuomulu"
            :theme="theme"
            @click="
              clickPage();
              directoryShow = true;
            "
          /> -->

          <operate-btn
            :icon="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'"
            :theme="theme"
            @click="
              clickPage();
              operateShelf(comicInfo);
            "
          />

          <operate-btn icon="fl-icon-fenxiang" :theme="theme" @click.stop="sharePopupShow = true">
            <share :show="sharePopupShow" :exhibit="comicInfo" />
          </operate-btn>

          <operate-btn
            :icon="theme === 'light' ? 'fl-icon-rijianmoshi' : 'fl-icon-yejianmoshi'"
            :theme="theme"
            @click="
              clickPage();
              setTheme();
            "
          />

          <back-top>
            <div class="back-top">
              <operate-btn icon="fl-icon-huidaodingbu" :theme="theme" />
            </div>
          </back-top>
        </div>
      </div>
    </template>

    <directory :show="directoryShow" :comicInfo="comicInfo" @closeDirectory="directoryShow = false" />
  </div>
</template>

<script lang="tsx">
import { toRefs } from "@vue/reactivity";
import { useMyRouter, useMyScroll, useMyShelf } from "../utils/hooks";
import { defineAsyncComponent, reactive, watch, watchEffect } from "vue";
import { ExhibitItem } from "@/api/interface";
import { addAuth, getExhibitAuthStatus, getExhibitFileStream, getExhibitInfo } from "@/api/freelog";
import { useStore } from "vuex";

export default {
  name: "reader",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "operate-btn": defineAsyncComponent(() => import("../components/operate-btn.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "back-top": defineAsyncComponent(() => import("../components/back-top.vue")),
    share: defineAsyncComponent(() => import("../components/share.vue")),
    directory: defineAsyncComponent(() => import("../components/directory.vue")),
  },

  setup() {
    const myTheme = localStorage.getItem("theme") || "light";
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { id } = query.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const { scrollTop } = useMyScroll();

    const data = reactive({
      loading: false,
      comicInfo: {} as ExhibitItem,
      content: "",
      theme: myTheme,
      sharePopupShow: false,
      directoryShow: false,
      mobileBarShow: true,
    });

    const methods = {
      // 点击页面
      clickPage() {
        if (data.sharePopupShow) data.sharePopupShow = false;
        if (store.state.inMobile && !data.mobileBarShow) data.mobileBarShow = true;
      },

      // 切换主题模式
      setTheme() {
        data.theme = data.theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", data.theme);
      },

      async getAuth() {
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) {
          getContent();
          refreshAuth();
        }
      },
    };

    const getComicInfo = async () => {
      const exhibitInfo = await getExhibitInfo(id, { isLoadVersionProperty: 1 });
      data.comicInfo = exhibitInfo.data.data;
      getContent();
    };

    const getContent = async () => {
      data.loading = true;
      const statusInfo = await getExhibitAuthStatus(id);
      if (statusInfo.data.data) data.comicInfo.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;

      if (data.comicInfo.defaulterIdentityType === 0) {
        // 已签约并且授权链无异常
        const info: any = await getExhibitFileStream(id, true);
        if (!info) {
          data.loading = false;
          return;
        }

        data.content = info;
      }

      data.loading = false;
    };

    const refreshAuth = () => {
      const { authIds, myShelf } = store.state;
      authIds.push(id);
      store.commit("setData", { key: "authIds", value: authIds });
      const index = myShelf.findIndex((item: ExhibitItem) => item.exhibitId === id);
      if (index !== -1) {
        myShelf[index].defaulterIdentityType = 0;
        store.commit("setData", { key: "myShelf", value: myShelf });
      }
    };

    watchEffect(() => {
      document.body.style.overflowY = data.directoryShow && store.state.inMobile ? "hidden" : "auto";
    });

    watch(
      () => scrollTop.value,
      (cur) => {
        if (cur === 0 && !data.mobileBarShow) data.mobileBarShow = true;
        if (cur !== 0 && data.mobileBarShow) data.mobileBarShow = false;
      }
    );

    getComicInfo();

    return {
      ...toRefs(store.state),
      switchPage,
      isCollected,
      operateShelf,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.reader-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fafbfc;
  transition: all 0.2s linear;

  &.in-mobile :deep .mobile-header-wrapper {
    position: fixed;
    top: 0;
    z-index: 1;
  }

  &.dark {
    background-color: #333333;
  }

  &.light {
    background-color: #fafbfc;
  }

  // mobile 主题内容区
  .mobile-body-wrapper {
    width: 100%;
    flex: 1;
    padding-top: 60px;
    animation: fade-in 0.3s ease-out;
    transition: background-color 0.2s linear;

    &.dark {
      color: #999;
    }

    &.light {
      color: #222;
    }

    .content {
      width: 100%;
    }

    .auth-box {
      width: 100%;
      padding: 110px 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .auth-link-abnormal {
        width: 72px;
        height: 72px;
      }

      .auth-link-tip {
        font-size: 16px;
        color: #222222;
        line-height: 22px;
        margin-top: 30px;
      }

      .home-btn {
        padding: 9px 20px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 20px;
        background-color: #f2f2f2;
        color: #666;
        margin-top: 30px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.6;
        }
      }
    }

    .lock-box {
      width: 100%;
      padding: 110px 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .lock {
        width: 48px;
        height: 48px;
      }

      .lock-tip {
        font-size: 16px;
        color: #999999;
        line-height: 22px;
        margin-top: 30px;
      }

      .get-btn {
        padding: 9px 20px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 20px;
        font-weight: bold;
        background-color: #2784ff;
        color: #fff;
        margin-top: 30px;
        cursor: pointer;

        &:hover {
          background-color: #529dff;
        }

        &:active {
          background-color: #2376e5;
        }
      }
    }
  }

  // PC 主题内容区
  .body-wrapper {
    width: 800px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .breadcrumbs-wrapper {
      display: flex;
      align-items: center;
      margin: 24px 0;
      font-size: 16px;
      font-weight: 600;
      line-height: 22px;

      .breadcrumbs-item {
        color: #999999;
      }

      .current-page {
        color: #222;
        margin-left: 10px;
      }
    }

    &.dark {
      .content-box {
        background-color: #373737;
      }

      .footer-bar {
        background-color: #373737;
        color: #999;

        .footer-btn.invalid {
          opacity: 0.4;
          pointer-events: none;
        }
      }
    }

    &.light {
      .content-box {
        background-color: #fff;
      }

      .footer-bar {
        background-color: #fff;
        color: #222;

        .footer-btn.invalid {
          opacity: 0.4;
          pointer-events: none;
        }
      }
    }

    .content-box {
      flex: 1;
      width: 100%;
      padding: 118px 60px;
      box-sizing: border-box;
      border-radius: 10px;
      animation: fade-in 0.3s ease-out;
      transition: all 0.2s linear;
      margin-bottom: 70px;

      .content {
        width: 100%;
      }

      .auth-box {
        width: 100%;
        padding: 110px 0;
        display: flex;
        flex-direction: column;
        align-items: center;

        .auth-link-abnormal {
          width: 72px;
          height: 72px;
        }

        .auth-link-tip {
          font-size: 16px;
          color: #222222;
          line-height: 22px;
          margin-top: 30px;
        }

        .home-btn {
          padding: 9px 20px;
          border-radius: 4px;
          font-size: 14px;
          line-height: 20px;
          background-color: #f2f2f2;
          color: #666;
          margin-top: 30px;
          cursor: pointer;

          &:hover {
            opacity: 0.8;
          }

          &:active {
            opacity: 0.6;
          }
        }
      }

      .lock-box {
        width: 100%;
        padding: 110px 0;
        display: flex;
        flex-direction: column;
        align-items: center;

        .lock {
          width: 48px;
          height: 48px;
        }

        .lock-tip {
          font-size: 16px;
          color: #999999;
          line-height: 22px;
          margin-top: 30px;
        }

        .get-btn {
          padding: 9px 20px;
          border-radius: 4px;
          font-size: 14px;
          line-height: 20px;
          font-weight: bold;
          background-color: #2784ff;
          color: #fff;
          margin-top: 30px;
          cursor: pointer;

          &:hover {
            background-color: #529dff;
          }

          &:active {
            background-color: #2376e5;
          }
        }
      }
    }

    .footer-bar {
      height: 78px;
      margin: 30px 0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      transition: all 0.2s linear;

      .footer-btn {
        flex: 1;
        font-size: 16px;
        line-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s linear;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        & + .footer-btn {
          border-left: 1px solid rgba(0, 0, 0, 0.2);
        }
      }
    }
  }

  // mobile 操作按钮群
  .mobile-operater-wrapper {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    // padding: 0 20px;
    background-color: var(--deriveColor);
    display: flex;

    .single-btn {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);

      &:active {
        color: #fff;
      }

      .freelog {
        width: 18px;
        height: 18px;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .operater-btn-label {
        font-size: 14px;
        color: #ffffff;
        margin-left: 5px;
        margin-top: 2px;
      }
    }

    .operater-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);

      &:active {
        color: #fff;
      }

      &:first-child .freelog {
        transform: rotate(180deg);
      }

      .freelog {
        width: 18px;
        height: 18px;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .operater-btn-label {
        font-size: 10px;
        color: #ffffff;
        line-height: 16px;
        margin-top: 4px;
      }

      & + .operater-btn {
        margin-left: 10px;
      }
    }

    .hidden-input {
      position: absolute;
      left: -100%;
      z-index: -1;
    }
  }

  // PC 操作按钮群
  .operater-wrapper {
    position: fixed;
    // bottom: 138px;
    bottom: 70px;
    left: 50%;
    margin-left: 500px;

    .operater-btns-box {
      position: absolute;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .back-top {
        margin-top: 10px;
      }

      .share-wrapper {
        right: 100%;
        top: 50%;
        margin-top: -140px;
        margin-right: 20px;
      }
    }
  }
}

/* fade-up */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.1s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* fade-down */
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.1s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
