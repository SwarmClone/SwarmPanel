<template>
  <a-config-provider :theme="antdTheme">
    <a-layout style="min-height: 100vh">
      <UnifiedSidebar
        :config="startupConfig"
        :status="runningStatus"
        :is-running="isRunning"
        :style="{ backgroundColor: token.colorBgContainer }"
      />

      <a-layout-content class="main-scroll">
        <div class="header"
          :style="{ backgroundColor: token.colorBgContainer }">
          <p class="page-title">
            {{ isRunning ? '系统消息总览' : '启动前参数配置' }}
          </p>

          <!-- 主题切换 -->
          <a-tooltip placement="bottom" title="切换主题">
            <a-button type="text" size="large" @click="toggleAntdTheme">
              <font-awesome-icon :icon="isDark ? ['fas', 'sun'] : ['fas', 'moon']" />
            </a-button>
          </a-tooltip>

          <div class="btn-group">
            <a-button size="large" @click="handleSave">保存</a-button>
            <a-button type="primary" size="large" @click="handleStart">启动</a-button>
          </div>
        </div>

        <!-- 启动中蒙版 -->
        <transition name="fade">
          <div
            v-if="starting"
            class="loading-mask"
            :style="{ backgroundColor: token.colorBgMask }"
          >
            <div
              class="loading-card"
              :style="{ backgroundColor: token.colorBgContainer }"
            >
              <div class="title-wrapper">
                <h1>正在启动中</h1>
                <p>请耐心等待</p>
              </div>
              <div class="icon-wrapper">
                <a-spin :indicator="indicator" size="large" />
              </div>
            </div>
          </div>
        </transition>

        <!-- 首次加载蒙版 -->
        <transition name="fade">
          <div
            v-if="showLoading"
            class="loading-mask"
            :style="{ backgroundColor: token.colorBgMask }"
          >
            <div
              class="loading-card"
              :style="{ backgroundColor: token.colorBgContainer }"
            >
              <div class="title-wrapper">
                <h1>蜂群克隆-控制面板</h1>
                <p>版本: {{ version }}</p>
              </div>
              <div class="icon-wrapper">
                <a-spin :indicator="indicator" size="large" />
              </div>
            </div>
          </div>
        </transition>

        <StartupForm v-if="!isRunning" ref="startupFormRef" :config="startupConfig" />
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, h } from 'vue'
import axios from 'axios'
import { notification, theme } from 'ant-design-vue'
import { LoadingOutlined } from '@ant-design/icons-vue'
import StartupForm from '@/components/startup/StartupForm.vue'
import type { StartupConfig } from '@/types/startupConfig'
import { initStore } from '@/composables/useConfigStore'
import { collectSelected } from '@/composables/useSelectedModules'
import { saveConfig, startService } from '@/api/configSaveApi'
import { useRetryRequest } from '@/composables/useRetryRequest'
import { fetchVersion, fetchStartupParam } from '@/api/health'
import UnifiedSidebar from '@/components/startup/UnifiedSidebar.vue'
import { isDark, antdTheme } from '@/main'

const indicator = h(LoadingOutlined, { style: { fontSize: '50px', color: '#548AF7' }, spin: true })

/* token：实时暗黑/亮色背景色 */
const { token } = theme.useToken()

const version = ref('获取中...')
const showLoading = ref(true)
const fadeClass = ref('')
const startupConfig = ref<StartupConfig>([])
const startupFormRef = ref<InstanceType<typeof StartupForm>>()
const runningStatus = ref<any[]>([])
const isRunning = ref(false)
const starting = ref(false)

const { exec: loadVersion } = useRetryRequest(fetchVersion)
const { exec: loadStartup } = useRetryRequest(fetchStartupParam)
const { exec: execStart } = useRetryRequest(startService)

onMounted(async () => {
  try {
    version.value = await loadVersion().then(d => (d.version === 'error' ? '未知版本' : d.version))
  } catch {
    version.value = '获取失败'
  }

  try {
    const data = await loadStartup()
    initStore(data)
    startupConfig.value = data
  } catch {
    /* 已弹窗，不再提示 */
  }

  fadeClass.value = 'fade-enter-active'
  setTimeout(() => {
    fadeClass.value = 'fade-out'
    setTimeout(() => (showLoading.value = false), 300)
  }, 800)
})

async function handleSave() {
  const cfg = startupFormRef.value?.collectValues();
  const selected = collectSelected().flatMap(i => i.module);

  const dataToSave = {
    value: cfg,
    selectedModules: selected,
  };

  const jsonString = JSON.stringify(dataToSave, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // 文件名：config_年月日时分秒毫秒.json
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  a.download = `config_${timestamp}.json`;

  a.click();
  a.remove();

  notification.success({ message: '保存成功', description: '配置已暂存', placement: 'bottomRight' });
}

async function handleStart() {
  const cfg = startupFormRef.value?.collectValues()
  const selected = collectSelected().flatMap(i => i.module)
  console.log(cfg);
  console.log(selected);

  starting.value = true
  try {
    const res = await execStart(cfg, selected)
    if (res.status === 'started') {
      isRunning.value = true
      startPolling(selected)
    }
  } finally {
    starting.value = false
  }
}

let timer: number | null = null
function startPolling(selectedModules: string[]) {
  const fetch = async () => {
    try {
      const joined = selectedModules.join(',')
      const url = `http://localhost:8000/api/get_status?selected=${encodeURIComponent(joined)}`
      const res = await axios.get(url)
      runningStatus.value = Array.isArray(res.data) ? res.data : []
    } catch {
      runningStatus.value = []
    }
  }
  fetch()
  timer = window.setInterval(fetch, 500)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const toggleAntdTheme = () => {
  isDark.value = !isDark.value
  antdTheme.value.algorithm = isDark.value
    ? theme.darkAlgorithm
    : theme.defaultAlgorithm
  localStorage.setItem('antd-theme', isDark.value ? 'dark' : 'light')
}
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
}
.loading-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-card {
  width: 60vw;
  max-width: 480px;
  min-height: 240px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
}
.title-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.title-wrapper h1 {
  font-size: 1.5rem;
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
.theme-btn {
  margin-right: 16px;
  transition: color 0.3s;
}
</style>