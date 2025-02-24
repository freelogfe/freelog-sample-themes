<!-- 音乐组件 -->
<template>
  <div class="voice-wrapper">
    <!-- mobile -->
    <div
      class="mobile-voice-wrapper"
      :class="{
        unplayable:
          !ifSupportMime ||
          authLinkAbnormal ||
          data.onlineStatus === 0 ||
          data.articleInfo.status === 2
      }"
      v-if="store.inMobile"
      @click.stop="
        !(
          !ifSupportMime ||
          authLinkAbnormal ||
          data.onlineStatus === 0 ||
          data.articleInfo.status === 2
        ) && playOrPause()
      "
    >
      <div
        ref="cover"
        class="cover-area"
        :class="{
          'opacity-40': authLinkAbnormal || data.onlineStatus === 0 || data.articleInfo.status === 2
        }"
      >
        <img class="cover" :src="data.coverImages[0]" />
        <div class="offline" v-if="data.onlineStatus === 0 && statusShow"><span>已下架</span></div>
        <div
          class="unplayable-tip"
          v-if="
            !ifSupportMime ||
            authLinkAbnormal ||
            data.onlineStatus === 0 ||
            data.articleInfo.status === 2
          "
        >
          无法播放
        </div>
        <!-- 播放中标识 -->
        <play-status
          class="cover-status"
          :playing="playing"
          :statusText="false"
          v-if="
            playingInfo &&
            `${playingInfo.exhibitId}${playingInfo.itemId ?? ''}` ===
              `${data.exhibitId}${data.itemId ?? ''}`
          "
        />
      </div>
      <div class="info-area">
        <div class="title-area">
          <img
            class="freeze-lock"
            src="../assets/images/freeze.png"
            alt="封禁"
            v-if="data?.articleInfo?.status === 2"
          />
          <div class="offline" v-else-if="data.onlineStatus === 0 && statusShow">
            <span>已下架</span>
          </div>
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            alt="授权链异常"
            v-else-if="authLinkAbnormal"
          />
          <i
            class="freelog fl-icon-suoding lock"
            @click.stop="getAuth()"
            alt="未授权"
            v-if="data.defaulterIdentityType >= 4"
          ></i>
          <!-- <template v-if="authShow">
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
          </template> -->
          <div class="title" :class="{ 'opacity-40': authLinkAbnormal }">
            {{ data.itemTitle || data.exhibitTitle }}
          </div>
        </div>
        <div class="duration" :class="{ 'opacity-40': authLinkAbnormal }">
          {{ data.versionInfo.exhibitProperty.display_artist }}
        </div>
        <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ absoluteTime(data.updateDate) }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-danji"></i>
            <div class="item-value">{{ data.signCount }}</div>
          </div>
        </div>
      </div>
      <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
        <span class="time">{{ secondsToHMS(data.versionInfo?.exhibitProperty?.duration) }}</span>
        <i class="freelog fl-icon-gengduo_yuandian_zongxiang" @click.stop="moreMenuShow = true" />
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
        <div class="modal" @click.stop="moreMenuShow = false" v-if="moreMenuShow"></div>
      </transition>
      <transition name="slide-up-fade">
        <div class="more-menu-card" v-if="moreMenuShow">
          <div class="btns">
            <div
              class="btn"
              :class="{ disabled: item.disabled }"
              v-for="item in menuBtnList"
              :key="item.label"
              @click.stop="item.operate"
            >
              <i class="freelog" :class="item.icon"></i>
              <div class="label">{{ item.label }}</div>
            </div>
          </div>
          <div class="close-btn" @click.stop="moreMenuShow = false">关闭</div>
        </div>
      </transition>
    </div>

    <!-- PC -->
    <div
      class="pc-voice-wrapper"
      :class="{
        unplayable:
          !ifSupportMime ||
          authLinkAbnormal ||
          data.onlineStatus === 0 ||
          data.articleInfo.status === 2
      }"
      :title="
        !ifSupportMime ||
        authLinkAbnormal ||
        data.onlineStatus === 0 ||
        data.articleInfo.status === 2
          ? '无法播放'
          : ''
      "
      v-if="store.inMobile === false"
    >
      <div class="left-box">
        <div
          ref="cover"
          class="cover-area"
          :class="{
            'opacity-40':
              authLinkAbnormal || data.onlineStatus === 0 || data.articleInfo.status === 2
          }"
          @click="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })"
        >
          <img class="cover" :src="data.coverImages[0]" />

          <div class="btn-modal" v-if="ifSupportMime">
            <div class="btn" @click.stop="playOrPause()">
              <i
                class="freelog"
                :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
              ></i>
            </div>
          </div>
          <!-- 播放中标识 -->
          <play-status
            class="cover-status"
            :playing="playing"
            :statusText="false"
            v-if="
              playingInfo &&
              `${playingInfo.exhibitId}${playingInfo.itemId ?? ''}` ===
                `${data.exhibitId}${data.itemId ?? ''}`
            "
          />
        </div>
        <div
          class="info-area"
          :class="!data.versionInfo.exhibitProperty.display_artist && 'flex-justify-center'"
        >
          <div class="title-area">
            <img
              class="freeze-lock"
              src="../assets/images/freeze.png"
              alt="封禁"
              v-if="data?.articleInfo?.status === 2"
            />
            <div class="offline" v-else-if="data.onlineStatus === 0 && statusShow">
              <span>已下架</span>
            </div>
            <img
              class="auth-link-abnormal"
              src="../assets/images/auth-link-abnormal.png"
              alt="授权链异常"
              v-else-if="authLinkAbnormal"
            />
            <i
              class="freelog fl-icon-suoding lock"
              @click.stop="getAuth()"
              alt="未授权"
              v-if="data.defaulterIdentityType >= 4"
            ></i>

            <myTooltip :content="data.exhibitTitle">
              <span
                class="title"
                :class="{ 'opacity-40': authLinkAbnormal }"
                @click="
                  $router.myPush({
                    path: '/detail',
                    query: { id: data.exhibitId, subID: data.itemId, albumName: data.albumName }
                  })
                "
              >
                {{ data.itemTitle || data.exhibitTitle }}
              </span>
            </myTooltip>
          </div>
          <div class="intro" :class="{ 'opacity-40': authLinkAbnormal }">
            {{ data.versionInfo.exhibitProperty.display_artist }}
          </div>
        </div>
        <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
          <myTooltip :content="item.title" v-for="item in btnList" :key="item.title">
            <i
              class="freelog text-btn"
              :class="[item.icon, { disabled: item.disabled }]"
              @click="item.operate"
            />
          </myTooltip>
        </div>
      </div>
      <div
        class="middle-box"
        :class="data.albumName && 'album'"
        @click="
          data.albumName && $router.myPush({ path: '/detail', query: { id: data.exhibitId } })
        "
      >
        {{ data.albumName || "-" }}
      </div>
      <div class="right-box">
        <play-status
          class="duration"
          style="opacity: 1"
          :playing="store.playing"
          :desc="`${secondsToHMS(store.progress * 1000)} / ${secondsToHMS(
            playingInfo.versionInfo.exhibitProperty.duration
          )}`"
          v-if="
            playingInfo &&
            `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ''}` ===
              `${data?.exhibitId}${data?.itemId ?? ''}`
          "
        />
        <div class="duration" v-else>
          {{ secondsToHMS(data.versionInfo?.exhibitProperty?.duration) }}
        </div>
      </div>

      <!-- <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="data.coverImages[0]" />
      </div> -->
    </div>
  </div>
</template>

<script>
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { secondsToHMS, absoluteTime } from "@/utils/common";
import { useGlobalStore } from "@/store/global";

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
    }
  },

  components: {
    playStatus,
    myTooltip
  },

  data() {
    const store = useGlobalStore();

    return {
      moreMenuShow: false,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      isCollected: false,
      isInPlayList: false,
      store,
      secondsToHMS,
      absoluteTime
    };
  },

  watch: {
    "store.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist({
          exhibitId: this.data.exhibitId,
          itemId: this.data.itemId
        });
      },
      immediate: true
    },
    "store.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist({
          exhibitId: this.data.exhibitId,
          itemId: this.data.itemId
        });
      },
      immediate: true,
      deep: true
    }
  },

  computed: {
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.data.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      const supportMimeList = [
        "audio/mp4",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/webm",
        "audio/flac"
      ];
      return supportMimeList.includes(this.data.versionInfo?.exhibitProperty?.mime);
    },

    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.store;
      const playingId = `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ""}`;
      const exhibit = `${this.data.exhibitId}${this.data.itemId ?? ""}`;
      return playing && playingId === exhibit;
    },

    /** 播放中声音信息 */
    playingInfo() {
      return this.store.playingInfo;
    },

    /** 操作按钮群 */
    btnList() {
      return [
        {
          icon:
            !this.ifSupportMime ||
            this.authLinkAbnormal ||
            this.data.onlineStatus === 0 ||
            this.data.articleInfo.status === 2
              ? "fl-icon-wufabofang"
              : this.playing
              ? "fl-icon-zanting-daibiankuang"
              : "fl-icon-bofang-daibiankuang",
          title:
            !this.ifSupportMime ||
            this.authLinkAbnormal ||
            this.data.onlineStatus === 0 ||
            this.data.articleInfo.status === 2
              ? "无法播放"
              : this.playing
              ? "暂停"
              : "播放",
          operate: this.playOrPause,
          disabled:
            !this.ifSupportMime ||
            this.data.onlineStatus === 0 ||
            this.data.articleInfo.status === 2
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
          icon:
            !this.ifSupportMime ||
            this.data.onlineStatus === 0 ||
            this.data.articleInfo.status === 2
              ? "fl-icon-wufabofang"
              : this.playing
              ? "fl-icon-zanting-daibiankuang"
              : "fl-icon-bofang-daibiankuang",
          label: !this.ifSupportMime ? "无法播放" : this.playing ? "暂停音乐" : "播放音乐",
          operate: this.playOrPause,
          disabled:
            !this.ifSupportMime ||
            this.data.onlineStatus === 0 ||
            this.data.articleInfo.status === 2
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          label: "加入播放列表",
          operate: this.addToPlayList,
          disabled: this.isInPlayList || !this.ifSupportMime
        },
        { icon: "fl-icon-danji", label: "查看音乐详情", operate: this.toVoiceDetail },
        this.data?.itemId
          ? {
              icon: "fl-icon-zhuanji",
              label: "查看专辑",
              operate: this.toAlbumDetail
            }
          : null,
        {
          icon: this.isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          label: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect
        }
      ].filter(Boolean);
    }
  },

  methods: {
    /** 查看声音详情 */
    toVoiceDetail() {
      const { exhibitId, itemId, albumName } = this.data;

      if (itemId) {
        this.$router.myPush({
          path: "/detail",
          query: { id: exhibitId, subID: itemId, albumName }
        });
      } else {
        this.$router.myPush({ path: "/detail", query: { id: exhibitId } });
      }
    },

    /** 查看专辑详情 */
    toAlbumDetail() {
      this.$router.myPush({ path: "/detail", query: { id: this.data.exhibitId } });
    },

    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.data);
    },

    /** 加入播放列表 */
    addToPlayList() {
      useMyPlay.addToPlayList({ exhibitId: this.data.exhibitId, itemId: this.data.itemId }, () => {
        const app = document.getElementById("app");
        const { offsetTop, offsetLeft } = this.$refs.cover;
        this.coverLeft = offsetLeft;
        this.coverTop = offsetTop - app.scrollTop;
        if (this.store.inMobile) this.moreMenuShow = false;
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
      this.store.setData({
        key: "shareInfo",
        value: { show: true, exhibit: this.data }
      });
    },

    /** 授权 */
    async getAuth() {
      console.log("这里的授权", this.data);
      useMyAuth.getAuth(this.data);
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/css/voice.less";
</style>
