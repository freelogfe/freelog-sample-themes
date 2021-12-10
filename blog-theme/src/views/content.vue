<template>
  <div class="content-wrapper" :class="{ 'in-mobile': inMobile }">
    <my-header />

    <!-- mobile -->
    <div class="mobile-content-body" v-if="inMobile">
      <div class="article-info">
        <div class="article-title">{{ articleData?.exhibitName }}</div>
        <div class="other-info">
          <div class="info">{{ formatDate(articleData?.createDate) }}</div>
          <div class="divider"></div>
          <div class="info">{{ articleData?.signCount || 0 }}人已签约</div>
        </div>
        <div class="tags">
          <tags :tags="articleData?.tags" />
        </div>
        <div class="article-content">
          <template v-if="isAuth === true">
            <p className="paragraph" v-for="(item, index) in content" :key="item + index">{{ item }}</p>
          </template>
          <div class="lock-box" v-if="isAuth === false">
            <img class="lock" src="../assets/images/lock.png" />
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth()">签约</div>
          </div>
        </div>
      </div>

      <div class="recommend">
        <div class="recommend-title">热门推荐</div>
        <div class="article-list">
          <my-article :data="item" v-for="item in recommendList" :key="item.presentableId" />
        </div>
      </div>
    </div>

    <!-- PC -->
    <div class="content-body" v-if="!inMobile">
      <div class="bread-crumbs">
        <div class="text-btn" @click="switchPage('/')">首页</div>
        <div class="arrow">></div>
        <div class="current-page">内容</div>
      </div>

      <div class="article-card">
        <div class="article-title">{{ articleData?.exhibitName }}</div>
        <div class="other-info">
          <div class="info">{{ formatDate(articleData?.createDate) }}</div>
          <div class="divider"></div>
          <div class="info">{{ articleData?.signCount || 0 }}人已签约</div>
          <tags :tags="articleData?.tags" />
        </div>
        <div class="divider"></div>
        <div class="article-content">
          <template v-if="isAuth === true">
            <p className="paragraph" v-for="(item, index) in content" :key="item + index">{{ item }}</p>
          </template>
          <div class="lock-box" v-if="isAuth === false">
            <img class="lock" src="../assets/images/lock.png" />
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth()">签约</div>
          </div>
        </div>
      </div>

      <div class="recommend">
        <div class="recommend-header">
          <div class="recommend-title">热门推荐</div>
          <div class="text-btn" @click="switchPage('/')">更多>></div>
        </div>
        <div class="article-list">
          <my-article :data="item" v-for="item in recommendList" :key="item.presentableId" />
        </div>
      </div>
    </div>

    <my-footer />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, reactive, toRefs, watch } from "vue";
import { useGetList, useMyRouter } from "../utils/hooks";
import { ExhibitItem } from "@/api/interface";
import {
  addAuth,
  getExhibitAuthStatus,
  getExhibitFileStream,
  getExhibitInfo,
  getExhibitSignCount,
} from "@/api/freelog";
import { formatDate } from "@/utils/common";
import { useStore } from "vuex";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    "my-article": defineAsyncComponent(() => import("../components/article.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const datasOfGetList = useGetList();

    const data = reactive({
      isAuth: null as boolean | null,
      articleData: null as ExhibitItem | null,
      content: [] as string[],
      recommendList: [] as ExhibitItem[],
    });

    const methods = {
      async getAuth() {
        const { id } = query.value;
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) getData();
      },
    };

    watch(
      () => query.value,
      () => {
        document.documentElement.scroll({ top: 0 });
        data.isAuth = false;
        data.articleData = null;
        data.content = [];
        data.recommendList = [];
        getData();
      }
    );

    const getData = async () => {
      const { id } = query.value;
      const exhibitInfo = await getExhibitInfo(id, { isLoadVersionProperty: 1 });
      const signCountData = await getExhibitSignCount(id);
      await datasOfGetList.getList({ limit: 4 }, true);
      data.articleData = { ...exhibitInfo.data.data, signCount: signCountData.data.data[0].count };
      const recommendList = datasOfGetList.listData.value.filter((item: ExhibitItem) => item.exhibitId !== id);
      data.recommendList = recommendList.filter((_: any, index: number) => index < 4);

      const statusInfo = await getExhibitAuthStatus(id);
      data.isAuth = statusInfo.data.data ? statusInfo.data.data[0].isAuth : false;
      if (data.isAuth) {
        const info: any = await getExhibitFileStream(id);
        if (!info) return;
        data.content = info.data.split(/\n/g).filter((item: string) => !!item);
      } else {
        methods.getAuth();
      }
    };
    getData();

    return { ...store.state, switchPage, formatDate, ...datasOfGetList, ...toRefs(data), ...methods };
  },
};
</script>

