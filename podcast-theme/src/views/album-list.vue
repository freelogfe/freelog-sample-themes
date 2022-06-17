<template>
  <div class="album-list-wrapper">
    <!-- PC -->
    <div class="pc-album-list-wrapper">
      <div class="title">专辑（{{ 7 }}）</div>
      <div class="album-list">
        <album class="album" v-for="item in 22" :key="item" />
      </div>
    </div>
  </div>
</template>

<script>
import album from "@/components/album";

export default {
  name: "album-list",

  components: {
    album,
  },
};
</script>

<style lang="scss" scoped>
.album-list-wrapper {
  .pc-album-list-wrapper {
    padding-top: 20px;
    padding-bottom: 120px;

    .title {
      font-size: 36px;
      font-weight: 600;
      color: #ffffff;
      line-height: 56px;
      opacity: 0.6;
    }

    .album-list {
      display: flex;
      flex-wrap: wrap;

      .album {
        margin-top: 50px;
        margin-left: 20px;

        &:nth-child(5n + 1) {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
