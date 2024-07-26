<!-- 声音组件 -->

<template>
  <div class="voice-wrapper">
    <!-- mobile -->
    <div
      class="mobile-voice-wrapper"
      :class="{ unplayable: !ifSupportMime }"
      v-if="$store.state.inMobile"
    >
      <div
        ref="cover"
        class="cover-area"
        :class="{ 'opacity-40': authLinkAbnormal }"
        @click="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })"
      >
        <img class="cover" v-view-lazy="data.coverImages[0]" />
        <div class="offline" v-if="data.onlineStatus === 0 && statusShow"><span>已下架</span></div>
        <div class="unplayable-tip" v-if="!ifSupportMime">无法播放</div>
      </div>
      <div
        class="info-area"
        @click="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })"
      >
        <div class="title-area">
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            v-if="authLinkAbnormal"
          />
          <i
            class="freelog fl-icon-suoding lock"
            @click.stop="getAuth()"
            v-if="data.defaulterIdentityType >= 4"
          ></i>
          <template v-if="authShow">
            <div
              class="tag is-auth"
              :class="{ 'opacity-40': authLinkAbnormal }"
              v-if="data.defaulterIdentityType < 4"
            >
              已授权
            </div>
            <div class="tag not-auth" :class="{ 'opacity-40': authLinkAbnormal }" v-else>
              未授权
            </div>
          </template>
          <div class="title" :class="{ 'opacity-40': authLinkAbnormal }">
            {{ data.exhibitTitle }}
          </div>
        </div>
        <div class="duration" :class="{ 'opacity-40': authLinkAbnormal }">
          {{ data.versionInfo.exhibitProperty.duration | secondsToHMS }}
        </div>
        <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ data.updateDate | relativeTime }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ data.signCount | signCount }}</div>
          </div>
        </div>
      </div>
      <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
        <i
          class="freelog"
          :class="{ [btnList[0].icon]: true, disabled: btnList[0].disabled }"
          @click="playOrPause()"
        />
        <i class="freelog fl-icon-gengduo_yuandian_zongxiang" @click="moreMenuShow = true" />
      </div>
      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="data.coverImages[0]" />
      </div>

      <!-- 更多菜单 -->
      <transition name="fade">
        <div class="modal" @click="moreMenuShow = false" v-if="moreMenuShow"></div>
      </transition>
      <transition name="slide-up-fade">
        <div class="more-menu-card" v-if="moreMenuShow">
          <div class="btns">
            <div
              class="btn"
              :class="{ disabled: item.disabled }"
              v-for="item in menuBtnList"
              :key="item.label"
              @click="item.operate"
            >
              <i class="freelog" :class="item.icon"></i>
              <div class="label">{{ item.label }}</div>
            </div>
          </div>
          <div class="close-btn" @click="moreMenuShow = false">关闭</div>
        </div>
      </transition>
    </div>

    <!-- PC -->
    <div
      class="pc-voice-wrapper"
      :class="{ unplayable: !ifSupportMime }"
      v-if="$store.state.inMobile === false"
    >
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
      </div>
      <div class="info-area">
        <div class="title-area">
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            v-if="authLinkAbnormal"
          />
          <i
            class="freelog fl-icon-suoding lock"
            @click.stop="getAuth()"
            v-if="data.defaulterIdentityType >= 4"
          ></i>
          <template v-if="mode === 'program'">
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
          </template>
          <template v-if="authShow">
            <div
              class="tag is-auth"
              :class="{ 'opacity-40': authLinkAbnormal }"
              v-if="data.defaulterIdentityType < 4"
            >
              已授权
            </div>
            <div class="tag not-auth" :class="{ 'opacity-40': authLinkAbnormal }" v-else>
              未授权
            </div>
          </template>
          <my-tooltip
            class="title"
            :class="{ 'opacity-40': authLinkAbnormal }"
            :content="data.exhibitTitle"
          >
            <span @click="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })">
              {{ data.exhibitTitle }}
            </span>
          </my-tooltip>
        </div>
        <div class="intro" :class="{ 'opacity-40': authLinkAbnormal }">
          {{ data.exhibitIntro }}
        </div>
        <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ data.updateDate | relativeTime }}</div>
          </div>
          <div class="info-item" v-if="mode === 'program' && data.articleInfo.articleType === 2">
            <i class="freelog fl-icon-danji"></i>
            <div class="item-value">{{ data.signCount | signCount }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ data.signCount | signCount }}</div>
          </div>
          <div class="info-item" v-if="!ifSupportMime">
            <i class="freelog fl-icon-wufabofang"></i>
            <div class="item-value">无法播放</div>
          </div>
          <transition name="slide-right">
            <div
              class="info-item"
              v-if="
                $store.state.playingInfo && $store.state.playingInfo.exhibitId === data.exhibitId
              "
            >
              <play-status :playing="playing" />
              <div class="progress">
                <span>{{ ($store.state.progress * 1000) | secondsToHMS }}</span>
                <span class="progress-divider">/</span>
                <span>{{ data.versionInfo.exhibitProperty.duration | secondsToHMS }}</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
        <my-tooltip
          class="text-btn"
          :class="{ disabled: item.disabled }"
          :content="item.title"
          v-for="item in btnList"
          :key="item.title"
        >
          <i class="freelog" :class="item.icon" @click="item.operate" />
        </my-tooltip>
      </div>
      <div class="right-area">
        <div v-if="data.articleInfo.articleType === 2" class="total">共5集</div>
        <div v-else class="duration">
          {{ data.versionInfo.exhibitProperty.duration | secondsToHMS }}
        </div>
      </div>
      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="data.coverImages[0]" />
      </div>
    </div>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";

