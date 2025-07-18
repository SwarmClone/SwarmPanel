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
import { isModuleSelected, autoExpandPanels } from '@/composables/useSelectedModules';
import { computed, ref, watchEffect } from 'vue';

const props = defineProps<{ module: Module; roleName: string }>();

const panelKey = computed(() => `${props.roleName}.${props.module.module_name}`);
const enabled  = computed(() => isModuleSelected(props.roleName, props.module.module_name));

// 用户手动展开的 key
const userExpanded = ref<string[]>([]);

const activeKeys = computed(() => {
  const keys = [...userExpanded.value];
  if (enabled.value && autoExpandPanels.has(panelKey.value)) {
    if (!keys.includes(panelKey.value)) keys.push(panelKey.value);
  }
  return keys;
});

const handleChange = (keys: string | string[]) => {
  const arr = Array.isArray(keys) ? keys : [keys];
  userExpanded.value = arr.filter(k => k === panelKey.value);
};

watchEffect(() => {
  if (enabled.value) autoExpandPanels.add(panelKey.value);
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