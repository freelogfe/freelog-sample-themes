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
        @click="skipToDetailPage"
      >
        <img class="cover" v-view-lazy="computedCover" />
        <div class="offline" v-if="data.onlineStatus === 0 && statusShow"><span>已下架</span></div>
        <div class="unplayable-tip" v-if="!ifSupportMime">无法播放</div>
      </div>
      <div
        class="info-area"
        @click="skipToDetailPage"
      >
        <div class="title-area" :class="{ 'mb-20': mode === 'program' }">
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
          <template v-if="!data.child">
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
          <div class="title" :class="{ 'opacity-40': authLinkAbnormal }">
            {{ computedTitle }}
          </div>
        </div>
        <div class="duration" :class="{ 'opacity-40': authLinkAbnormal }" v-if="mode === 'voice'">
          {{ computedEstimateDuration }}
        </div>
        <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
          <div class="info-item relative-time">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ data.updateDate | relativeTime }}</div>
          </div>
          <div class="info-item" v-if="mode === 'program' && data.articleInfo.articleType === 2">
            <i class="freelog fl-icon-danji"></i>
            <div class="item-value">{{ data.totalItem }}</div>
          </div>
          <div class="info-item" v-if="mode === 'program'">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ data.signCount | signCount }}</div>
          </div>
          <div class="info-item exhibit-title" 
            v-if="data.articleInfo.articleType === 2 && mode === 'voice' && subMode !== 'inDetailPage'" 
            @click.stop="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })">
            <i class="freelog fl-icon-zhuanji"></i>
            <div class="item-value">{{ data.exhibitTitle }}</div>
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
        <img class="cover" :src="computedCover" />
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
        @click="skipToDetailPage"
      >
        <img class="cover" :src="computedCover" />
        <div class="offline" v-if="data.onlineStatus === 0 && statusShow"><span>已下架</span></div>
        <div class="btn-modal" v-if="ifSupportMime">
          <div class="btn" @click.stop="handlePlayOrPause">
            <i
              class="freelog"
              :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
            ></i>
          </div>
        </div>
      </div>
      <div class="info-area" :class="{ 'in-detail-page': subMode === 'inDetailPage' }">
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
          <template v-if="!data.child">
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
            :content="computedTitle"
          >
            <span @click="skipToDetailPage">
              {{ computedTitle }}
            </span>
          </my-tooltip>
        </div>
        <div class="intro" :class="{ 'opacity-40': authLinkAbnormal }">
          {{ computedIntro }}
        </div>
        <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ computedUpdate }}</div>
          </div> 
          <div class="info-item" v-if="mode === 'program' && data.articleInfo.articleType === 2">
            <i class="freelog fl-icon-danji"></i>
            <div class="item-value">{{ data.totalItem }}</div>
          </div>
          <div class="info-item" v-if="mode === 'program'">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ data.signCount | signCount }}</div>
          </div>
          <div class="info-item to-pool" :class="{ vaild: subMode !== 'inDetailPage' }" 
            v-if="data.articleInfo.articleType === 2 && mode === 'voice' && subMode !== 'inDetailPage'"
            @click="$router.myPush({ path: '/detail', query: { id: data.exhibitId } })">
            <i class="freelog fl-icon-zhuanji"></i>
            <div class="item-value">{{ data.exhibitTitle }}</div>
          </div>
          <div class="info-item" v-if="!ifSupportMime">
            <i class="freelog fl-icon-wufabofang"></i>
            <div class="item-value">无法播放</div>
          </div>
          <transition name="slide-right">
            <div class="info-item play-shrink" v-if="showPlayStatus">
              <play-status :playing="playing" />
              <div class="progress" v-if="mode === 'voice'">
                <span>{{ ($store.state.progress * 1000) | secondsToHMS }}</span>
                <span class="progress-divider">/</span>
                <span>{{ computedDuration }}</span>
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
        <div v-if="data.articleInfo.articleType === 2 && mode === 'program'" class="total">
          共{{ data.totalItem }}集
        </div>
        <div v-else class="duration">
          {{ computedEstimateDuration }}
        </div>
      </div>
      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="computedCover" />
      </div>
    </div>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { relativeTime, signCount, secondsToHMS, estimateDuration } from "@/utils/filter";
