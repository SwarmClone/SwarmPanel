<template>
  <a-config-provider :theme="antdTheme">
    <a-layout style="min-height: 100vh">
      <UnifiedSidebar
        :config="startupConfig"
        :status="runningStatus"
        :is-running="true"
        :style="{ backgroundColor: token.colorBgContainer }"
      />
      <a-layout>
        <a-layout-content class="main-scroll">
          <div class="header" :style="{ backgroundColor: token.colorBgContainer }">
            <div class="header-left">
              <p class="page-title">系统消息总览</p>
            </div>
            <a-tooltip placement="bottom" title="切换主题">
              <a-button type="text" size="large" @click="toggleAntdTheme">
                <font-awesome-icon :icon="isDark ? ['fas', 'sun'] : ['fas', 'moon']" />
              </a-button>
            </a-tooltip>
          </div>

          <!-- 聊天区域 -->
          <div class="chat-area">
            <div class="chat-box">
              <div
                v-for="msg in messages"
                :key="msg.send_time"
                :class="['msg-block', msg.message_type.toLowerCase()]"
              >
                <div class="msg-title">
                  【{{ msg.message_type }}】{{ msg.message_source }} → {{ msg.message_destinations.join(', ') }}
                </div>
                <div class="msg-content">
                  <div v-for="kv in msg.message" :key="kv.key">{{ kv.key }}: {{ kv.value }}</div>
                </div>
                <div class="msg-time">{{ formatDate2(msg.send_time) }}</div>
              </div>
            </div>

            <!-- 固定在底部的输入框 -->
            <div class="chat-input">
              <a-input
                v-model:value="inputText"
                placeholder="输入内容…"
                @pressEnter="send"
              >
                <template #suffix>
                  <a-button type="text" size="small" @click="send">
                    <font-awesome-icon :icon="['fas', 'paper-plane']" />
                  </a-button>
                </template>
              </a-input>
            </div>
          </div>
        </a-layout-content>
        <FilterSidebar />
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { theme } from 'ant-design-vue'
import UnifiedSidebar from '@/components/startup/UnifiedSidebar.vue'
import FilterSidebar from '@/components/running/FilterSidebar.vue'
import { isDark, antdTheme } from '@/main'
import { fetchStartupParam } from '@/api/health'
import { useRetryRequest } from '@/composables/useRetryRequest'
import axios from 'axios'

interface ModuleStatus {
  role_name: string
  modules: Array<{
    module_name: string
    running: boolean
    loaded: boolean
    err: string | null
  }>
}

const { token } = theme.useToken()

const startupConfig = ref([])
const runningStatus = ref<ModuleStatus[]>([])
const messages = ref<any[]>([])
const inputText = ref('')

const selectedModules = JSON.parse(localStorage.getItem('selectedModules') || '[]')

const { exec: loadStartup } = useRetryRequest(fetchStartupParam)

const formatDate2 = (ts: number) => {
  const d = new Date(ts * 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(async () => {
  const data = await loadStartup()
  startupConfig.value = data
  if (selectedModules.length) {
    startPolling()
    startMessages()
  }
})

let timer: number | null = null
function startPolling() {
  const fetch = async () => {
    try {
      const url = `http://localhost:8000/api/get_status?selected=${encodeURIComponent(selectedModules.join(','))}`
      const res = await axios.get(url)
      runningStatus.value = Array.isArray(res.data) ? res.data : []
    } catch {
      runningStatus.value = []
    }
  }
  fetch()
  timer = window.setInterval(fetch, 500)
}

let msgTimer: number | null = null

function startMessages() {
  const fetch = async () => {
    try {
      const { data } = await axios.get('/api/get_messages')
      if (Array.isArray(data) && data.length) {
        messages.value.unshift(...data.reverse())
      }
    } catch (e) {
      console.error(e)
    }
  }
  fetch()
  msgTimer = window.setInterval(fetch, 1000)
}

const send = () => {
  if (!inputText.value.trim()) return
  messages.value.unshift({
    message_name: 'User',
    send_time: Math.floor(Date.now() / 1000),
    message_type: 'USER',
    message_source: 'Frontend',
    message_destinations: ['Backend'],
    message: [{ key: 'text', value: inputText.value }]
  })
  inputText.value = ''
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (msgTimer) clearInterval(msgTimer)
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
.main-scroll {
  position: relative;
  height: 100vh;
  overflow-y: auto;
  padding: 64px 20px 20px;
}
.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  padding: 0 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-area {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}
.chat-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  padding: 0 8px;
}
.msg-block {
  margin: 0;
  padding: 8px;
  line-height: 1.4;
  word-break: break-all;
  border-radius: 0;
}
.msg-block.data   { background: #52c41a; color: #fff; }
.msg-block.signal { background: #1890ff; color: #fff; }
.msg-title   { font-weight: 600; margin-bottom: 4px; }
.msg-content { margin-bottom: 6px; }
.msg-time    { font-size: 12px; opacity: 0.8; }
.chat-input {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 260px;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-container);
}
</style>