import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { 
    path: '/callback', 
    name: 'Callback', 
    component: () => import('@/views/Callback.vue'), 
    meta: { requiresAuth: false } 
  },
  {
  path: '/brands',
  name: 'BrandList',
  component: () => import('@/views/brands/BrandList.vue'),
  meta: { title: 'Бренды деталей', requiresAuth: true }
  },
  {
  path: '/brands/:id',
  name: 'BrandDetail',
  component: () => import('@/views/brands/BrandDetail.vue'),
  meta: { title: 'Бренд', requiresAuth: true },
  props: true
  },
  {
  path: '/telescope-parts',
  name: 'TelescopePartsList',
  component: () => import('@/views/telescope-parts/TelescopePartsList.vue'),
  meta: { title: 'Детали телескопа', requiresAuth: true }
  },
  {
  path: '/telescope-parts/:id',
  name: 'TelescopePartDetail',
  component: () => import('@/views/telescope-parts/TelescopePartDetail.vue'),
  meta: { title: 'Деталь', requiresAuth: true },
  props: true 
  },
  {
  path: '/types',
  name: 'TypeDetailList',
  component: () => import('@/views/types/TypeDetailList.vue'),
  meta: { title: 'Типы деталей', requiresAuth: true }
},
{
  path: '/types/:id',
  name: 'TypeDetail',
  component: () => import('@/views/types/TypeDetailDetail.vue'),
  meta: { title: 'Тип детали', requiresAuth: true },
  props: true
},
  
  
  { path: '/:pathMatch(.*)*', redirect: '/telescope-parts' }
];

const router = createRouter({ 
  history: createWebHistory(), 
  routes 
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  
  if (to.meta.title) {
    document.title = `${to.meta.title} | Астрофото Админ`;
  }
  
  if (to.name === 'Callback') return true;
  if (!auth.isInitialized) return true;
  
  if (to.meta.requiresAuth && !auth.authenticated) {
    auth.login();
    return false;
  }
  
  return true;
});

export default router;