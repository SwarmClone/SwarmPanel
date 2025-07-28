import { reactive, ref, watchEffect } from 'vue'

const STORAGE_KEY = 'selectedModules_v2'

/* 从 localStorage 恢复初始值 */
const initRaw = localStorage.getItem(STORAGE_KEY)
const init: Record<string, string[]> = initRaw ? JSON.parse(initRaw) : {}
export const selectedModules = reactive<Record<string, Set<string>>>(
  Object.fromEntries(
    Object.entries(init).map(([k, arr]) => [k, new Set(arr)])
  )
)

watchEffect(() => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      Object.fromEntries(
        Object.entries(selectedModules).map(([k, s]) => [k, [...s]])
      )
    )
  )
})
export const manualCollapsed = reactive<Set<string>>(new Set())

export const toggleModule = (role: string, module: string) => {
  if (!selectedModules[role]) selectedModules[role] = new Set()
  const set = selectedModules[role]
  const key = `${role}.${module}`

  if (set.has(module)) {
    set.delete(module)
  } else {
    set.add(module)
    manualCollapsed.delete(key)
  }
}

export const shouldPanelBeOpen = (
  role: string,
  module: string,
  userExpanded: string[]
): boolean => {
  const key = `${role}.${module}`
  if (manualCollapsed.has(key)) return false
  if (userExpanded.includes(key)) return true
  if (selectedModules[role]?.has(module)) return true
  return false
}

export const markManualCollapsed = (key: string) => manualCollapsed.add(key)
export const markManualExpanded  = (key: string) => manualCollapsed.delete(key)

export const collectSelected = () =>
  Object.entries(selectedModules)
    .filter(([, s]) => s.size)
    .map(([role, s]) => ({ role, module: Array.from(s) }))

export const isModuleSelected = (role: string, module: string) =>
  selectedModules[role]?.has(module) ?? false

export const collectFiltered = (
  fullCfg: Record<string, Record<string, any>>
): Record<string, Record<string, any>> => {
  const res: Record<string, Record<string, any>> = {}
  const selected = collectSelected()
  selected.forEach(({ role, module }) => {
    if (!fullCfg[role]) return
    res[role] = res[role] || {}
    module.forEach(m => {
      if (fullCfg[role][m]) res[role][m] = fullCfg[role][m]
    })
  })
  return res
}

export const highlightedKey = ref<string | null>(null)
export const highlightModule = (role: string, module: string) => {
  highlightedKey.value = `${role}.${module}`
}
export const clearHighlight = () => {
  highlightedKey.value = null
}