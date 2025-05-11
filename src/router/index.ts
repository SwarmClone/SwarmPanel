import { createRouter, createWebHistory } from 'vue-router';
import SplashScreen from '../views/SplashScreen.vue';
import ASRDummy from '../views/ASRDummy.vue';

const routes = [
  {
    path: '/',
    name: 'SplashScreen',
    component: SplashScreen
  },
  {
    path: '/asr-dummy',
    name: 'ASRDummy',
    component: ASRDummy
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
