<!-- 专辑 -->
<template>
  <div class="album-wrapper">
    <!-- PC -->
    <div class="pc-album-wrapper">
      <div class="cover-area" @click="$router.push({ path: '/album-detail', query: { id: '123' } })">
        <img
          class="cover"
          src="https://s3.cn-north-1.amazonaws.com.cn/lcavatar/f9705206-9b7a-47ad-a2c0-88c696410a5c_160x160.png"
        />
        <div class="btn-modal">
          <div class="btn" @click.stop="playing = !playing">
            <i class="freelog" :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"></i>
          </div>
        </div>
        <div class="play-mark">
          <play-status :playing="playing" color="#fff" />
        </div>
      </div>
      <div class="title-area">
        <!-- <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="!data.authLinkNormal" />
        <img class="lock" src="../assets/images/mini-lock.png" @click.stop="getAuth(data.exhibitId)" v-if="!isAuth" /> -->
        <my-tooltip class="title" :content="'睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊'">
          <span @click="$router.push({ path: '/album-detail', query: { id: '123' } })">
            {{ "睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊" }}
          </span>
        </my-tooltip>
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
    </div>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";

export default {
  name: "album",

  components: {
    playStatus,
    myTooltip,
  },

  data() {
    return {
      playing: false,
    };
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.album-wrapper {
  // pc
  .pc-album-wrapper {
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

      &:hover {
        .btn-modal {
          background: rgba(0, 0, 0, 0.2);

          .btn {
            opacity: 1;
          }
        }

        .play-mark {
          opacity: 0;
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
          width: 80px;
          height: 80px;
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
            font-size: 26px;
            color: #fff;
          }
        }
      }

      .play-mark {
        position: absolute;
        right: 10px;
        bottom: 10px;
        height: 24px;
        border-radius: 24px;
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(12px);
        padding: 0 10px 0 12px;
        opacity: 1;
        transition: all 0.5s ease;
        cursor: pointer;
      }
    }

    .title-area {
      display: flex;
      align-items: center;
      margin-top: 10px;

      .auth-link-abnormal,
      .lock {
        width: 16px;
        height: 16px;
        margin-right: 5px;
      }

      .title {
        flex: 1;
        width: 0;
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
        line-height: 20px;
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

    .info-area {
      display: flex;
      margin-top: 8px;

      .info-item {
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.4);

        & + .info-item {
          margin-left: 12px;
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
  }
}
</style>
