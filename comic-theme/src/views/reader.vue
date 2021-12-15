<template>
  <div class="reader-wrapper" :class="theme" @click="closeAllPopup()">
    <my-header />

    <!-- mobile -->
    <template v-if="inMobile">
      <div class="mobile-body-wrapper">
        <img class="content" :src="content" v-if="isAuth === true && content" />

        <div class="lock-box" v-if="isAuth === false">
          <img class="lock" src="../assets/images/lock.png" alt="未授权" />
          <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
          <div class="get-btn" @click="getAuth()">签约</div>
        </div>
      </div>

      <div class="mobile-operater-wrapper" @touchmove.prevent>
        <div class="operater-btn">
          <i class="iconfont fl-icon-xiaoshuomulu"></i>
          <div class="operater-btn-label">上一话</div>
        </div>

        <div class="operater-btn" @click="directoryShow = true">
          <i class="iconfont fl-icon-xiaoshuomulu"></i>
          <div class="operater-btn-label">目录</div>
        </div>

        <div class="operater-btn" @click="operateShelf(comicInfo)">
          <i
            class="iconfont"
            :class="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'"
          ></i>
          <div class="operater-btn-label">{{ isCollected ? "取消收藏" : "加入收藏" }}</div>
        </div>

        <div class="operater-btn">
          <i class="iconfont fl-icon-xiaoshuomulu"></i>
          <div class="operater-btn-label">下一话</div>
        </div>
      </div>
    </template>

    <!-- PC -->
    <template v-if="!inMobile">
      <div class="body-wrapper" :class="theme">
        <breadcrumbs :inReader="true" :title="comicInfo?.exhibitName" :dark="theme === 'dark'" />

        <div class="content-box">
          <img class="content" :src="content" v-if="isAuth === true && content" />

          <div class="lock-box" v-if="isAuth === false">
            <img class="lock" src="../assets/images/lock.png" alt="未授权" />
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth()">签约</div>
          </div>
        </div>

        <div class="footer-bar">
          <div class="footer-btn invalid">上一话</div>
          <div class="footer-btn" @click="switchPage('/detail', { id: comicInfo.exhibitId })">漫画详情</div>
          <div class="footer-btn invalid">下一话</div>
        </div>
      </div>

      <div class="operater-wrapper">
        <div class="operater-btns-box">
          <operate-btn
            icon="fl-icon-xiaoshuomulu"
            :theme="theme"
            @click="
              closeAllPopup();
              directoryShow = true;
            "
          />

          <operate-btn
            :icon="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'"
            :theme="theme"
            @click="
              closeAllPopup();
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
              closeAllPopup();
              setTheme();
            "
          />

          <div class="back-top">
            <back-top>
              <operate-btn icon="fl-icon-huidaodingbu" :theme="theme" />
            </back-top>
          </div>
        </div>
      </div>
    </template>

    <directory :show="directoryShow" :comicInfo="comicInfo" @closeDirectory="directoryShow = false" />
  </div>
</template>

<script lang="tsx">
import { toRefs } from "@vue/reactivity";
import { useMyRouter, useMyShelf } from "../utils/hooks";
import { defineAsyncComponent, reactive, watchEffect } from "vue";
import { ExhibitItem } from "@/api/interface";
import { addAuth, getExhibitAuthStatus, getExhibitFileStream, getExhibitInfo } from "@/api/freelog";
import { useStore } from "vuex";

export default {
  name: "reader",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    breadcrumbs: defineAsyncComponent(() => import("../components/breadcrumbs.vue")),
    "operate-btn": defineAsyncComponent(() => import("../components/operate-btn.vue")),
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

    const data = reactive({
      comicInfo: {} as ExhibitItem,
      content: "",
      isAuth: null as boolean | null,
      theme: myTheme,
      sharePopupShow: false,
      directoryShow: false,
    });

    const methods = {
      // 关闭所有弹窗
      closeAllPopup() {
        data.sharePopupShow = false;
      },

      // 切换主题模式
      setTheme() {
        data.theme = data.theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", data.theme);
      },

      async getAuth() {
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) getContent();
      },
    };

    watchEffect(() => {
      document.body.style.overflowY = data.directoryShow && store.state.inMobile ? "hidden" : "auto";
    });

    const getComicInfo = async () => {
      const exhibitInfo = await getExhibitInfo(id, { isLoadVersionProperty: 1 });
      data.comicInfo = exhibitInfo.data.data;
      getContent();
    };

    const getContent = async () => {
      const statusInfo = await getExhibitAuthStatus(id);
      data.isAuth = statusInfo.data.data ? statusInfo.data.data[0].isAuth : false;
      if (data.isAuth) {
        const info: any = await getExhibitFileStream(id, true);
        if (!info) return;
        
        data.content = info;
      } else {
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) getContent();
      }
    };

    getComicInfo();

    return {
      ...store.state,
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
    padding: 20px 20px 90px;
    box-sizing: border-box;
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

    &.dark {
      .content-box {
        background-color: #373737;
      }

      .footer-bar {
        background-color: #373737;
        background-color: #373737;
        color: #999;

        .footer-btn.invalid {
          color: #444;
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
          color: #999;
          pointer-events: none;
        }
      }
    }

    .content-box {
      flex: 1;
      width: 100%;
      padding: 118px 60px;
      border-radius: 10px;
      animation: fade-in 0.3s ease-out;
      transition: all 0.2s linear;

      .content {
        width: 100%;
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
    padding: 0 20px;
    background-color: var(--deriveColor);
    display: flex;

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

      .iconfont {
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
    bottom: 138px;
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
</style>
