<template>
  <div class="album-detail-wrapper">
    <!-- PC -->
    <div class="pc-album-detail-wrapper">
      <div class="cover-area">
        <img
          class="cover"
          src="https://s3.cn-north-1.amazonaws.com.cn/lcavatar/f9705206-9b7a-47ad-a2c0-88c696410a5c_160x160.png"
        />
      </div>

      <div class="right-area">
        <div class="title-area">
          <!-- <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="!data.authLinkNormal" />
          <i class="freelog fl-icon-suoding lock" @click.stop="getAuth(data.exhibitId)" v-if="!isAuth"></i> -->

          <div class="type-mark">专辑</div>

          <my-tooltip
            class="title"
            :content="'睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊'"
          >
            <span>
              {{ "睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊" }}
            </span>
          </my-tooltip>
        </div>
        <div class="intro">
          睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊
        </div>
        <div class="info-area">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ "2022-5-13 09:18:00" | relativeTime }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-danji"></i>
            <div class="item-value">{{ 5 }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ 99999999 | signCount }}</div>
          </div>
        </div>

        <div class="btns-area">
          <div
            class="btn"
            :class="index === 0 ? 'play-btn' : 'normal-btn'"
            v-for="(item, index) in btnList"
            :key="item.title"
            @click="item.operate"
          >
            <i class="freelog" :class="item.icon"></i>
            <div class="btn-label">{{ item.title }}</div>
          </div>
        </div>

        <div class="voice-title">包含声音（5）</div>
        <div class="voice-list">
          <voice v-for="item in 5" :key="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import voice from "@/components/voice";
import myTooltip from "@/components/tooltip";

export default {
  name: "album-detail",

  components: {
    voice,
    myTooltip,
  },

  data() {
    return {
      albumInfo: null,
      playing: false,
    };
  },

  computed: {
    /** 按钮群 */
    btnList() {
      return [
        {
          icon: this.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          title: this.playing ? "暂停" : "播放全部",
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

  created() {},

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
      this.$store.commit("setData", { key: "shareInfo", value: { show: true, exhibit: this.albumInfo } });
    },
  },
};
</script>

<style lang="scss" scoped>
.album-detail-wrapper {
  .pc-album-detail-wrapper {
    padding-top: 20px;
    padding-bottom: 120px;
    display: flex;

    .cover-area {
      position: relative;
      width: 210px;
      height: 210px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;

      .cover {
        height: 100%;
      }
    }

    .right-area {
      flex: 1;
      width: 0;
      margin-left: 50px;

      .title-area {
        display: flex;
        align-items: center;

        .auth-link-abnormal {
          width: 30px;
          height: 30px;
          margin-right: 20px;
        }

        .lock {
          font-size: 30px;
          color: rgba(255, 255, 255, 0.8);
          margin-right: 20px;
          cursor: pointer;
        }

        .type-mark {
          padding: 6px 15px;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          line-height: 20px;
        }

        .title {
          flex: 1;
          width: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 36px;
          font-weight: 600;
          color: #ffffff;
          line-height: 56px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-left: 20px;
        }
      }

      .intro {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.4);
        line-height: 20px;
        word-break: break-all;
        margin-top: 20px;
      }

      .info-area {
        display: flex;
        margin-top: 20px;

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
        }
      }

      .btns-area {
        margin: 30px 0;
        display: flex;

        .btn {
          padding: 0 20px;
          height: 38px;
          border-radius: 38px;
          display: flex;
          align-items: center;

          & + .btn {
            margin-left: 15px;
          }

          .freelog {
            font-size: 16px;
          }

          .btn-label {
            font-size: 14px;
            font-weight: 600;
            margin-left: 5px;
          }
        }
      }

      .voice-title {
        font-size: 20px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.6);
        line-height: 28px;
      }

      .voice-list {
        width: 100%;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 15px;
        margin-top: 15px;
        padding: 20px;
        box-sizing: border-box;

        .voice-wrapper + .voice-wrapper {
          margin-top: 25px;
        }

        :deep .voice-wrapper .info-area {
          width: 480px;
        }
      }
    }
  }
}
</style>
