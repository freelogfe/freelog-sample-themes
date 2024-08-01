<!-- 声音详情页 -->

<template>
  <div class="detail-wrapper">
    <transition name="detail-fade">
      <template v-if="voiceInfo">
        <div>
          <!-- mobile -->
          <div class="mobile-detail-wrapper" v-if="$store.state.inMobile">
            <div ref="cover" class="cover-area">
              <img class="cover" :src="voiceInfo.coverImages[0]" />
            </div>
            <div class="title-area">
              <img
                class="auth-link-abnormal"
                src="../assets/images/auth-link-abnormal.png"
                v-if="authLinkAbnormal"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth()"
                v-if="voiceInfo.defaulterIdentityType >= 4"
              ></i>
              <my-tooltip class="title" :content="voiceInfo.exhibitTitle">
                <span>{{ voiceInfo.exhibitTitle }}</span>
              </my-tooltip>
            </div>
            <div class="info-area">
              <div class="info-item">
                <i class="freelog fl-icon-gengxinshijian"></i>
                <div class="item-value">{{ voiceInfo.updateDate | relativeTime }}</div>
              </div>
              <div class="info-item">
                <i class="freelog fl-icon-yonghu"></i>
                <div class="item-value">{{ voiceInfo.signCount | signCount }}</div>
              </div>
              <div class="duration">
                时长{{ voiceInfo.versionInfo.exhibitProperty.duration | secondsToHMS }}
              </div>
            </div>
            <div
              class="play-voice-btn"
              :class="{ disabled: btnList[0].disabled }"
              @click="playOrPause()"
            >
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
            <div class="intro">{{ voiceInfo.exhibitIntro }}</div>
            <div
              class="cover-to-add"
              :class="{ animation: addAnimation }"
              :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
            >
              <img class="cover" :src="voiceInfo.coverImages[0]" />
            </div>
          </div>
          <!-- PC -->
          <div class="pc-detail-wrapper" v-if="!$store.state.inMobile">
            <div ref="cover" class="cover-area">
              <img class="cover" :src="voiceInfo.coverImages[0]" />
            </div>

            <div class="right-area">
              <div class="title-area">
                <img
                  class="auth-link-abnormal"
                  src="../assets/images/auth-link-abnormal.png"
                  v-if="authLinkAbnormal"
                />
                <i class="freelog fl-icon-suoding lock" @click.stop="getAuth()" v-if="voiceInfo.defaulterIdentityType >= 4"></i>
                <div
                  v-if="voiceInfo.articleInfo.articleType === 1"
                  class="single freelog fl-icon-bokebiaoqian_danji"
                  :class="{ 'opacity-40': authLinkAbnormal }"
                ></div>
                <div v-else class="multiple" :class="{ 'opacity-40': authLinkAbnormal }">
                  <span
                    class="ing freelog fl-icon-bokebiaoqian_lianzaizhong"
                    v-if="voiceInfo.articleInfo.serializeStatus === 0"
                  ></span>
                  <span class="end freelog fl-icon-bokebiaoqian_yiwanjie" v-else></span>
                </div>

                <my-tooltip class="title" :content="voiceInfo.exhibitTitle">
                  <span>{{ voiceInfo.exhibitTitle }}</span>
                </my-tooltip>
              </div>
              <div class="intro">{{ voiceInfo.exhibitIntro }}</div>
              <div class="info-area">
                <div class="info-item">
                  <i class="freelog fl-icon-gengxinshijian"></i>
                  <div class="item-value">{{ voiceInfo.updateDate | relativeTime }}</div>
                </div>
                <div class="info-item">
                  <i class="freelog fl-icon-yonghu"></i>
                  <div class="item-value">{{ voiceInfo.signCount | signCount }}</div>
                </div>
              </div>

              <div class="btns-area">
                <template v-if="playingInfo && voiceInfo.articleInfo.articleType === 1">
                  <div class="duration" v-if="playingInfo.exhibitId !== voiceInfo.exhibitId">
                    时长{{ voiceInfo.versionInfo.exhibitProperty.duration | secondsToHMS }}
                  </div>
                  <transition name="slide-right">
                    <div class="playing-mark" v-if="playingInfo.exhibitId === voiceInfo.exhibitId">
                      <play-status :playing="$store.state.playing" />
                      <div class="progress">
                        <span>{{ ($store.state.progress * 1000) | secondsToHMS }}</span>
                        <span class="progress-divider">/</span>
                        <span>{{
                          voiceInfo.versionInfo.exhibitProperty.duration | secondsToHMS
                        }}</span>
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
            </div>

            <div
              class="cover-to-add"
              :class="{ animation: addAnimation }"
              :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
            >
              <img class="cover" :src="voiceInfo.coverImages[0]" />
            </div>
          </div>
          <!-- pc：合集的单品列表 -->
          <div
            class="pc-detail-list"
            v-if="!$store.state.inMobile && voiceInfo.articleInfo.articleType === 2"
          >
            <div class="shortCut">
              <label>包含声音</label>
              <span>({{ total }})</span>
            </div>
            <div class="list-container" v-if="list.length">
              <div class="list-item" v-for="item in list">
                <voice :data="item" :key="item.exhibitId" subMode="inDetailPage"></voice>
              </div>
            </div>
            <div class="no-data-tip" v-else>暂无任何声音, 请稍后查看</div>
          </div>
          <!-- pc: 分页 -->
          <div
            class="pc-detail-pagination"
            v-if="list.length && !$store.state.inMobile && voiceInfo.articleInfo.articleType === 2"
          >
            <el-pagination
              :current-page="currentPage"
              :total="total"
              :page-size="5"
              :pager-count="9"
              layout="prev, pager, next, jumper"
              @current-change="handleCurrentChange"
            >
            </el-pagination>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { showToast } from "@/utils/common";
