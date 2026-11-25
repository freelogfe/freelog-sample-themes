<template>
  <div class="sy-song-skeleton">
    <div v-for="index in 5" :key="index" class="sy-song-skeleton-row">
      <div class="sy-song-skeleton-left">
        <span class="sy-skeleton-block sy-song-skeleton-cover"></span>
        <div class="sy-song-skeleton-info">
          <span class="sy-skeleton-block sy-song-skeleton-title"></span>
          <span class="sy-skeleton-block sy-song-skeleton-duration"></span>
          <span class="sy-skeleton-block sy-song-skeleton-others"></span>
        </div>
      </div>
      <span class="sy-skeleton-block sy-song-skeleton-actions"></span>
      <span class="sy-skeleton-block sy-song-skeleton-column"></span>
      <span class="sy-skeleton-block sy-song-skeleton-column"></span>
      <span class="sy-skeleton-block sy-song-skeleton-column"></span>
    </div>
  </div>
</template>
<style scoped>
.sy-song-skeleton { display: flex; flex-direction: column; gap: 20px; padding-bottom: 120px; }
.sy-song-skeleton-row { display: grid; grid-template-columns: minmax(0, 460fr) minmax(0, 140fr) minmax(0, 170fr) minmax(0, 170fr) minmax(0, 180fr); gap: 40px; align-items: center; }
.sy-song-skeleton-left { display: flex; align-items: center; gap: 20px; min-width: 0; }
.sy-song-skeleton-cover { width: 50px; height: 50px; flex: 0 0 50px; border-radius: 6px; }
.sy-song-skeleton-info { flex: 1; min-width: 0; }
.sy-song-skeleton-title, .sy-song-skeleton-actions { height: 20px; }
.sy-song-skeleton-column { height: 18px; }
.sy-song-skeleton-duration, .sy-song-skeleton-others { display: none; }
@media (max-width: 1000px) { .sy-song-skeleton-row { gap: 20px; } }
@media (max-width: 700px) {
  .sy-song-skeleton { gap: 15px; padding-bottom: 0; }
  .sy-song-skeleton-row { display: block; }
  .sy-song-skeleton-row:nth-child(n + 5), .sy-song-skeleton-actions, .sy-song-skeleton-column { display: none; }
  .sy-song-skeleton-left { gap: 10px; }
  .sy-song-skeleton-cover { width: 70px; height: 70px; flex-basis: 70px; border-radius: 10px; }
  .sy-song-skeleton-title { width: min(100%, 200px); height: 22px; }
  .sy-song-skeleton-duration { display: block; width: 50px; height: 20px; margin-top: 5px; }
  .sy-song-skeleton-others { display: block; width: 100px; height: 18px; margin-top: 5px; }
}
</style>
