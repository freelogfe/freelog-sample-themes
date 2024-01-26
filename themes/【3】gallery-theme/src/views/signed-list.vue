<!-- 签约列表页 -->

<template>
  <div class="signed-list-wrapper" :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }">
    <my-header />

    <div class="content" v-if="userData.isLogin && mySignedList">
      <div class="content-header">
        <div class="signed-list-title">已签约图片/视频</div>

        <div class="search-box">
          <input class="search-input input-none" v-model="searchKey" placeholder="搜索" @keyup="search($event)" />
          <i class="freelog fl-icon-content"></i>
        </div>
      </div>

      <div class="frame-list">
        <div class="waterfall" v-for="list in listNumber" :key="list">
          <my-frame
            class="frame"
            :inSignedList="true"
            :data="item"
            v-for="item in waterfall[waterfallList[list - 1]]"
            :key="item.exhibitId"
            @click="clickFrame(item)"
          />
        </div>
      </div>
      <div class="tip" v-if="mySignedList.length === 0">暂无数据，快去签约图片/视频吧～</div>
    </div>

    <div class="not-login-content" v-if="userData.isLogin === false">
      <div class="not-login-tip">此页面需登录浏览，请先登录</div>
      <div class="main-btn" @click="callLogin()" v-if="!inMobile">登录</div>
    </div>

    <detail v-model:id="currentId" v-if="!inMobile" />

    <my-footer />

    <theme-entrance />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs } from "@vue/runtime-core";
import { useMyRouter, useMySignedList, useMyWaterfall } from "../utils/hooks";
import { useStore } from "vuex";
import { onUnmounted, watch } from "vue";
import { callLogin } from "@/api/freelog";
import { ExhibitItem } from "../api/interface";
import { showToast } from "@/utils/common";

export default {
  name: "signed-list",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
    detail: defineAsyncComponent(() => import("../views/detail.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { mySignedList, getMySignedList } = useMySignedList();
    const { listNumber, waterfall, waterfallList, getListNumber, initWaterfall, setWaterFall } = useMyWaterfall();

    const data = reactive({
      searchKey: "",
      currentId: null as null | string,
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

      /** 点击图片/视频组件 */
      clickFrame(item: ExhibitItem) {
        const { exhibitId, defaulterIdentityType } = item;

        if (![0, 4].includes(defaulterIdentityType)) {
          showToast("授权链异常，无法查看");
          return;
        }

        if (store.state.inMobile) {
          switchPage("/detail", { id: exhibitId });
        } else {
          data.currentId = exhibitId;
        }
        store.commit("setData", { key: "listData", value: mySignedList.value });
      },
    };

    /** 屏幕尺寸变化切换瀑布流列数 */
    const waterfallResize = () => {
      getListNumber();
      initWaterfall();
      setWaterFall(mySignedList.value || []);
    };

    /** 根据链接判断是否进入详情页或打开内容弹窗 */
    const judgeUrl = () => {
      const { id } = query.value;
      if (!id) return;

      if (store.state.inMobile) {
        // 移动端跳转详情页面
        switchPage("/signedList", {}, "replace");
        setTimeout(() => {
          switchPage("/detail", { id });
        }, 0);
      } else {
        // PC端弹出内容弹窗
        data.currentId = id;
      }
    };

    watch(
      () => mySignedList.value,
      async (cur: any) => {
        initWaterfall();

        const { inMobile } = store.state;
        let num = 0;
        let frameWidth = 0;
        let minHeight = 0;

        if (inMobile) {
          frameWidth = (document.body.clientWidth - 40) / 2;
          minHeight = 120;
        } else {
          frameWidth = 300;
          minHeight = 230;
        }

        for (let i = 0; i < cur.length; i++) {
          const img = new Image();
          img.src = cur[i].coverImages[0];
          img.onload = () => {
            const height = (frameWidth / img.width) * img.height;
            cur[i].height = height < minHeight ? minHeight : height;
            num++;

            if (num === cur.length) setWaterFall(cur || []);
          };
        }
      }
    );

    window.addEventListener("resize", waterfallResize);
    onUnmounted(() => {
      window.removeEventListener("resize", waterfallResize);
    });

    judgeUrl();
    getListNumber();

    return {
      callLogin,
      ...toRefs(store.state),
      mySignedList,
      listNumber,
      waterfall,
      waterfallList,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.signed-list-wrapper {
  position: relative;
  min-height: 100vh;

  // mobile
  &.in-mobile {
    padding-bottom: 98px;
    box-sizing: border-box;

    .content {
      width: 100%;

      .content-header {
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;

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

      .frame-list {
        width: 100%;
        padding: 0 15px;
        box-sizing: border-box;
        display: flex;

        .waterfall {
          flex: 1;

          & + .waterfall {
            margin-left: 10px;
          }

          .frame-wrapper + .frame-wrapper {
            margin-top: 10px;
          }
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
      width: 1230px;
      display: flex;
      flex-direction: column;

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

      .frame-list {
        width: 100%;
        display: flex;

        .waterfall {
          width: 300px;

          & + .waterfall {
            margin-left: 10px;
          }

          .frame-wrapper + .frame-wrapper {
            margin-top: 10px;
          }
        }
      }
    }

    @media (min-width: 1600px) {
      .content {
        width: 1540px !important;
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
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 30px;
    }
  }
}
</style>
