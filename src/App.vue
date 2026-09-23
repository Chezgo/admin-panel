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
import { useAuthStore } from '@/stores/auth';
import AppHeader from '@/components/AppHeader.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import AppFooter from '@/components/AppFooter.vue';

const authStore = useAuthStore();
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #0b1120;
  color: #cbd5e1;
  line-height: 1.6;
  overflow-x: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: calc(100vh - 110px);
}

.main-content {
  position: relative;
  background-color: #0b1120;
  flex: 1;
  min-width: 0;
  padding: 2rem;
  overflow-y: auto;
  z-index: 1;
}

.main-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
    radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
    radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px);
  background-size: 550px 550px, 350px 350px, 250px 250px;
  background-position: 0 0, 40px 60px, 130px 270px;
  animation: starsMove 100s linear infinite;
  z-index: 0; /* Звёзды под контентом */
  pointer-events: none; /* Чтобы клики проходили сквозь */
}

@keyframes starsMove {
  from { background-position: 0 0, 40px 60px, 130px 270px; }
  to { background-position: 0 1000px, 40px 1060px, 130px 1270px; }
}

.loading-screen,
.auth-redirect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  background-color: #0b1120;
  color: #60a5fa;
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
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.card {
  position: relative;
  z-index: 1; /* Карточки поверх звёзд */
  background: #111827;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.btn {
  position: relative;
  z-index: 1;
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
  text-decoration: none;
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

.ui-icon {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  stroke-width: 2;
}

.ui-icon-lg {
  width: 1.35rem;
  height: 1.35rem;
  flex-shrink: 0;
  stroke-width: 2;
}

.icon-heading,
.status-message,
.icon-value {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-message {
  justify-content: center;
}

.status-message .ui-icon {
  color: #f87171;
}

.btn-icon {
  line-height: 0;
}

.pagination-btn {
  display: inline-flex !important;
  width: 40px !important;
  height: 36px !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  border: 1px solid rgba(96, 165, 250, 0.65) !important;
  border-radius: 8px !important;
  background: rgba(37, 99, 235, 0.22) !important;
  color: #dbeafe !important;
  box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.04);
}

.pagination-btn .ui-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #93c5fd !important;
  background: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 0 14px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.pagination-btn:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

.pagination-btn:disabled {
  border-color: rgba(96, 165, 250, 0.28) !important;
  background: rgba(30, 64, 175, 0.1) !important;
  color: #64748b !important;
  opacity: 1 !important;
  cursor: not-allowed !important;
  box-shadow: none;
}

h1, h2, h3 {
  position: relative;
  z-index: 1;
  color: #e0e7ff;
  text-shadow: 0 0 12px rgba(96, 165, 250, 0.4);
}

h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
h2 { font-size: 1.35rem; font-weight: 600; margin-bottom: 0.75rem; }
h3 { font-size: 1.1rem; font-weight: 600; }

.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 2rem;
}

.page-subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

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

@media (max-width: 768px) {
  .content-wrapper {
    display: block;
    min-height: calc(100vh - 60px);
  }

  .main-content {
    min-height: calc(100vh - 60px);
    padding: 1rem 1rem calc(5.25rem + env(safe-area-inset-bottom));
    overflow: visible;
  }

  h1 {
    font-size: 1.5rem;
    line-height: 1.25;
  }

  h2 { font-size: 1.2rem; }
  .page-header { margin-bottom: 1.25rem; }
  .card { border-radius: 10px; }
}

@media (max-width: 640px) {
  input,
  select,
  textarea {
    font-size: 16px !important;
  }

  .modal-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .modal {
    width: 100% !important;
    max-height: 94dvh !important;
    overflow-y: auto;
    border-radius: 14px 14px 0 0 !important;
  }

  .modal-header,
  .modal-body {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
  }

  .modal-footer { flex-wrap: wrap; }

  .modal-footer .btn {
    flex: 1;
    justify-content: center;
  }

  .controls-bar { align-items: stretch !important; }

  .search-input,
  .sort-control,
  .page-control {
    width: 100%;
  }

  .sort-control,
  .page-control {
    justify-content: space-between;
  }

  .sort-control select {
    min-width: 0;
    flex: 1;
  }

  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td {
    display: block;
    width: 100%;
  }

  .data-table thead { display: none; }
  .data-table tbody { padding: 0.35rem; }

  .data-table tr {
    margin-bottom: 0.6rem;
    padding: 0.75rem;
    background: rgba(30, 41, 59, 0.45);
    border-radius: 8px;
  }

  .data-table tr:last-child { margin-bottom: 0; }

  .data-table td {
    max-width: none !important;
    padding: 0.3rem 0.25rem !important;
    overflow: visible !important;
    border: 0 !important;
    text-overflow: initial !important;
    white-space: normal !important;
  }

  .data-table td:first-child {
    color: #64748b;
    font-size: 0.78rem;
  }

  .data-table .action-buttons {
    justify-content: flex-end;
    padding-top: 0.25rem;
  }

  .form-row { grid-template-columns: 1fr !important; }
}
</style>
