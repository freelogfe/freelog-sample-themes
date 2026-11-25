import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { freelogApp, initFreelogApp } from 'freelog-runtime';
import { useGlobalStore } from '@/store/global';
import { initTheme } from '@/utils/theme-manager';
import mapRoutes from '@/utils/map-routes';
import { demoMode } from '@/api/shengyu';
import App from './App.vue';
import router from './router/index';
let app: ReturnType<typeof createApp> | null = null;
let removeRouteHook: (() => void) | undefined;
window.mount = async () => {
  initTheme();
  try {
    if (!demoMode) {
      initFreelogApp();
      await freelogApp.mapShareUrl(mapRoutes);
    }
    const pinia = createPinia();
    app = createApp(App);
    app.use(pinia).use(router);
    const store = useGlobalStore();
    if (!demoMode) {
      await store.initStoreData();
      freelogApp.onLogin(() => freelogApp.reload(), () => document.getElementById('app')?.scrollTo({top:0}));
    }
    removeRouteHook = router.afterEach((_to, from) => {
      if (!demoMode && from.matched.length) freelogApp.closeAuth();
    });
    app.mount('#app');
  } catch (error) {
    console.error('声屿初始化失败', error);
    const container = document.getElementById('app');
    if (container) {
      container.replaceChildren();
      const message = document.createElement('p');
      message.textContent = '声屿加载失败。请在 Freelog 节点中打开。';
      const retry = document.createElement('button');
      retry.textContent = '重新加载';
      retry.onclick = () => location.reload();
      container.append(message, retry);
    }
  }
};
window.unmount = () => {
  removeRouteHook?.();
  app?.unmount();
  app = null;
};
if (!window.__MICRO_APP_ENVIRONMENT__) window.mount();
