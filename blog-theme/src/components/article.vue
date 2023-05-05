<template>
  <div class="article-wrapper">
    <!-- mobile -->
    <div class="mobile-article-wrapper" @click="clickArticle()" v-if="inMobile">
      <div class="article-cover-box" v-if="selfConfig.articleCover === '显示'">
        <img
          class="article-cover"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          :src="data.coverImages[0]"
          :alt="data.exhibitTitle"
        />
        <div class="offline" v-if="data.onlineStatus === 0 && inSignedList">已下架</div>
      </div>

      <div class="article-info">
        <div class="article-title" :class="{ 'one-line': inSignedList }">
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            v-if="![0, 4].includes(data.defaulterIdentityType)"
          />
          <img
            class="lock"
            src="../assets/images/mini-lock.png"
            v-if="!inSignedList && data.defaulterIdentityType >= 4"
          />
          <span :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }">{{ data.exhibitTitle }}</span>
        </div>
        <div
          class="other-info"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          v-if="!inSignedList"
        >
          <div class="info">{{ formatDate(data.createDate) }}</div>
          <div class="info">{{ data.signCount || 0 }}人已签约</div>
        </div>
        <template v-if="inSignedList">
          <div class="time-signcount" :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }">
            <div class="info">{{ formatDate(data.createDate) }}</div>
            <div class="divider"></div>
            <div class="info">{{ data.signCount || 0 }}人已签约</div>
          </div>
          <div class="tag is-auth" v-if="data.defaulterIdentityType < 4">已授权</div>
          <div class="tag not-auth" v-else>未授权</div>
        </template>
      </div>
    </div>

    <!-- PC -->
    <div class="pc-article-wrapper" v-if="!inMobile">
      <div class="article-cover-box" @click="clickArticle()" v-if="selfConfig.articleCover === '显示'">
        <img
          class="article-cover"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          :src="data.coverImages[0]"
          :alt="data.exhibitTitle"
        />
        <div class="offline" v-if="data.onlineStatus === 0 && inSignedList">已下架</div>
      </div>

      <div class="article-info">
        <div class="article-title">
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            v-if="![0, 4].includes(data.defaulterIdentityType)"
          />
          <img
            class="lock"
            src="../assets/images/mini-lock.png"
            v-if="!inSignedList && data.defaulterIdentityType >= 4"
          />
          <div
            class="title"
            :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
            :title="data.exhibitTitle"
            @click="clickArticle()"
          >
            {{ data.exhibitTitle }}
          </div>
          <div class="tag is-auth" v-if="inSignedList && data.defaulterIdentityType < 4">已授权</div>
          <div class="tag not-auth" v-if="inSignedList && data.defaulterIdentityType >= 4">未授权</div>
        </div>
        <div
          class="article-intro"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          :title="data.versionInfo.exhibitProperty.intro || ''"
        >
          {{ data.versionInfo.exhibitProperty.intro || "" }}
        </div>
        <div class="other-info" :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }">
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
import { defineAsyncComponent, toRefs } from "vue";
import { useMyRouter } from "@/utils/hooks";
import { useStore } from "vuex";
import { ExhibitItem } from "../api/interface";
import { showToast } from "../../../comic-theme/src/utils/common";

export default {
  name: "my-article",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
  },

  props: ["data", "inSignedList"],

  setup(props: { data: ExhibitItem }) {
    const store = useStore();
    const { switchPage } = useMyRouter();
    const clickArticle = () => {
      const { exhibitId, defaulterIdentityType } = props.data;

      if (![0, 4].includes(defaulterIdentityType)) {
        showToast("授权链异常，无法查看");
        return;
      }

      switchPage("/content", { id: exhibitId });
    };

    return {
      ...toRefs(store.state),
      clickArticle,
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

        .auth-link-abnormal {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 5px;
          transform: translateY(2px);
        }

        .lock {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 10px;
          transform: translateY(2px);
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

        .auth-link-abnormal {
          width: 16px;
          height: 16px;
          margin-right: 5px;
        }

        .lock {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          margin-right: 10px;
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
        height: 20px;
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

  .opacity-40p {
    opacity: 0.4;
  }
}
</style>
