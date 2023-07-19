<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="home">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <div id="modal"></div>
</template>

<style lang="scss">
@import "@/assets/css";
</style>
