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
                <i class="freelog fl-icon-suoding lock" @click.stop="getAuth()"></i>
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
              <span>(5)</span>
            </div>
            <div class="list-container">
              <div class="list-item" v-for="item in list">
                <voice :data="item" :key="item.exhibitId"></voice>
              </div>
            </div>
          </div>
          <!-- pc: 分页 -->
          <div
            class="pc-detail-pagination"
            v-if="!$store.state.inMobile && voiceInfo.articleInfo.articleType === 2"
          >
            <el-pagination
              :page-size="5"
              :pager-count="9"
              layout="prev, pager, next, jumper"
              :total="1000"
              hide-on-single-page
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
      list: [
        {
          exhibitId: "66a20354eff80a0030587039",
          exhibitName: "张学友-情已逝",
          exhibitTitle: "张学友-情已逝",
          exhibitIntro:
            "李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 李清照浊浊浊时代峰峻, 档司机查清要要要",
          exhibitSubjectType: 2,
          tags: [],
          coverImages: ["//static.testfreelog.com/static/default_cover.png"],
          version: "1.0.0",
          policies: [
            {
              policyId: "2665bd4e6e035c9dc0260cf8c7ee01b1",
              policyName: "永久免费",
              status: 1
            }
          ],
          onlineStatus: 1,
          nodeId: 80000252,
          userId: 50492,
          articleInfo: {
            articleId: "669f20f341e7c1002f4a0f58",
            articleName: "liuxianxi/张学友-情已逝",
            resourceType: ["音频", "音乐"],
            articleType: 1,
            serializeStatus: 1,
            articleOwnerId: 0,
            articleOwnerName: "liuxianxi"
          },
          status: 0,
          createDate: "2024-07-25T07:48:36.567Z",
          updateDate: "2024-07-25T09:05:24.548Z",
          versionInfo: {
            exhibitId: "66a20354eff80a0030587039",
            exhibitProperty: {
              fileSize: 11387456,
              duration: 284600,
              bitRate: 320,
              fileSizeUnit: "bytes",
              fileNameSuffix: ".mp3",
              mime: "audio/mpeg",
              durationUnit: "ms"
            },
            dependencyTree: [
              {
                nid: "20f4004c9725",
                articleId: "669f20f341e7c1002f4a0f58",
                articleName: "liuxianxi/张学友-情已逝",
                articleType: 1,
                version: "1.0.0",
                versionRange: "1.0.0",
                resourceType: ["音频", "音乐"],
                versionId: "5fd935db53652bb8d426c7b1cacbb90a",
                deep: 1,
                parentNid: "",
                fileSha1: "97bb1dd5f81551f72c0cba1b80b21ed5373be101"
              }
            ]
          },
          signCount: 2,
          defaulterIdentityType: 0
        },
        {
          exhibitId: "669f4a5308d30a002f0d2bb2",
          exhibitName: "DAOKO_(ダヲコ)_-_打上花火",
          exhibitTitle: "DAOKO (ダヲコ) - 打上花火",
          exhibitIntro: "",
          exhibitSubjectType: 2,
          tags: [],
          coverImages: ["//static.testfreelog.com/static/default_cover.png"],
          version: "1.0.0",
          policies: [
            {
              policyId: "2665bd4e6e035c9dc0260cf8c7ee01b1",
              policyName: "永久免费",
              status: 1
            }
          ],
          onlineStatus: 1,
          nodeId: 80000252,
          userId: 50492,
          articleInfo: {
            articleId: "669f491441e7c1002f4a2a57",
            articleName: "liuxianxi/DAOKO_(ダヲコ)_-_打上花火",
            resourceType: ["音频", "音乐"],
            articleType: 1,
            serializeStatus: 1,
            articleOwnerId: 0,
            articleOwnerName: "liuxianxi"
          },
          status: 0,
          createDate: "2024-07-23T06:14:43.227Z",
          updateDate: "2024-07-23T06:14:53.754Z",
          versionInfo: {
            exhibitId: "669f4a5308d30a002f0d2bb2",
            exhibitProperty: {
              fileSize: 11578086,
              duration: 289300,
              bitRate: 320,
              fileSizeUnit: "bytes",
              fileNameSuffix: ".mp3",
              mime: "audio/mpeg",
              durationUnit: "ms"
            },
            dependencyTree: [
              {
                nid: "7c0c2542fdd8",
                articleId: "669f491441e7c1002f4a2a57",
                articleName: "liuxianxi/DAOKO_(ダヲコ)_-_打上花火",
                articleType: 1,
                version: "1.0.0",
                versionRange: "1.0.0",
                resourceType: ["音频", "音乐"],
                versionId: "87f71e4da0060bab37cc46e367105bf8",
                deep: 1,
                parentNid: "",
                fileSha1: "03d0887d8553dcfcd7769bbc0687a552da65ed8b"
              }
            ]
          },
          signCount: 3,
          defaulterIdentityType: 0
        },
        {
          exhibitId: "669f4a1308d30a002f0d2b0a",
          exhibitName: "陈慧娴_-_千千阙歌",
          exhibitTitle: "陈慧娴 - 千千阙歌",
          exhibitIntro: "",
          exhibitSubjectType: 2,
          tags: [],
          coverImages: ["//static.testfreelog.com/static/default_cover.png"],
          version: "1.0.0",
          policies: [
            {
              policyId: "2665bd4e6e035c9dc0260cf8c7ee01b1",
              policyName: "永久免费",
              status: 1
            }
          ],
          onlineStatus: 1,
          nodeId: 80000252,
          userId: 50492,
          articleInfo: {
            articleId: "669f491541e7c1002f4a2a7f",
            articleName: "liuxianxi/陈慧娴_-_千千阙歌",
            resourceType: ["音频", "音乐"],
            articleType: 1,
            serializeStatus: 1,
            articleOwnerId: 0,
            articleOwnerName: "liuxianxi"
          },
          status: 0,
          createDate: "2024-07-23T06:13:39.531Z",
          updateDate: "2024-07-23T06:13:47.335Z",
          versionInfo: {
            exhibitId: "669f4a1308d30a002f0d2b0a",
            exhibitProperty: {
              fileSize: 11969468,
              duration: 299100,
              bitRate: 320,
              fileSizeUnit: "bytes",
              fileNameSuffix: ".mp3",
              mime: "audio/mpeg",
              durationUnit: "ms"
            },
            dependencyTree: [
              {
                nid: "aec74d3597a5",
                articleId: "669f491541e7c1002f4a2a7f",
                articleName: "liuxianxi/陈慧娴_-_千千阙歌",
                articleType: 1,
                version: "1.0.0",
                versionRange: "1.0.0",
                resourceType: ["音频", "音乐"],
                versionId: "8175a5af0c64b847f66aa8f92b2e11bf",
                deep: 1,
                parentNid: "",
                fileSha1: "4472825462794b7fe0f889108006920e1cbc97aa"
              }
            ]
          },
          signCount: 3,
          defaulterIdentityType: 0
        },
        {
          exhibitId: "669f49f408d30a002f0d2aca",
          exhibitName: "刘若英+-+后来",
          exhibitTitle: "刘若英+-+后来",
          exhibitIntro: "",
          exhibitSubjectType: 2,
          tags: [],
          coverImages: ["//static.testfreelog.com/static/default_cover.png"],
          version: "1.0.0",
          policies: [
            {
              policyId: "2665bd4e6e035c9dc0260cf8c7ee01b1",
              policyName: "永久免费",
              status: 1
            }
          ],
          onlineStatus: 1,
          nodeId: 80000252,
          userId: 50492,
          articleInfo: {
            articleId: "669f491541e7c1002f4a2a93",
            articleName: "liuxianxi/刘若英+-+后来",
            resourceType: ["音频", "音乐"],
            articleType: 1,
            serializeStatus: 1,
            articleOwnerId: 0,
            articleOwnerName: "liuxianxi"
          },
          status: 0,
          createDate: "2024-07-23T06:13:08.742Z",
          updateDate: "2024-07-23T06:13:15.027Z",
          versionInfo: {
            exhibitId: "669f49f408d30a002f0d2aca",
            exhibitProperty: {
              fileSize: 13660273,
              duration: 341400,
              bitRate: 320,
              fileSizeUnit: "bytes",
              fileNameSuffix: ".mp3",
              mime: "audio/mpeg",
              durationUnit: "ms"
            },
            dependencyTree: [
              {
                nid: "ecdb61f48c53",
                articleId: "669f491541e7c1002f4a2a93",
                articleName: "liuxianxi/刘若英+-+后来",
                articleType: 1,
                version: "1.0.0",
                versionRange: "1.0.0",
                resourceType: ["音频", "音乐"],
                versionId: "af136557d20032a90a49ddfe426e32a2",
                deep: 1,
                parentNid: "",
                fileSha1: "8327fd183aed3689d09dd3ba3b10c1abbf019dfe"
              }
            ]
          },
          signCount: 3,
          defaulterIdentityType: 0
        },
        {
          exhibitId: "669f49c808d30a002f0d2a57",
          exhibitName: "谭咏麟-讲不出再见",
          exhibitTitle: "谭咏麟-讲不出再见",
          exhibitIntro: "",
          exhibitSubjectType: 2,
          tags: [],
          coverImages: ["//static.testfreelog.com/static/default_cover.png"],
          version: "1.0.0",
          policies: [
            {
              policyId: "2665bd4e6e035c9dc0260cf8c7ee01b1",
              policyName: "永久免费",
              status: 1
            }
          ],
          onlineStatus: 1,
          nodeId: 80000252,
          userId: 50492,
          articleInfo: {
            articleId: "669f491541e7c1002f4a2aa7",
            articleName: "liuxianxi/谭咏麟-讲不出再见",
            resourceType: ["音频", "音乐"],
            articleType: 1,
            serializeStatus: 1,
            articleOwnerId: 0,
            articleOwnerName: "liuxianxi"
          },
          status: 0,
          createDate: "2024-07-23T06:12:24.575Z",
          updateDate: "2024-07-23T06:12:39.455Z",
          versionInfo: {
            exhibitId: "669f49c808d30a002f0d2a57",
            exhibitProperty: {
              fileSize: 11763542,
              duration: 294000,
              bitRate: 320,
              fileSizeUnit: "bytes",
              fileNameSuffix: ".mp3",
              mime: "audio/mpeg",
              durationUnit: "ms"
            },
            dependencyTree: [
              {
                nid: "1fac1e0501ee",
                articleId: "669f491541e7c1002f4a2aa7",
                articleName: "liuxianxi/谭咏麟-讲不出再见",
                articleType: 1,
                version: "1.0.0",
                versionRange: "1.0.0",
                resourceType: ["音频", "音乐"],
                versionId: "7ec0b22b8aeec2bd1bfb063b394433b3",
                deep: 1,
                parentNid: "",
                fileSha1: "201e8fb707b195eb423a810ffbcf3ba096cf4e4e"
              }
            ]
          },
          signCount: 3,
          defaulterIdentityType: 0
        }
      ]
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
    addToPlayList() {
      useMyPlay.addToPlayList(this.id, () => {
        const { offsetTop, offsetLeft } = this.$refs.cover;
        this.coverLeft = offsetLeft;
        this.coverTop = offsetTop - app.scrollTop;
        this.addAnimation = true;
        setTimeout(() => {
          this.addAnimation = false;
        }, 700);
      });
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
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/detail";
</style>
