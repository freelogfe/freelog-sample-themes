<!-- 音乐、专辑详情页 -->
<template>
  <div class="detail-wrapper">
    <!-- <transition name="detail-fade"> -->
    <!-- <template v-if="voiceInfo"> -->
    <!-- mobile -->
    <div class="mobile-detail-wrapper" v-if="store.inMobile">
      <div ref="cover" class="cover-area">
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
      </div>
      <div class="title-area">
        <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
        <i
          class="freelog fl-icon-suoding lock"
          @click.stop="getAuth()"
          v-if="voiceInfo?.defaulterIdentityType >= 4"
        ></i>
        <my-tooltip class="title" :content="voiceInfo?.exhibitTitle">
          <span>{{ voiceInfo?.exhibitTitle }}</span>
        </my-tooltip>
      </div>

      <div class="info-area">
        <div class="info-item">
          <i class="freelog fl-icon-gengxinshijian"></i>
          <div class="item-value">{{ voiceInfo?.updateDate }}</div>
        </div>
        <div class="info-item">
          <i class="freelog fl-icon-yonghu"></i>
          <div class="item-value">{{ voiceInfo?.signCount }}</div>
        </div>
        <div class="duration" v-if="voiceInfo.articleInfo?.articleType === 1">
          时长{{ relativeTime(voiceInfo?.versionInfo.exhibitProperty.duration) }}
        </div>
      </div>

      <div class="play-voice-btn" :class="{ disabled: btnList[0].disabled }" @click="playOrPause()">
        <i class="freelog" :class="btnList[0].icon"></i>
        <div class="label">{{ btnList[0].title }}</div>
      </div>
      <div class="btns-area">
        <template v-for="item in btnList.filter((_, i) => [1, 2, 3].includes(i))">
          <div class="btn" :class="{ disabled: item.disabled }" @click="item.operate">
            <i class="freelog" :class="item.icon"></i>
            <div class="btn-label">{{ item.title }}</div>
          </div>
        </template>
        <input id="href" class="hidden-input" :value="href" readOnly />
      </div>
      <div class="intro">{{ voiceInfo?.exhibitIntro }}</div>
      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
      </div>
    </div>

    <!-- PC -->
    <div class="pc-detail-wrapper" v-if="!store.inMobile">
      <div ref="cover" class="cover-area">
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
      </div>

      <div class="right-area">
        <div class="title-area">
          <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
          <i
            class="freelog fl-icon-suoding lock"
            @click.stop="getAuth()"
            v-if="voiceInfo?.defaulterIdentityType >= 4"
          ></i>

          <my-tooltip :content="voiceInfo?.exhibitTitle">
            <span class="title">{{ voiceInfo?.exhibitTitle }}</span>
          </my-tooltip>
        </div>

        <div class="info-area">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ relativeTime(voiceInfo?.updateDate) }}</div>
          </div>
          <div class="info-item">
            <div class="item-value">{{}}收录于专辑</div>
            <div class="item-album">{{ "XXX" }}</div>
          </div>
        </div>

        <div class="info-detail">
          <div class="detail-item">
            <span class="name">专辑:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">歌手:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">语言:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">唱片公司:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">唱片类型:</span>
            <span class="value">XXX</span>
          </div>
        </div>

        <div class="intro">{{ voiceInfo?.exhibitIntro }}</div>

        <div class="btns-area">
          <template v-if="playingInfo">
            <div
              class="duration"
              v-if="
                voiceInfo.articleInfo?.articleType === 1 &&
                playingInfo.exhibitId !== voiceInfo?.exhibitId
              "
            >
              时长{{ secondsToHMS(voiceInfo?.versionInfo.exhibitProperty.duration) }}
            </div>
            <transition name="slide-right">
              <div class="playing-mark" v-if="playingInfo.exhibitId === voiceInfo?.exhibitId">
                <play-status :playing="store.playing" />
                <div class="progress">
                  <span>{{ secondsToHMS(store.progress * 1000) }}</span>
                  <span class="progress-divider">/</span>
                  <span>{{ secondsToHMS(voiceInfo.versionInfo.exhibitProperty.duration) }}</span>
                </div>
              </div>
            </transition>
          </template>
          <template v-for="(item, index) in btnList">
            <div
              class="btn normal-btn"
              :class="{ 'play-btn': index === 0, disabled: item.disabled }"
              :key="item.title"
              @click="item.operate"
              v-if="!item.hidden"
            >
              <i class="freelog" :class="item.icon"></i>
              <div class="btn-label">{{ item.title }}</div>
            </div>
          </template>
        </div>

        <div class="album-content" v-if="voiceInfo?.articleInfo.articleType === 2">
          <div class="title">包含音乐（5）</div>
          <div class="content-item-wrap">
            <div class="content-item" v-for="(item, index) in [1, 2, 3, 4, 5]" :key="index">
              <div class="index">{{ index }}</div>
              <div class="music">Music</div>
              <div class="singer">Singer</div>
              <div class="time">时间</div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
      </div>
    </div>
  </div>
  <!-- </template> -->
  <!-- </transition> -->
