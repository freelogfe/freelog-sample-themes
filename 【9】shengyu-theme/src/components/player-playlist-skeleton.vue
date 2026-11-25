<template>
  <div class="player-playlist-skeleton">
    <div class="skeleton-row" v-for="item in rowCount" :key="item">
      <div class="skeleton-block col-title"></div>
      <div class="skeleton-block col-artist"></div>
      <div class="skeleton-block col-album"></div>
      <div class="skeleton-block col-duration"></div>
      <div class="skeleton-block col-delete"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "player-playlist-skeleton",

  data() {
    return {
      rowCount: 8
    };
  }
};
</script>

<style lang="less" scoped>
.player-playlist-skeleton {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 40px;
  height: 40px;
  padding: 0 15px;
  border-radius: 6px;
  box-sizing: border-box;
}

.skeleton-block {
  border-radius: 4px;
  flex-shrink: 0;
  background: linear-gradient(
      90deg,
      var(--text-first-color) 25%,
      var(--text-point-fifth-color) 37%,
      var(--text-first-color) 63%
    )
    0% 0% / 400% 100%;
  animation: player-playlist-skeleton-loading 1.4s ease infinite;
}

.col-title {
  width: 398px;
  height: 20px;
}

.col-artist,
.col-album {
  width: 170px;
  height: 18px;
}

.col-duration {
  width: 180px;
  height: 18px;
}

.col-delete {
  width: 20px;
  height: 20px;
  margin-left: auto;
  border-radius: 4px;
}

@keyframes player-playlist-skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
