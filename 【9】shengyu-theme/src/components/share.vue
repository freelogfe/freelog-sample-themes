<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { freelogApp, type WidgetController } from 'freelog-runtime';
import { useGlobalStore } from '@/store/global';
import { isPodcast } from '@/api/shengyu';
import { currentTheme } from '@/utils/theme-manager';

const store = useGlobalStore();
const container = ref<HTMLElement>();
const dialog = ref<HTMLDialogElement>();
const error = ref('');
let widget: WidgetController | undefined;
let revision = 0;
let disposed = false;
let pending = Promise.resolve();
let dependencies: ReturnType<typeof freelogApp.getSelfDepForTheme> | undefined;
function copyButtonColors() {
  return {
    background: 'var(--sy-brand, #8fc914)',
    text: currentTheme.value === 'light' ? '#fff' : '#111314',
  };
}
async function shareDependency() {
  try {
    dependencies ||= freelogApp.getSelfDepForTheme();
    const deps = await dependencies;
    return deps.find(item => item.articleName === 'ZhuC/Freelog插件-展品分享');
  } catch (cause) {
    dependencies = undefined;
    throw cause;
  }
}
onMounted(() => {
  // Load the published widget while the page is idle. Keep its DOM and scripts
  // cached; legacy widgets still need remounting with the actual exhibit.
  pending = pending.catch(() => {}).then(async () => {
    if (disposed || store.shareInfo.show || !container.value) return;
    try {
      const dep = await shareDependency();
      if (!dep || disposed || store.shareInfo.show) return;
      const mounted = await freelogApp.mountArticleWidget({
        articleId: dep.articleId, parentNid: dep.parentNid, nid: dep.nid,
        topExhibitId: freelogApp.getTopExhibitId(), container: container.value,
        renderWidgetOptions: { iframe: true, data: {
          exhibit: { exhibitId: freelogApp.getTopExhibitId(), exhibitTitle: '', coverImages: [] },
          type: '音乐', routerType: 'detail', show: false,
        } },
      });
      if (disposed || mounted.success === false) await mounted.unmount();
      else widget = mounted;
    } catch {
      // A background preload failure should not interrupt page browsing.
      dependencies = undefined;
    }
  });
});
function close() {
  store.setData({ key: 'shareInfo', value: { show: false, exhibit: null } });
}
function refresh() {
  const request = ++revision;
  const exhibit = store.shareInfo.exhibit;
  const show = store.shareInfo.show && !!exhibit;
  error.value = '';
  dialog.value?.close();
  pending = pending.catch(() => {}).then(async () => {
    if (widget) {
      const old = widget;
      widget = undefined;
      await old.unmount();
    }
    if (disposed || request !== revision || !show) return;
    await nextTick();
    if (disposed || request !== revision || !container.value) return;
    try {
      const dep = await shareDependency();
      if (disposed || request !== revision) return;
      if (!dep) throw new Error('主题尚未配置展品分享插件，请添加 ZhuC/Freelog插件-展品分享 依赖。');
      // The plugin reads exhibit data at mount time, so remount when the shared item changes.
      const mounted = await freelogApp.mountArticleWidget({
        articleId: dep.articleId, parentNid: dep.parentNid, nid: dep.nid,
        topExhibitId: freelogApp.getTopExhibitId(),
        container: container.value,
        renderWidgetOptions: { iframe: true, data: {
          exhibit: { ...exhibit, exhibitTitle: exhibit.itemTitle || exhibit.exhibitTitle },
          type: isPodcast(exhibit) ? '播客' : '音乐',
          routerType: 'detail',
          copyButtonColors: copyButtonColors(),
          show: true,
          onClose: close,
        } },
      });
      if (disposed || request !== revision) { await mounted.unmount(); return; }
      if (mounted.success === false) {
        await mounted.unmount();
        throw new Error('分享插件加载失败，请检查节点插件依赖与资源是否可访问。');
      }
      widget = mounted;
      // Old plugins ignore initial show data. Identical setData is deduplicated,
      // so force a notification once the plugin has mounted.
      await mounted.forceSetData({ show: true, copyButtonColors: copyButtonColors() });
      if (!disposed && request === revision) dialog.value?.showModal();
    } catch (cause) {
      if (!disposed && request === revision) {
        dependencies = undefined;
        error.value = cause instanceof Error ? cause.message : '分享插件加载失败，请重试';
        if (!dialog.value?.open) dialog.value?.showModal();
      }
    }
  }).catch(() => {
    if (!disposed && request === revision) {
      error.value = '分享插件加载失败，请重试';
      if (!dialog.value?.open) dialog.value?.showModal();
    }
  });
}
watch(() => [store.shareInfo.show, store.shareInfo.exhibit], refresh, { flush: 'post', immediate: true });
watch(currentTheme, () => {
  void widget?.setData({ copyButtonColors: copyButtonColors() }).catch(() => {});
});
onBeforeUnmount(() => {
  disposed = true;
  revision++;
  dialog.value?.close();
  const mounted = widget;
  widget = undefined;
  void mounted?.unmount().catch(() => {});
});
</script>

