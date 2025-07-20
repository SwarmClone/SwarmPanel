// 启动配置表单的类型声明
export interface Option {
  key: string;
  value: string | number | boolean;
}

export interface ConfigItem {
  name: string;
  type: 'int' | 'float' | 'str' | 'bool' | 'selection';
  desc: string;
  required: boolean;
  default?: any;
  options?: Option[];
  multiline: boolean;
  min?: number;
  max?: number;
  step?: number;
  password?: boolean;
}

export interface Module {
  module_name: string;
  desc: string;
  config: ConfigItem[];
}

export interface Role {
  role_name: string;
  modules: Module[];
}

export type StartupConfig = Role[];