<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/store/global";

import myTooltip from "@/components/tooltip.vue";
import MoreIcon from "@/assets/images/arrow.png";
import AuthLinkAbnormal from "@/assets/images/auth-link-abnormal.png";

import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";

import { Exhibit } from "@/interface";

const store = useGlobalStore();
const router = useRouter();

const props = defineProps<{
  hasHeader: boolean;
  data: Exhibit[];
}>();

const showMore = ref<boolean>(false);
const moreMenuShow = ref<boolean>(false);
const changeIndex = (index: number): string => {
  if (index > 1 && index < 10) {
    return index.toString().padStart(2, "0");
  }
  return index.toString();
};

/** 授权链异常 */
const authLinkAbnormal = (defaulterIdentityType: number) => {
  return ![0, 4].includes(defaulterIdentityType);
};

/** 是否为支持格式 */
const ifSupportMime = (mime: string) => {
  const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
  return supportMimeList.includes(mime);
};

/** 是否播放中 */
const playing = (obj: { exhibitId: string; itemId: string }) => {
  const { playing, playingInfo } = store;
  const playingId = `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ""}`;
  const exhibit = `${obj.exhibitId}${obj.itemId ?? ""}`;

  return playing && playingId === exhibit;
};

/** 播放/暂停 */
const playOrPause = (item: Exhibit) => {
  console.log("popular item", item);
  useMyPlay.playOrPause(item);
};
/** 加入播放列表 */
const addToPlayList = (obj: { exhibitId: string; itemId: string }) => {
  useMyPlay.addToPlayList(obj);
};

/** 收藏/取消收藏 */
const operateCollect = data => {
  useMyCollection.operateCollect(data);
};

/** 分享 */
const share = data => {
  store.setData({
    key: "shareInfo",
    value: { show: true, exhibit: data }
  });
};

/** 授权 */
const getAuth = data => {
  useMyAuth.getAuth(data);
};

const menuBtnList = computed(() => {
  /** 更多菜单按钮群 */
  // return [
  //   {
  //     icon: !this.ifSupportMime
  //       ? "fl-icon-wufabofang"
  //       : this.playing
  //       ? "fl-icon-zanting-daibiankuang"
  //       : "fl-icon-bofang-daibiankuang",
  //     label: !this.ifSupportMime ? "无法播放" : this.playing ? "暂停声音" : "播放声音",
  //     operate: this.playOrPause,
  //     disabled: !this.ifSupportMime
  //   },
  //   {
  //     icon: "fl-icon-jiarubofangliebiao",
  //     label: "加入播放列表",
  //     operate: this.addToPlayList,
  //     disabled: this.isInPlayList || !this.ifSupportMime
  //   },
  //   { icon: "fl-icon-danji", label: "查看声音详情", operate: this.toVoiceDetail },
  //   {
  //     icon: this.isCollected
  //       ? "fl-icon-shoucangxiaoshuoyishoucang"
  //       : "fl-icon-shoucangxiaoshuo",
  //     label: this.isCollected ? "取消收藏" : "收藏",
  //     operate: this.operateCollect
  //   }
  // ];
});
</script>

