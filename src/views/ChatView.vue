<template>
  <div class="chat-container">
    <h1>聊天页面</h1>
    <div class="chat-content">
      <p>这里是聊天内容区域</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 聊天页面的逻辑代码
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-content {
  padding: 16px;
  border-radius: 4px;
  flex: 1;
  overflow: auto;
}

h1 {
  color: black;
  margin-bottom: 16px;
  padding: 8px 16px;
}
</style>