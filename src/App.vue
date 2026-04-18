<template>
  <div v-if="!authStore.isInitialized" class="loading-screen">
    <div class="spinner"></div>
    <p>Инициализация системы...</p>
  </div>

  <div v-else-if="!authStore.authenticated && !isCallbackRoute" class="loading-screen">
    <p>Перенаправление на авторизацию...</p>
  </div>

  <div v-else class="app-wrapper">
    <AppHeader />
    <div class="content-wrapper">
      <AppSidebar />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppHeader from '@/components/AppHeader.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import AppFooter from '@/components/AppFooter.vue';

const authStore = useAuthStore();
const router = useRouter();
const isCallbackRoute = computed(() => window.location.pathname === '/callback');

onMounted(async () => {
  await authStore.initAuth();
  if (!authStore.authenticated && !isCallbackRoute.value) {
    authStore.login();
  }
});
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #0b1120; /* Глубокий темно-синий */
  color: #cbd5e1;
  line-height: 1.6;
  overflow-x: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ===== Звездный фон для контента ===== */
.main-content {
  position: relative;
  background-color: #0b1120;
  background-image: 
    radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
    radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
    radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px);
  background-size: 550px 550px, 350px 350px, 250px 250px;
  background-position: 0 0, 40px 60px, 130px 270px;
  animation: starsMove 100s linear infinite;
}

@keyframes starsMove {
  from { transform: translateY(0); }
  to { transform: translateY(-1000px); }
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 110px);
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* ===== Экраны загрузки ===== */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1.5rem;
  background-color: #0b1120;
  color: #60a5fa;
  font-size: 1.1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Анимации переходов ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ===== Утилиты ===== */
.card {
  background: #111827;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-icon {
  width: 36px;
  height: 36px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e0e7ff;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
}

.card-body {
  padding: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.9rem;
}

.btn:hover {
  background: rgba(59, 130, 246, 0.25);
  border-color: #60a5fa;
  color: #bfdbfe;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.btn-primary {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  color: #fecaca;
}

h1, h2, h3 {
  color: #e0e7ff;
  text-shadow: 0 0 12px rgba(96, 165, 250, 0.4);
}

h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
h2 { font-size: 1.35rem; font-weight: 600; margin-bottom: 0.75rem; }
h3 { font-size: 1.1rem; font-weight: 600; }

.page-header {
  margin-bottom: 2rem;
}

.page-subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

/* Скроллбар */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0b1120;
}
::-webkit-scrollbar-thumb {
  background: #1e3a8a;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}
</style>