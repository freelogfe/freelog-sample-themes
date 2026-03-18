<script setup lang="ts">
import { computed, inject } from "vue";
import { useStore } from "vuex";
import { freelogEntrances } from "@/api/data";

const store = useStore();
const themeEntrance = freelogEntrances[2];
const openShare = inject<() => void>("openShare");

const baseMenuList = [
  {
    icon: "freelog fl-icon-shiyongzhuti",
    label: "使用此主题",
    desc: "官方示例主题, 可免费使用",
    action: "theme" as const
  },
  {
    icon: "freelog fl-icon-fenxiang",
    label: "分享节点",
    desc: "点击下载二维码, 分享你的节点",
    action: "share" as const
  }
];

const showThemeEntrance = computed(() => {
  const selfConfig = store.state.selfConfig;
  return (
    selfConfig?.entranceShow?.trim() === "显示" ||
    selfConfig?.options_entranceShow?.trim() === "显示"
  );
});

const menuList = computed(() =>
  baseMenuList.filter(item => item.action !== "theme" || showThemeEntrance.value)
);

const handleClick = (action: "theme" | "share") => {
  if (action === "theme") {
    window.open(themeEntrance.url);
  } else {
    openShare?.();
  }
};
</script>

<template>
  <div class="home-float-menu">
    <div
      class="home-float-menu-item"
      v-for="item in menuList"
      :key="item.label"
      @click="handleClick(item.action)"
    >
      <div class="menu-content">
        <span class="menu-label">{{ item.label }}</span>
        <span class="menu-desc">{{ item.desc }}</span>
      </div>
      <i :class="item.icon" class="menu-icon"></i>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-float-menu {
  position: fixed;
  bottom: 30px;
  right: 30px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 防止子项互相拉伸宽度 */
  gap: 12px;
  z-index: 100;
  padding-right: 0;
}

.home-float-menu-item {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  width: 84px;
  height: 68px;
  padding: 0 30px;
  box-sizing: border-box;
  border-radius: 50px;
  background: rgba(34, 34, 34, 0.1);
  backdrop-filter: blur(5px);
  cursor: pointer;
  overflow: hidden;
  transition: width 0.3s ease, border-radius 0.3s ease, box-shadow 0.2s ease;

  &:hover {
    width: fit-content;
    min-width: 243px;
    max-width: 267px;
    // border-radius: 24px 0 0 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

    .menu-content {
      max-width: 220px; /* 放宽限制，让长文案能撑到 267px */
      opacity: 1;
      margin-left: 15px;
    }
  }
}

.menu-icon {
  flex-shrink: 0;
  width: 24px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px !important;
  color: #222222;
}

.menu-content {
  flex-shrink: 0;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  // padding-right: 12px;
  white-space: nowrap;
  transition: max-width 0.3s ease, opacity 0.2s ease;
}

.menu-label {
  font-size: 14px;
  font-weight: 600;
  color: #222222;
  line-height: 20px;
}

.menu-desc {
  font-size: 12px;
  font-weight: 400;
  color: #222222;
  line-height: 18px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
