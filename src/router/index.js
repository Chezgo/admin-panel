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
    path: '/', 
    redirect: '/telescope-parts' 
  },
  { 
    path: '/telescope-parts', 
    name: 'TelescopeParts', 
    component: () => import('@/views/telescope-parts/TelescopePartsList.vue'), 
    meta: { title: 'Панель управления', requiresAuth: true } 
  },
  { 
    path: '/brands', 
    name: 'Brands', 
    component: () => import('@/views/brands/BrandList.vue'), 
    meta: { title: 'Бренды деталей', requiresAuth: true } 
  },
  { 
    path: '/types', 
    name: 'PartTypes', 
    component: () => import('@/views/types/PartTypeList.vue'), 
    meta: { title: 'Типы деталей', requiresAuth: true } 
  },
  // ⚠️ Временно закомментировано, пока не создадите файлы:
  // { path: '/profiles', name: 'Profiles', component: () => import('@/views/profiles/ProfileList.vue'), meta: { title: 'Профили', requiresAuth: true } },
  // { path: '/gallery', name: 'Gallery', component: () => import('@/views/gallery/GalleryList.vue'), meta: { title: 'Галерея', requiresAuth: true } },
  
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