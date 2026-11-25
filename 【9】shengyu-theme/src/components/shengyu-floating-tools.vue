<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import QrcodeVue from "qrcode.vue";
import { freelogApp, type WidgetController } from "freelog-runtime";
import HomeFloatMenu from "@/components/home-float-menu.vue";
import { useGlobalStore } from "@/store/global";
import { demoMode } from "@/api/shengyu";
import sunSvg from "@/assets/images/shengyu-theme-sun.svg?raw";
import moonSvg from "@/assets/images/shengyu-theme-moon.svg?raw";
import { currentTheme, toggleTheme } from "@/utils/theme-manager";

const store = useGlobalStore();
// Keep reactive icon updates independent of the host micro-app's document URL.
const sunIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sunSvg)}`;
const moonIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(moonSvg)}`;
const appearanceLabel = computed(() =>
  currentTheme.value === "dark" ? "切换浅色模式" : "切换暗黑模式"
);
const shareDialog = ref<HTMLDialogElement | null>(null);
const shareWidgetContainer = ref<HTMLElement | null>(null);
const shareQr = ref<HTMLElement | null>(null);
const shareLoading = ref(false);
let shareWidget: WidgetController | undefined;
let disposed = false;
function setShareWidgetShow(show: boolean) {
  const mobilePanel = document.getElementById("mobile-share-wrap");
  if (store.inMobile && mobilePanel) mobilePanel.style.display = show ? "flex" : "none";
  return shareWidget?.setData({ show });
}
const shareUrl = ref("");
const copyStatus = ref("");
const shareError = ref("");
const themeUrl = computed(() => {
  const configured = store.selfConfig.options_theme_url;
  try {
    const url = new URL(configured);
    if (["https:", "http:"].includes(url.protocol)) return url.href;
  } catch {
    /* A published resource URL is optional. */
  }
  return "https://console.freelog.cn/resource/details/6b03b22ec9004b002f527c85";
});

async function openShare() {
  if (shareLoading.value) return;
  // Preserve the music theme's share card and download/social actions when configured.
  if (!demoMode && shareWidgetContainer.value) {
    shareLoading.value = true;
    try {
      if (!shareWidget) {
        const deps = await freelogApp.getSelfDepForTheme();
        const dep = deps.find(item =>
          ["ZhuC/_Freelog插件-主页分享", "ZhuC/Freelog插件-主页分享"].includes(item.articleName)
        );
        if (dep && !disposed) {
          const nodeInfo = freelogApp.nodeInfo as unknown as Record<string, any>;
          const mounted = await freelogApp.mountArticleWidget({
            articleId: dep.articleId,
            parentNid: dep.parentNid,
            nid: dep.nid,
            topExhibitId: freelogApp.getTopExhibitId(),
            container: shareWidgetContainer.value,
            renderWidgetOptions: {
              iframe: true,
              data: {
                exhibit: {
                  ...nodeInfo,
                  avatarUrl: `https://image.freelog.cn/avatar/${nodeInfo.ownerUserId || ""}`,
                  nodeUrl: new URL(freelogApp.getCurrentUrl()).origin,
                  exhibitId: nodeInfo.nodeId || freelogApp.getTopExhibitId(),
                  exhibitTitle: nodeInfo.nodeName || nodeInfo.nodeShortDescription
                },
                type: "音乐",
                show: true,
                onClose: () => setShareWidgetShow(false)
              }
            }
          });
          if (disposed) await mounted.unmount();
          else shareWidget = mounted;
        }
      } else {
        await setShareWidgetShow(true);
      }
      if (shareWidget || disposed) return;
    } catch {
      // Nodes without a usable share widget can still share a QR code and link.
    } finally {
      shareLoading.value = false;
    }
  }
  if (disposed) return;
  copyStatus.value = "";
  shareError.value = "";
  shareUrl.value = "";
  try {
    shareUrl.value = demoMode ? window.location.href : new URL(freelogApp.getCurrentUrl()).origin;
    if (!shareUrl.value) throw new Error("missing URL");
  } catch {
    shareError.value = "暂时无法获取分享链接，请稍后重试。";
  }
  shareDialog.value?.showModal();
}
function downloadQr() {
  const canvas = shareQr.value?.querySelector("canvas");
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = "声屿-分享二维码.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copyStatus.value = "链接已复制";
  } catch {
    copyStatus.value = "请选中上方链接手动复制";
  }
}
onBeforeUnmount(() => {
  disposed = true;
  shareWidget?.unmount();
});
</script>

