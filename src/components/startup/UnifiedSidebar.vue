<template>
  <a-layout-sider
    width="260"
    class="unified-sidebar"
    :style="{ backgroundColor: 'var(--color-bg-container)' }"
  >
    <!-- 未启动：配置菜单 -->
    <template v-if="!isRunning">
      <h1>启动前参数配置</h1>
      <p>在此选择要启动的模块</p>

      <a-menu
        v-if="config.length"
        mode="inline"
        :open-keys="openKeys"
        :selected-keys="[]"
        @openChange="handleOpenChange"
        @select="handleSelect"
      >
        <a-sub-menu
          v-for="role in config"
          :key="role.role_name"
          :title="role.role_name"
        >
          <a-menu-item
            v-for="mod in role.modules"
            :key="`${role.role_name}.${mod.module_name}`"
          >
            <span style="display:flex;align-items:center">
              <a-checkbox
                :checked="isSelected(role.role_name, mod.module_name)"
                @change.stop="handleToggle(role, mod)"
              />
              <span style="margin-left:8px">{{ mod.module_name }}</span>
            </span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>

      <div v-else>
        <p>配置为空</p>
      </div>
    </template>

    <!-- 已启动：状态列表 -->
    <template v-else>
      <h1>模块状态</h1>
      <div v-if="flatModules.length">
        <a-menu mode="inline" :selected-keys="[]">
          <a-menu-item
            v-for="item in flatModules"
            :key="item.key"
            style="display:flex;align-items:center;"
          >
            <a-tooltip placement="top" :title="statusText(item)">
              <a-badge
                :color="badgeColor(item)"
                style="
                  margin-left:8px;
                  transform: scale(1.3);
                  display: inline-block;"
              />
            </a-tooltip>
            {{ item.module_name }}
          </a-menu-item>
        </a-menu>
      </div>
      <div v-else>
        <p>暂无状态数据</p>
      </div>
    </template>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { StartupConfig } from '@/types/startupConfig'
import { toggleModule, isModuleSelected, selectedModules } from '@/composables/useSelectedModules'

interface ModuleStatus {
  role_name: string
  modules: Array<{
    module_name: string
    running: boolean
    loaded: boolean
    err: string | null
  }>
}

const props = defineProps<{
  config: StartupConfig
  status: ModuleStatus[]
  isRunning: boolean
}>()

/* ---------- 原有逻辑 ---------- */
const openKeys = ref<string[]>([])

watch(
  () => props.config,
  val => {
    if (val && val.length) openKeys.value = [val[0].role_name]
  },
  { immediate: true }
)

const handleOpenChange = (keys: string[]) => {
  openKeys.value = keys
}

const handleSelect = ({ key }: { key: string }) => {
  document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const isSelected = isModuleSelected

const flatModules = computed(() =>
  (props.status || []).flatMap(role =>
    role.modules.map(m => ({
      key: `${role.role_name}.${m.module_name}`,
      module_name: m.module_name,
      running: m.running,
      loaded: m.loaded,
      err: m.err
    }))
  )
)

const badgeColor = (item: any) => {
  if (item.err) return 'red'
  if (item.running) return 'green'
  if (item.loaded) return 'blue'
  return 'gold'
}

const statusText = (item: any) => {
  if (item.err) return `异常终止: ${item.err}`
  if (item.running) return '正在运行中'
  if (item.loaded) return '已加载'
  return '正在加载中'
}

function handleToggle(roleCfg: any, mod: any) {
  const roleName = roleCfg.role_name
  const modName  = mod.module_name
  const limit    = roleCfg.allowed_num ?? Infinity

  // 当前 role 下已选模块
  const selectedInRole = Array.from(selectedModules[roleName] || [])

  // 如果即将超限，先取消最早被选中的模块
  if (!isSelected(roleName, modName) && selectedInRole.length >= limit) {
    toggleModule(roleName, selectedInRole[0])
  }

  // 执行本次勾选/取消勾选
  toggleModule(roleName, modName)
}
</script>

<style scoped>
.unified-sidebar {
  height: 100vh;
  overflow-y: auto;
  padding: 20px;
}
.unified-sidebar h1,
.unified-sidebar p {
  margin: 20px 0;
  text-align: center;
}
h1 {
  font-size: 1.75rem;
  font-weight: 600;
}
</style>