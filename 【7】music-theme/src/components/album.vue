<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { relativeTime } from "@/utils/common.js";

import MoreIcon from "@/assets/images/arrow.png";
import TimeIcon from "@/assets/images/time.png";
import AlbumIcon from "@/assets/images/album.png";
import type { Exhibit } from "@/interface";

const props = defineProps<{
  hasHeader: boolean;
  data: Exhibit[];
}>();

const router = useRouter();

const authLinkAbnormal = () => {
  return ![0, 4].includes(props.data.defaulterIdentityType);
};

const ifSupportMime = () => {
  return true;
};
</script>

<template>
  <div class="album-wrap">
    <!-- 专辑头部 -->
    <div class="album-header-box" v-if="props.hasHeader">
      <span class="title">专辑</span>
      <div class="more" @click="router.myPush({ path: '/album-list' })">
        所有专辑
        <div class="more-icon">
          <img :src="MoreIcon" alt="更多" />
        </div>
      </div>
    </div>

    <!-- 专辑内容 -->
    <div class="album-content-box">
      <div class="content-item" v-for="(item, index) in props.data" :key="index">
        <div class="info-box">
          <div class="cover-image">
            <img :src="item.coverImages[0]" alt="歌曲封面" />
            <div class="btn-modal" v-if="ifSupportMime">
              <div class="btn" @click.stop="playOrPause()">
                <i
                  class="freelog"
                  :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
                ></i>
              </div>
            </div>
          </div>
          <div class="info">
            <span
              class="title"
              @click="router.myPush({ path: '/detail', query: { id: item.exhibitId } })"
              >{{ item.exhibitTitle }}</span
            >

            <div class="desc">
              <div class="time-box">
                <div class="icon">
                  <img :src="TimeIcon" alt="更新时间" />
                </div>
                <span class="time">{{ relativeTime(item.updateDate) }}</span>
              </div>

              <div class="album-box">
                <div class="icon">
                  <img :src="AlbumIcon" alt="专辑" />
                </div>
                <span class="album">{{ item.signCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.album-wrap {
  width: 100%;
  padding-bottom: 100px;
  box-sizing: border-box;

  .album-header-box {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;

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

  .album-content-box {
    display: flex;
    gap: 30px;
    min-width: 1100px;

    .content-item {
      .info-box {
        display: flex;
        flex-direction: column;

        .cover-image {
          position: relative;
          width: 232px;
          height: 232px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          margin-right: 15px;
          overflow: hidden;

          &:hover {
            opacity: 1;

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
      }

      .info {
        margin-top: 10px;

        .title {
          font-weight: 600;
          font-size: 14px;
          color: #ffffff;
          line-height: 20px;
          opacity: 0.8;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
            color: #44d7b6;
            opacity: 1;
          }
        }

        .desc {
          margin-top: 10px;
          display: flex;

          .time-box,
          .album-box {
            display: flex;
            align-items: center;

            .icon {
              width: 14px;
              height: 14px;
              margin-right: 5px;
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            .time,
            .album {
              font-weight: 400;
              font-size: 12px;
              color: #ffffff;
              line-height: 18px;
            }

            .time {
              margin-right: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
