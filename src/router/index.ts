import { createRouter, createWebHistory } from 'vue-router'
import StartupView from '@/views/StartupView.vue'
import RunningView from '@/views/RunningView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'startup', component: StartupView },
    { path: '/running', name: 'running', component: RunningView }
  ]
})