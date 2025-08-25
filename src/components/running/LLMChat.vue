<template>
  <!-- 聊天区域 -->
  <div class="chat-area">
    <!-- 消息展示区，倒序显示保证最新消息在底部 -->
    <div ref="chatBox" class="chat-box">
      <template v-for="item in chatMessages" :key="item.id">
        <div :class="['msg-item', item.role]">
          <div class="msg-header">
            <span class="msg-identity">
              {{ item.role === 'llm' ? 'LLM' : (item.identity === 'developer' ? '开发者' : '弹幕') }}
              <span v-if="item.is_whisper" class="msg-whisper">悄悄话</span>
            </span>
          </div>
          <p class="msg-content">{{ item.content }}</p>
          <span class="msg-time">{{ formatTime(item.time) }}</span>
        </div>
      </template>
    </div>

    <!-- 输入区 -->
    <div class="chat-input" @mouseenter="focusInput">
      <t-chat-sender 
        ref="chatSenderRef"
        v-model="inputText" 
        class="chat-sender" 
        :textarea-props="{ 
          placeholder: '请输入消息...', 
        }" 
        :loading="loading" 
        @send="handleSend" 
      > 
        <template #prefix> 
          <div class="sender-prefix"> 
            <a-select 
              v-model:value="selectedIdentity" 
              size="small" 
              style="width: 100px; margin-right: 8px;" 
            > 
              <a-select-option value="developer">开发者</a-select-option> 
              <a-select-option value="danmaku">弹幕</a-select-option> 
            </a-select> 
            <a-button 
              v-if="selectedIdentity === 'developer'"
              :class="{ 'is-active': isWhisper }" 
              variant="text" 
              size="small" 
              @click="toggleWhisper" 
            > 
              悄悄话 
            </a-button> 
          </div> 
        </template> 
        <template #suffix> 
          <a-button size="large" class="btn" @click="handleSend"> 
            <template #icon><SendOutlined /></template>
          </a-button> 
        </template> 
      </t-chat-sender>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { message as antdMessage } from 'ant-design-vue'
import { SendOutlined } from '@ant-design/icons-vue'
import http from '@/api/axios'
import { isDark } from '@/main'

console.log('isDark', isDark.value)

interface ChatMessage {
  id: string
  role: 'user' | 'llm'
  content: string
  time: number
  is_whisper?: boolean
  identity?: 'developer' | 'danmaku'
}

const chatMessages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const chatSenderRef = ref<HTMLElement | any>(null)
const selectedIdentity = ref<'developer' | 'danmaku'>('developer')
const isWhisper = ref(false)

// 监听身份变化，从开发者切换到弹幕时自动关闭悄悄话
watch(selectedIdentity, (newValue, oldValue) => {
  if (oldValue === 'developer' && newValue === 'danmaku' && isWhisper.value) {
    isWhisper.value = false
  }
})

/**
 * 切换悄悄话模式
 */
const toggleWhisper = () => {
  isWhisper.value = !isWhisper.value
}
// 轮询定时器
let msgTimer: number | null = null

/**
 * 自动聚焦输入框
 */
const focusInput = () => {
  if (chatSenderRef.value && chatSenderRef.value.$el) {
    // 获取TDesign组件内部的textarea元素并聚焦
    const textarea = chatSenderRef.value.$el.querySelector('textarea')
    if (textarea) {
      textarea.focus()
    }
  }
}

/**
 * 格式化时间戳为 HH:MM:SS
 * @param ts 秒级时间戳
 */
const formatTime = (ts: number) => {
  const d = new Date(ts * 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * 向后端发送用户消息
 */
const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text) return
  if (loading.value) return

  loading.value = true

  // 本地立即显示用户消息
  chatMessages.value.push({
    id: `${Date.now()}-user`,
    role: 'user',
    content: text,
    time: Math.floor(Date.now() / 1000),
    is_whisper: isWhisper.value,
    identity: selectedIdentity.value
  })
  inputText.value = ''

  try {
    await http.post('/api')
    console.log('消息已发送')
  } catch (err) {
    console.error('发送失败', err)
    antdMessage.error('发送失败')
  } finally {
    loading.value = false
    scrollToBottom()
    nextTick(() => focusInput())
  }
}

