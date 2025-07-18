<template>
  <a-collapse
    :active-key="activeKeys"
    @change="handleChange"
  >
    <a-collapse-panel :header="module.module_name" :key="panelKey">
      <p style="margin-bottom: 12px;">{{ module.desc }}</p>

      <div class="module-wrapper" :class="{ masked: !enabled }">
        <ConfigItem
          v-for="cfg in module.config"
          :key="cfg.name"
          :config="cfg"
          :role-name="roleName"
          :module-name="module.module_name"
          :config-name="cfg.name"
          :disabled="!enabled"
        />
      </div>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
import type { Module } from '@/types/startupConfig';
import ConfigItem from './ConfigItem.vue';
import { isModuleSelected } from '@/composables/useSelectedModules';
import { computed, ref, watch } from 'vue';

const props = defineProps<{ module: Module; roleName: string }>();

const panelKey = computed(() => `${props.roleName}.${props.module.module_name}`);
const enabled  = computed(() => isModuleSelected(props.roleName, props.module.module_name));

/* 用户手动展开的 key */
const userExpanded = ref<string[]>([]);

/* 是否因勾选而自动展开 */
const autoOpen = ref(false);

/* 最终 active keys */
const activeKeys = computed(() => {
  const keys = [...userExpanded.value];
  if (autoOpen.value) keys.push(panelKey.value);
  return [...new Set(keys)];
});

/* 面板展开/收起回调 */
const handleChange = (keys: string | string[]) => {
  const arr = Array.isArray(keys) ? keys : [keys];
  userExpanded.value = arr.filter(k => k === panelKey.value);
};

/* 监听勾选状态 */
watch(enabled, (isChecked) => {
  if (isChecked) {
    // 勾选 -> 自动展开
    autoOpen.value = true;
  } else {
    // 取消勾选 && 当前是自动展开 -> 自动折叠
    if (autoOpen.value) autoOpen.value = false;
  }
});
</script>

<style scoped>
.module-wrapper {
  position: relative;
}
.masked {
  pointer-events: none;
  user-select: none;
}
.masked::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
}
</style>