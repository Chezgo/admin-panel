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
{
  path: '/profiles',
  name: 'ProfileList',
  component: () => import('@/views/profiles/ProfileList.vue'),
  meta: { title: 'Профили пользователей', requiresAuth: true }
},
{
  path: '/profiles/:id',
  name: 'ProfileDetail',
  component: () => import('@/views/profiles/ProfileDetail.vue'),
  meta: { title: 'Профиль', requiresAuth: true },
  props: true
},
{
  path: '/attributes',
  name: 'AttributeList',
  component: () => import('@/views/attributes/AttributeList.vue'),
  meta: { title: 'Характеристики деталей', requiresAuth: true }
},
{
  path: '/attributes/:id',
  name: 'AttributeDetail',
  component: () => import('@/views/attributes/AttributeDetail.vue'),
  meta: { title: 'Характеристика', requiresAuth: true },
  props: true
},
{
  path: '/assemblies',
  name: 'AssemblyList',
  component: () => import('@/views/assemblies/AssemblyList.vue'),
  meta: { title: 'Сборки телескопов', requiresAuth: true }
},
{
  path: '/assemblies/:id',
  name: 'AssemblyDetail',
  component: () => import('@/views/assemblies/AssemblyDetail.vue'),
  meta: { title: 'Сборка', requiresAuth: true },
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