import { freelogApp } from "freelog-runtime";

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
    },
    subMode: {
      type: String,
      default: "other" // "inDetailPage" | "other" 只用于控制宽度使用
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
      isInPlayList: false,
      collectionList: []
    };
  },

  watch: {
    "$store.state.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist(this.data);
      },
      immediate: true
    },
    "$store.state.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist(this.data);
      },
      immediate: true
    },
    data: {
      handler(newData) {
        if (newData.articleInfo.articleType === 2) {
          this.getListInCollection(newData.exhibitId);
        }
      },
      immediate: true
    }
  },

  computed: {
    /** 播放状态 */
    showPlayStatus() {
      if (this.data.articleInfo.articleType === 1) {
        return (
          this.$store.state.playingInfo &&
          this.$store.state.playingInfo.exhibitId === this.data.exhibitId
        );
      } else {
        if (this.mode === 'voice') {
          return (
            this.$store.state.playingInfo &&
            this.$store.state.playingInfo.exhibitId === this.data.exhibitId &&
            this.$store.state.playingInfo.child &&
            this.$store.state.playingInfo.child.itemId &&
            this.data.child &&
            this.$store.state.playingInfo.child.itemId === this.data.child.itemId
          );
        } else {
          return (
            this.$store.state.playingInfo &&
            this.$store.state.playingInfo.exhibitId === this.data.exhibitId &&
            !this.data.child
          );
        }
      }
    },

    /** 时长 */
    computedEstimateDuration() {
      if (this.data.articleInfo.articleType === 1) {
        return estimateDuration(this.data.versionInfo.exhibitProperty.duration);
      } else {
        if (this.mode === 'voice'){
          return estimateDuration(this.data?.child?.articleInfo?.articleProperty?.duration);
        } else {
          return estimateDuration(this.$store.state.playingInfo?.child?.articleInfo?.articleProperty?.duration)
        }
      }
    },

    /** 时长 */
    computedDuration() {
      if (this.data.articleInfo.articleType === 1) {
        return secondsToHMS(this.data.versionInfo.exhibitProperty.duration);
      } else {
        if (this.mode === 'voice'){
          return secondsToHMS(this.data?.child?.articleInfo?.articleProperty?.duration);
        } 
      }
    },

    /** 更新时间 */
    computedUpdate() {
      if (this.data.articleInfo.articleType === 1) {
        return relativeTime(this.data.updateDate);
      } else {
        if (this.mode === 'voice') { 
          return relativeTime(this.data?.child?.createDate);
        } else {
          return relativeTime(this.data.updateDate);          
        }
      }
    },

    /** 简介 */
    computedIntro() {
      if (this.data.articleInfo.articleType === 1) {
        return this.data.exhibitIntro;
      } else {
        if (this.mode === 'voice') { 
          return this.data?.child?.articleInfo?.intro || "";
        } else {
          return this.data.exhibitIntro;  
        }
      }
    },

    /** 标题 */
    computedTitle() {
      if (this.data.articleInfo.articleType === 1) {
        return this.data.exhibitTitle;
      } else {
        if (this.mode === 'voice') { 
          return this.data?.child?.itemTitle || "";
        } else {
          return this.data.exhibitTitle;
        }
      }
    },

    /** 封面 */
    computedCover() {
      if (this.data.articleInfo.articleType === 1) {
        return this.data.coverImages[0];
      } else {
        if (this.mode === 'voice') {
          if (this.data?.child?.articleInfo?.coverImages[0]) {
            return this.data?.child?.articleInfo?.coverImages[0];
          } else {
            return '//static.testfreelog.com/static/default_cover.png';
          }
        } else {
          return this.data.coverImages[0];
        }
      }
    },

    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.data.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      if (this.data.articleInfo.articleType === 1) {
        return supportMimeList.includes(this.data.versionInfo.exhibitProperty.mime);
      } else {
        if (this.mode === 'voice') {
          return supportMimeList.includes(this.data?.child?.articleInfo?.articleProperty?.mime);
        } else {
          return this.data.articleInfo.resourceType[0] === '音频' && this.collectionList.length
        }
      }
    },

    /** 是否播放中 */
    playing() {
      const { playing: _play, playingInfo } = this.$store.state;
      if (!playingInfo) return _play
      if (playingInfo.articleInfo.articleType === 1) {
        return _play && playingInfo.exhibitId === this.data.exhibitId;
      } else {
        if (this.data.child) {
          return _play && 
            playingInfo.exhibitId === this.data.exhibitId && 
            playingInfo.child.itemId && 
            this.data.child &&
            this.data.child.itemId &&
            playingInfo.child.itemId === this.data.child.itemId
        }
        return _play && playingInfo.exhibitId === this.data.exhibitId;
      }
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
        { icon: "fl-icon-danji", label: "查看声音详情", operate: this.skipToDetailPage },
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
    /** 跳转到声音详情 */
    skipToDetailPage() {
      if (this.data.articleInfo.articleType === 1) {
        this.$router.myPush({ path: '/detail', query: { id: this.data.exhibitId } })
      } else {
        if (this.mode === 'voice') {
          // 存入数据到localStorage
          sessionStorage.setItem("detail-sub", JSON.stringify(this.data))
          this.$router.myPush({ path: '/detail-sub', query: { id: this.data.exhibitId } })
        } else {
          this.$router.myPush({ path: '/detail', query: { id: this.data.exhibitId } })
        }
      }
    },
    /** 播放/暂停 */
    handlePlayOrPause() {
      this.playOrPause()
    },
    /** 播放/暂停 */
    playOrPause() {
      if (this.data.articleInfo.articleType === 1) {
        useMyPlay.playOrPause(this.data);
      } else {
        if (this.mode === 'voice') {
          useMyPlay.playOrPause(this.data);
        } else {
          useMyPlay.playOrPause(this.data, 'pool');
        }
      }
    },

    /** 加入播放列表 */
    async addToPlayList() {
      const callback = () => {
        const app = document.getElementById("appPodcast");
        const { offsetTop, offsetLeft } = this.$refs.cover;
        this.coverLeft = offsetLeft;
        this.coverTop = offsetTop - app.scrollTop;
        if (this.$store.state.inMobile) this.moreMenuShow = false;
        this.addAnimation = true;
        setTimeout(() => {
          this.addAnimation = false;
        }, 700);
      }
      const { articleInfo, exhibitId, child } = this.data
      if (articleInfo.articleType === 2 && this.mode === 'program') {
        const res = await useMyPlay.getListInCollection(exhibitId);
        this.$store.commit("setCachePool", {
          key: exhibitId,
          value: JSON.parse(JSON.stringify(res))
        });
        await useMyPlay.addToPlayListBatch({
          exhibitId, 
          addArr: res,
          callback,
        }, true)
      } else {
        if (articleInfo.articleType === 2) {
          useMyPlay.addToPlayList({
            id: exhibitId,
            itemId: child.itemId,
            callback,
            isExhibit: false
          });
        } else {
          useMyPlay.addToPlayList({
            id: exhibitId,
            callback,
            isExhibit: true
          });
        }
      }
      
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
    },

    /** 获取某个合集里的列表 */
    async getListInCollection(exhibitId) {
    const res = await freelogApp.getCollectionSubList(exhibitId, {
      sortType: 1,
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
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/voice";
</style>
