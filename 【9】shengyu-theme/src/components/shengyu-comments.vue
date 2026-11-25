<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { freelogApp, type WidgetController } from "freelog-runtime";
import { useGlobalStore } from "@/store/global";
import { currentTheme } from "@/utils/theme-manager";
import { demoMode, type AudioEntry } from "@/api/shengyu";
const props = defineProps<{ item: AudioEntry }>();
const store = useGlobalStore();
const container = ref<HTMLElement>();
const failed = ref(false);
let widget: WidgetController | undefined,
  disposed = false;
function themeData() {
  const css = getComputedStyle(document.getElementById("music-theme") || document.documentElement);
  const pick = (key: string) => css.getPropertyValue(key).trim();
  return {
    theme: currentTheme.value,
    isLoggedIn: store.userData.isLogin,
    avatarUrl: store.userData.headImage,
    currentUserId: store.userData.userId,
    pageBackground: pick("--sy-bg"),
    pageColor: pick("--sy-brand"),
    primaryButtonText: pick("--sy-nav"),
    textPrimary: pick("--sy-text"),
    textSecondary: pick("--sy-secondary"),
    borderColor: pick("--sy-border"),
  };
}
async function mount() {
  if (demoMode || !container.value) return;
  failed.value = false;
  try {
    const deps = await freelogApp.getSelfDepForTheme();
    const dep = deps.find((x) => x.articleName === "ZhuC/Freelog插件-评论插件");
    if (!dep || disposed) return;
    const mounted = await freelogApp.mountArticleWidget({
      articleId: dep.articleId,
      parentNid: dep.parentNid,
      nid: dep.nid,
      topExhibitId: freelogApp.getTopExhibitId(),
      container: container.value,
      renderWidgetOptions: {
        iframe: true,
        data: {
          exhibit: props.item,
          exhibitId: props.item.exhibitId,
          itemId: props.item.itemId,
          type: String(props.item.articleInfo?.resourceType).includes("播")
            ? "播客"
            : "音乐",
          isNodeAdmin: store.userData.isOwner,
          layout: "vertical",
          show: true,
          onLogin: () => freelogApp.callLogin(),
          ...themeData(),
        },
      },
    });
    if (disposed) await mounted.unmount();
    else widget = mounted;
  } catch {
    failed.value = true;
  }
}
watch([currentTheme, () => store.userData.isLogin, () => store.selfConfig?.options_theme_color], () =>
  widget?.setData(themeData()),
  { flush: "post" },
);
onMounted(mount);
onBeforeUnmount(() => {
  disposed = true;
  widget?.unmount();
});
</script>
<template>
  <section class="sy-section sy-comments">
    <div ref="container"></div>
    <div v-if="failed" class="sy-status">
      评论加载失败 <button @click="mount">重试</button>
    </div>
  </section>
</template>
<style scoped>
/* Older comment widgets hardcode white text and ignore primaryButtonText.
   Their UI remains inside this host even when the script sandbox uses iframe. */
.sy-comments :deep(.comment-widget .btn-login),
.sy-comments :deep(.comment-widget .btn-publish) {
  color: var(--sy-nav, #1b1e20) !important;
}
</style>