import { freelogApp } from "freelog-runtime";
import voice from "@/components/voice";

export default {
  name: "detail",

  components: { playStatus, myTooltip, voice },

  data() {
    return {
      id: "",
      voiceInfo: null,
      isCollected: false,
      isInPlayList: false,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      href: "",
      list: [],
      currentPage: 1,
      total: 0
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

    "$store.state.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist(this.id);
      },
      immediate: true
    },

    "$store.state.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist(this.id);
      },
      immediate: true
    },

    "$store.state.authIdList"(cur) {
      if (cur.includes(this.voiceInfo.exhibitId)) this.voiceInfo.defaulterIdentityType = 0;
    }
  },

  computed: {
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.voiceInfo.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      return supportMimeList.includes(this.voiceInfo.versionInfo.exhibitProperty.mime);
    },

    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.$store.state;
      return playing && playingInfo.exhibitId === this.voiceInfo.exhibitId;
    },

    /** 播放中声音信息 */
    playingInfo() {
      return this.$store.state.playingInfo;
    },

    /** 操作按钮群 */
    btnList() {
      return [
        {
          icon:
            this.voiceInfo.articleInfo.articleType === 1
              ? !this.ifSupportMime
                ? "fl-icon-wufabofang"
                : this.playing
                ? "fl-icon-zanting-daibiankuang"
                : "fl-icon-bofang-daibiankuang"
              : "fl-icon-bofang-daibiankuang",
          title:
            this.voiceInfo.articleInfo.articleType === 1
              ? !this.ifSupportMime
                ? "无法播放"
                : this.playing
                ? "暂停"
                : "播放"
              : "播放全部",
          operate: this.playOrPause,
          disabled: !(
            this.voiceInfo.articleInfo.articleType === 2 ||
            (this.voiceInfo.articleInfo.articleType === 1 && this.ifSupportMime)
          )
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: this.addToPlayList,
          disabled: !(
            this.voiceInfo.articleInfo.articleType === 2 ||
            (this.voiceInfo.articleInfo.articleType === 1 &&
              !this.isInPlayList &&
              this.ifSupportMime)
          )
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
    async addToPlayList() {
      const { exhibitId, articleInfo } = this.voiceInfo
      if (articleInfo.articleType === 2) {
        const res = await useMyPlay.getListInCollection(exhibitId);
        this.$store.commit("setCachePool", {
          key: exhibitId,
          value: JSON.parse(JSON.stringify(res))
        });
        await useMyPlay.addToPlayListBatch(exhibitId, res)
      } else {
        useMyPlay.addToPlayList(this.id, () => {
          const { offsetTop, offsetLeft } = this.$refs.cover;
          this.coverLeft = offsetLeft;
          this.coverTop = offsetTop - app.scrollTop;
          this.addAnimation = true;
          setTimeout(() => {
            this.addAnimation = false;
          }, 700);
        });
      }
    },

    /** 收藏/取消收藏 */
    operateCollect() {
      useMyCollection.operateCollect(this.voiceInfo);
    },

    /** 分享 */
    share() {
      if (this.$store.state.inMobile) {
        const input = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: this.voiceInfo?.exhibitId } });
      } else {
        this.$store.commit("setData", {
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

      if (exhibitInfo.data.data.articleInfo.articleType === 2) {
        this.queryList()
      }
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    },
    /** 分页 */
    async queryList() {
      const limit = 5
      let skip = (this.currentPage - 1) * limit
      const res = await freelogApp.getCollectionSubList(this.voiceInfo.exhibitId, {
        sortType: -1,
        skip,
        limit: 5,
        isShowDetailInfo: 1
      });
      if (res.data.errCode === 0) {
        const arr = res.data.data.dataList;
        for (let index = arr.length - 1; index >= 0; index--) {
          const element = arr[index];
          const url = await freelogApp.getCollectionSubFileStream(
            this.voiceInfo.exhibitId,
            {
              itemId: element.itemId,
              returnUrl: true
            }
          );
          element.url = url;
        }
        this.list = arr.map(ele => {
          return {
            ...this.voiceInfo,
            child: ele
          };
        });
        this.total = res.data.data.totalItem
      } else {
        console.warn(res.data);
      }
    },
    /** 分页 */
    handleCurrentChange(current) {
      this.currentPage = current
      this.queryList()
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/detail";
</style>
