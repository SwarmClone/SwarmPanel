<template>
  <a-layout style="min-height: 100vh">
    <!-- 侧边栏 -->
    <Sidebar :config="startupConfig" />

    <!-- 右侧主体 -->
    <a-layout-content class="main-scroll">
      <!-- 固定顶部导航 -->
      <div class="header">
        <p class="page-title">
          在左侧选择您需要启动的模块 在右侧配置选择要启动的模块的启动参数
        </p>
        <div class="btn-group">
          <a-button @click="handleSave" size="large">保存</a-button>
          <a-button type="primary" @click="handleStart" size="large">启动</a-button>
        </div>
      </div>

      <!-- loading -->
      <div v-if="showLoading" class="loading-mask" :class="fadeClass">
        <div class="loading-container">
          <div class="title-wrapper">
            <h1>蜂群克隆-控制面板</h1>
            <p>版本: {{ version }}</p>
          </div>
          <div class="icon-wrapper">
            <a-spin :indicator="indicator" size="large" />
          </div>
        </div>
      </div>

      <!-- 表单 -->
      <StartupForm ref="startupFormRef" :config="startupConfig" />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { notification } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import StartupForm from '@/components/startup/StartupForm.vue';
import type { StartupConfig } from '@/types/startupConfig';
import { initStore } from '@/composables/useConfigStore';
import Sidebar from '@/components/startup/Sidebar.vue';
import { collectSelected } from '@/composables/useSelectedModules';
import { saveConfig, startService } from '@/api/configSaveApi';
import { useRetryRequest } from '@/composables/useRetryRequest';
import { fetchVersion, fetchStartupParam } from '@/api/health';

const indicator = h(LoadingOutlined, {
  style: { fontSize: '50px', color: '#548AF7' },
  spin: true,
});

const version        = ref('获取中...');
const showLoading    = ref(true);
const fadeClass      = ref('');
const startupConfig  = ref<StartupConfig>([]);
const startupFormRef = ref<InstanceType<typeof StartupForm>>();

const { exec: loadVersion }  = useRetryRequest(fetchVersion);
const { exec: loadStartup }  = useRetryRequest(fetchStartupParam);

onMounted(async () => {
  try {
    version.value = await loadVersion().then(d => d.version === 'error' ? '未知版本' : d.version);
  } catch (e: any) {
    version.value = '获取失败';
  }

  try {
    const data = await loadStartup();
    initStore(data);
    startupConfig.value = data;
  } catch {
    /* 网络层已弹窗，此处不再重复提示 */
  }

  fadeClass.value = 'fade-enter-active';
  setTimeout(() => {
    fadeClass.value = 'fade-out';
    setTimeout(() => (showLoading.value = false), 300);
  }, 800);
});

const { exec: execSave }   = useRetryRequest(saveConfig);
const { exec: execStart }  = useRetryRequest(startService);

async function handleSave() {
  const cfg = startupFormRef.value?.collectValues();
  const selected = collectSelected().flatMap(i => i.module);
  await execSave(cfg, selected);
  notification.success({ message: '保存成功', description: '配置已暂存', placement: 'bottomRight' });
}

async function handleStart() {
  const cfg = startupFormRef.value?.collectValues();
  const selected = collectSelected().flatMap(i => i.module);
  await execStart(cfg, selected);
  notification.success({ message: '启动成功', description: '服务正在启动...', placement: 'bottomRight' });
}
</script>

<style scoped>
html, body { overflow: hidden; }

.header {
  position: fixed;
  top: 0;
  left: 260px;
  right: 0;
  height: 64px;
  padding: 0 20px 0 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1rem;
  font-weight: 200;
  margin: 0;
  text-align: left;
  flex: 1;
}

.btn-group { display: flex; gap: 16px; }

.main-scroll {
  height: 100vh;
  overflow-y: auto;
  padding: 84px 20px 20px;
  background-color: #fff;
}

.loading-mask {
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.title-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.title-wrapper h1 { margin: 0; font-weight: bold; }
.title-wrapper p  { margin: 4px 0 0; color: #666; }

.icon-wrapper {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-out {
  animation: fade-out 0.4s ease forwards;
}
@keyframes fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>