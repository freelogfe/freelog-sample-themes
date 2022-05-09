<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="home">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <div id="modal"></div>
</template>

<style lang="scss">
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Microsoft Yahei, Roboto, Oxygen, Ubuntu, Cantarell,
    "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vh;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
