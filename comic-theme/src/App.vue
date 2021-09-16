<template>
  <router-view />
  <div id="modal"></div>
</template>

<style lang="scss">
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Microsoft Yahei,
    Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
    "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #333;
  user-select: none;
  touch-action: pan-y;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}

img {
  display: block;
}
</style>
