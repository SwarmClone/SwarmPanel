import { createRouter, createWebHistory } from 'vue-router';
import StartupView from '../views/StartupView.vue';

const routes = [
  {
    path: '/',
    name: 'StartupSettings',
    component: StartupView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
