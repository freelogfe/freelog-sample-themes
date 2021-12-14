<template>
  <div class="article-wrapper">
    <!-- mobile -->
    <div class="mobile-article-wrapper" @click="switchPage('/content', { id: data.exhibitId })" v-if="inMobile">
      <div class="article-cover-box" v-if="selfConfig.articleCover === '显示'">
        <img class="article-cover" :src="data.coverImages[0]" :alt="data.exhibitName" />
      </div>

      <div class="article-info">
        <div class="article-title">
          <img class="lock" src="../assets/images/mini-lock.png" v-if="!data.isAuth" />
          {{ data.exhibitName }}
        </div>
        <div class="other-info">
          <div class="info">{{ formatDate(data.createDate) }}</div>
          <div class="info">{{ data.signCount || 0 }}人已签约</div>
        </div>
      </div>
    </div>

    <!-- PC -->
    <div class="pc-article-wrapper" v-if="!inMobile">
      <div class="article-cover-box" v-if="selfConfig.articleCover === '显示'">
        <img class="article-cover" :src="data.coverImages[0]" :alt="data.exhibitName" />
      </div>

      <div class="article-info">
        <div class="article-title">
          <img class="lock" src="../assets/images/mini-lock.png" v-if="!data.isAuth" />
          <span :title="data.exhibitName" @click="switchPage('/content', { id: data.exhibitId })">
            {{ data.exhibitName }}
          </span>
        </div>
        <div class="article-intro">{{ data.exhibitName }}</div>
        <div class="other-info">
          <div class="info">{{ formatDate(data.createDate) }}</div>
          <div class="divider"></div>
          <div class="info">{{ data.signCount || 0 }}人已签约</div>
          <tags :tags="data.tags" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { formatDate } from "@/utils/common";
import { defineAsyncComponent } from "vue";
import { useMyRouter } from "@/utils/hooks";
import { useStore } from "vuex";

export default {
  name: "my-article",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
  },

  props: ["data"],

  setup() {
    const store = useStore();
    const { switchPage } = useMyRouter();

    return {
      ...store.state,
      switchPage,
      formatDate,
    };
  },
};
</script>

<style lang="scss" scoped>
.article-wrapper {
  width: 100%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  // mobile
  .mobile-article-wrapper {
    width: 100%;
    padding: 15px 0;
    box-sizing: border-box;
    display: flex;

    .article-cover-box {
      width: 104px;
      height: 78px;
      border-radius: 6px;
      background: #b7b7b7;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      .article-cover {
        width: 100%;
      }
    }

    .article-info {
      flex: 1;
      width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .article-title {
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        color: #222222;
        line-height: 22px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;

        .lock {
          float: left;
          width: 16px;
          height: 16px;
          margin-right: 10px;
          margin-top: 3px;
        }
      }

      .other-info {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;

        .info {
          color: #999999;
          font-size: 12px;
          color: #999999;
          line-height: 18px;
        }
      }
    }
  }

  // PC
  .pc-article-wrapper {
    width: 100%;
    padding: 20px 10px;
    box-sizing: border-box;
    display: flex;

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }

    .article-cover-box {
      width: 136px;
      height: 102px;
      border-radius: 6px;
      background: #b7b7b7;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      .article-cover {
        width: 100%;
      }
    }

    .article-info {
      flex: 1;
      width: 0;

      .article-title {
        width: 100%;
        font-size: 20px;
        font-weight: 600;
        color: #222222;
        line-height: 28px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        .lock {
          float: left;
          width: 16px;
          height: 16px;
          margin-right: 10px;
          margin-top: 6px;
        }

        span {
          cursor: pointer;

          &:hover {
            color: #2784ff;
          }

          &:active {
            color: #2376e5;
          }
        }
      }

      .article-intro {
        font-size: 14px;
        color: #666666;
        line-height: 20px;
        margin-top: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .other-info {
        height: 24px;
        margin-top: 20px;
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
    }
  }
}
</style>
