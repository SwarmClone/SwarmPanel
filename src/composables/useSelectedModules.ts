import { reactive } from 'vue';

/**
 * 结构：{ [roleName: string]: Set<moduleName> }
 * 示例：{ LLM: new Set(['LLMBase', 'LLMTransformers']) }
 */
export const selectedModules = reactive<Record<string, Set<string>>>({});

export const toggleModule = (role: string, module: string) => {
  if (!selectedModules[role]) selectedModules[role] = new Set();
  const set = selectedModules[role];
  set.has(module) ? set.delete(module) : set.add(module);
};

// 打包数据
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