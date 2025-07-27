<template>
  <a-modal
    :open="open"
    title="导出配置"
    :centered="true"
    :width="480"
    :footer="null"
    @cancel="handleCancel"
  >
    <!-- 模式选择 -->
    <a-radio-group v-model:value="mode" style="margin-bottom: 16px">
      <a-radio value="current">导出当前页面配置</a-radio>
      <a-radio value="presets">导出已有预设</a-radio>
    </a-radio-group>

    <a-checkbox-group
        v-if="mode === 'presets'"
        v-model:value="selectedPresets"
        style="margin-bottom: 16px"
        >
        <a-checkbox
            v-for="preset in props.presets"
            :key="preset.name"
            :value="preset.name"
            style="display: flex; align-items: center; margin-bottom: 8px; width: 100%;"
        >
            <span style="display: flex; align-items: center; width: 100%;">
            <span style="word-break: break-word; flex: 1; margin-right: 8px;">
                {{ preset.name }}
            </span>
            <span style="font-size: 12px; color: #999; white-space: nowrap;">
                {{ formatDate(preset.createdAt) }}
            </span>
            </span>
        </a-checkbox>
    </a-checkbox-group>
    <p v-if="mode === 'presets' && presets.length === 0"
        style="color: #999; margin-top: 8px;">
        暂无预设，请先添加或导入。
    </p>

    <!-- 底部按钮 -->
    <div style="text-align: right">
      <a-button style="margin-right: 12px" @click="handleCancel">取消</a-button>
      <a-button type="primary" :disabled="!canExport" @click="handleExport">
        导出
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { formatDate } from '@/composables/useFormatDate';

export interface PresetItem {
  name: string;
  config: any;
  selectedModules: string[];
  createdAt: number;
}

export interface Props {
  open: boolean;
  presets: PresetItem[];
}

export interface Emits {
  (e: 'close'): void;
  (e: 'export', payload: ExportPayload): void;
}

type ExportMode = 'current' | 'presets';
export interface ExportPayload {
  mode: ExportMode;
  selectedPresets: string[];
}

defineOptions({ name: 'StartupExportModal' });

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const mode = ref<ExportMode>('current');
const selectedPresets = ref<string[]>([]);

console.log('presets', props.presets);

const canExport = computed(() =>
  mode.value === 'current' ? true : selectedPresets.value.length > 0
);

function handleCancel() {
  emit('close');
}

function handleExport() {
  emit('export', {
    mode: mode.value,
    selectedPresets: selectedPresets.value
  });
  selectedPresets.value = [];
  message.success('导出已开始');
  
}
</script>

<style scoped>
.preset-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
}
.name {
  word-break: break-word;
  flex: 1;
}
.date {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}
</style>