<template>
    <a-layout-sider 
      width="260" 
      class="unified-sidebar"
      :style="{ backgroundColor: 'var(--color-bg-container)' }">
      <!-- 未启动：配置菜单 -->
      <template v-if="!isRunning">
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
        <div v-else>
          <p>配置为空</p>
        </div>
      </template>

      <!-- 已启动：状态列表 -->
      <template v-else>
        <h1>模块状态</h1>
        <div v-if="flatModules.length">
          <a-menu mode="inline" :selected-keys="[]">
            <a-menu-item
              v-for="item in flatModules"
              :key="item.key"
              style="display:flex;align-items:center;"
            >
              <a-tooltip placement="top" :title="statusText(item)">
                <a-badge :color="badgeColor(item)" 
                  style="
                  margin-left:8px; 
                  transform: scale(1.3);
                  display: inline-block;" 
                  />
              </a-tooltip>
              {{ item.module_name }}
            </a-menu-item>
          </a-menu>
        </div>
        <div v-else>
          <p>暂无状态数据</p>
        </div>
      </template>
    </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { StartupConfig } from '@/types/startupConfig';
import { toggleModule, isModuleSelected } from '@/composables/useSelectedModules';
import { antdTheme } from '@/main';

interface ModuleStatus {
  role_name: string;
  modules: Array<{
    module_name: string;
    running: boolean;
    loaded: boolean;
    err: string | null;
  }>;
}

const props = defineProps<{
  config: StartupConfig;
  status: ModuleStatus[];
  isRunning: boolean;
}>();

console.log('[UnifiedSidebar] props.config', props.config);
console.log('[UnifiedSidebar] props.status', props.status);
console.log('[UnifiedSidebar] props.isRunning', props.isRunning);

const openKeys = ref<string[]>([]);

watch(
  () => props.config,
  (val) => {
    if (val && val.length) {
      openKeys.value = [val[0].role_name];
      console.log('[UnifiedSidebar] openKeys set to', openKeys.value);
    }
  },
  { immediate: true }
);

const handleOpenChange = (keys: string[]) => {
  openKeys.value = keys;
};

const handleSelect = ({ key }: { key: string }) => {
  console.log('[UnifiedSidebar] handleSelect', key);
  const el = document.getElementById(key);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const isSelected = isModuleSelected;

const flatModules = computed(() => {
  console.log('[UnifiedSidebar] flatModules input', props.status);
  const result = (props.status || []).flatMap(role =>
    role.modules.map(m => ({
      key: `${role.role_name}.${m.module_name}`,
      module_name: m.module_name,
      running: m.running,
      loaded: m.loaded,
      err: m.err,
    }))
  );
  console.log('[UnifiedSidebar] flatModules output', result);
  return result;
});

const badgeColor = (item: any) => {
  if (item.err) return 'red';
  if (item.running) return 'green';
  if (item.loaded) return 'blue';
  return 'gold';
};

const statusText = (item: any) => {
  if (item.err) return `异常终止: ${item.err}`;
  if (item.running) return '正在运行中';
  if (item.loaded) return '已加载';
  return '正在加载中';
};
</script>

<style scoped>
.unified-sidebar {
  height: 100vh;
  overflow-y: auto;
  padding: 20px;
}

.unified-sidebar h1,
.unified-sidebar p {
  margin: 20px 0;
  text-align: center;
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
}
</style>