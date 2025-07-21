<template>
  <a-card :title="role.role_name" style="margin-bottom: 16px;">
    <ModuleSection
      v-for="mod in role.modules"
      :key="mod.module_name"
      :role-name="role.role_name"
      :module="mod"
    />
  </a-card>
</template>

<script setup lang="ts">
import type { Role } from '@/types/startupConfig';
import ModuleSection from './ModuleSection.vue';
defineProps<{ role: Role }>();
</script>
