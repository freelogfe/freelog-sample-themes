<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/store/global";

import myTooltip from "@/components/tooltip.vue";
import playStatus from "@/components/play-status.vue";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { secondsToHMS } from "@/utils/common";

import MoreIcon from "@/assets/images/arrow.png";
import AuthLinkAbnormal from "@/assets/images/auth-link-abnormal.png";
import Freeze from "@/assets/images/freeze.png";
import { Exhibit } from "@/interface";

const store = useGlobalStore();
const router = useRouter();
const props = defineProps<{
  hasHeader: boolean;
  data: Exhibit[];
}>();

const showMore = ref<boolean>(false);
const moreMenuShow = ref<boolean>(false);
const selectedData = ref({} as Exhibit);

const changeIndex = (index: number): string => {
  if (index > 0 && index < 10) {
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
  const supportMimeList = [
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/flac"
  ];
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

const isCollected = item => {
  return useMyCollection.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId });
};

const isInPlayList = item => {
  return useMyPlay.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId });
};

/** 查看音乐详情 */
const toMusicDetail = item => {
  moreMenuShow.value = false;
  if (item.itemId) {
    router.myPush({
      path: "/detail",
      query: { id: item.exhibitId, subID: item.itemId, albumName: item.albumName }
    });
  } else {
    router.myPush({ path: "/detail", query: { id: item.exhibitId } });
  }
};

/** 查看专辑详情 */
const toAlbumDetail = item => {
  router.myPush({ path: "/detail", query: { id: item.exhibitId } });
};

/** 更多菜单按钮群 */
const menuBtnList = item => {
  return [
    {
      icon: !ifSupportMime(item.versionInfo?.exhibitProperty?.mime)
        ? "fl-icon-wufabofang"
        : playing({ exhibitId: item.exhibitId, itemId: item.itemId })
        ? "fl-icon-zanting-daibiankuang"
        : "fl-icon-bofang-daibiankuang",
      label: !ifSupportMime(item.versionInfo?.exhibitProperty?.mime)
        ? "无法播放"
        : playing({ exhibitId: item.exhibitId, itemId: item.itemId })
        ? "暂停音乐"
        : "播放音乐",
      operate: () => playOrPause(item),
      disabled: !ifSupportMime(item.versionInfo?.exhibitProperty?.mime)
    },
    {
      icon: "fl-icon-jiarubofangliebiao",
      label: "加入播放列表",
      operate: () => addToPlayList({ exhibitId: item.exhibitId, itemId: item.itemId }),
      disabled: isInPlayList(item) || !ifSupportMime(item.versionInfo?.exhibitProperty?.mime)
    },
    {
      icon: "fl-icon-danji",
      label: "查看音乐详情",
      operate: () => toMusicDetail(item)
    },
    item?.itemId
      ? {
          icon: "fl-icon-zhuanji",
          label: "查看专辑",
          operate: () => toAlbumDetail(item)
        }
      : null,
    {
      icon: isCollected(item) ? "fl-icon-shoucangxiaoshuoyishoucang" : "fl-icon-shoucangxiaoshuo",
      label: isCollected(item) ? "取消收藏" : "收藏",
      operate: () => operateCollect(item)
    }
  ].filter(Boolean);
};