<template>
  <!-- PC -->
  <div class="pc-home-popular-wrap" v-if="!store.inMobile">
    <!-- 热门头部 -->
    <div class="popular-header-box">
      <span class="title">推荐音乐</span>
      <div class="more" @click="router.myPush({ path: '/voice-list' })">
        所有音乐
        <div class="more-icon">
          <img :src="MoreIcon" alt="更多" />
        </div>
      </div>
    </div>

    <!-- 热门内容 -->
    <div class="popular-content-box">
      <div class="content-item" v-for="(item, index) in props.data" :key="index">
        <div class="index">{{ changeIndex(index + 1) }}</div>
        <div class="info-box">
          <div class="cover-image">
            <img :src="item.coverImages[0]" alt="歌曲封面" />
            <div
              class="btn-modal"
              v-if="ifSupportMime(item.versionInfo?.exhibitProperty?.mime as string)"
            >
              <div class="btn" @click.stop="playOrPause(item)">
                <i
                  class="freelog"
                  :class="
                    playing({ exhibitId: item.exhibitId, itemId: item.itemId })
                      ? 'fl-icon-zanting'
                      : 'fl-icon-bofang-sanjiaoxing'
                  "
                ></i>
              </div>
            </div>
          </div>
          <div class="info">
            <span
              class="title"
              @click="
                router.myPush({
                  path: '/detail',
                  query: { id: item.exhibitId, subID: item.itemId, albumName: item.albumName }
                })
              "
            >
              <img
                class="auth-link-abnormal"
                :src="AuthLinkAbnormal"
                v-if="authLinkAbnormal(item.defaulterIdentityType)"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth(item)"
                v-if="item.defaulterIdentityType >= 4"
              ></i>
              {{ item.exhibitTitle }}
            </span>
            <span class="desc">{{ item.exhibitIntro }}</span>
            <span
              class="type"
              :class="item.albumName && 'album'"
              @click="
                item.albumName && router.myPush({ path: '/detail', query: { id: item.exhibitId } })
              "
            >
              {{ item.albumName || "单曲" }}
            </span>
          </div>
          <div class="btns-area" :class="{ opacity: authLinkAbnormal(item.defaulterIdentityType) }">
            <myTooltip content="加入播放列表">
              <i
                class="freelog text-btn"
                :class="['fl-icon-jiarubofangliebiao', { disabled: useMyPlay.ifExist({exhibitId:item.exhibitId,itemId:item.itemId}) || (item.articleInfo.articleType === 1 && !ifSupportMime(item.versionInfo?.exhibitProperty?.mime as string)) }]"
                @click="addToPlayList({ exhibitId: item.exhibitId, itemId: item.itemId })"
              />
            </myTooltip>
            <myTooltip content="更多">
              <i
                class="freelog text-btn"
                :class="['fl-icon-gengduo_yuandian_zongxiang more-icon']"
                @click="showMore = true"
              />
            </myTooltip>

            <div class="more-btns" v-if="showMore" @mouseleave="showMore = false">
              <div class="more-item" @click="share(item)">
                <i class="freelog text-btn fl-icon-fenxiang" />
                分享
              </div>
              <div class="more-item" @click="operateCollect(item)">
                <i
                  class="freelog text-btn"
                  :class="
                    useMyCollection.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId })
                      ? 'fl-icon-shoucangxiaoshuoyishoucang'
                      : 'fl-icon-shoucangxiaoshuo'
                  "
                />
                {{
                  useMyCollection.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId })
                    ? "取消收藏"
                    : "收藏"
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile -->
  <div class="mobile-home-popular-wrap" v-else>
    <!-- 热门头部 -->
    <div class="popular-header-box">
      <span class="title">推荐音乐</span>
      <div class="more" @click="router.myPush({ path: '/voice-list' })">
        所有音乐
        <div class="more-icon">
          <img :src="MoreIcon" alt="更多" />
        </div>
      </div>
    </div>

    <!-- 热门内容 -->
    <div class="popular-content-box">
      <div class="content-item" v-for="(item, index) in props.data" :key="index">
        <div class="info-box">
          <div class="cover-image" @click.stop="playOrPause(item)">
            <img :src="item.coverImages[0]" alt="歌曲封面" />
          </div>
          <div class="info">
            <span
              class="title"
              @click="
                router.myPush({
                  path: '/detail',
                  query: { id: item.exhibitId, subID: item.itemId, albumName: item.albumName }
                })
              "
            >
              <img
                class="auth-link-abnormal"
                :src="AuthLinkAbnormal"
                v-if="authLinkAbnormal(item.defaulterIdentityType)"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth(item)"
                v-if="item.defaulterIdentityType >= 4"
              ></i>
              {{ item.exhibitTitle }}
            </span>
            <span class="desc">{{ item.exhibitIntro }}</span>
            <span
              class="type"
              :class="item.albumName && 'album'"
              @click="
                item.albumName && router.myPush({ path: '/detail', query: { id: item.exhibitId } })
              "
            >
              {{ item.albumName || "单曲" }}
            </span>
          </div>
          <div class="btns-area" :class="{ opacity: authLinkAbnormal(item.defaulterIdentityType) }">
            <!-- <i
              class="freelog"
              :class="{ [btnList[0].icon]: true, disabled: btnList[0].disabled }"
              @click="playOrPause()"
            /> -->
            <i class="freelog fl-icon-gengduo_yuandian_zongxiang" @click="moreMenuShow = true" />
          </div>
          <!-- 更多菜单 -->
          <transition name="fade">
            <div class="modal" @click="moreMenuShow = false" v-if="moreMenuShow"></div>
          </transition>
          <transition name="slide-up-fade">
            <div class="more-menu-card" v-if="moreMenuShow">
              <!-- <div class="btns">
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
              </div> -->
              <div class="close-btn" @click="moreMenuShow = false">关闭</div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