<template>
  <aside
    class="sy-floating-tools"
    :class="{ 'player-visible': store.playerShowStatus || store.inMobile }"
    aria-label="快捷工具"
  >
    <button
      type="button"
      class="sy-tool"
      :aria-label="appearanceLabel"
      :title="appearanceLabel"
      @click="toggleTheme(currentTheme === 'dark' ? 'light' : 'dark')"
    >
      <img class="sy-tool-icon" :src="currentTheme === 'dark' ? sunIcon : moonIcon" alt="" />
    </button>
    <HomeFloatMenu embedded :theme-url="themeUrl" :aria-busy="shareLoading" @share="openShare" />
  </aside>

  <dialog
    ref="shareDialog"
    class="sy-tools-dialog"
    :data-theme="currentTheme"
    aria-labelledby="sy-share-title"
    @click="$event.target === shareDialog && shareDialog?.close()"
  >
    <button class="sy-dialog-close" aria-label="关闭分享" @click="shareDialog?.close()">×</button>
    <h2 id="sy-share-title">分享声屿</h2>
    <template v-if="shareUrl">
      <p>{{ demoMode ? "当前为本地预览链接，仅同一设备可访问" : "扫描二维码，分享你的节点" }}</p>
      <div ref="shareQr" class="sy-share-qr">
        <QrcodeVue :value="shareUrl" :size="180" :margin="2" level="M" />
      </div>
      <input
        class="sy-share-url"
        aria-label="分享链接"
        :value="shareUrl"
        readonly
        @focus="($event.target as HTMLInputElement).select()"
      />
      <button class="sy-dialog-action" @click="copyLink">复制链接</button>
      <button class="sy-download-qr" @click="downloadQr">下载二维码</button>
      <p class="sy-copy-status" role="status">{{ copyStatus }}</p>
    </template>
    <p v-else role="alert">{{ shareError }}</p>
  </dialog>
  <Teleport to="body"
    ><div ref="shareWidgetContainer" class="sy-share-widget" :data-theme="currentTheme"></div
  ></Teleport>
</template>

<style scoped>
.sy-floating-tools {
  --tool-size: 68px;
  position: fixed;
  right: max(30px, env(safe-area-inset-right));
  bottom: max(30px, env(safe-area-inset-bottom));
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.sy-floating-tools.player-visible {
  bottom: calc(120px + env(safe-area-inset-bottom));
}
.sy-tool {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--tool-size);
  height: var(--tool-size);
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--sy-text);
  background: rgb(255 255 255 / 10%);
  backdrop-filter: blur(5px);
  cursor: pointer;
}
[data-theme="light"] .sy-tool {
  background: rgb(34 34 34 / 10%);
}
.sy-tool:hover {
  background: var(--sy-border);
}
.sy-tool:focus-visible {
  outline: 2px solid var(--sy-brand);
  outline-offset: 4px;
}
.sy-tool-icon {
  width: 24px;
  height: 24px;
}
[data-theme="light"] .sy-tool-icon {
  filter: invert(1);
}
.sy-tools-dialog {
  box-sizing: border-box;
  margin: auto;
  padding: 36px;
  width: min(420px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  overflow: auto;
  border: 1px solid var(--sy-border);
  border-radius: 20px;
  background: var(--sy-card);
  color: var(--sy-text);
  text-align: center;
  box-shadow: 0 24px 80px rgb(0 0 0 / 30%);
}
.sy-tools-dialog::backdrop {
  background: rgb(0 0 0 / 55%);
  backdrop-filter: blur(4px);
}
.sy-tools-dialog h2 {
  margin: 4px 0 12px;
  font-size: 24px;
}
.sy-tools-dialog p {
  color: var(--sy-muted);
  font-size: 14px;
  line-height: 1.8;
}
.sy-dialog-close {
  position: absolute;
  right: 12px;
  top: 8px;
  width: 32px;
  height: 32px;
  font-size: 28px;
  color: var(--sy-muted);
}
.sy-share-qr {
  width: fit-content;
  margin: 24px auto;
  padding: 8px;
  background: white;
  border-radius: 8px;
}
.sy-share-qr :deep(canvas) {
  display: block;
}
.sy-share-url {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--sy-border);
  border-radius: 8px;
  color: var(--sy-text);
  background: var(--sy-bg);
}
.sy-dialog-action {
  width: 100%;
  padding: 12px;
  border-radius: 24px;
  background: var(--sy-brand);
  color: #111314;
  font-weight: 600;
}
.sy-copy-status {
  min-height: 25px;
  margin-bottom: 0;
}
.sy-download-qr {
  margin-top: 16px;
  color: var(--sy-text);
  text-decoration: underline;
}
.sy-share-widget {
  position: fixed;
  inset: 0 auto auto 0;
  width: 0;
  height: 0;
  overflow: visible;
  z-index: 1000;
}
@media (max-width: 640px), (max-height: 600px) {
  .sy-floating-tools {
    --tool-size: 48px;
    right: max(12px, env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
    gap: 8px;
  }
  .sy-floating-tools.player-visible {
    bottom: calc(120px + env(safe-area-inset-bottom));
  }
  .sy-tools-dialog {
    padding: 32px 24px;
  }
}
</style>
