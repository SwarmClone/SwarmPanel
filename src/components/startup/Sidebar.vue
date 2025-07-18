<template>
  <a-layout-sider
    width="260"
    class="ant-layout-sider"
  >
    <!-- 标题 -->
    <h1>启动前参数配置</h1>
    <p>在此选择要启动的模块</p>

    <!-- 菜单 -->
    <a-menu
      mode="inline"
      :selected-keys="[]"
      @select="handleSelect"
    >
      <a-sub-menu
        v-for="role in config"
        :key="role.role_name"
        :title="role.role_name"
      >
        <a-menu-item
          v-for="mod in role.modules"
          :key="`${role.role_name}.${mod.module_name}`"
        >
          <span style="display:flex;align-items:center">
            <a-checkbox
              :checked="isSelected(role.role_name, mod.module_name)"
              @change.stop="toggleModule(role.role_name, mod.module_name)"
            />
            <span style="margin-left:8px">{{ mod.module_name }}</span>
          </span>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<script setup lang="ts">
import type { StartupConfig } from '@/types/startupConfig';
import {
  toggleModule,
  isModuleSelected,
} from '@/composables/useSelectedModules';

defineProps<{ config: StartupConfig }>();
const isSelected = isModuleSelected;

/* 点击子菜单项时滚动到对应模块 */
const handleSelect = ({ key }: { key: string }) => {
  const el = document.getElementById(key);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<style scoped>
h1 {
  margin: 20px 0;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
}
p {
  margin: 20px 0;
  text-align: center;
}
.ant-layout-sider {
  background: #fff;
  height: 100vh;
  overflow-y: auto;
}
</style>