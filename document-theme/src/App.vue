<template>
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Microsoft Yahei, Roboto, Oxygen, Ubuntu, Cantarell,
    "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #222;
  text-align: left;
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
  background-color: #fff;
}

img {
  display: block;
}

input {
  background: none;
  outline: none;
  border: none;
  padding: 0;
}
input:focus {
  border: none;
  box-shadow: none;
}

.text-btn {
  color: #2784ff;
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  &.mobile {
    cursor: default;
    transition: none;

    &:hover {
      opacity: 1;
    }
  }
}

/* fade */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* slide-up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* slide-right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* slide-down-scale */
.slide-down-scale-enter-active,
.slide-down-scale-leave-active {
  transition: all 0.2s ease;
}
.slide-down-scale-enter-from,
.slide-down-scale-leave-to {
  opacity: 0;
  transform: translateY(-30px) scaleY(0.8);
}
</style>
