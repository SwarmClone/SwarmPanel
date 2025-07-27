<template>
  <a-drawer
    :open="open"
    title="预设配置"
    placement="right"
    :width="400"
    @close="$emit('close')"
  >
    <!-- 顶部行 -->
    <div class="drawer-header">
      <span :style="{ color: token.colorText }">已保存的预设</span>
      <div style="display:flex; gap: 8px;">
        <a-button type="primary" size="small" @click="showNewModal = true">新建</a-button>
        <a-button type="primary" size="small" @click="showExportModal = true">导出</a-button>
      </div>
    </div>

    <!-- 空列表提示 -->
    <div
      v-if="!presets.length"
      :style="{ color: token.colorTextSecondary, textAlign: 'center', padding: '32px 0' }"
    >
      暂无预设，点击右上角「新建」添加
    </div>

    <!-- 预设列表 -->
    <a-list v-else size="small" :data-source="presets">
      <template #renderItem="{ item }">
        <a-list-item>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <!-- 左侧：名字+日期 -->
            <div style="word-break:break-word; flex:1; margin-right:8px;">
              <span style="font-weight:500;">{{ item.name }}</span>
              <br>
              <span style="font-size:12px; color:#999;">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>
            <!-- 右侧：按钮组 -->
            <div style="white-space:nowrap; flex-shrink:0; display:flex; gap:8px;">
              <a-button type="link" size="small" @click="apply(item)">应用</a-button>
              <a-button type="link" size="small" @click="downloadJson(item.name, item)">
                导出
              </a-button>
              <a-button type="link" danger size="small" @click="remove(item)">
                删除
              </a-button>
            </div>
          </div>
        </a-list-item>
      </template>
    </a-list>

    <!-- 新建弹窗 -->
    <NewPresetModal
      :open="showNewModal"
      :config="currentConfig"
      :selected-modules="currentModules"
      :full-config="fullConfig"
      @close="showNewModal = false"
      @saved="loadPresets"
    />

    <!-- 批量导出弹窗 -->
    <ExportModal
      :open="showExportModal"
      :presets="presets"
      @close="showExportModal = false"
      @export="handleExport"
    />
  </a-drawer>

  <!-- 删除确认预设的 Modal -->
  <a-modal
    v-model:open="showDeleteModal"
    title="确认删除"
    :centered="true"
    :width="400"
    :footer="null"
  >
    <div style="display: flex; align-items: center; gap: 8px">
      <ExclamationCircleOutlined style="color:#ff4d4f;font-size:22px" />
      <span>确定要删除预设 “{{ deleteTarget?.name }}” 吗？</span>
    </div>
    <div style="margin-top: 24px; text-align: right">
      <a-button danger @click="doDelete">确认</a-button>
      <a-button style="margin-left: 8px" @click="showDeleteModal = false">
        取消
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { collectAll, setVal } from '@/composables/useConfigStore';
import { ref, watch } from 'vue';
import { theme, message } from 'ant-design-vue';
import NewPresetModal from './NewPresetModal.vue';
import { collectSelected } from '@/composables/useSelectedModules';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { toggleModule } from '@/composables/useSelectedModules';
import type { StartupConfig } from '@/types/startupConfig';
import ExportModal from '@/components/startup/ExportModal.vue';
import type { ExportPayload } from '@/components/startup/ExportModal.vue';
import { formatDate } from '@/composables/useFormatDate';

interface PresetItem {
  name: string;
  config: any;
  selectedModules: string[];
  createdAt: number;
}

interface Props {
  open: boolean;
  fullConfig: StartupConfig;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { token } = theme.useToken();

const presets = ref<PresetItem[]>([]);
const showNewModal = ref(false);
const showExportModal = ref(false);
const currentConfig = ref();
const currentModules = ref<string[]>([]);
const showDeleteModal = ref(false);
const deleteTarget = ref<PresetItem | null>(null);

watch(
  () => props.open,
  (val) => {
    if (val) {
      currentConfig.value = collectAll();
      currentModules.value = collectSelected().flatMap(i => i.module);
      loadPresets();
    }
  }
);

function loadPresets() {
  presets.value = JSON.parse(localStorage.getItem('userPresets') || '[]');
}

function apply(item: PresetItem) {
  // 清空所有已勾选模块
  collectSelected().forEach(({ role, module }) => {
    module.forEach(m => toggleModule(role, m));
  });

  // 按预设重新勾选
  item.selectedModules.forEach(m => {
    props.fullConfig.forEach(role => {
      if (role.modules.some(mod => mod.module_name === m)) {
        toggleModule(role.role_name, m);
      }
    });
  });

  // 逐字段写回配置值
  const cfg = item.config as Record<string, Record<string, Record<string, any>>>;
  for (const roleName in cfg) {
    for (const moduleName in cfg[roleName]) {
      for (const configName in cfg[roleName][moduleName]) {
        const key = `${roleName}.${moduleName}.${configName}`;
        console.log('key', key);
        setVal(roleName, moduleName, configName, cfg[roleName][moduleName][configName]);
      }
    }
  }

  message.success(`已加载预设：${item.name}`);
  emit('close');
}

function remove(item: PresetItem) {
  deleteTarget.value = item;
  showDeleteModal.value = true;
}

function doDelete() {
  const list: PresetItem[] = JSON.parse(localStorage.getItem('userPresets') || '[]');
  const idx = list.findIndex(p => p.createdAt === deleteTarget.value!.createdAt);
  if (idx > -1) {
    list.splice(idx, 1);
    localStorage.setItem('userPresets', JSON.stringify(list));
    loadPresets();
    message.success('预设已删除');
  }
  showDeleteModal.value = false;
  deleteTarget.value = null;
}

// 统一下载函数（供单条导出 & 批量导出使用）
function downloadJson(filename: string, data: any) {
  const suffix = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
  const finalName = `${filename}_${suffix}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function handleExport(payload: ExportPayload) {
  if (payload.mode === 'current') {
    downloadJson('config', collectAll());
  } else {
    payload.selectedPresets.forEach((name: string) => {
      const p = presets.value.find(p => p.name === name);
      if (p) downloadJson(name, p);
    });
  }
  showExportModal.value = false;
}
</script>

<style scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
:deep(.ant-list-item:hover) {
  background: v-bind('token.colorFillSecondary');
}
</style>