<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Логотип слева -->
      <div class="logo-area">
        <div class="logo-icon">🔭</div>
        <span class="logo-text">Астрофото Админ</span>
      </div>

      <!-- Полный логин посередине -->
      <div class="user-display">
        <span class="user-name">{{ username }}</span>
      </div>

      <!-- Аватар + Выйти справа -->
      <div class="header-right">
        <button @click="handleLogout" class="logout-btn" title="Выйти">
          <span>Выйти</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const username = computed(() => authStore.getUsername);
const userInitial = computed(() => username.value.charAt(0).toUpperCase());

const handleLogout = () => {
  if (confirm('Вы действительно хотите выйти?')) {
    authStore.logout();
  }
};
</script>

<style scoped>
.app-header {
  height: 60px;
  background: #111827;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  gap: 1rem;
}

/* Логотип слева */
.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-self: start;
}

.logo-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.5));
}

.logo-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: #e0e7ff;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.4);
  letter-spacing: 0.02em;
}

/* Логин посередине */
.user-display {
  justify-self: center;
  text-align: center;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #cbd5e1;
  text-shadow: 0 0 8px rgba(96, 165, 250, 0.3);
  letter-spacing: 0.01em;
}

/* Правая часть */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-self: end;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: 2px solid rgba(96, 165, 250, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fecaca;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .header-content {
    grid-template-columns: auto 1fr auto;
  }
  
  .logo-text {
    display: none;
  }
  
  .user-name {
    font-size: 0.95rem;
  }
  
  .logout-btn span {
    display: none;
  }
  
  .logout-btn {
    padding: 0.5rem;
  }
}
</style>