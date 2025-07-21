<template>
  <a-form-item
    :label="labelWithRange"
    :required="config.required"
    :rules="config.required ? [{ required: true, message: `${config.name} 必填` }] : []"
    class="desc"
  >
    <!-- 滑动条 + 输入框 -->
    <template v-if="config.min != null && config.max != null">
      <a-slider
        v-model:value="value"
        :min="config.min"
        :max="config.max"
        :step="computedStep"
        :disabled="disabled"
        class="width-limit"
      />
      <a-input-number
        v-model:value="value"
        :min="config.min"
        :max="config.max"
        :step="computedStep"
        :precision="precision"
        :disabled="disabled"
        style="margin-top: 8px;"
        class="width-limit"
      />
    </template>

    <!-- 普通数字 -->
    <a-input-number
      v-else-if="['int', 'float'].includes(config.type)"
      v-model:value="value"
      :min="config.min"
      :max="config.max"
      :step="computedStep"
      :precision="precision"
      :disabled="disabled"
      style="width: 100%;"
      class="width-limit"
    />

    <!-- 字符串 -->
    <template v-else-if="config.type === 'str'">
      <!-- 多行文本框 -->
      <a-textarea
        v-if="config.multiline"
        v-model:value="value"
        :disabled="disabled"
        :rows="10"
        class="width-limit"
      />
      <!-- 单行文本框 -->
      <template v-else>
        <a-input-password
          v-if="config.password"
          v-model:value="value"
          :disabled="disabled"
          visibility-toggle
          class="width-limit"
        />
        <a-input
          v-else
          v-model:value="value"
          :disabled="disabled"
          class="width-limit"
        />
      </template>
    </template>

    <!-- 布尔 -->
    <a-switch
      v-else-if="config.type === 'bool'"
      v-model:checked="value"
      :disabled="disabled"
    />

    <!-- 选择 -->
    <a-select
      v-else-if="config.type === 'selection'"
      v-model:value="value"
      :disabled="disabled"
      class="width-limit"
    >
      <a-select-option
        v-for="opt in config.options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.key }}
      </a-select-option>
    </a-select>

    <!-- 描述 -->
    <div
      v-if="config.desc"
      v-html="parsedDesc"
      style="margin-top: 4px;"
      class="width-limit desc"
    />
  </a-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getVal, setVal } from '@/composables/useConfigStore';
import type { ConfigItem } from '@/types/startupConfig';

const props = defineProps<{
  config: ConfigItem;
  roleName: string;
  moduleName: string;
  configName: string;
  disabled?: boolean;
}>();

/* 双向绑定到全局 store */
const value = computed({
  get: () => getVal(props.roleName, props.moduleName, props.configName),
  set: (val) => setVal(props.roleName, props.moduleName, props.configName, val),
});

const computedStep = computed(() =>
  props.config.step ?? (props.config.type === 'int' ? 1 : 0.01)
);
const precision = computed(() => (props.config.type === 'int' ? 0 : 2));
const labelWithRange = computed(() =>
  props.config.min != null && props.config.max != null
    ? `${props.config.name} (${props.config.min} ~ ${props.config.max})`
    : props.config.name
);
const parsedDesc = computed(() =>
  props.config.desc.replace(
    /<url[^>]*id="([^"]*)"[^>]*title="([^"]*)"[^>]*>([^<]*)<\/url>/g,
    '<a href="$1" target="_blank" title="$2">$3</a>'
  )
);
</script>

<style scoped>
.desc {
  font-size: 1rem;
  font-weight: 200;
}
</style>