/**
 * 获取并过滤后端消息，只取 message_source 包含 'LLM' 的项，并从 message 数组中提取 key === 'text' 的内容
 */
const fetchMessages = async () => {
  try {
    const { data } = await http.get('/api/get_messages')
    console.log('raw messages', data)
    if (!Array.isArray(data) || !data.length) return

    // 展平并过滤 LLM 消息
    const llmMsgs: ChatMessage[] = []
    data.forEach((msgObj: any) => {
      console.log('msgObj.source', msgObj.message_source, 'msgObj.message', msgObj.message)
      // 检查消息来源是否包含 LLM
      if (msgObj.message_source && msgObj.message_source.includes('LLM') && Array.isArray(msgObj.message)) {
        // 查找 key 为 'text' 的消息内容
        const textItem = msgObj.message.find((m: any) => m.key === 'text')
        if (textItem) {
          llmMsgs.push({
            id: `${msgObj.send_time}-${textItem.value.substring(0, 10)}`,
            role: 'llm',
            content: textItem.value,
            time: msgObj.send_time
          })
        }
      }
    })

    if (llmMsgs.length) {
      // 去重：只添加未存在的消息
      llmMsgs.forEach(item => {
        if (!chatMessages.value.find(v => v.id === item.id)) {
          chatMessages.value.push(item)
        }
      })
      scrollToBottom()
    }
  } catch (e) {
    // TODO: 处理错误
    console.error('获取消息失败', e)
  }
}

/**
 * 将滚动条保持在底部
 */
const chatBox = ref<HTMLElement | null>(null)
const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  })
}

onMounted(() => {
  fetchMessages()
  msgTimer = window.setInterval(fetchMessages, 1000)
  scrollToBottom()
  nextTick(() => focusInput())
})

onUnmounted(() => {
  if (msgTimer) clearInterval(msgTimer)
})
</script>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background-color: v-bind(isDark ? '#121212' : '#FFFFFF')
}
.chat-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
}
.msg-item {
  max-width: 80%;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  word-break: break-all;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
.msg-item.user {
  align-self: flex-end;
  background: v-bind(isDark ? '#292929' : '#F5F5F5');
  color: v-bind(isDark ? '#FFFFFF' : '#000000');
  border-bottom-right-radius: 4px;
}
.msg-item.llm {
  align-self: flex-start;
  background: v-bind(isDark ? '#292929' : '#F5F5F5');
  color: v-bind(isDark ? '#FFFFFF' : '#000000');
  border: 1px solid v-bind(isDark ? '#333333' : '#E8E8E8');
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 4px;
}
.msg-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.msg-identity {
  font-size: 12px;
  opacity: 0.7;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: v-bind(isDark ? '#333333' : '#F0F0F0');
}

.msg-time {
  display: block;
  font-size: 12px;
  opacity: 0.6;
  margin-top: 4px;
  text-align: right;
}

.msg-whisper {
  display: inline-block;
  margin-left: 4px;
  font-size: 12px;
  color: #ffffff;
  background-color: rgb(66, 113, 255);
  padding: 2px 6px;
  border-radius: 4px;
}
.chat-input {
  padding: 16px 20px;
  border-top: 1px solid v-bind(isDark ? '#333333' : '#E8E8E8');
  background-color: v-bind(isDark ? '#121212' : '#FFFFFF');
}

.chat-sender {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 移除动态绑定，使用TDesign的CSS变量 */
  background-color: transparent;
}

.chat-sender :deep(.t-textarea__inner) {
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  /* 移除动态绑定，使用TDesign的CSS变量 */
  background-color: transparent;
  color: var(--td-text-color-primary);
  transition: all 0.3s ease;
  min-height: 40px;
  resize: none;
}

.chat-sender :deep(.t-textarea__inner:focus) {
  box-shadow: none;
}

.sender-prefix {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.chat-sender .btn.t-button {
  height: var(--td-comp-size-m);
  padding: 0 16px;
}

.is-active {
  background-color: rgb(94, 91, 255);
  color: #ffffff;
}
</style>