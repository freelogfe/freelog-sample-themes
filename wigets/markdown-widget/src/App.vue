<template>
  <router-view />
</template>

<style lang="scss">
.toast-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  color: #fff;
  font-weight: bold;
  transform: translate(-50%, -50%);
  padding: 19px 50px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  font-size: 16px;
  line-height: 22px;
  animation: fade-in-out 2s linear;
  white-space: nowrap;
  z-index: 101;
}

@keyframes fade-in-out {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
