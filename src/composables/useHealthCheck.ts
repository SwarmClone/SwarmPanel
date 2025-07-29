import { ref, onUnmounted } from 'vue'
import axios from 'axios'

const isBackendHealthy = ref(true)
const isCheckingHealth = ref(false)
let healthCheckInterval: number | null = null

export function useHealthCheck() {
  const checkHealth = async () => {
    isCheckingHealth.value = true
    try {
      const response = await axios.get('/api/health', {
        timeout: 3000,
        baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000'
      })
      isBackendHealthy.value = response.data?.status === 'ok'
    } catch (error) {
      isBackendHealthy.value = false
    } finally {
      isCheckingHealth.value = false
    }
  }

  const startHealthPolling = (intervalMs: number = 3000) => {
    // 立即检查一次
    checkHealth()
    
    // 设置定时轮询
    healthCheckInterval = window.setInterval(checkHealth, intervalMs)
  }

  const stopHealthPolling = () => {
    if (healthCheckInterval !== null) {
      clearInterval(healthCheckInterval)
      healthCheckInterval = null
    }
  }

  onUnmounted(() => {
    stopHealthPolling()
  })

  return {
    isBackendHealthy,
    isCheckingHealth,
    checkHealth,
    startHealthPolling,
    stopHealthPolling
  }
}