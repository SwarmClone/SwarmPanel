import { reactive } from 'vue';

export const selectedModules = reactive<Record<string, Set<string>>>({});

export const autoExpandPanels = reactive<Set<string>>(new Set());

export const toggleModule = (role: string, module: string) => {
  if (!selectedModules[role]) selectedModules[role] = new Set();
  const set = selectedModules[role];
  const key = `${role}.${module}`;

  if (set.has(module)) {
    set.delete(module);
    // 取消勾选时不自动收起，由用户手动控制
  } else {
    set.add(module);
    autoExpandPanels.add(key); // 勾选后追加
  }
};

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
      if (fullCfg[role][m]) {
        res[role][m] = fullCfg[role][m];
      }
    });
  });
  return res;
};