export default {
  name: "voice",

  props: {
    /** 声音信息 */
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
    /** 是否显示上线状态 */
    statusShow: {
      type: Boolean,
      default: false
    },
    /** 是否显示授权状态 */
    authShow: {
      type: Boolean,
      default: false
    },
    /** 类型：节目/声音 */
    mode: {
      type: String,
      default: "voice" // "voice" | 'program'
    }
  },

  components: {
    playStatus,
    myTooltip
  },

  data() {
    return {
      moreMenuShow: false,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      isCollected: false,
      isInPlayList: false
    };
  },

  watch: {
    "$store.state.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist(this.data.exhibitId);
      },
      immediate: true
    },
    "$store.state.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist(this.data.exhibitId);
      },
      immediate: true
    }
  },

  computed: {
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.data.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      return supportMimeList.includes(this.data.versionInfo.exhibitProperty.mime);
    },

    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.$store.state;
      return playing && playingInfo.exhibitId === this.data.exhibitId;
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
          title: this.playing ? "暂停" : "播放",
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
    },

    /** 更多菜单按钮群 */
    menuBtnList() {
      return [
        {
          icon: !this.ifSupportMime
            ? "fl-icon-wufabofang"
            : this.playing
            ? "fl-icon-zanting-daibiankuang"
            : "fl-icon-bofang-daibiankuang",
          label: !this.ifSupportMime ? "无法播放" : this.playing ? "暂停声音" : "播放声音",
          operate: this.playOrPause,
          disabled: !this.ifSupportMime
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          label: "加入播放列表",
          operate: this.addToPlayList,
          disabled: this.isInPlayList || !this.ifSupportMime
        },
        { icon: "fl-icon-danji", label: "查看声音详情", operate: this.toVoiceDetail },
        {
          icon: this.isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          label: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect
        }
      ];
    }
  },

  methods: {
    /** 查看声音详情 */
    toVoiceDetail() {
      this.$router.myPush({ path: "/detail", query: { id: this.data.exhibitId } });
    },

    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.data);
    },

    /** 加入播放列表 */
    addToPlayList() {
      useMyPlay.addToPlayList(this.data.exhibitId, () => {
        const { offsetTop, offsetLeft } = this.$refs.cover;
        this.coverLeft = offsetLeft;
        this.coverTop = offsetTop - app.scrollTop;
        if (this.$store.state.inMobile) this.moreMenuShow = false;
        this.addAnimation = true;
        setTimeout(() => {
          this.addAnimation = false;
        }, 700);
      });
    },

    /** 收藏/取消收藏 */
    async operateCollect() {
      useMyCollection.operateCollect(this.data);
    },

    /** 分享 */
    share() {
      this.$store.commit("setData", {
        key: "shareInfo",
        value: { show: true, exhibit: this.data }
      });
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.data);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/voice";
</style>
