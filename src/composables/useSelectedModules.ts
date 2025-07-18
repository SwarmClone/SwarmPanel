import { reactive } from 'vue';

/**
 * 结构：{ [roleName: string]: Set<moduleName> }
 */
export const selectedModules = reactive<Record<string, Set<string>>>({});

/** 勾选 / 取消勾选 */
export const toggleModule = (role: string, module: string) => {
  if (!selectedModules[role]) selectedModules[role] = new Set();
  const set = selectedModules[role];
  set.has(module) ? set.delete(module) : set.add(module);
};

/** 已勾选模块列表 [{ role, module[] }] */
export const collectSelected = () =>
  Object.entries(selectedModules)
    .filter(([, set]) => set.size)
    .map(([role, set]) => ({
      role,
      module: Array.from(set),
    }));

export const isModuleSelected = (
  role: string,
  module: string
): boolean => selectedModules[role]?.has(module) ?? false;

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