<template>
  <dialog ref="dialog" class="sy-exhibit-share-dialog" :data-theme="currentTheme" aria-label="分享" @cancel.prevent="close" @click="($event.target === dialog) && close()">
    <section class="sy-exhibit-share-panel">
      <button class="sy-exhibit-share-close" aria-label="关闭分享" @click="close"><i class="freelog fl-icon-guanbi" /></button>
      <div v-if="error" class="sy-share-status" role="alert"><p>{{ error }}</p><button @click="refresh">重试</button></div>
      <div ref="container" class="sy-exhibit-share-host"></div>
    </section>
  </dialog>
</template>

<style scoped>
.sy-exhibit-share-dialog { width: min(650px, calc(100vw - 32px)); max-width: none; max-height: calc(100vh - 32px); margin: auto; padding: 0; border: 0; border-radius: 6px; background: transparent; overflow: visible; }
.sy-exhibit-share-dialog::backdrop { background: rgb(0 0 0 / 50%); }
.sy-exhibit-share-dialog { --share-surface: rgb(255 255 255 / 10%); --share-input: rgb(255 255 255 / 10%); }
.sy-exhibit-share-dialog[data-theme="light"] { --share-surface: #fff; --share-input: #f3f6f7; }
.sy-exhibit-share-panel { position: relative; isolation: isolate; min-height: 90px; color: var(--sy-text); }
/* Blur only the background: filtering the panel would make the plugin's fixed
   QR overlay position itself against the panel instead of the viewport. */
.sy-exhibit-share-panel::before { content: ''; position: absolute; inset: 0; z-index: -1; border-radius: 6px; background: var(--share-surface); -webkit-backdrop-filter: blur(30px); backdrop-filter: blur(30px); pointer-events: none; }
.sy-exhibit-share-close { position: absolute; right: 12px; top: 12px; z-index: 2; display: grid; place-items: center; width: 30px; height: 30px; padding: 0; background: transparent; color: var(--sy-secondary); }
.sy-exhibit-share-close:hover { color: var(--sy-text); }
.sy-share-status { padding: 35px 24px; text-align: center; }
/* Runtime iframe sandbox keeps the widget DOM in this host. Override the legacy
   widget's fixed light colors locally, without changing its copy/social buttons. */
.sy-exhibit-share-host :deep(.share-wrapper) { padding-top: 0; }
.sy-exhibit-share-host :deep(.share-popup) { width: 100%; background-color: transparent !important; box-shadow: none; }
.sy-exhibit-share-host :deep(.share-popup .share-title) { color: var(--sy-secondary) !important; }
.sy-exhibit-share-host :deep(.share-popup .textarea) { background: var(--share-input) !important; color: var(--sy-text) !important; border-color: transparent !important; }
.sy-exhibit-share-host :deep(.share-popup .share-label) { color: var(--sy-muted) !important; }
.sy-exhibit-share-host :deep(.qrcode-popup-wrapper) { position: fixed; inset: 0; z-index: 3; overflow: auto; padding: 16px; box-sizing: border-box; }
.sy-exhibit-share-host :deep(.qrcode-popup) { flex-shrink: 0; margin: auto; background-color: #fff !important; border-color: #ddd !important; }
.sy-exhibit-share-host :deep(.qrcode-text),
.sy-exhibit-share-host :deep(.qrcode-popup .close-btn) { color: #222 !important; }
</style>
