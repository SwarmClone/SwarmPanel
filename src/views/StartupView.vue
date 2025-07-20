<template>
  <a-layout style="min-height: 100vh">
    <UnifiedSidebar
      :config="startupConfig"
      :status="runningStatus"
      :is-running="isRunning"
    />

    <a-layout-content class="main-scroll">
      <div class="header">
        <p class="page-title">
          {{ isRunning ? '系统消息总览' : '启动前参数配置' }}
        </p>
        <div class="btn-group">
          <a-button @click="handleSave" size="large">保存</a-button>
          <a-button type="primary" @click="handleStart" size="large">启动</a-button>
        </div>
      </div>

      <!-- 启动中蒙版（复用首次加载动画） -->
      <div v-if="starting" class="loading-mask-2">
        <div class="loading-container-2">
          <div class="title-wrapper">
            <h1>正在启动中</h1>
            <p>请耐心等待</p>
          </div>
          <div class="icon-wrapper">
            <a-spin :indicator="indicator" size="large" />
          </div>
        </div>
      </div>

      <!-- 首次加载蒙版 -->
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

      <StartupForm v-if="!isRunning" ref="startupFormRef" :config="startupConfig" />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, h } from 'vue';
import axios from 'axios';
import { notification } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import StartupForm from '@/components/startup/StartupForm.vue';
import type { StartupConfig } from '@/types/startupConfig';
import { initStore } from '@/composables/useConfigStore';
import { collectSelected } from '@/composables/useSelectedModules';
import { saveConfig, startService } from '@/api/configSaveApi';
import { useRetryRequest } from '@/composables/useRetryRequest';
import { fetchVersion, fetchStartupParam } from '@/api/health';
import UnifiedSidebar from '@/components/startup/UnifiedSidebar.vue';

const indicator = h(LoadingOutlined, { style: { fontSize: '50px', color: '#548AF7' }, spin: true });

const version = ref('获取中...');
const showLoading = ref(true);
const fadeClass = ref('');
const startupConfig = ref<StartupConfig>([]);
const startupFormRef = ref<InstanceType<typeof StartupForm>>();
const runningStatus = ref<any[]>([]);
const isRunning = ref(false);
const starting = ref(false);

const { exec: loadVersion } = useRetryRequest(fetchVersion);
const { exec: loadStartup } = useRetryRequest(fetchStartupParam);
const { exec: execSave } = useRetryRequest(saveConfig);
const { exec: execStart } = useRetryRequest(startService);

onMounted(async () => {
  try {
    version.value = await loadVersion().then(d => (d.version === 'error' ? '未知版本' : d.version));
  } catch {
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

async function handleSave() {
  const cfg = startupFormRef.value?.collectValues();
  const selected = collectSelected().flatMap(i => i.module);
  await execSave(cfg, selected);
  notification.success({ message: '保存成功', description: '配置已暂存', placement: 'bottomRight' });
}

async function handleStart() {
  const cfg = startupFormRef.value?.collectValues();
  const selected = collectSelected().flatMap(i => i.module);

  starting.value = true;
  try {
    const res = await execStart(cfg, selected);
    if (res.status === 'started') {
      isRunning.value = true;
      startPolling(selected);
    }
  } finally {
    starting.value = false;
  }
}

let timer: number | null = null;
function startPolling(selectedModules: string[]) {
  const fetch = async () => {
    try {
      const joined = selectedModules.join(",");
      const url = `http://localhost:8000/api/get_status?selected=${encodeURIComponent(joined)}`;
      const res = await axios.get(url);
      runningStatus.value = Array.isArray(res.data) ? res.data : [];
    } catch {
      runningStatus.value = [];
    }
  };
  fetch();
  timer = window.setInterval(fetch, 500);
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
html,
body {
  overflow: hidden;
}
.header {
  position: fixed;
  top: 0;
  left: 260px;
  right: 0;
  height: 64px;
  padding: 0 20px;
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
  flex: 1;
}
.btn-group {
  display: flex;
  gap: 16px;
}
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
.loading-mask-2 {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
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
.loading-container-2 {
  display: flex;
  flex-direction: column;
  height: 50vh;
  width: 60%;
  background-color: #fff;
  border-radius: 10px;
}
.title-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.icon-wrapper {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
}
@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>