import { reactive, ref } from 'vue';

/* 原有状态 */
export const selectedModules = reactive<Record<string, Set<string>>>({});

export const manualCollapsed = reactive<Set<string>>(new Set());

export const toggleModule = (role: string, module: string) => {
  if (!selectedModules[role]) selectedModules[role] = new Set();
  const set = selectedModules[role];
  const key = `${role}.${module}`;

  if (set.has(module)) {
    // 取消勾选：仅去掉选择，不操作折叠状态
    set.delete(module);
  } else {
    // 勾选：加入选择 + 删除手动折叠记录（允许再次自动展开）
    set.add(module);
    manualCollapsed.delete(key);
  }
};

/**
 * 计算面板是否展开
 * @param role         当前角色
 * @param module       当前模块
 * @param userExpanded 用户手动展开的 key 数组
 */
export const shouldPanelBeOpen = (
  role: string,
  module: string,
  userExpanded: string[]
): boolean => {
  const key = `${role}.${module}`;

  // 用户手动折叠 -> 强制关闭
  if (manualCollapsed.has(key)) return false;

  // 用户手动展开 -> 强制打开
  if (userExpanded.includes(key)) return true;

  // 当前被勾选 -> 自动打开（每次勾选都会触发）
  if (selectedModules[role]?.has(module)) return true;

  return false;
};

export const markManualCollapsed = (key: string) => manualCollapsed.add(key);
export const markManualExpanded  = (key: string) => manualCollapsed.delete(key);

export const collectSelected = () =>
  Object.entries(selectedModules)
    .filter(([, s]) => s.size)
    .map(([role, s]) => ({ role, module: Array.from(s) }));

export const isModuleSelected = (role: string, module: string) =>
  selectedModules[role]?.has(module) ?? false;

export const collectFiltered = (
  fullCfg: Record<string, Record<string, any>>
): Record<string, Record<string, any>> => {
  const res: Record<string, Record<string, any>> = {};
  const selected = collectSelected();
  selected.forEach(({ role, module }) => {
    if (!fullCfg[role]) return;
    res[role] = {};
    module.forEach(m => {
      if (fullCfg[role][m]) res[role][m] = fullCfg[role][m];
    });
  });
  return res;
};

export const highlightedKey = ref<string | null>(null);

export const highlightModule = (role: string, module: string) => {
  highlightedKey.value = `${role}.${module}`;
};
export const clearHighlight = () => {
  highlightedKey.value = null;
};