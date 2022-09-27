<!-- 声音（次级声音组件，用于专辑中的单品） -->
<template>
  <div class="second-voice-wrapper">
    <!-- PC -->
    <div class="pc-second-voice-wrapper">
      <div class="cover-area" @click="$router.myPush({ path: '/voice-detail', query: { id: '123' } })">
        <img
          class="cover"
          src="https://image.freelog.com/preview-image/1b11038db350bc3d928496cd88ea12f4b90d0576.jpg#x=106&y=0&w=1707&h=1280&width=1920&height=1280"
        />
        <div class="btn-modal">
          <div class="btn" @click.stop="playing = !playing">
            <i class="freelog" :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"></i>
          </div>
        </div>
      </div>
      <div class="info-area">
        <div class="title-area">
          <my-tooltip
            class="title"
            :content="'睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊'"
          >
            <span @click="$router.myPush({ path: '/voice-detail', query: { id: '123' } })">
              睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊
            </span>
          </my-tooltip>
        </div>
        <div class="other-area">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ "2022-5-13 09:18:00" | relativeTime }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ 99999999 | signCount }}</div>
          </div>
          <transition name="slide-right">
            <div class="info-item" v-if="playing">
              <play-status :playing="playing" />
              <div class="progress">{{ "12:02/23:12" }}</div>
            </div>
          </transition>
        </div>
      </div>
      <div class="btns-area">
        <my-tooltip
          class="text-btn"
          popperClass="voice-btn"
          placement="bottom-start"
          :visibleArrow="false"
          :content="item.title"
          v-for="item in btnList"
          :key="item.title"
        >
          <i class="freelog" :class="item.icon" @click="item.operate" />
        </my-tooltip>
      </div>
      <div class="duration">{{ "150" | secondsToHMS }}</div>
    </div>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";

export default {
  name: "second-voice",

  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  components: {
    playStatus,
    myTooltip,
  },

  data() {
    return {
      playing: false,
    };
  },

  computed: {
    /** 按钮群 */
    btnList() {
      return [
        {
          icon: this.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          title: this.playing ? "暂停" : "播放",
          operate: this.playOrPause,
        },
        { icon: "fl-icon-jiarubofangliebiao", title: "加入播放列表", operate: this.addToPlayList },
        {
          icon: this.playing ? "fl-icon-shoucangxiaoshuoyishoucang" : "fl-icon-shoucangxiaoshuo",
          title: this.playing ? "取消收藏" : "收藏",
          operate: this.collect,
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share },
      ];
    },
  },

  methods: {
    /** 播放/暂停 */
    playOrPause() {
      this.playing = !this.playing;
    },

    /** 加入播放列表 */
    addToPlayList() {
      console.error("addToPlayList");
    },

    /** 收藏/取消收藏 */
    collect() {
      console.error("collect");
    },

    /** 分享 */
    share() {
      this.$store.commit("setData", { key: "shareInfo", value: { show: true, exhibit: this.data } });
    },
  },
};
</script>

<style lang="scss" scoped>
.second-voice-wrapper {
  // pc
  .pc-second-voice-wrapper {
    display: flex;
    align-items: center;

    &:hover {
      .btns-area {
        opacity: 1;
      }
    }

    .cover-area {
      position: relative;
      width: 50px;
      height: 50px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;

      &:hover {
        .btn-modal {
          background: rgba(0, 0, 0, 0.2);

          .btn {
            opacity: 1;
          }
        }
      }

      .cover {
        height: 100%;
      }

      .btn-modal {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.5s ease;

        .btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(1px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.5s ease;

          &:hover {
            background: #2784ff;
          }

          &:active {
            background: rgba(255, 255, 255, 0.4);
          }

          .freelog {
            font-size: 10px;
            color: #fff;
            margin-left: 5px;
          }
        }
      }
    }

    .info-area {
      width: 600px;
      height: 100%;
      margin-left: 10px;

      .title-area {
        width: 100%;
        display: flex;
        align-items: center;

        .title {
          flex: 1;
          width: 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          line-height: 22px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            color: #fff;
            text-decoration: underline;
          }
        }
      }

      .other-area {
        display: flex;
        margin-top: 10px;

        .info-item {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.4);

          & + .info-item {
            margin-left: 20px;
          }

          .freelog {
            font-size: 14px;
          }

          .item-value {
            font-size: 12px;
            line-height: 18px;
            margin-left: 5px;
          }

          .progress {
            font-size: 12px;
            color: #2784ff;
            line-height: 18px;
            margin-left: 10px;
          }
        }
      }
    }

    .btns-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.5s ease;

      .text-btn {
        .freelog {
          font-size: 20px;
        }

        & + .text-btn {
          margin-left: 24px;
        }
      }
    }

    .duration {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      flex-shrink: 0;
    }
  }
}
</style>
