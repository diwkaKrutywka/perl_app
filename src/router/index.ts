import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";


// Основные маршруты
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'MainView',
    component: () => import('../views/MainView.vue'),
  },
  {
    path: '/language-selection',
    name: 'LanguageSelectionView',
    component: () => import('../views/LanguageSelectionView.vue'),
  },
  {
    path: '/home',
    name: 'HomeView',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/info-service',
    name: 'InfoService',
    component: () => import('../views/InfoService.vue'),
  },
  {
    path: '/info-details',
    name: 'InfoDetails',
    component: () => import('../views/InfoDetails.vue'),
  },
  {
    path: '/service',
    name: 'ServiceView',
    component: () => import('../views/ServiceView.vue'),
  },
  {
    path: '/auth-page',
    name: 'AuthPage',
    component: () => import('../views/AuthPage.vue'),
  },
  {
    path: '/doctors',
    name: 'DoctorsPage',
    component: () => import('../views/DoctorsPage.vue'),
  },
]
const router = createRouter({
    history: createWebHistory(),
    routes,
  });
  
export default router;