<template>
  <a-collapse>
    <a-collapse-panel :header="module.module_name" :key="module.module_name">
      <p style="margin-bottom: 12px;">{{ module.desc }}</p>
      <ConfigItem
        v-for="cfg in module.config"
        :key="cfg.name"
        :config="cfg"
        :role-name="roleName"
        :module-name="module.module_name"
        :config-name="cfg.name"
      />
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
import type { Module } from '@/types/startup';
import ConfigItem from './ConfigItem.vue';
defineProps<{ module: Module; roleName: string }>();
</script>