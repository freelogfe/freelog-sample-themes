<script setup lang="ts">
import { ref } from "vue";
import { useGlobalStore } from "@/store/global";

import MoreIcon from "@/assets/images/arrow.png";
import TimeIcon from "@/assets/images/time.png";
import AlbumIcon from "@/assets/images/album.png";

const store = useGlobalStore();

const albumData = ref<any[]>([1, 2, 3, 4, 5]);
</script>

<template>
  <div class="home-album-wrap">
    <!-- 热门头部 -->
    <div class="album-header-box">
      <span class="title">热门音乐</span>
      <div class="more">
        所有专辑
        <div class="more-icon">
          <img :src="MoreIcon" alt="更多" />
        </div>
      </div>
    </div>

    <!-- 专辑内容 -->
    <div class="album-content-box">
      <div class="content-item" v-for="(item, index) in albumData" :key="index">
        <div class="info-box">
          <div class="cover-image">
            <img
              src="https://fastly.picsum.photos/id/886/170/170.jpg?hmac=pS3kuW8yXp5t8UX3v-vMkM3wA0fcbAeeSyo9NyUIQqs"
              alt="歌曲封面"
              srcset=""
            />
          </div>
          <div class="info">
            <span class="title">夏日的清晨，阳光洒在大地上，微风轻拂，给人带来宁静</span>

            <div class="desc">
              <div class="time-box">
                <div class="icon">
                  <img :src="TimeIcon" alt="更新时间" />
                </div>
                <span class="time">2021/12/18</span>
              </div>

              <div class="album-box">
                <div class="icon">
                  <img :src="AlbumIcon" alt="专辑" />
                </div>
                <span class="album">33</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-album-wrap {
  width: 100%;
  padding: 0 80px 100px;
  box-sizing: border-box;

  .album-header-box {
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
    margin-top: 40px;

    .content-item {
      .info-box {
        display: flex;
        flex-direction: column;

        .cover-image {
          width: 232px;
          height: 232px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          margin-right: 15px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
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

            &:hover {
              text-decoration: underline;
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
}
</style>
