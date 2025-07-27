<template>
  <!-- 默认 480，导入模式 600 -->
  <a-modal
    :open="open"
    :title="mode === 'save' ? '保存预设' : '从文件导入预设'"
    :centered="true"
    :width="mode === 'save' ? 480 : 600"
    :footer="null"
    @cancel="close"
  >
    <!-- 模式选择 -->
    <a-select v-model:value="mode" style="width: 100%; margin-bottom: 16px">
      <a-select-option value="save">保存当前配置为预设</a-select-option>
      <a-select-option value="import">从文件导入预设</a-select-option>
    </a-select>

    <!-- 保存模式 -->
    <template v-if="mode === 'save'">
      <a-input
        v-model:value="presetName"
        placeholder="请输入预设名称"
        size="large"
        @pressEnter="save"
      />
      <div style="margin-top: 24px; text-align: right">
        <a-button style="margin-right: 12px" @click="close">取消</a-button>
        <a-button
          type="primary"
          :disabled="!presetName.trim()"
          @click="save"
        >
          保存
        </a-button>
      </div>
    </template>

    <!-- 导入模式 -->
    <template v-else>
      <!-- 拖放区域 -->
      <div
        class="drop-zone"
        :class="{ active: isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @click="openFileSelect"
      >
        <CloudUploadOutlined style="font-size: 48px; color: #999" />
        <p>将 JSON 文件拖到此处，或 <a>点击选择</a></p>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".json"
          style="display: none"
          @change="handleSelect"
        />
      </div>

      <!-- 文件列表 -->
      <a-list
        v-if="fileList.length"
        size="small"
        :data-source="fileList"
        style="margin-top: 12px; max-height: 160px; overflow: auto"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            {{ item.name }}
          </a-list-item>
        </template>
      </a-list>

      <!-- 导入按钮 -->
      <div style="margin-top: 16px; text-align: right">
        <a-button style="margin-right: 12px" @click="close">取消</a-button>
        <a-button
          type="primary"
          :disabled="!fileList.length"
          @click="doImport"
        >
          保存
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { message, notification } from 'ant-design-vue';
import { CloudUploadOutlined } from '@ant-design/icons-vue';
import { collectSelected } from '@/composables/useSelectedModules';
import { collectAll } from '@/composables/useConfigStore';
import type { StartupConfig } from '@/types/startupConfig';

interface Props {
  open: boolean;
  fullConfig: StartupConfig;
}

interface Emits {
  (e: 'close'): void;
  (e: 'saved'): void;
}

interface PresetItem {
  name: string;
  config: any;
  selectedModules: string[];
  createdAt: number;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const mode = ref<'save' | 'import'>('save');
const presetName = ref('');
const fileInput = ref<HTMLInputElement>();
const fileList = ref<File[]>([]);
const isDragOver = ref(false);

watch(
  () => props.open,
  (val) => {
    if (!val) reset();
  }
);

function reset() {
  presetName.value = '';
  fileList.value = [];
  mode.value = 'save';
  isDragOver.value = false;
}

function close() {
  emit('close');
}

function save() {
  if (!presetName.value.trim()) return;

  const record: PresetItem = {
    name: presetName.value.trim(),
    config: collectAll(),
    selectedModules: collectSelected().flatMap(i => i.module),
    createdAt: Date.now()
  };

  const list = JSON.parse(localStorage.getItem('userPresets') || '[]');
  list.unshift(record);
  localStorage.setItem('userPresets', JSON.stringify(list));

  notification.success({ message: '已保存', description: presetName.value, placement: 'bottomRight'});
  emit('saved');
  close();
}

function openFileSelect() {
  fileInput.value?.click();
}

function handleSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  addFiles(Array.from(files));
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false;
  if (!e.dataTransfer) return;
  addFiles(Array.from(e.dataTransfer.files));
}

function addFiles(files: File[]) {
  const jsonFiles = files.filter(f => f.name.toLowerCase().endsWith('.json'));
  if (jsonFiles.length !== files.length) {
    message.warning('已过滤非 JSON 文件');
  }
  fileList.value.push(...jsonFiles);
}

async function doImport() {
  if (!fileList.value.length) return;
  try {
    const imported: PresetItem[] = [];
    for (const file of fileList.value) {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object') throw new Error('格式错误');
      const record: PresetItem = {
        name: file.name.replace(/\.json$/i, ''),
        config: data.value || {},
        selectedModules: data.selectedModules || [],
        createdAt: Date.now()
      };
      imported.push(record);
    }
    const list = JSON.parse(localStorage.getItem('userPresets') || '[]');
    list.unshift(...imported);
    localStorage.setItem('userPresets', JSON.stringify(list));
    notification.success({
      message: '批量导入成功',
      description: `共导入 ${imported.length} 条预设`,
      placement: 'bottomRight'
    });
    emit('saved');
    close();
  } catch (e: any) {
    message.error('导入失败：' + e.message);
  }
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}
.drop-zone.active {
  border-color: #4096ff;
}
</style>