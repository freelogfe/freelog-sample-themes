<template>
  <router-view />
</template>

<script>
import { widgetApi } from "freelog-runtime";

export default {
  created() {
    const themeInfo = widgetApi.getData().themeInfo;
    console.log("当前应用版本为:", themeInfo.version, "+++");
  }
};
</script>

<style lang="scss">
@import "@/assets/css";
</style>
