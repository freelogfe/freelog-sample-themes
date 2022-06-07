<template>
  <div class="collect-list-wrapper">
    <!-- PC -->
    <div class="pc-collect-list-wrapper">
      <div class="title">收藏</div>
      <template v-if="$store.state.collectionList">
        <div class="collect-list" v-if="$store.state.collectionList.length">
          <!-- <template v-for="item in $store.state.collectionList" :key="item.exhibitId">
          <second-album class="list-item" :data="item" />
          <voice class="list-item" :data="item" statusShow />
        </template> -->
          <voice
            class="list-item"
            :data="item"
            statusShow
            v-for="item in $store.state.collectionList"
            :key="item.exhibitId"
          />
        </div>
        <div class="no-data-tip" v-else>暂无任何收藏</div>
      </template>

      <el-skeleton class="skeleton" animated v-else>
        <template slot="template">
          <div class="voice-skeleton" v-for="item in 5" :key="item">
            <el-skeleton-item class="cover" variant="image" />
            <div class="info-area">
              <el-skeleton-item class="voice-title" variant="text" />
              <el-skeleton-item class="voice-intro" variant="text" />
              <el-skeleton-item class="voice-intro" variant="text" />
              <el-skeleton-item class="voice-others" variant="text" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
import secondAlbum from "@/components/second-album";
import voice from "@/components/voice";

export default {
  name: "collect-list",

  components: { secondAlbum, voice },
};
</script>

<style lang="scss" scoped>
.collect-list-wrapper {
  .pc-collect-list-wrapper {
    padding-top: 20px;
    padding-bottom: 168px;

    .title {
      font-size: 36px;
      font-weight: 600;
      color: #ffffff;
      line-height: 56px;
      opacity: 0.6;
      margin-bottom: 50px;
    }

    .collect-list {
      width: 100%;

      .list-item + .list-item {
        margin-top: 50px;
      }

      .voice-wrapper + .voice-wrapper {
        margin-top: 25px;
      }
    }

    .no-data-tip {
      width: 100%;
      text-align: center;
      font-size: 30px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 36px;
      margin-top: 258px;
    }

    .skeleton {
      .voice-skeleton {
        width: 100%;
        display: flex;
        margin-top: 25px;

        .cover {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .info-area {
          display: flex;
          flex-direction: column;
          margin-left: 20px;

          .voice-title {
            height: 22px;
            width: 400px;
            margin-bottom: 10px;
          }

          .voice-intro {
            width: 700px;
            height: 18px;

            & + .voice-intro {
              margin-top: 4px;
            }
          }

          .voice-others {
            width: 150px;
            height: 18px;
            margin-top: 10px;
          }
        }
      }

      ::v-deep .el-skeleton.is-animated .el-skeleton__item {
        background: linear-gradient(90deg, rgb(70, 70, 70) 25%, rgb(50, 50, 50) 37%, rgb(70, 70, 70) 63%) 0% 0% / 400%
          100%;
      }
    }
  }
}
</style>
