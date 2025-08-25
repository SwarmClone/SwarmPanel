<template>
  <a-config-provider :theme="antdTheme">
    <div class="app-container">
      <!-- 加载蒙版 -->
      <div v-if="!isBackendHealthy" class="loading-mask">
        <div class="loading-content">
          <a-spin :indicator="indicator" size="large" />
          <h2>正在连接服务器...</h2>
          <p>请稍候，正在建立与服务器的连接</p>
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <!-- 主应用内容 -->
      <div :class="{ 'app-content': true, 'blurred': !isBackendHealthy }">
        <router-view/>
      </div>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { antdTheme, isDark } from '@/main';
import { useHealthCheck } from '@/composables/useHealthCheck';
import { h, onMounted, watch } from 'vue';
import { LoadingOutlined } from '@ant-design/icons-vue'

const { isBackendHealthy, startHealthPolling } = useHealthCheck();

/**
 * 设置TDesign的主题模式
 */
const setTDesignTheme = () => {
  if (isDark.value) {
    document.documentElement.setAttribute('theme-mode', 'dark');
  } else {
    document.documentElement.removeAttribute('theme-mode');
  }
}

onMounted(() => {
  startHealthPolling(2000);
  // 初始化设置TDesign主题
  setTDesignTheme();
});

// 监听主题变化，同步更新TDesign主题
watch(isDark, () => {
  setTDesignTheme();
});

const indicator = h(LoadingOutlined, {
  style: { fontSize: '50px', color: '#548AF7' },
  spin: true
})
</script>

<style>
@font-face {
  font-family: 'MiSans-Demibold';
  src: url('./assets/font/MiSans-Demibold.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

* {
  font-family: 'MiSans-Demibold', sans-serif;
}

.app-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.app-content {
  width: 100%;
  height: 100%;
  transition: filter 0.3s ease;
}

.app-content.blurred {
  filter: blur(3px);
  pointer-events: none;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.loading-content {
  text-align: center;
  color: white;
  padding: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-content h2 {
  margin: 20px 0 10px;
  font-size: 24px;
  font-weight: 500;
}

.loading-content p {
  margin: 0 0 20px;
  font-size: 16px;
  opacity: 0.8;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: loadingDot 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes loadingDot {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>