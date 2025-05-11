<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getLastestVersion } from '../api/version';
import { useRouter } from 'vue-router';

const version = ref('Ver. 0.0');
const router = useRouter();

onMounted(async () => {
  const latestVersion = await getLastestVersion();
  version.value = `Ver. ${latestVersion}`;
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const handleKeyDown = (event: KeyboardEvent) => {
  console.log('按键被按下:', event.key); 
  if (event.key === 'Enter') {
    console.log('尝试跳转到 ASRDummy 页面'); 
    router.push({ name: 'ASRDummy' }); 
  }
};
</script>

<template>
  <div class="container">
    <img
      alt="Splash Screen"
      class="splash"
      src="@/assets/img/Background-1.png"
    />
    <h1 class="title">蜂群克隆-AI控制面板</h1>
    <p class="tip">按下Enter键打开控制面板</p>
    <div class="lastest-version">
      <h2 class="lastest">Lastest </h2>
      <h2 class="version">{{ version }}</h2>
    </div>
    <div class="links">
      <a href="https://github.com/SwarmClone" target="_blank" rel="noopener noreferrer">
        <p>Github</p>
      </a>
      <div class="separator"></div>
      <a href="https://space.bilibili.com/526786514" target="_blank" rel="noopener noreferrer">
        <p>Bilibili</p>
      </a>
    </div>
  </div>
</template>

<style scoped>
.splash {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.title {
  font-family: 'AlibabaPuHuiTi', sans-serif;
  color: #004491;
  font-size: 4vw;
  margin-bottom: 6vh;
  font-weight: bold;
  text-align: center;
  position: absolute;
  top: 35vh;
  left: 50%;
  transform: translateX(-50%);
}

.lastest-version {
  position: absolute;
  align-items: baseline;
  gap: 1vw;
  top: 68vh;
  right: 65vw;
  display: inline-flex;
}

.lastest {
  font-family: 'Righteous', sans-serif;
  color: #004491;
  font-size: 1.6vw;
  margin: 0;
}

.version {
  font-family: 'Righteous', sans-serif;
  color: #004491;
  font-size: 3.0vw;
  margin: 0;
}

.links {
  position: absolute;
  bottom: 4.5vh;
  left: 85.5%;
  transform: translateX(-50%);
  display: flex;
  gap: 1vw;
  align-items: center;
}

.links a {
  text-decoration: none;
  color: #004491;
}

.links p {
  margin: 0;
  font-family: 'Righteous', sans-serif;
  font-size: 1.2vw;
}

.links p:hover {
  color: #007bff;
  text-decoration: underline;
}

.links p:active {
  color: #0056b3;
  text-decoration: underline;
}

.separator {
  width: 2px;
  height: 1.5em;
  background-color: #004491;
}

.tip {
  font-family: 'AlibabaPuHuiTi', sans-serif;
  color: #004491;
  font-size: 1vw;
  text-align: center;
  position: absolute;
  top: calc(35vh + 6vh + 7vw); /* 在 h1 下方，根据 h1 的 top、margin-bottom 和 font-size 计算 */
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.7; /* 设置透明度 */
}
</style>