<style lang="scss" scoped>
.content-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 148px;
  box-sizing: border-box;
  background: #fafbfc;

  &.in-mobile {
    background: rgba(0, 0, 0, 0.03);
    padding-bottom: 98px;
  }

  // mobile
  .mobile-content-body {
    width: 100%;

    .article-info {
      width: 100%;
      background: #ffffff;
      padding: 20px;
      box-sizing: border-box;

      .article-title {
        font-size: 20px;
        font-weight: 600;
        color: #222222;
        line-height: 28px;
      }

      .other-info {
        margin-top: 8px;
        display: flex;
        align-items: center;

        .info {
          font-size: 12px;
          line-height: 18px;
          color: #999999;
        }

        .divider {
          width: 1px;
          height: 14px;
          background: rgba(0, 0, 0, 0.15);
          margin: 0 10px;
        }
      }

      .tags {
        margin-top: 12px;
      }

      .article-content {
        font-size: 18px;
        color: #222222;
        line-height: 32px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        padding-top: 20px;
        margin-top: 20px;

        .paragraph {
          word-break: break-all;
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
    }

    .recommend {
      width: 100%;
      padding: 20px 20px 0;
      box-sizing: border-box;
      margin-top: 5px;
      background-color: #fff;

      .recommend-title {
        font-size: 16px;
        font-weight: 600;
        color: #222222;
        line-height: 22px;
      }

      .article-list {
        margin-top: 5px;

        .article-wrapper:last-child {
          border-bottom: none;
        }
      }
    }
  }

  // PC
  .content-body {
    width: 920px;

    .bread-crumbs {
      display: flex;
      align-items: center;
      margin: 24px 0;
      font-size: 16px;
      color: #999999;
      line-height: 22px;

      .arrow {
        margin: 0 10px;
      }

      .current-page {
        font-weight: 600;
        color: #222222;
      }
    }

    .article-card {
      width: 100%;
      background: #ffffff;
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      padding: 25px 30px;
      box-sizing: border-box;

      .article-title {
        font-size: 20px;
        font-weight: 600;
        color: #222222;
        line-height: 28px;
      }

      .other-info {
        height: 24px;
        margin-top: 10px;
        display: flex;
        align-items: center;

        .info {
          font-size: 12px;
          color: #999999;
        }

        .divider {
          width: 1px;
          height: 14px;
          background: rgba(0, 0, 0, 0.15);
          margin: 0 10px;
        }

        .tags-wrapper {
          margin-left: 20px;
        }
      }

      .divider {
        width: 100%;
        height: 1px;
        background-color: rgba(0, 0, 0, 0.1);
        margin: 25px 0;
      }

      .article-content {
        font-size: 14px;
        color: #222222;
        line-height: 24px;

        .paragraph {
          word-break: break-all;
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
    }

    .recommend {
      margin-top: 50px;

      .recommend-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .recommend-title {
          font-size: 14px;
          font-weight: 600;
          color: #222222;
          line-height: 20px;
        }

        .text-btn {
          font-size: 14px;
          line-height: 20px;
        }
      }

      .article-list {
        margin-top: 15px;

        .article-wrapper:first-child {
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
