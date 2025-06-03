import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ChatView from '../views/ChatView.vue';
import SettingsView from '../views/SettingsView.vue';
import OtherView from '../views/OtherView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/asr-dummy',
    name: 'Chat',
    component: ChatView
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView
  },
  {
    path: '/other',
    name: 'Other',
    component: OtherView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
