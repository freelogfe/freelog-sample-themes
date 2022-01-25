<template>
  <div class="article-wrapper">
    <!-- mobile -->
    <div class="mobile-article-wrapper" @click="switchPage('/content', { id: data.exhibitId })" v-if="inMobile">
      <div class="article-cover-box" v-if="selfConfig.articleCover === '显示'">
        <img class="article-cover" :src="data.coverImages[0]" :alt="data.exhibitTitle" />
        <div class="offline" v-if="data.onlineStatus === 0 && inSignedList">已下架</div>
      </div>

      <div class="article-info">
        <div class="article-title" :class="{ 'one-line': inSignedList }">
          <img class="lock" src="../assets/images/mini-lock.png" v-if="!inSignedList && !data.isAuth" />
          {{ data.exhibitTitle }}
        </div>
        <div class="other-info" v-if="!inSignedList">
          <div class="info">{{ formatDate(data.createDate) }}</div>
          <div class="info">{{ data.signCount || 0 }}人已签约</div>
        </div>
        <template v-if="inSignedList">
          <div class="time-signcount">
            <div class="info">{{ formatDate(data.createDate) }}</div>
            <div class="divider"></div>
            <div class="info">{{ data.signCount || 0 }}人已签约</div>
          </div>
          <div class="tag is-auth" v-if="data.isAuth">已授权</div>
          <div class="tag not-auth" v-if="!data.isAuth">未授权</div>
        </template>
      </div>
    </div>

    <!-- PC -->
    <div class="pc-article-wrapper" v-if="!inMobile">
      <div
        class="article-cover-box"
        @click="switchPage('/content', { id: data.exhibitId })"
        v-if="selfConfig.articleCover === '显示'"
      >
        <img class="article-cover" :src="data.coverImages[0]" :alt="data.exhibitTitle" />
        <div class="offline" v-if="data.onlineStatus === 0 && inSignedList">已下架</div>
      </div>

      <div class="article-info">
        <div class="article-title">
          <img class="lock" src="../assets/images/mini-lock.png" v-if="!inSignedList && !data.isAuth" />
          <div class="title" :title="data.exhibitTitle" @click="switchPage('/content', { id: data.exhibitId })">
            {{ data.exhibitTitle }}
          </div>
          <div class="tag is-auth" v-if="inSignedList && data.isAuth">已授权</div>
          <div class="tag not-auth" v-if="inSignedList && !data.isAuth">未授权</div>
        </div>
        <div class="article-intro">{{ data.exhibitTitle }}</div>
        <div class="other-info">
          <div class="info">{{ formatDate(data.createDate) }}</div>
          <div class="divider"></div>
          <div class="info">{{ data.signCount || 0 }}人已签约</div>
          <div class="tags">
            <tags :tags="data.tags" />
          </div>
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

  props: ["data", "inSignedList"],

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
      position: relative;
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

      .offline {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 0px 0px 4px 0px;
        font-size: 10px;
        font-weight: 600;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
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

        &.one-line {
          -webkit-line-clamp: 1;
        }

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

      .time-signcount {
        display: flex;
        align-items: center;

        .info {
          font-size: 12px;
          color: #999999;
          line-height: 18px;
        }

        .divider {
          width: 1px;
          height: 10px;
          background: rgba(0, 0, 0, 0.2);
          margin: 0 10px;
        }
      }

      .tag {
        flex-shrink: 0;
        width: 56px;
        height: 22px;
        border-radius: 22px;
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
      position: relative;
      width: 136px;
      height: 102px;
      border-radius: 6px;
      background: #b7b7b7;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      cursor: pointer;
      transition: all 0.2s linear;

      .article-cover {
        width: 100%;
      }

      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 0.6;
      }

      .offline {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 0px 0px 4px 0px;
        font-size: 10px;
        font-weight: 600;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
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
        display: flex;
        align-items: center;

        .lock {
          flex-shrink: 0;
          float: left;
          width: 16px;
          height: 16px;
          margin-right: 10px;
          margin-top: 6px;
        }

        .title {
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            opacity: 0.8;
          }

          &:active {
            opacity: 0.6;
          }
        }

        .tag {
          flex-shrink: 0;
          width: 56px;
          height: 22px;
          border-radius: 22px;
          margin-left: 10px;
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
          flex-shrink: 0;
          font-size: 12px;
          color: #999999;
        }

        .divider {
          width: 1px;
          height: 14px;
          background: rgba(0, 0, 0, 0.15);
          margin: 0 10px;
        }

        .tags {
          margin-left: 20px;
          height: 24px;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
