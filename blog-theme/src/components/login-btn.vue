<template>
  <div
    class="login-btn-wrapper main-btn mobile"
    :class="{ hidden: userData || !inMobile }"
    :style="{ boxShadow: `0px 2px 10px 0px ${theme.deriveColor}40` }"
    @click="callLogin()"
  >
    登录 / 注册
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { callLogin } from "@/api/freelog";

export default {
  name: "login-btn",

  setup() {
    const store = useStore();

    console.error(store.state.userData)

    return {
      ...store.state,
      callLogin,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-btn-wrapper {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 60px;
  border-radius: 60px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0px 2px 10px 0px rgba(39, 132, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  &.hidden {
    display: none;
  }
}
</style>
