<!-- 专辑（次级专辑组件，用于收藏列表、签约列表） -->
<template>
  <div class="second-album-wrapper">
    <!-- PC -->
    <div class="pc-second-album-wrapper">
      <div class="cover-area" @click="$router.push({ path: '/album-detail', query: { id: '123' } })">
        <img
          class="cover"
          src="https://image.freelog.com/preview-image/1b11038db350bc3d928496cd88ea12f4b90d0576.jpg#x=106&y=0&w=1707&h=1280&width=1920&height=1280"
        />
        <div class="offline" v-if="data.onlineStatus === 0"><span>已下架</span></div>
        <div class="btn-modal">
          <div class="btn" @click.stop="playing = !playing">
            <i class="freelog" :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"></i>
          </div>
        </div>
      </div>
      <div class="info-area">
        <div class="title-area">
          <!-- <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="!data.authLinkNormal" />
        <img class="lock" src="../assets/images/mini-lock.png" @click.stop="getAuth(data.exhibitId)" v-if="!isAuth" /> -->
          <div class="tag is-auth" v-if="[200, 301].includes(data.authCode)">已授权</div>
          <div class="tag not-auth" v-if="data.authCode === 303">未授权</div>
          <div class="type-mark">专辑</div>
          <my-tooltip
            class="title"
            :content="'睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊'"
          >
            <span @click="$router.push({ path: '/album-detail', query: { id: '123' } })">
              {{
                "睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊"
              }}
            </span>
          </my-tooltip>
        </div>
        <my-tooltip
          class="intro"
          :content="'对无常的理解能给我们带来一份慰藉，因为即使再痛苦、孤独、彷徨、与绝望，任何感受与处境都不是恒定不变的，疫情下的变化也是如此，这一切都终将过去。对无常的理解能给我们带来一份慰藉，因为即使再痛苦、孤独、彷徨、与绝望，任何感受与处境都不是恒定不变的，疫情下的变化也是如此，这一切都终将过去。'"
        >
          <span>
            {{
              "对无常的理解能给我们带来一份慰藉，因为即使再痛苦、孤独、彷徨、与绝望，任何感受与处境都不是恒定不变的，疫情下的变化也是如此，这一切都终将过去。对无常的理解能给我们带来一份慰藉，因为即使再痛苦、孤独、彷徨、与绝望，任何感受与处境都不是恒定不变的，疫情下的变化也是如此，这一切都终将过去。"
            }}
          </span>
        </my-tooltip>
        <div class="other-area">
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
        <div class="voice-list">
          <second-voice v-for="item in 3" :key="item" />
          <div class="view-all">
            <div class="text-btn" @click="$router.push('/album-detail')">查看全部（12）</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import secondVoice from "@/components/second-voice";
import myTooltip from "@/components/tooltip";

export default {
  name: "second-album",

  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  components: {
    secondVoice,
    myTooltip,
  },

  data() {
    return {
      playing: false,
    };
  },

  computed: {
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

  methods: {
    // 播放/暂停
    playOrPause() {
      this.playing = !this.playing;
    },

    // 加入播放列表
    addToPlayList() {
      console.error("addToPlayList");
    },

    // 收藏/取消收藏
    collect() {
      console.error("collect");
    },

    // 分享
    share() {
      this.$store.commit("setData", { key: "shareInfo", value: { show: true, exhibit: this.data } });
    },
  },
};
</script>

<style lang="scss" scoped>
.second-album-wrapper {
  // pc
  .pc-second-album-wrapper {
    display: flex;

    .cover-area {
      position: relative;
      width: 100px;
      height: 100px;
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

      .offline {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 0px 0px 4px 0px;
        display: flex;
        align-items: center;
        justify-content: center;

        span {
          font-size: 10px;
          font-weight: 600;
          color: #ffffff;
          transform: scale(0.84);
        }
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
          width: 50px;
          height: 50px;
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
            font-size: 18px;
            color: #fff;
          }
        }
      }
    }

    .info-area {
      flex: 1;
      margin-left: 20px;

      .title-area {
        width: 100%;
        display: flex;
        align-items: center;

        .auth-link-abnormal,
        .lock {
          width: 16px;
          height: 16px;
          margin-right: 10px;
        }

        .tag {
          flex-shrink: 0;
          width: 56px;
          height: 22px;
          border-radius: 22px;
          margin-right: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;

          &.is-auth {
            background: #42c28c;
          }

          &.not-auth {
            background: #e9a923;
          }
        }

        .type-mark {
          padding: 2px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          line-height: 18px;
          margin-right: 5px;
        }

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

      .intro {
        width: 100%;
        height: 40px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.4);
        line-height: 20px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-top: 10px;
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
            font-size: 16px;
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

      .btns-area {
        margin: 15px 0;
        display: flex;

        .btn {
          padding: 0 15px;
          height: 32px;
          border-radius: 32px;
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

      .voice-list {
        width: 100%;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 15px;
        padding: 20px;
        box-sizing: border-box;

        .second-voice-wrapper + .second-voice-wrapper {
          margin-top: 15px;
        }

        .view-all {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;

          .text-btn {
            font-size: 14px;
            line-height: 20px;
          }
        }
      }
    }
  }
}
</style>
