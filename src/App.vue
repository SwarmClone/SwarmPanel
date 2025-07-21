<template>
  <a-config-provider :theme="antdTheme">
    <router-view/>
  </a-config-provider>
</template>

<script setup lang="ts">
import { antdTheme } from '@/main';
</script>

<style>
@font-face {
  font-family: 'MiSans-Demibold';
  src: url('./assets/font/MiSans-Demibold.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

* {
  font-family: 'MiSans-Demibold', sans-serif;
}
</style>