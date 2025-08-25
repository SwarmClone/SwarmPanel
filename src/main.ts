import { createApp, ref } from 'vue';
import App from './App.vue';
import router from './router';
import TDesignChat from '@tdesign-vue-next/chat'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { theme } from 'ant-design-vue';
import '@/styles/global.css'
import 'tdesign-vue-next/es/style/index.css'

/* 主题切换 */
export const isDark = ref(localStorage.getItem('antd-theme') === 'dark');
export const antdTheme = ref({
  algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
});
console.log(antdTheme);

/* FontAwesome 相关 */
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faSun, faMoon);

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router);
app.use(Antd);
app.use(TDesignChat)
app.mount('#app');
