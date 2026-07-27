<template>
  <div class="album-play-list-skeleton" :class="{ mobile: store.inMobile }">
    <div class="album-drop-wrapper">
      <div class="selected-box">
        <div class="txt">最新发布</div>
        <div class="drop-trigger">
          <div class="triangle"></div>
        </div>
      </div>
    </div>

    <div class="skeleton-grid" v-if="!store.inMobile">
      <div class="skeleton-card" v-for="item in 5" :key="item">
        <div class="skeleton-block skeleton-cover"></div>
        <div class="skeleton-info">
          <div class="skeleton-block skeleton-title"></div>
          <div class="skeleton-block skeleton-sub sub-1"></div>
          <div class="skeleton-block skeleton-sub sub-2"></div>
        </div>
      </div>
    </div>

    <div class="skeleton-list" v-else>
      <div class="skeleton-row" v-for="item in 4" :key="item">
        <div class="skeleton-block skeleton-cover"></div>
        <div class="skeleton-info">
          <div class="skeleton-block skeleton-title"></div>
          <div class="skeleton-block skeleton-sub sub-1"></div>
          <div class="skeleton-block skeleton-sub sub-2"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGlobalStore } from "@/store/global";

export default {
  name: "album-play-list-skeleton",

  data() {
    const store = useGlobalStore();

    return {
      store
    };
  }
};
</script>

<style lang="less" scoped>
.album-play-list-skeleton {
  width: 100%;

  .album-drop-wrapper {
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

  .skeleton-block {
    background: linear-gradient(
        90deg,
        var(--text-first-color) 25%,
        var(--text-point-fifth-color) 37%,
        var(--text-first-color) 63%
      )
      0% 0% / 400% 100%;
    animation: album-play-list-skeleton-loading 1.4s ease infinite;
  }

  .skeleton-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
    padding-bottom: 120px;
  }

  .skeleton-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 224px;
    flex-shrink: 0;
  }

  .skeleton-cover {
    width: 224px;
    height: 224px;
    border-radius: 10px;
    flex-shrink: 0;
  }

  .skeleton-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }

  .skeleton-title {
    width: 100%;
    height: 20px;
    border-radius: 4px;
  }

  .skeleton-sub {
    border-radius: 4px;

    &.sub-1 {
      width: 150px;
      height: 18px;
    }

    &.sub-2 {
      width: 80px;
      height: 18px;
    }
  }

  &.mobile {
    .album-drop-wrapper {
      margin: 20px 0;
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .skeleton-row {
      display: flex;
      align-items: flex-start;
    }

    .skeleton-cover {
      width: 62px;
      height: 62px;
      border-radius: 10px;
      margin-right: 10px;
    }

    .skeleton-info {
      flex: 1;
      min-width: 0;
      margin-top: 0;
    }

    .skeleton-title {
      width: 200px;
      height: 22px;
    }

    .skeleton-sub.sub-1 {
      width: 150px;
    }

    .skeleton-sub.sub-2 {
      width: 80px;
    }
  }
}

@keyframes album-play-list-skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
