<template>
  <a-form layout="vertical">
    <RoleSection
      v-for="role in config"
      :key="role.role_name"
      :role="role"
    />
  </a-form>
</template>

<script setup lang="ts">
import { initStore, collectAll } from '@/composables/useConfigStore';
import type { StartupConfig } from '@/types/startupConfig';
import RoleSection from './RoleSection.vue';

const props = defineProps<{ config: StartupConfig }>();
initStore(props.config);

defineExpose({ collectValues: collectAll });
</script>