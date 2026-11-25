<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{ modelValue: string; disabled?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [] }>();
const options = [
  { label: '最新发布', value: 'updateDate:-1' },
  { label: '最早发布', value: 'updateDate:1' },
];
const selected = computed(() => options.find(option => option.value === props.modelValue) || options[0]);
const open = ref(false);
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const menu = ref<HTMLElement>();

function close(restoreFocus = false) {
  open.value = false;
  if (restoreFocus) trigger.value?.focus();
}
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close();
}
function focusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node)) close();
}
async function focusOption(index: number) {
  if (props.disabled) return;
  open.value = true;
  await nextTick();
  menu.value?.querySelectorAll<HTMLButtonElement>('button')[index]?.focus();
}
function choose(value: string) {
  close(true);
  if (props.disabled || value === props.modelValue) return;
  emit('update:modelValue', value);
  emit('change');
}
watch(() => props.disabled, disabled => { if (disabled) close(); });
onMounted(() => document.addEventListener('pointerdown', outside));
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside));
</script>

<template>
  <div ref="root" class="sy-sort" @focusout="focusOut" @keydown.esc.stop.prevent="close(true)">
    <button ref="trigger" class="sy-sort-trigger" :disabled="disabled" :aria-label="`排序：${selected.label}`" aria-haspopup="menu" :aria-expanded="open" @click="open = !open" @keydown.down.prevent="focusOption(0)" @keydown.up.prevent="focusOption(options.length - 1)">
      <span>{{ selected.label }}</span><span class="sy-sort-arrow" :class="{ open }" aria-hidden="true"><span></span></span>
    </button>
    <div v-if="open" ref="menu" class="sy-sort-menu" role="menu" aria-label="排序方式">
      <button v-for="(option, index) in options" :key="option.value" role="menuitemradio" :aria-checked="modelValue === option.value" @click="choose(option.value)" @keydown.down.prevent="focusOption((index + 1) % options.length)" @keydown.up.prevent="focusOption((index + options.length - 1) % options.length)" @keydown.home.prevent="focusOption(0)" @keydown.end.prevent="focusOption(options.length - 1)">{{ option.label }}</button>
    </div>
  </div>
</template>

<style scoped>
.sy-sort { position: relative; height: 20px; }
.sy-sort-trigger { display: flex; align-items: center; padding: 0; height: 20px; font-size: 14px; font-weight: 400; line-height: 20px; color: var(--sy-text); }
.sy-sort-trigger:hover, .sy-sort-trigger:active { background: transparent; }
.sy-sort-trigger:disabled { cursor: wait; opacity: .6; }
.sy-sort-arrow { position: relative; margin-left: 5px; transition: transform .35s; }
.sy-sort-arrow.open { transform: rotate(-180deg); }
.sy-sort-arrow > span { display: block; position: relative; top: 3px; width: 0; border: solid transparent; border-width: 6px 5px; border-top-color: var(--sy-text); }
.sy-sort-menu { position: absolute; left: 0; top: 25px; z-index: 40; width: 240px; max-width: calc(100vw - 40px); padding: 5px 0; border-radius: 4px; background: var(--sy-sort-bg); color: var(--sy-sort-text); box-shadow: 0 2px 5px #0003; backdrop-filter: blur(25px); overflow: hidden; }
.sy-sort-menu > button { display: block; width: 100%; height: 50px; padding: 0 20px; text-align: left; color: inherit; font-size: 14px; font-weight: 600; line-height: 50px; }
.sy-sort-menu > button:hover, .sy-sort-menu > button:focus-visible { background: var(--sy-brand); color: var(--sy-nav); }
.sy-sort-menu > button:focus-visible { outline: 1px solid var(--sy-text); outline-offset: -3px; }
</style>
