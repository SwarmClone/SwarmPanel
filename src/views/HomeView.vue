<template>
  <div class="container">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="home" tab="首页">
        <div class="tab-content">
          <h1>首页</h1>
        </div>
      </a-tab-pane>
      <a-tab-pane key="chat" tab="对话">
        <div class="tab-content">
          <ChatView />
        </div>
      </a-tab-pane>
      <a-tab-pane key="settings" tab="设置">
        <div class="tab-content">
          <SettingsView />
        </div>
      </a-tab-pane>
      <a-tab-pane key="other" tab="其他">
        <div class="tab-content">
          <OtherView />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatView from './ChatView.vue';
import SettingsView from './SettingsView.vue';
import OtherView from './OtherView.vue';

const activeKey = ref('home');
</script>

<style scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

:deep(.ant-tabs-nav) {
  margin: 0 auto;
  padding-top: 16px;
}

/* 增大标签页尺寸 */
:deep(.ant-tabs-tab) {
  padding: 8px 45px; /* 调整内边距来增大标签页 */
  font-size: 16px;
}

/* 设置标签页背景颜色和圆角 */
:deep(.ant-tabs-tab) {
  background-color: white;
}

/* 激活状态的标签页样式 */
:deep(.ant-tabs-tab-active) {
  background-color: #00A3D8; /* 激活状态的背景颜色 */
}

:deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: whitesmoke !important; /* 覆盖已有的样式 */
  font-weight: bold;
}

.tab-content {
  padding: 16px;
  background-color: #fff;
  flex: 1;
  overflow: auto;
}

h1 {
  color: black;
  margin-top: 0;
}
</style>