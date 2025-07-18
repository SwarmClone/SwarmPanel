import { reactive, watch } from 'vue';
import type { ConfigItem, Module, Role, StartupConfig } from '@/types/startupConfig';

const store = reactive<Record<string, any>>({});
const key = (r: string, m: string, c: string) => `${r}.${m}.${c}`;

// 初始化
export const initStore = (cfg: StartupConfig) => {
  cfg.forEach((role: Role) =>
    role.modules.forEach((mod: Module) =>
      mod.config.forEach((item: ConfigItem) => {
        if (!(key(role.role_name, mod.module_name, item.name) in store)) {
          store[key(role.role_name, mod.module_name, item.name)] = item.default;
        }
      })
    )
  );
};

// 配置读写接口
export const getVal = (r: string, m: string, c: string) =>
  store[key(r, m, c)];
export const setVal = (r: string, m: string, c: string, v: any) =>
  (store[key(r, m, c)] = v);

// 收集配置
export const collectAll = () => {
  const res: any = {};
  Object.keys(store).forEach(k => {
    // r=role, m=module, c=config
    const [r, m, c] = k.split('.');
    if (!res[r]) res[r] = {}; /* 如果 role 不存在，创建空对象 */
    if (!res[r][m]) res[r][m] = {}; /* 如果 module 不存在，创建空对象 */
    res[r][m][c] = store[k];
  });
  return res;
};

// TODO：这个我觉得可能会需要
watch(store, () => {
  // localStorage.setItem('startup-config', JSON.stringify(store));
});