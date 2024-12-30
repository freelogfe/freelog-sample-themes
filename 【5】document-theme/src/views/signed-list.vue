<!-- 签约列表页 -->

<template>
  <div class="signed-list-wrapper" :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }">
    <my-header />

    <div class="content" v-if="userData.isLogin && mySignedList">
      <div class="content-header">
        <div class="signed-list-title">已签约文档</div>

        <div class="search-box">
          <input
            class="search-input input-none"
            v-model="searchKey"
            placeholder="搜索"
            @keyup="search($event)"
          />
          <i class="freelog fl-icon-content"></i>
        </div>
      </div>

      <div class="document-box" v-for="item in mySignedList" :key="item.exhibitId">
        <div class="document-title-box">
          <img
            class="freeze-lock"
            src="../assets/images/freeze.png"
            alt="封禁"
            v-if="item?.articleInfo.status === 2"
          />
          <div class="offline" v-else-if="item.onlineStatus === 0">已下架</div>
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            alt="授权链异常"
            v-else-if="![0, 4].includes(item.defaulterIdentityType)"
          />
          <div
            class="document-title"
            :style="{ opacity: !isDisabled(item) ? 1 : 0.4 }"
            :title="item.exhibitTitle"
            @click="clickDocument(item)"
          >
            {{ item.exhibitTitle }}
          </div>
        </div>
        <div class="tag" :class="item.defaulterIdentityType < 4 ? 'is-auth' : 'not-auth'">
          <span v-if="item.defaulterIdentityType < 4">已授权</span>
          <span v-else>未授权</span>
        </div>
      </div>
      <div class="tip" v-if="mySignedList.length === 0">暂无数据，快去签约文档吧～</div>
    </div>

    <div class="not-login-content" v-if="userData.isLogin === false">
      <div class="not-login-tip">此页面需登录浏览，请先登录</div>
      <div class="main-btn" @click="callLogin()" v-if="!inMobile">登录</div>
    </div>

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs } from "@vue/runtime-core";
import { useMyRouter, useMySignedList } from "../utils/hooks";
import { useStore } from "vuex";
import { callLogin } from "@/api/freelog";
import { ExhibitItem } from "../api/interface";
import { showToast } from "@/utils/common";

export default {
  name: "signed-list",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue"))
  },

  setup() {
    const store = useStore();
    const { switchPage } = useMyRouter();
    const { mySignedList, getMySignedList } = useMySignedList();

    const data = reactive({
      searchKey: ""
    });

    const methods = {
      /** 搜索签约列表 */
      search(e: { keyCode: number }) {
        if (e.keyCode === 13) {
          getMySignedList(data.searchKey);
        } else if (e.keyCode === 27) {
          data.searchKey = "";
        }
      },

      isDisabled(item: any) {
        return (
          (item.articleInfo as any)?.status === 2 ||
          item.onlineStatus === 0 ||
          ![0, 4].includes(item.defaulterIdentityType) ||
          !["阅读"].includes(item?.articleInfo.resourceType[0])
        );
      },

      /** 点击文档 */
      clickDocument(item: ExhibitItem) {
        const { exhibitId, defaulterIdentityType } = item;

        if ((item.articleInfo as any)?.status === 2) {
          showToast("此作品因违规无法访问");
          return;
        }

        if (item.onlineStatus === 0) {
          showToast("作品已下架，无法访问");
          return;
        }

        if (![0, 4].includes(item.defaulterIdentityType!)) {
          showToast("作品异常，无法访问");
          return;
        }

        if (!["阅读"].includes(item?.articleInfo.resourceType[0])) {
          showToast("此作品格式暂不支持访问");
          return;
        }

        switchPage("/reader", { id: exhibitId });
      }
    };

    return { callLogin, ...toRefs(store.state), mySignedList, ...toRefs(data), ...methods };
  }
};
</script>

<style lang="scss" scoped>
.signed-list-wrapper {
  position: relative;
  min-height: 100vh;

  // mobile
  &.in-mobile {
    padding-bottom: 128px;
    box-sizing: border-box;

    .content {
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .content-header {
        width: 100%;

        .signed-list-title {
          width: 100%;
          height: 100px;
          line-height: 100px;
          font-size: 34px;
          color: #222222;
        }

        .search-box {
          display: none;
        }
      }

      .document-box {
        width: 100%;
        height: 56px;
        padding: 0 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 4px;

        & + .document-box {
          margin-top: 10px;
        }

        .document-title-box {
          flex: 1;
          width: 0;
          display: flex;
          align-items: center;

          .freeze-lock,
          .auth-link-abnormal {
            width: 16px;
            height: 16px;
            margin-right: 5px;
          }

          .offline {
            flex-shrink: 0;
            width: 40px;
            height: 20px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 5px;
          }

          .document-title {
            max-width: 100%;
            font-size: 16px;
            font-weight: 600;
            line-height: 60px;
            color: #222222;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .tag {
          flex-shrink: 0;
          width: 56px;
          height: 24px;
          border-radius: 24px;
          margin-left: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .is-auth {
          background: #42c28c;
        }

        .not-auth {
          background: #e9a923;
        }
      }
    }
  }

  // PC
  &.in-pc {
    padding-bottom: 148px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;

    .content {
      width: 750px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .content-header {
        width: 100%;
        height: 116px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .signed-list-title {
          font-size: 30px;
          color: #222222;
          line-height: 36px;
        }

        .search-box {
          position: relative;
          width: 220px;
          height: 38px;
          border-radius: 38px;
          display: flex;
          align-items: center;
          overflow: hidden;

          .search-input {
            height: 100%;
            flex: 1;
            font-size: 14px;
            color: #222;
            padding: 0 38px;
            background: #f7f7f7;
          }

          .fl-icon-content {
            position: absolute;
            left: 12px;
            width: 14px;
            height: 14px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8e8e93;
          }
        }
      }

      .document-box {
        width: 100%;
        height: 60px;
        padding: 0 10px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        transition: all 0.2s linear;

        &:last-child {
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        &:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        .document-title-box {
          flex: 1;
          width: 0;
          display: flex;
          align-items: center;

          .freeze-lock,
          .auth-link-abnormal {
            width: 16px;
            height: 16px;
            margin-right: 5px;
          }

          .offline {
            flex-shrink: 0;
            width: 40px;
            height: 20px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 5px;
          }

          .document-title {
            max-width: 100%;
            font-size: 14px;
            font-weight: 600;
            line-height: 60px;
            color: #222222;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            cursor: pointer;
            transition: all 0.2s linear;

            &:hover {
              color: #2784ff;
            }

            &:active {
              color: rgba(39, 132, 255, 0.8);
            }
          }
        }

        .tag {
          flex-shrink: 0;
          width: 56px;
          height: 22px;
          border-radius: 22px;
          margin-left: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .is-auth {
          background: #42c28c;
        }

        .not-auth {
          background: #e9a923;
        }
      }
    }
  }

  .tip {
    width: 100%;
    font-size: 16px;
    line-height: 22px;
    color: #999;
    text-align: center;
    margin-top: 60px;
  }

  .not-login-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .not-login-tip {
      margin-top: 100px;
      font-size: 16px;
      color: #999999;
      line-height: 22px;
    }

    .main-btn {
      width: fit-content;
      height: 32px;
      padding: 0 15px;
      box-sizing: border-box;
      color: #fff;
      background: #2784ff;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 30px;
      cursor: pointer;
      transition: all 0.2s linear;

      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 0.6;
      }
    }
  }
}
</style>
