<template>
  <div class="program-wrapper">
    <!-- pc -->
    <div class="pc-program-wrapper" :class="{ 'unplayable': !ifSupportMime }">
      <!-- 封面 -->
      <div
        ref="cover"
        class="cover-area"
        :class="{ 'opacity-40': authLinkAbnormal }"
        @click="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })"
      >
        <img class="cover" :src="data.coverImages[0]" />
        <div class="offline" v-if="data.onlineStatus === 0 && statusShow"><span>已下架</span></div>
        <div class="btn-modal" v-if="ifSupportMime">
          <div class="btn" @click.stop="playOrPause()">
            <i
              class="freelog"
              :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
            ></i>
          </div>
        </div>
        <div
          class="play-status-wrapper"
          v-if="$store.state.playingInfo && $store.state.playingInfo.exhibitId === data.exhibitId"
        >
          <play-status :playing="playing" />
        </div>
      </div>
      <!-- 中间 -->
      <div class="title">
        <i
          class="freelog fl-icon-suoding lock"
          :class="{ 'opacity-40': authLinkAbnormal }"
          @click.stop="getAuth()"
          v-if="data.defaulterIdentityType >= 4"
        ></i>
        <img
          class="auth-link-abnormal"
          src="../assets/images/auth-link-abnormal.png"
          v-if="authLinkAbnormal"
        />
        <div
          v-if="data.articleInfo.articleType === 1"
          class="single freelog fl-icon-bokebiaoqian_danji"
          :class="{ 'opacity-40': authLinkAbnormal }"
        ></div>
        
        <div v-else class="multiple" :class="{ 'opacity-40': authLinkAbnormal }">
          <span
            class="ing freelog fl-icon-bokebiaoqian_lianzaizhong"
            v-if="data.articleInfo.serializeStatus === 0"
          ></span>
          <span class="end freelog fl-icon-bokebiaoqian_yiwanjie" v-else></span>
        </div>
        <div class="title-txt" :class="{ 'opacity-40': authLinkAbnormal }" @click="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })">
          {{ data.exhibitTitle }}
        </div>
      </div>
      <!-- 尾部 -->
      <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
        <div class="info-item">
          <i class="freelog fl-icon-gengxinshijian"></i>
          <div class="item-value">{{ data.updateDate | relativeTime }}</div>
        </div>
        <div class="info-item" v-if="data.articleInfo && data.articleInfo.articleType === 2">
          <i class="freelog fl-icon-danji"></i>
          <div class="item-value">{{ data.totalItem || 0 }}</div>
        </div>
        <div class="info-item">
          <i class="freelog fl-icon-yonghu"></i>
          <div class="item-value">{{ data.signCount | signCount }}</div>
        </div>
      </div>
    </div>
    <!-- mobile -->
  </div>
</template>

<script>
import { freelogApp } from "freelog-runtime";
import { useMyPlay, useMyAuth } from "@/utils/hooks";
import playStatus from "@/components/play-status";
import { supportAudio, unSupportAudioIOS } from "@/api/data"

export default {
  name: "program",
  components: {
    playStatus
  },
  props: {
    /** 声音信息 */
    data: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      collectionList: []
    };
  },
  computed: {
    ifSupportMime() {
      const supportMimeList = supportAudio;
      const isIOS = this.$store.state.isIOS

      if (this.data.articleInfo.articleType === 2) {
        return this.data.articleInfo.resourceType[0] === '音频'
      } else {
        const mime = this.data.versionInfo.exhibitProperty.mime
        if (isIOS) {
          return supportMimeList.includes(mime) && !unSupportAudioIOS.includes(mime)
        }
        return supportMimeList.includes(mime);
      }
    },
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.data.defaulterIdentityType);
    },
    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.$store.state;
      return playing && playingInfo && playingInfo.exhibitId === this.data.exhibitId;
    }
  },
  watch: {
    data: {
      handler(newData) {
        if (newData.articleInfo.articleType === 2) {
          this.getListInCollection(newData.exhibitId);
        }
      },
      immediate: true
    }
  },
  created() {},
  activated() {},
  deactivated() {},
  methods: {
    /** 播放/暂停 */
    async playOrPause() {
      if (this.data.articleInfo.articleType === 1) {
        useMyPlay.playOrPause(this.data);
      } else {
        useMyPlay.playOrPause(this.data, "pool");
      }
    },
    /** 获取某个合集里的列表 */
    async getListInCollection(exhibitId) {
      const res = await freelogApp.getCollectionSubList(exhibitId, {
        skip: 0,
        limit: 5,
        isShowDetailInfo: 0
      });
      if (res.data.errCode === 0) {
        this.collectionList = res.data.data.dataList;
      } else {
        console.warn(res.data);
      }
    },
    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.data);
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.program-wrapper {
  .pc-program-wrapper {

    &.unplayable {
      .cover-area,
      .title,
      .other-area {
        opacity: 0.4;
      }
    }

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
      transition: all 0.5s ease;
      z-index: 1;

      &:hover {
        opacity: 1;

        .btn-modal {
          background: rgba(0, 0, 0, 0.2);

          .btn {
            opacity: 1;
          }
        }

        div[playing="true"] {
          display: none;
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

            &.fl-icon-bofang-sanjiaoxing {
              margin-left: 5px;
            }

            &.fl-icon-zanting {
              margin-left: 2px;
            }
          }
        }
      }

      .play-status-wrapper {
        position: absolute;
        right: 20px;
        bottom: 13px;
      }
    }
    .title {
      display: flex;
      margin: 10px 0px;
      align-items: center;
      height: 20px;
      width: 210px;
      .auth-link-abnormal {
        width: 16px;
        height: 16px;
        margin-right: 5px;
      }
      .single {
        opacity: 0.32;
        font-size: 18px;
        color: #fff;
      }
      .multiple {
        display: flex;
        align-items: center;
        .ing {
          font-size: 18px;
          color: #42c28c;
        }
        .end {
          font-size: 18px;
          color: #e9a923;
        }
      }
      .title-txt {
        height: 20px;
        font-weight: 600;
        font-size: 14px;
        color: #ffffff;
        line-height: 20px;
        text-align: left;
        cursor: pointer;
        opacity: 0.8;
        margin-left: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        &:hover {
          text-decoration: underline;
          opacity: 1;
        }
      }
      .lock {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
        margin-right: 5px;
        cursor: pointer;
      }
    }
    .other-area {
      display: flex;
      margin-top: 10px;
      width: 210px;
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

          .progress-divider {
            margin: 0 2px;
          }
        }
      }
    }
  }
}
</style>
