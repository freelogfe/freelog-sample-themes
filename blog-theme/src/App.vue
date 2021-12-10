<template>
  <router-view />
  <theme-entrance />
  <login-btn />
  <div id="modal"></div>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";

export default {
  components: {
    "theme-entrance": defineAsyncComponent(() => import("./components/theme-entrance.vue")),
    "login-btn": defineAsyncComponent(() => import("./components/login-btn.vue")),
  },
};
</script>

<style lang="scss">
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Microsoft Yahei, Roboto, Oxygen, Ubuntu, Cantarell,
    "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #222;
  user-select: none;
  touch-action: pan-y;
  text-align: left;
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

.main-btn {
  color: #fff;
  background: var(--deriveColor);
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6 !important;
  }

  &.mobile {
    cursor: default;
    transition: none;

    &:hover {
      opacity: 1;
    }
  }
}

.assist-btn {
  position: relative;
  color: var(--deriveColor);
  cursor: pointer;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--deriveColor);
    opacity: 0.1;
    transition: all 0.2s linear;
  }

  &:hover::before {
    opacity: 0.08;
  }

  &:active::before {
    opacity: 0.06 !important;
  }

  &.mobile {
    cursor: default;
    transition: none;

    &:hover::before {
      opacity: 0.1;
    }
  }
}

.text-btn {
  color: var(--deriveColor);
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6 !important;
  }

  &.mobile {
    cursor: default;
    transition: none;

    &:hover {
      opacity: 1;
    }
  }
}

.second-text-btn {
  color: #999999;
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    color: var(--deriveColor);
  }

  &:active {
    opacity: 0.8 !important;
  }

  &.mobile {
    cursor: default;
    transition: none;

    &:hover {
      color: #999999;
    }
  }
}

.header-login-btn {
  color: #fff;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6 !important;
  }

  &.mobile {
    cursor: default;
    transition: none;

    &:hover {
      opacity: 1;
    }
  }
}

.header-register-btn {
  color: var(--deriveColor);
  background: #fff;
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6 !important;
  }

  &.mobile {
    cursor: default;
    transition: none;

    &:hover {
      opacity: 1;
    }
  }
}

.user-box-btn {
  color: #222;
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    color: #fff;
    background: var(--deriveColor);
  }

  &:active {
    opacity: 0.8 !important;
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
