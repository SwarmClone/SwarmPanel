<template>
  <a-collapse>
    <a-collapse-panel :header="module.module_name" :key="module.module_name">
      <p style="margin-bottom: 12px;">{{ module.desc }}</p>

      <!-- 蒙版容器 -->
      <div
        class="module-wrapper"
        :class="{ masked: !enabled }"
      >
        <!-- 真正的配置项 -->
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
import { computed } from 'vue';

const props = defineProps<{ module: Module; roleName: string }>();

const enabled = computed(() =>
  isModuleSelected(props.roleName, props.module.module_name)
);
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