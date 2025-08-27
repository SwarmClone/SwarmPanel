<template>
  <a-layout-sider
    width="260"
    class="sidebar"
    :class="isDark ? 'dark' : 'light'"
  >
    <h1>运行时控制台</h1>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { isDark } from '@/main'
</script>

<style scoped>
.sidebar {
  height: 100vh;
  overflow-y: auto;
  padding: 20px;
}
.sidebar.dark {
  background-color: #141414;
}
.sidebar.light {
  background-color: #ffffff;
}
.sidebar h1,
.sidebar p {
  margin: 20px 0;
  text-align: center;
}
.sidebar h1 {
  font-size: 1.75rem;
  font-weight: 600;
}
</style>