<script setup lang="ts">
import { computed } from "vue";
import darkIconShare from "@/assets/images/dark_icon_share.svg";
import lightIconShare from "@/assets/images/light_icon_share.svg";
import darkIconComments from "@/assets/images/dark_icon_comments.svg";
import lightIconComments from "@/assets/images/light_icon_comments.svg";

const props = withDefaults(
  defineProps<{
    /** 与设计稿一致：浅色底图标偏深 / 深色底图标偏亮 */
    theme?: "dark" | "light";
    /** 评论数量；≤0 时不展示角标 */
    commentCount?: number;
    /** 角标数字上限展示为 99+ */
    maxBadge?: number;
    /** 为 false 时隐藏评论浮钮（例如评论垂直嵌入页内、仅抽屉模式需要侧栏打开评论） */
    showCommentButton?: boolean;
  }>(),
  {
    theme: "dark",
    commentCount: 99,
    maxBadge: 99,
    showCommentButton: true
  }
);

const emit = defineEmits<{
  (e: "share"): void;
  (e: "comment"): void;
}>();

const badgeText = computed(() => {
  const n = props.commentCount;
  if (n <= 0) return "";
  if (n > props.maxBadge) return `${props.maxBadge}+`;
  return String(n);
});

/** 资源命名：dark_* = 深色描边/填充（用于浅色底），light_* = 浅色填充（用于深色底） */
const shareIconSrc = computed(() => (props.theme === "light" ? darkIconShare : lightIconShare));

const commentIconSrc = computed(() =>
  props.theme === "light" ? darkIconComments : lightIconComments
);
</script>

<template>
  <div
    class="detail-float-menu"
    :class="`detail-float-menu--${theme}`"
    data-name="评论插件-侧栏浮钮"
  >
    <button type="button" class="dfm-btn" aria-label="分享" @click="emit('share')">
      <span class="dfm-btn__inner">
        <img class="dfm-icon" :src="shareIconSrc" alt="" />
      </span>
    </button>

    <button
      v-if="showCommentButton"
      type="button"
      class="dfm-btn dfm-btn--comment"
      aria-label="评论"
      @click="emit('comment')"
    >
      <span v-if="badgeText" class="dfm-badge">{{ badgeText }}</span>
      <span class="dfm-btn__inner">
        <img class="dfm-icon dfm-icon--comment" :src="commentIconSrc" alt="" />
      </span>
    </button>
  </div>
</template>

<style lang="less" scoped>
/* Figma: 单按钮 50×50，纵向 top 415 / 475 → 间距 10px */
@btn-size: 50px;
@gap: 10px;

.detail-float-menu {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: @gap;
  user-select: none;
}

.dfm-btn {
  position: relative;
  width: @btn-size;
  height: @btn-size;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  transition:
    box-shadow 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;

  &:active {
    transform: scale(0.96);
  }
}

.dfm-btn__inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dfm-icon {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  object-fit: contain;
}

.dfm-icon--comment {
  width: 16px;
  height: 14px;
}

/* 角标：Figma Notice / Notice_dark — 12px Inter，贴右上 */
.dfm-badge {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  transform: translate(18%, -18%);
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  box-sizing: border-box;
  border-radius: 9px;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
  white-space: nowrap;
}

/* —— Dark（对应设计稿 property dark / Notice_dark）—— */
.detail-float-menu--dark {
  .dfm-btn {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }

  .dfm-btn:hover,
  .dfm-btn:focus-visible {
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
  }

  .dfm-badge {
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
  }
}

/* —— Light（对应 Default / Notice 浅色画板）—— */
.detail-float-menu--light {
  .dfm-btn {
    background: rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(8px);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  .dfm-btn:hover,
  .dfm-btn:focus-visible {
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.28);
  }

  .dfm-badge {
    background: rgba(0, 0, 0, 0.12);
    color: #000;
  }
}
</style>
