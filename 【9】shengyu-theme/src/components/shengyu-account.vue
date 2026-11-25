<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { freelogApp } from 'freelog-runtime';
import { useGlobalStore } from '@/store/global';
import { demoMode } from '@/api/shengyu';
import defaultAvatar from '@/assets/images/default-user-avatar.png';

const store = useGlobalStore();
const route = useRoute();
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const open = ref(false);
const avatar = computed(() => store.userData.headImage || defaultAvatar);
function login() {
  if (!demoMode) freelogApp.callLogin();
}
function register() {
  if (demoMode) return;
  // Keep the same environment-specific registration destination as music-theme.
  const suffix = (window as any).HOST_END === '.com' ? '.com' : '.cn';
  const hostname = new URL(freelogApp.getCurrentUrl()).hostname;
  const domain = hostname.match(suffix === '.cn' ? /\.([^.]*)\.cn$/ : /\.([^.]*)\.com$/)?.[1] || 'freelog';
  window.open(`https://user.${domain}${suffix}/logon`, '_blank', 'noopener,noreferrer');
}
function logout() {
  open.value = false;
  if (!demoMode) freelogApp.callLoginOut();
}
function closeOutside(event: Event) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}
function closeOnBlur(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node)) open.value = false;
}
function closeOnEscape() {
  open.value = false;
  trigger.value?.focus();
}
watch([() => route.fullPath, () => store.userData.isLogin], () => { open.value = false; });
onMounted(() => document.addEventListener('pointerdown', closeOutside));
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOutside));
</script>
<template>
  <div v-if="!store.userData.isLogin" class="sy-account-auth">
    <button class="sy-account-login" :disabled="demoMode" @click="login">登录</button>
    <button class="sy-account-register" :disabled="demoMode" @click="register">注册</button>
  </div>
  <div v-else ref="root" class="sy-account-menu" @mouseenter="open = true" @mouseleave="open = false" @focusout="closeOnBlur" @keydown.esc.prevent="closeOnEscape">
    <button ref="trigger" class="sy-account" aria-label="账号菜单" :aria-expanded="open" aria-controls="sy-account-panel" @click="open = true" @keydown.down.prevent="open = true">
      <img class="sy-avatar" :src="avatar" :alt="store.userData.username || '用户头像'" />
    </button>
    <div v-if="open" id="sy-account-panel" class="sy-account-panel-wrap">
      <div class="sy-account-panel">
        <div class="sy-account-profile">
          <img :src="avatar" alt="" />
          <p :title="store.userData.username">{{ store.userData.username }}</p>
        </div>
        <RouterLink to="/signed-list" @click="open = false">签约记录</RouterLink>
        <button @click="logout">登出</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.sy-account-auth { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.sy-account-auth > button { height: 38px; padding: 0 20px; border-radius: 4px; font-size: 14px; font-weight: 600; }
.sy-account-login { background: var(--sy-card); color: var(--sy-text); }
.sy-account-login:not(:disabled):hover { background: var(--sy-hover); }
.sy-account-register { background: var(--sy-text); color: var(--sy-inverse); }
.sy-account-register:not(:disabled):hover { background: var(--sy-brand); color: var(--sy-nav); }
.sy-account-menu { position: relative; flex-shrink: 0; }
.sy-account-panel-wrap { position: absolute; top: 100%; right: 0; padding-top: 10px; z-index: 50; width: 240px; max-width: calc(100vw - 40px); }
.sy-account-panel { overflow: hidden; border-radius: 4px; background: var(--sy-card); box-shadow: 0 2px 5px #0003; }
.sy-account-profile { display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 15px; }
.sy-account-profile img { width: 60px; height: 60px; object-fit: cover; border-radius: 50%; border: 1px solid var(--sy-border); }
.sy-account-profile p { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--sy-text); font-size: 16px; line-height: 22px; font-weight: 600; }
.sy-account-panel > a, .sy-account-panel > button { display: flex; align-items: center; width: 100%; min-height: 50px; padding: 0 20px; text-align: left; font-size: 14px; color: var(--sy-secondary); background: transparent; }
.sy-account-panel > a:hover, .sy-account-panel > button:hover,
.sy-account-panel > a:focus-visible, .sy-account-panel > button:focus-visible { background: var(--sy-brand); color: var(--sy-nav); }
@media (max-width: 1000px) { .sy-account-auth > button { padding: 0 12px; } }
@media (max-width: 640px) { .sy-account-auth { margin-left: auto; } }
</style>
