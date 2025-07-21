<template>
  <div :id="panelKey">
    <a-collapse
      :active-key="activeKeys"
      @change="handleChange"
    >
      <a-collapse-panel
        :header="module.module_name"
        :key="panelKey"
      >
        <p style="margin-bottom: 12px;">{{ module.desc }}</p>

        <div class="module-wrapper" :class="{ masked: !enabled }">
          <ConfigItem
            v-for="cfg in module.config"
            :key="cfg.name"
            :config="cfg"
            :role-name="roleName"
            :module-name="module.module_name"
            :config-name="cfg.name"
            :disabled="!enabled"
          />
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import type { Module } from '@/types/startupConfig'
import ConfigItem from './ConfigItem.vue'
import {
  isModuleSelected,
  highlightedKey
} from '@/composables/useSelectedModules'
import { shouldPanelBeOpen, markManualCollapsed, markManualExpanded } from '@/composables/useSelectedModules'
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps<{ module: Module; roleName: string }>()

const panelKey = computed(() => `${props.roleName}.${props.module.module_name}`)
const enabled = computed(() => isModuleSelected(props.roleName, props.module.module_name))

const userExpanded = ref<string[]>([])

const activeKeys = computed(() =>
  shouldPanelBeOpen(props.roleName, props.module.module_name, userExpanded.value)
    ? [panelKey.value]
    : []
)

const handleChange = (keys: string | string[]) => {
  const arr = Array.isArray(keys) ? keys : [keys]
  if (arr.includes(panelKey.value)) {
    // 用户手动展开
    markManualExpanded(panelKey.value)
  } else {
    // 用户手动折叠
    markManualCollapsed(panelKey.value)
  }
  userExpanded.value = arr.filter(k => k === panelKey.value)
}

/* 首次勾选后高亮并滚动到面板 */
watch(
  () => isModuleSelected(props.roleName, props.module.module_name),
  (v) => {
    if (v) {
      nextTick(() => {
        document.getElementById(panelKey.value)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }
  }
)

/* 高亮定位 */
watch(highlightedKey, (newKey) => {
  if (newKey === panelKey.value) {
    nextTick(() => {
      document.getElementById(panelKey.value)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }
})
</script>

<style scoped>
.module-wrapper {
  position: relative;
}
.masked {
  pointer-events: none;
  user-select: none;
}
.masked::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}
</style>