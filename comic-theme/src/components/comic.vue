<template>
  <!-- 移动端收藏漫画组件 -->
  <div class="mobile-shelf-comic-wrapper" @click="switchPage('/detail', { id: data.exhibitId })" v-if="inMobileShelf">
    <div class="comic-cover-box">
      <img class="comic-cover" :src="data.coverImages[0]" :alt="data.exhibitName" />
    </div>

    <div class="comic-name" :title="data.exhibitName">
      {{ data.exhibitName }}
    </div>

    <div class="comic-author">{{ data.articleInfo.articleOwnerName }}</div>
  </div>

  <!-- 普通漫画组件 -->
  <div
    class="comic-wrapper"
    :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }"
    @click="switchPage('/detail', { id: data.exhibitId })"
    v-if="!inMobileShelf"
  >
    <div class="comic-content">
      <div class="comic-cover-box">
        <img class="comic-cover" :src="data.coverImages[0]" :alt="data.exhibitName" />
      </div>

      <div class="comic-info">
        <div class="comic-name" :title="data.exhibitName">
          <img class="lock" src="../assets/images/mini-lock.png" alt="未授权" v-if="!data.isAuth" />
          {{ data.exhibitName }}
        </div>

        <div class="comic-author">{{ data.articleInfo.articleOwnerName }}</div>

        <div class="tags">
          <tags :tags="data.tags" />
        </div>
      </div>

      <i class="freelog fl-icon-zhankaigengduo"></i>

      <div class="main-btn btn" @click.stop="switchPage('/reader', { id: data?.exhibitId })" v-if="operateShelf">
        立即阅读
      </div>

      <div class="assist-btn btn" @click.stop="operateShelf(data)" v-if="operateShelf">
        取消收藏
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
  name: "comic",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
  },

  props: ["inMobileShelf", "data", "operateShelf"],

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
// 移动端书架小说组件
.mobile-shelf-comic-wrapper {
  width: 100px;

  .comic-cover-box {
    width: 100px;
    height: 140px;
    border-radius: 4px;
    background: #b7b7b7;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .comic-cover {
      height: 100%;
    }
  }

  .comic-name {
    width: 100px;
    font-size: 16px;
    font-weight: 600;
    color: #222222;
    line-height: 22px;
    margin-top: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .comic-author {
    width: 100px;
    font-size: 13px;
    color: #666666;
    line-height: 18px;
    margin-top: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

// 普通小说组件
.comic-wrapper {
  width: 100%;

  .comic-content {
    width: 100%;
    display: flex;
    align-items: center;

    .comic-cover-box {
      border-radius: 4px;
      background: #b7b7b7;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      .comic-cover {
        height: 100%;
      }
    }

    .comic-info {
      flex: 1;
      width: 0;

      .comic-name {
        width: 100%;
        font-size: 16px;
        color: #222;
        line-height: 22px;
        font-weight: bold;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        .lock {
          float: left;
          width: 16px;
          height: 16px;
          margin-right: 10px;
          margin-top: 3px;
        }
      }

      .comic-author {
        width: 100%;
        font-size: 13px;
        line-height: 18px;
        color: #666666;
        margin-top: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tags {
        margin-top: 12px;
        height: 24px;
      }
    }
  }

  // 移动端普通小说组件
  &.in-mobile {
    padding: 0 20px;

    &:active {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .comic-content {
      width: 100%;
      padding: 15px 0;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);

      .comic-cover-box {
        width: 70px;
        height: 98px;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
        margin-right: 15px;
      }

      .fl-icon-zhankaigengduo {
        width: 6px;
        height: 12px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
      }

      .btn {
        display: none;
      }

      .tag + .tag {
        margin-left: 8px;
      }
    }
  }

  // PC端普通小说组件
  &.in-pc {
    border-radius: 6px;
    padding: 10px;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0.1) 100%);
    cursor: pointer;

    &:hover {
      background: linear-gradient(90deg, rgba(0, 0, 0, 0.08) 0%, rgba(255, 255, 255, 0.1) 100%);
    }

    .comic-cover-box {
      width: 80px;
      height: 112px;
      margin-right: 20px;
    }

    .fl-icon-zhankaigengduo {
      display: none;
    }

    .btn {
      height: 38px;
      padding: 0 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;

      &.assist-btn {
        margin-left: 15px;
      }
    }
  }
}
</style>
