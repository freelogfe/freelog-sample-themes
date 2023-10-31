<!-- 播放状态（动画图标与描述） -->

<template>
  <div class="play-status" :style="{ '--color': color }">
    <div class="play-icon-wrapper">
      <div
        class="line"
        :class="{ play: playing, short: item % 2, long: item % 2 === 0 }"
        v-for="item in 4"
        :key="item"
      ></div>
    </div>
    <div class="play-text">
      <span v-if="desc">{{ desc }}</span>
      <span v-else>{{ playing ? "正在播放" : "已暂停" }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "play-status",

  props: {
    /** 是否播放中 */
    playing: {
      type: Boolean,
      default: false,
    },
    /** 描述文本 */
    desc: {
      type: String,
    },
    /** 颜色 */
    color: {
      type: String,
      default: "#2784FF",
    },
  },
};
</script>

<style lang="scss" scoped>
.play-status {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  .play-icon-wrapper {
    width: 13px;
    height: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    .line {
      width: 1px;
      background-color: var(--color);

      &.play {
        animation: play 0.5s ease infinite;

        &.short {
          animation-direction: alternate;
        }

        &.long {
          animation-direction: alternate-reverse;
        }
      }
    }

    .short {
      height: 7px;
    }

    .long {
      height: 12px;
    }
  }

  .play-text {
    font-size: 12px;
    color: var(--color);
    line-height: 18px;
    margin-left: 6px;
  }
}

@keyframes play {
  from {
    height: 7px;
  }
  to {
    height: 12px;
  }
}
</style>
