<template>
  <a-layout-sider
    width="260"
    class="filter-sidebar"
    :class="isDark ? 'dark' : 'light'"
  >
    <h1>筛选器</h1>
    <p>内容内容内容</p>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { isDark } from '@/main'
</script>

<style scoped>
.filter-sidebar {
  height: 100vh;
  overflow-y: auto;
  padding: 20px;
}
.filter-sidebar.dark {
  background-color: #141414;
}
.filter-sidebar.light {
  background-color: #ffffff;
}
.filter-sidebar h1,
.filter-sidebar p {
  margin: 20px 0;
  text-align: center;
}
.filter-sidebar h1 {
  font-size: 1.75rem;
  font-weight: 600;
}
</style>