<template>
    <div class="chat-container">
      <h1>其他页面</h1>
      <div class="chat-content">
        <p>这里是其他内容的区域</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  
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