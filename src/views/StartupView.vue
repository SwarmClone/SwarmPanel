<template>
  <div class="startup-view">
  <a-layout style="min-height: 100vh">
    <!-- 侧边栏 -->
    <Sidebar :config="startupConfig" />
    <a-layout-content class="main-scroll">
      <!-- 顶部导航 -->
      <div class="header">
        <p class="page-title">在左侧选择您需要启动的模块 在右侧配置选择要启动的模块的启动参数</p>
        <div class="btn-group">
          <a-button @click="handleSave" size="large">保存</a-button>
          <a-button type="primary" @click="handleStart" size="large">启动</a-button>
        </div>
      </div>

      <div
        v-if="showLoading"
        class="loading-mask"
        :class="fadeClass">
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
      <StartupForm
        ref="startupFormRef"
        :config="startupConfig"
      />
    </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h} from 'vue';
import axios from 'axios';
import { notification } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import StartupForm from '@/components/startup/StartupForm.vue';
import type { StartupConfig } from '@/types/startupConfig';
import { initStore } from '@/composables/useConfigStore';
import Sidebar from '@/components/startup/Sidebar.vue';
import { collectSelected } from '@/composables/useSelectedModules';

const indicator = h(LoadingOutlined, { style: { fontSize: '50px', color: '#548AF7' }, spin: true });

const version   = ref('获取中...');
const showLoading = ref(true);   // 显示 loading
const fadeClass   = ref('');
const startupConfig = ref<StartupConfig>([]);
const startupFormRef = ref<InstanceType<typeof StartupForm>>();

const host = '127.0.0.1';
const port = '8000';

onMounted(async () => {
  await getVersion();
  await getStartupInfo();

  fadeClass.value = 'fade-enter-active';
  /* 强制 0.8 秒 loading*/
  setTimeout(async () => {
    fadeClass.value = 'fade-out';
    setTimeout(() => (showLoading.value = false), 300);
  }, 800);
});

async function getVersion() {
  try {
    const { data } = await axios.get(`http://${host}:${port}/api/get_version`);
    version.value = data.version === 'error' ? '未知版本' : data.version;
  } catch {
    openNotification('error', '获取版本号失败', '请等待后端服务正常启动后重试');
    version.value = '获取失败';
  }
}

async function getStartupInfo() {
  try {
    const { data } = await axios.get(`http://${host}:${port}/api/startup_param`);
    initStore(data);
    startupConfig.value = data;
  } catch {
    openNotification('error', '获取启动信息失败', '请等待后端服务正常启动后重试');
  }
}

function handleSave() {
  const cfg = startupFormRef.value?.collectValues();
  const selected = collectSelected();
  console.log('保存的配置：', cfg);
  console.log('勾选的模块：', selected);
  openNotification('success', '保存成功', '配置已暂存');
}

function handleStart() {
  const cfg = startupFormRef.value?.collectValues();
  const selected = collectSelected();
  console.log('启动的配置：', cfg);
  console.log('勾选的模块：', selected);
  openNotification('success', '启动成功', '服务正在启动...');
}

const openNotification = (
  type: 'success' | 'info' | 'warning' | 'error',
  title: string,
  message: string
) => {
  notification[type]({ message: title, description: message, placement:'bottomRight'});
}
</script>

<style scoped>
.startup-view {
  padding: 20px;
}

.main-scroll {
  height: 100vh;
  overflow-y: auto;
  padding: 20px 20px;
  background-color: #FFFFFF;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右分布 */
  margin-bottom: 24px;
}

.page-title {
  font-size: 1rem;
  font-weight: 200;
  margin: 0;
}

.btn-group {
  display: flex;
  gap: 16px; /* 按钮间距 */
}

.loading-mask {
  position: fixed;
  inset: 0;
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

/* 上半区标题绝对居中 */
.title-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-wrapper h1 {
  margin: 0;
}

.title-wrapper p {
  margin: 4px 0 0;
  color: #666;
}

/* 下半区图标垂直居中 */
.icon-wrapper {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-out {
  animation: fade-out 0.3s ease forwards;
}

@keyframes fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>