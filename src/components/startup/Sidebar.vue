<template>
  <a-layout-sider width="260" class="ant-layout-sider">
    <h1>启动前参数配置</h1>
    <p>在此选择要启动的模块</p>

    <a-menu
      v-if="config.length"
      mode="inline"
      :open-keys="openKeys"
      :selected-keys="[]"
      @openChange="handleOpenChange"
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
import { toggleModule, isModuleSelected } from '@/composables/useSelectedModules';
import { ref, watch } from 'vue';

const props = defineProps<{ config: StartupConfig }>();

const isSelected = isModuleSelected;

const openKeys = ref<string[]>([]);

/* 当 config 有值后，把第一个 role 的 key 写进去 */
watch(
  () => props.config,
  (val) => {
    if (val && val.length) {
      openKeys.value = [val[0].role_name];
    }
  },
  { immediate: true }
);

const handleOpenChange = (keys: string[]) => {
  openKeys.value = keys;
};

/* 点击菜单项滚动到对应表单 */
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