</template>

<script>
import { freelogApp } from "freelog-runtime";
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { showToast, relativeTime, secondsToHMS } from "@/utils/common";
import { useGlobalStore } from "@/store/global";

import AuthLinkAbnormalIcon from "@/assets/images/auth-link-abnormal.png";

export default {
  name: "detail",

  components: { playStatus, myTooltip },

  data() {
    const store = useGlobalStore();

    return {
      AuthLinkAbnormalIcon,
      id: "",
      voiceInfo: null,
      isCollected: false,
      isInPlayList: false,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      href: "",
      store,
      relativeTime,
      secondsToHMS
    };
  },

  watch: {
    "$route.query.id": {
      handler(cur) {
        if (!cur) return;
        const app = document.getElementById("app");
        app.scroll({ top: 0 });
        this.id = cur;
        this.getVoiceInfo();
      },
      immediate: true
    },

    "store.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist(this.id);
      },
      immediate: true
    },

    "store.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist(this.id);
      },
      immediate: true
    },

    "store.authIdList"(cur) {
      if (cur.includes(this.voiceInfo.exhibitId)) this.voiceInfo.defaulterIdentityType = 0;
    }
  },

  computed: {
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.voiceInfo?.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      return supportMimeList.includes(this.voiceInfo?.versionInfo.exhibitProperty.mime);
    },

    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.store;
      return playing && playingInfo.exhibitId === this.voiceInfo.exhibitId;
    },

    /** 播放中声音信息 */
    playingInfo() {
      return this.store.playingInfo;
    },

    /** 操作按钮群 */
    btnList() {
      return [
        {
          icon: !this.ifSupportMime
            ? "fl-icon-wufabofang"
            : this.playing
            ? "fl-icon-zanting-daibiankuang"
            : "fl-icon-bofang-daibiankuang",
          title: !this.ifSupportMime ? "无法播放" : this.playing ? "暂停" : "播放",
          operate: this.playOrPause,
          disabled: !this.ifSupportMime
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: this.addToPlayList,
          disabled: this.isInPlayList || !this.ifSupportMime
        },
        {
          icon: this.isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          title: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share }
      ];
    }
  },

  methods: {
    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.voiceInfo);
    },

    /** 加入播放列表 */
    addToPlayList() {
      useMyPlay.addToPlayList(this.id);
    },

    /** 收藏/取消收藏 */
    operateCollect() {
      useMyCollection.operateCollect(this.voiceInfo);
    },

    /** 分享 */
    share() {
      if (this.store.inMobile) {
        const input = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: this.voiceInfo?.exhibitId } });
      } else {
        this.store.setData({
          key: "shareInfo",
          value: { show: true, exhibit: this.voiceInfo }
        });
      }
    },

    /** 获取声音详情 */
    async getVoiceInfo() {
      this.voiceInfo = null;
      const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
        freelogApp.getExhibitInfo(this.id, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitSignCount(this.id),
        freelogApp.getExhibitAuthStatus(this.id)
      ]);
      this.voiceInfo = {
        ...exhibitInfo.data.data,
        signCount: signCountData.data.data[0].count,
        defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType
      };
      this.href = freelogApp.getCurrentUrl();
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/css/detail.less";
</style>