// 是否已选中数据
const isSelectedData = item => {
  return (
    `${item.exhibitId}${item.itemId ?? ""}` ===
    `${selectedData.value.exhibitId}${selectedData.value.itemId ?? ""}`
  );
};
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
    <div class="popular-content-box" v-if="props.data.length">
      <div
        class="content-item"
        :class="{
          'opacity-40':
            ![0, 4].includes(item.defaulterIdentityType) ||
            item.onlineStatus === 0 ||
            item?.articleInfo?.status === 2
        }"
        v-for="(item, index) in props.data"
        :key="index"
      >
        <div class="index">{{ changeIndex(index + 1) }}</div>
        <div class="info-box">
          <div class="cover-image">
            <img :src="item.coverImages[0]" alt="歌曲封面" />
            <div
              class="btn-modal"
              v-if="ifSupportMime(item.versionInfo?.exhibitProperty?.mime as string)"
            >
              <div class="btn" @click="playOrPause(item)">
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
            <!-- 播放中标识 -->
            <play-status
              class="cover-status"
              :playing="store.playing"
              :statusText="false"
              v-if="
                store.playingInfo &&
                `${store.playingInfo.exhibitId}${store.playingInfo.itemId ?? ''}` ===
                  `${item.exhibitId}${item.itemId ?? ''}`
              "
            />
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
                class="freeze-lock"
                :src="Freeze"
                alt="封禁"
                v-if="item.articleInfo?.status === 2"
              />
              <div v-else-if="item.onlineStatus === 0" class="offline-lock">已下架</div>
              <img
                class="auth-link-abnormal"
                :src="AuthLinkAbnormal"
                alt="授权链异常"
                v-else-if="authLinkAbnormal(item.defaulterIdentityType)"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth(item)"
                alt="未授权"
                v-else-if="item.defaulterIdentityType >= 4"
              ></i>
              {{ item.exhibitTitle }}
            </span>
            <span
              class="desc"
              v-if="
                item?.versionInfo?.exhibitProperty?.display_artist ||
                item?.articleInfo?.articleProperty?.display_artist
              "
            >
              {{
                item?.versionInfo?.exhibitProperty?.display_artist ||
                item?.articleInfo?.articleProperty?.display_artist
              }}
            </span>
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
    <div class="no-data" v-else>暂无任何音乐</div>
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
    <div class="popular-content-box" v-if="props.data.length">
      <div
        class="content-item"
        :class="{
          'opacity-40':
            ![0, 4].includes(item.defaulterIdentityType) ||
            item.onlineStatus === 0 ||
            item?.articleInfo?.status === 2
        }"
        v-for="(item, index) in props.data"
        :key="index"
      >
        <div class="info-box" @click="playOrPause(item)">
          <div class="cover-image">
            <img :src="item.coverImages[0]" alt="歌曲封面" />
            <!-- 播放中标识 -->
            <play-status
              class="cover-status"
              :playing="store.playing"
              :statusText="false"
              v-if="
                store.playingInfo &&
                `${store.playingInfo.exhibitId}${store.playingInfo.itemId ?? ''}` ===
                  `${item.exhibitId}${item.itemId ?? ''}`
              "
            />
          </div>
          <div class="info">
            <span class="title">
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
            <span
              class="desc"
              v-if="
                item?.versionInfo?.exhibitProperty?.display_artist ||
                item?.articleInfo?.articleProperty?.display_artist
              "
            >
              {{
                item?.versionInfo?.exhibitProperty?.display_artist ||
                item?.articleInfo?.articleProperty?.display_artist
              }}</span
            >
            <span class="type" :class="item.albumName && 'album'">
              {{ item.albumName || "单曲" }}
            </span>
          </div>
          <div class="btns-area" :class="{ opacity: authLinkAbnormal(item.defaulterIdentityType) }">
            <span class="time">{{ secondsToHMS(item.versionInfo.exhibitProperty.duration) }}</span>
            <i
              class="freelog fl-icon-gengduo_yuandian_zongxiang"
              @click.stop="
                () => {
                  moreMenuShow = true;
                  selectedData = item;
                }
              "
            />
          </div>
        </div>
        <!-- 更多菜单 -->
        <transition name="fade">
          <div
            class="modal"
            @click="moreMenuShow = false"
            v-if="moreMenuShow && isSelectedData(item)"
          ></div>
        </transition>
        <transition name="slide-up-fade">
          <div class="more-menu-card" v-if="moreMenuShow && isSelectedData(item)">
            <div class="btns">
              <div
                class="btn"
                :class="{ disabled: btn?.disabled }"
                v-for="btn in menuBtnList(item)"
                :key="btn?.label"
                @click="btn?.operate"
              >
                <i class="freelog" :class="btn?.icon"></i>
                <div class="label">{{ btn?.label }}</div>
              </div>
            </div>
            <div class="close-btn" @click="moreMenuShow = false">关闭</div>
          </div>
        </transition>
      </div>
    </div>
    <div class="no-data" v-else>暂无任何音乐</div>
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
              z-index: 99;

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

              .info-box .btns-area {
                opacity: 1 !important;
              }
              .lock {
                color: #ffffff;
              }
            }

            .freeze-lock,
            .auth-link-abnormal {
              width: 16px;
              height: 16px;
              margin-right: 5px;
            }

            .offline-lock {
              flex-shrink: 0;
              width: 40px;
              height: 20px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 13px;
              font-size: 10px;
              font-weight: 600;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
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
            background: rgba(34, 34, 34);
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

  .no-data {
    padding: 122px 0 144px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 30px;
    color: #ffffff;
    line-height: 36px;
    opacity: 0.4;
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
              // color: #44d7b6;
              // opacity: 1;

              .info-box .btns-area {
                opacity: 1 !important;
              }
              .lock {
                color: #ffffff;
              }
            }

            .freeze-lock,
            .auth-link-abnormal {
              width: 16px;
              height: 16px;
              margin-right: 5px;
            }

            .offline-lock {
              flex-shrink: 0;
              width: 40px;
              height: 20px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 13px;
              font-size: 10px;
              font-weight: 600;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
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
                // color: #44d7b6;
                // opacity: 1;
              }
            }
          }
        }

        .btns-area {
          opacity: 0.4;

          .time {
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 18px;
            margin-right: 15px;
          }

          transition: all 0.5s ease;
          margin-left: auto;
        }
      }

      .modal {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.2);
        z-index: 300;
      }

      .more-menu-card {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        z-index: 300;

        .btns {
          width: 100%;
          padding: 30px 33px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 30px 39px;
          justify-content: space-between;
          box-sizing: border-box;

          .btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: rgba(255, 255, 255, 0.6);

            &:active {
              color: rgba(255, 255, 255, 0.4);

              .freelog {
                background: rgba(255, 255, 255, 0.03);
              }
            }

            &.disabled {
              background: rgba(255, 255, 255, 0.02);
              color: rgba(255, 255, 255, 0.24);
              pointer-events: none;
            }

            & + .btn {
              // margin-left: 44px;
            }

            .freelog {
              width: 48px;
              height: 48px;
              font-size: 24px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .label {
              width: 48px;
              line-height: 17px;
              font-size: 12px;
              display: flex;
              justify-content: center;
              margin-top: 5px;
              word-break: keep-all;
            }
          }
        }

        .close-btn {
          width: 100%;
          height: 60px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);

          &:active {
            color: rgba(255, 255, 255, 0.4);
          }
        }
      }
    }
  }

  .no-data {
    padding: 90px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 24px;
    color: #ffffff;
    line-height: 40px;
    opacity: 0.4;
  }
}
</style>
