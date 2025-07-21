<script setup lang="ts">
import { antdTheme } from '@/main';
</script>

<template>
  <a-config-provider :theme="antdTheme">
    <router-view/>
  </a-config-provider>
</template>