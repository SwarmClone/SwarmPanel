<template>
  <a-layout-sider
    width="260"
    style="background: #fff; border-right: 1px solid #f0f0f0; overflow-y: auto"
  >
  <h1>启动前参数配置</h1>
    <a-menu mode="inline" :open-keys="openKeys">
      <a-sub-menu v-for="role in config" :key="role.role_name">
        <template #title>{{ role.role_name }}</template>

        <a-menu-item v-for="mod in role.modules" :key="mod.module_name">
          <span style="display: flex; align-items: center">
            <a-checkbox
              :checked="isChecked(role.role_name, mod.module_name)"
              @change="toggle(role.role_name, mod.module_name)"
            />
            <span style="margin-left: 8px">{{ mod.module_name }}</span>
          </span>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { StartupConfig } from '@/types/startupConfig';
import { selectedModules, toggleModule } from '@/composables/useSelectedModules';

defineProps<{ config: StartupConfig }>();

const openKeys = ref<string[]>([]); // 默认全部折叠

const isChecked = (r: string, m: string) =>
  selectedModules[r]?.has(m) ?? false;

const toggle = (r: string, m: string) => {
  toggleModule(r, m);
  // 如果该 role 第一次出现，初始化 openKeys
  if (!openKeys.value.includes(r)) openKeys.value.push(r);
};
</script>

<style scoped>
h1 {
  margin: 20px 0;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
}

</style>
