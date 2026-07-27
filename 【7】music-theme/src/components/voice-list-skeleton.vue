<template>
  <div class="voice-list-skeleton" :class="{ mobile: store.inMobile }">
    <div class="music-drop-wrapper">
      <div class="selected-box">
        <div class="txt">最新发布</div>
        <div class="drop-trigger">
          <div class="triangle"></div>
        </div>
      </div>
    </div>
    <div class="skeleton-rows">
      <div class="skeleton-row" v-for="item in rowCount" :key="item">
        <template v-if="!store.inMobile">
          <div class="skeleton-left">
            <div class="skeleton-block skeleton-cover"></div>
            <div class="skeleton-block skeleton-title"></div>
          </div>
          <div class="skeleton-block skeleton-col col-1"></div>
          <div class="skeleton-block skeleton-col col-2"></div>
          <div class="skeleton-block skeleton-col col-3"></div>
          <div class="skeleton-block skeleton-col col-4"></div>
        </template>
        <template v-else>
          <div class="skeleton-block skeleton-cover"></div>
          <div class="info-area">
            <div class="skeleton-block skeleton-title"></div>
            <div class="skeleton-block skeleton-duration"></div>
            <div class="skeleton-block skeleton-others"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { useGlobalStore } from "@/store/global";

export default {
  name: "voice-list-skeleton",

  data() {
    const store = useGlobalStore();

    return {
      store
    };
  },

  computed: {
    rowCount() {
      return this.store.inMobile ? 4 : 5;
    }
  }
};
</script>

<style lang="less" scoped>
.voice-list-skeleton {
  width: 100%;

  .music-drop-wrapper {
    display: flex;
    align-items: center;
    margin: 40px 0;
    width: 100%;
    height: 20px;

    .selected-box {
      display: flex;
      align-items: center;

      .txt {
        height: 20px;
        font-weight: 600;
        font-size: 14px;
        color: var(--text-color);
        line-height: 20px;
        opacity: 0.6;
      }

      .drop-trigger {
        position: relative;
        margin-left: 7px;

        .triangle {
          width: 0;
          border-width: 6px 5px;
          border-style: solid;
          border-color: transparent;
          border-top-color: var(--text-color);
          position: relative;
          top: 3px;
          opacity: 0.6;
        }
      }
    }
  }

  .skeleton-rows {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 120px;
  }

  .skeleton-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .skeleton-left {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 460px;
    flex-shrink: 0;
  }

  .skeleton-cover {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .skeleton-title {
    height: 20px;
    width: 390px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .skeleton-col {
    border-radius: 4px;
    flex-shrink: 0;

    &.col-1 {
      width: 140px;
      height: 20px;
    }

    &.col-2,
    &.col-3 {
      width: 170px;
      height: 18px;
    }

    &.col-4 {
      width: 180px;
      height: 18px;
    }
  }

  .skeleton-block {
    background: linear-gradient(
        90deg,
        var(--text-first-color) 25%,
        var(--text-point-fifth-color) 37%,
        var(--text-first-color) 63%
      )
      0% 0% / 400% 100%;

    animation: voice-list-skeleton-loading 1.4s ease infinite;
  }

  &.mobile {
    .music-drop-wrapper {
      margin: 20px 0;
    }

    .skeleton-rows {
      gap: 15px;
      padding-bottom: 0;
    }

    .skeleton-row {
      justify-content: flex-start;
    }

    .skeleton-cover {
      width: 70px;
      height: 70px;
      border-radius: 10px;
    }

    .info-area {
      display: flex;
      flex-direction: column;
      margin-left: 10px;
      flex: 1;
    }

    .skeleton-title {
      width: 200px;
      height: 22px;
    }

    .skeleton-duration {
      width: 50px;
      height: 20px;
      margin-top: 5px;
      border-radius: 4px;
    }

    .skeleton-others {
      width: 100px;
      height: 18px;
      margin-top: 5px;
      border-radius: 4px;
    }
  }
}

@keyframes voice-list-skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
