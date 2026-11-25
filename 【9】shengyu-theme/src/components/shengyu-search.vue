<script setup lang="ts">
import { themeAssets } from "@/assets/theme";
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { readSearchHistory, saveSearchHistory, addSearchHistory } from "@/utils/search-history";

const route = useRoute(), router = useRouter();
const root = ref<HTMLElement>(), input = ref<HTMLInputElement>();
const query = ref(""), history = ref(readSearchHistory()), open = ref(false), selected = ref(-1);
const matches = computed(() => history.value.filter(word => word.toLowerCase().includes(query.value.trim().toLowerCase())));
const visible = computed(() => open.value && matches.value.length > 0);
watch(() => route.fullPath, () => {
  query.value = route.path === "/search-list" ? String(route.query.q || "") : "";
  open.value = false;
  selected.value = -1;
}, { immediate: true });
watch(query, () => { selected.value = -1; });
function submit(word = query.value) {
  const value = word.trim().slice(0, 100);
  if (!value) return;
  query.value = value;
  history.value = addSearchHistory(history.value, value);
  saveSearchHistory(history.value);
  open.value = false;
  selected.value = -1;
  input.value?.blur();
  router.push({ path: "/search-list", query: { q: value } });
}
async function remove(word: string) {
  history.value = history.value.filter(x => x !== word);
  saveSearchHistory(history.value);
  selected.value = -1;
  await nextTick();
  input.value?.focus();
  open.value = true;
}
function clearHistory() {
  history.value = [];
  saveSearchHistory([]);
  selected.value = -1;
}
function keydown(event: KeyboardEvent) {
  if (event.isComposing) {
    if (event.key === "Enter") event.preventDefault();
    return;
  }
  if (event.key === "Escape") { open.value = false; selected.value = -1; }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    open.value = true;
    if (!matches.value.length) return;
    selected.value = event.key === "ArrowDown"
      ? Math.min(selected.value + 1, matches.value.length - 1)
      : Math.max(selected.value - 1, -1);
  }
  if (event.key === "Enter") {
    event.preventDefault();
    submit(visible.value && selected.value >= 0 ? matches.value[selected.value] : query.value);
  }
}
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}
function focusout(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node)) open.value = false;
}
function clearQuery() { query.value = ""; open.value = true; input.value?.focus(); }
onMounted(() => document.addEventListener("pointerdown", outside));
onBeforeUnmount(() => document.removeEventListener("pointerdown", outside));
</script>

<template>
  <div ref="root" class="sy-search-wrap" @focusout="focusout">
    <form class="sy-search" role="search" @submit.prevent="submit()">
      <button type="submit" class="sy-search-submit" aria-label="搜索"><img :src="themeAssets.search" alt="" /></button>
      <input ref="input" v-model="query" maxlength="100" autocomplete="off" role="combobox"
        aria-label="搜索音乐与播客" placeholder="支持搜索关键字" aria-autocomplete="list"
        aria-controls="sy-search-history" :aria-expanded="visible"
        :aria-activedescendant="visible && selected >= 0 ? `sy-history-${selected}` : undefined"
        @focus="open = true" @input="open = true" @keydown="keydown" />
      <button v-if="query" type="button" class="sy-search-clear" aria-label="清除搜索词" @click="clearQuery"><i class="freelog fl-icon-guanbi" aria-hidden="true"></i></button>
    </form>
    <div v-if="visible" class="sy-search-history">
      <div id="sy-search-history" role="listbox" aria-label="搜索记录" class="sy-history-list">
        <div v-for="(word, index) in matches" :id="`sy-history-${index}`" :key="word" role="option"
          :aria-selected="selected === index" class="sy-history-item" :class="{ selected: selected === index }">
          <button type="button" class="sy-history-word" @click="submit(word)">{{ word }}</button>
          <button type="button" class="sy-history-delete" :aria-label="`删除搜索记录 ${word}`" @mousedown.prevent @click="remove(word)"><i class="freelog fl-icon-guanbi" aria-hidden="true"></i></button>
        </div>
      </div>
      <button type="button" class="sy-history-clear" @click="clearHistory">清空搜索记录</button>
    </div>
  </div>
</template>