// PC
.pc-home-popular-wrap {
  width: 100%;
  padding: 60px 0;
  box-sizing: border-box;

  .popular-header-box {
    display: flex;
    justify-content: space-between;

    .title {
      font-weight: 600;
      font-size: 20px;
      color: #ffffff;
      line-height: 28px;
      opacity: 0.6;
    }

    .more {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
      color: #ffffff;
      opacity: 0.6;
      line-height: 20px;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }

      .more-icon {
        width: 7px;
        height: 13px;
        margin-left: 5px;
        transform: rotate(180deg);
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .popular-content-box {
    display: flex;
    flex-wrap: wrap;
    gap: 40px 30px;
    margin-top: 40px;

    .content-item {
      display: flex;
      width: 400px;

      &:hover {
        .info-box .btns-area {
          opacity: 1;
        }
      }

      .index {
        width: 40px;
        font-weight: 600;
        font-size: 16px;
        color: #ffffff;
        line-height: 22px;
        text-align: left;
        opacity: 0.2;
        flex-shrink: 0;
      }

      .info-box {
        display: flex;
        align-items: center;

        .cover-image {
          position: relative;
          width: 70px;
          height: 70px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-right: 15px;
          overflow: hidden;
          cursor: pointer;

          &:hover {
            /* 使用兄弟选择器来改变 btns-area 的样式 */
            // + .info + .btns-area {
            //   opacity: 1;
            // }

            .btn-modal {
              background: rgba(0, 0, 0, 0.2);

              .btn {
                opacity: 1;
              }
            }
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
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
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.4);
              backdrop-filter: blur(1px);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: all 0.5s ease;

              &:hover {
                background: #44d7b6;
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
        }

        .info {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .title {
            display: flex;
            align-items: center;
            width: 196px;
            font-weight: 600;
            font-size: 16px;
            color: #ffffff;
            line-height: 22px;
            opacity: 0.8;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            &:hover {
              color: #44d7b6;
              opacity: 1;
              text-decoration: underline;

              .info-box .btns-area {
                opacity: 1 !important;
              }
              .lock {
                color: #ffffff;
              }
            }

            .auth-link-abnormal {
              width: 16px;
              height: 16px;
              margin-right: 5px;
            }

            .lock {
              margin-right: 5px;
            }
          }

          .desc {
            width: 196px;
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 18px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .type {
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 18px;
            opacity: 0.4;

            &.album {
              cursor: pointer;

              &:hover {
                color: #44d7b6;
                opacity: 1;
              }
            }
          }
        }

        .btns-area {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.5s ease;

          .text-btn {
            font-size: 20px;
            flex-shrink: 0;
            margin-left: 20px;
          }

          .more-icon {
            transform: rotate(90deg);
          }

          .more-btns {
            position: absolute;
            right: 0;
            top: 14px;
            width: 91px;
            height: 100px;
            background: rgba(0, 0, 0, 0.2);
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            backdrop-filter: blur(25px);
            overflow: hidden;

            .more-item {
              height: 50px;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;

              &:hover {
                background: #44d7b6;
              }

              .text-btn {
                margin-left: 0;
                margin-right: 5px;
                &:hover {
                  color: rgba(255, 255, 255, 0.8);
                }
              }
            }
          }
        }
      }
    }
  }
}

// mobile
.mobile-home-popular-wrap {
  width: 100%;
  padding: 40px 15px;
  box-sizing: border-box;

  .popular-header-box {
    display: flex;
    justify-content: space-between;

    .title {
      font-weight: 600;
      font-size: 20px;
      color: #ffffff;
      line-height: 28px;
      opacity: 0.6;
    }

    .more {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
      color: #ffffff;
      opacity: 0.6;
      line-height: 20px;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }

      .more-icon {
        width: 7px;
        height: 13px;
        margin-left: 5px;
        transform: rotate(180deg);
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .popular-content-box {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 15px 0;
    margin-top: 40px;

    .content-item {
      display: flex;

      .info-box {
        display: flex;
        align-items: center;
        width: 100%;

        .cover-image {
          position: relative;
          width: 62px;
          height: 62px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-right: 10px;
          overflow: hidden;
          cursor: pointer;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .info {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .title {
            display: flex;
            align-items: center;
            width: 196px;
            font-weight: 600;
            font-size: 16px;
            color: #ffffff;
            line-height: 22px;
            opacity: 0.8;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            &:hover {
              color: #44d7b6;
              opacity: 1;
              text-decoration: underline;

              .info-box .btns-area {
                opacity: 1 !important;
              }
              .lock {
                color: #ffffff;
              }
            }

            .auth-link-abnormal {
              width: 16px;
              height: 16px;
              margin-right: 5px;
            }

            .lock {
              margin-right: 5px;
            }
          }

          .desc {
            width: 196px;
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 18px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .type {
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 18px;
            opacity: 0.4;

            &.album {
              cursor: pointer;

              &:hover {
                color: #44d7b6;
                opacity: 1;
              }
            }
          }
        }

        .btns-area {
          transition: all 0.5s ease;
          margin-left: auto;
        }
      }
    }
  }
}
</style>
