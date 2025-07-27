import { reactive, watch } from 'vue';
import type { StartupConfig } from '@/types/startupConfig';
import { collectFiltered } from './useSelectedModules';

export const store = reactive<Record<string, any>>({});

/* 初始化 store */
export const initStore = (cfg: StartupConfig) => {
  cfg.forEach(role =>
    role.modules.forEach(mod =>
      mod.config.forEach(item => {
        const k = `${role.role_name}.${mod.module_name}.${item.name}`;
        if (!(k in store)) store[k] = item.default;
      })
    )
  );
};

/* 读 / 写单个值 */
export const getVal = (r: string, m: string, c: string) => store[`${r}.${m}.${c}`];
export const setVal = (r: string, m: string, c: string, v: any) => (store[`${r}.${m}.${c}`] = v);

/* 原始完整收集 */
export const collectAllRaw = (): Record<string, Record<string, any>> => {
  const res: Record<string, Record<string, any>> = {};
  Object.keys(store).forEach(k => {
    const [r, m, c] = k.split('.');
    if (!res[r]) res[r] = {};
    if (!res[r][m]) res[r][m] = {};
    res[r][m][c] = store[k];
  });
  return res;
};

/* 对外暴露：只含已勾选模块 */
export const collectAll = () => collectFiltered(collectAllRaw());

// TODO：这个我觉得可能会需要
watch(store, (value) => {
  console.log(value);
});