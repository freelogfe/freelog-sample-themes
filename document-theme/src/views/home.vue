<template>
  <div class="home-wrapper">
    <my-header />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile"></div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <!-- 列表条 -->
      <div class="list-bar">
        <div class="list-title">展品列表</div>

        <div
          class="list-item"
          :class="{ active: currentId === item.exhibitId }"
          v-for="item in listData"
          :key="item.exhibitId"
          @click="currentId = item.exhibitId"
        >
          <div class="item-title-lock">
            <div class="item-title" :title="item.exhibitName">
              {{ item.exhibitName }}
            </div>
            <img
              class="item-lock"
              src="../assets/images/mini-lock.png"
              title="授权"
              @click.stop="getAuth(item)"
              v-if="!item.isAuth"
            />
          </div>
          <div class="item-update-time">最近更新 {{ relativeTime(item.updateDate) }}</div>
          <div class="item-sign-count">签约量 {{ item.signCount }}</div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <div class="content-body">
          <div class="top-bar" v-if="documentData.isAuth === true">
            <div class="bar-info">
              <div>作者 {{ documentData?.articleInfo?.articleOwnerName }}</div>
              <div>最近更新 {{ relativeTime(documentData?.updateDate) }}</div>
            </div>
            <div>签约量 {{ documentData?.signCount }}</div>
          </div>

          <my-markdown :data="documentData" v-if="documentData.isAuth === true" />
          <div class="lock-box" v-if="documentData.isAuth === false">
            <img class="lock" src="../assets/images/lock.png" />
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth(documentData)">签约</div>
          </div>

          <my-footer />
        </div>
      </div>

      <!-- 标题目录区域 -->
      <div class="title-directory"></div>

      <theme-entrance />
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs, watch } from "vue";
import { useStore } from "vuex";
import { useGetList, useMyRouter, useMyScroll } from "@/utils/hooks";
import { addAuth, getExhibitFileStream, getExhibitSignCount } from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { relativeTime } from "@/utils/common";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-markdown": defineAsyncComponent(() => import("../components/markdown.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
  },

  setup() {
    const store = useStore();
    const { query } = useMyRouter();
    const { scrollToTop } = useMyScroll();
    const datasOfGetList = useGetList();

    const data = reactive({
      currentId: "",
      documentData: {} as ExhibitItem,
    });

    const methods = {
      // 授权
      async getAuth(item: ExhibitItem) {
        const authResult = await addAuth(item.exhibitId);
        const { status } = authResult;
        if (status === 0) {
          item.isAuth = true;
          const signCountData = await getExhibitSignCount(item.exhibitId);
          const { count } = signCountData.data.data;
          item.signCount = count;
          getDocumentData(item.exhibitId);
        }
      },
    };

    // 获取数据
    const getData = () => {
      datasOfGetList.getList({}, true);
    };

    const getDocumentData = async (id = "") => {
      const exhibitId = id || data.currentId;
      const documentData = datasOfGetList.listData.value.find((item) => item.exhibitId === exhibitId);

      if (!documentData) return;

      if (!id) data.documentData = documentData;

      if (!documentData.isAuth) return;

      const info: any = await getExhibitFileStream(exhibitId);
      if (!info) return;
      if (!id) data.documentData.content = info.data;
    };

    watch(
      () => datasOfGetList.listData.value,
      (cur) => {
        if (cur.length) data.currentId = cur[0].exhibitId;
      }
    );

    watch(
      () => query.value,
      (cur) => {
        if (cur && cur !== data.currentId) data.currentId = cur;
      }
    );

    watch(
      () => data.currentId,
      () => {
        scrollToTop("auto");
        getDocumentData();
      }
    );

    getData();

    return {
      relativeTime,
      ...store.state,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  // mobile
  .mobile-home-body {
    width: 100%;
  }

  // PC
  .home-body {
    width: 100%;
    display: flex;

    .list-bar {
      position: fixed;
      width: 280px;
      top: 70px;
      left: 0;
      bottom: 0;
      background: #fafbfc;
      box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;

      .list-title {
        width: 100%;
        font-size: 12px;
        font-weight: 600;
        color: #7a869a;
        line-height: 17px;
        padding: 30px 30px 15px;
        box-sizing: border-box;
      }

      .list-item {
        width: 100%;
        padding: 15px 30px;
        box-sizing: border-box;
        cursor: pointer;
        transition: all 0.2s linear;

        &:hover,
        &.active {
          background: rgba(0, 0, 0, 0.03);

          .item-title {
            color: #222222 !important;
          }
        }

        .item-title-lock {
          display: flex;
          align-items: center;

          .item-title {
            flex: 1;
            font-size: 14px;
            font-weight: 600;
            color: #999999;
            line-height: 20px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            transition: all 0.2s linear;
          }

          .item-lock {
            width: 16px;
            height: 16px;
            margin-left: 30px;
            transition: all 0.1s linear;

            &:hover {
              transform: scale(1.2);
            }
          }
        }

        .item-update-time {
          font-size: 12px;
          font-weight: 400;
          color: #999999;
          line-height: 18px;
          margin-top: 10px;
        }

        .item-sign-count {
          font-size: 12px;
          color: #999999;
          line-height: 18px;
          margin-top: 3px;
        }
      }
    }

    .content-area {
      flex: 1;
      min-width: 1140px;
      height: 100%;
      padding-left: 280px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;

      .content-body {
        position: relative;
        width: 750px;
        min-height: calc(100vh - 70px);
        padding-bottom: 70px;
        box-sizing: border-box;

        .top-bar {
          width: 100%;
          height: 38px;
          padding: 0 15px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          color: #7a869a;
          background: #fafbfc;
          border-radius: 4px;
          margin-top: 30px;

          .bar-info {
            display: flex;

            div + div {
              margin-left: 30px;
            }
          }
        }

        .markdown-wrapper {
          margin-top: 30px;
        }

        .lock-box {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .lock {
            width: 64px;
            height: 64px;
          }

          .lock-tip {
            font-size: 20px;
            color: #222;
            line-height: 28px;
            margin-top: 40px;
          }

          .get-btn {
            padding: 9px 20px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 20px;
            font-weight: bold;
            background-color: #2784ff;
            color: #fff;
            margin-top: 40px;
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
    }
  }
}
</style>
