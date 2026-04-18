<template>
  <aside class="sidebar" :class="{ collapsed: sidebarStore.collapsed }">
    <!-- Логотип сверху -->
    <div class="sidebar-header">
      <div class="sidebar-logo" v-if="!sidebarStore.collapsed">
        <div class="sidebar-logo-icon">🔭</div>
        <span class="sidebar-logo-text">Астрофото Админ</span>
      </div>
      <div class="sidebar-logo-icon-only" v-else>🔭</div>
      
      <button class="collapse-btn" @click="sidebarStore.toggle" :title="sidebarStore.collapsed ? 'Развернуть' : 'Свернуть'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: sidebarStore.collapsed }">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Навигация -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li 
          v-for="item in menuItems" 
          :key="item.path"
          :class="{ active: isActive(item.path) }"
        >
          <router-link :to="item.path" class="nav-link" :title="sidebarStore.collapsed ? item.title : ''">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text" v-if="!sidebarStore.collapsed">{{ item.title }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebar';

const route = useRoute();
const sidebarStore = useSidebarStore();

const menuItems = [
  { path: '/telescope-parts', title: 'Детали', icon: '🔧' },
  { path: '/types', title: 'Типы деталей', icon: '📋' },
  { path: '/brands', title: 'Бренды деталей', icon: '🏷️' },
  { path: '/profiles', title: 'Профили', icon: '👤' },
  { path: '/gallery', title: 'Галерея', icon: '🖼️' }
];

const isActive = (path) => route.path.startsWith(path);
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #111827;
  border-right: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 70px;
}

/* Шапка сайдбара */
.sidebar-header {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.sidebar-logo-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.5));
  flex-shrink: 0;
}

.sidebar-logo-text {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e7ff;
  text-shadow: 0 0 8px rgba(96, 165, 250, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-logo-icon-only {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.5));
  margin: 0 auto;
}

.collapse-btn {
  background: transparent;
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #93c5fd;
  padding: 0.35rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: #60a5fa;
  color: #bfdbfe;
}

.collapse-btn .rotated {
  transform: rotate(180deg);
}

/* Навигация */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  margin: 0.125rem 0;
}

.nav-link:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #cbd5e1;
}

/* Активный пункт */
.nav-link.active,
.nav-list li.active .nav-link {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%);
  color: #93c5fd;
  border-left-color: #3b82f6;
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Свернутый режим */
.sidebar.collapsed .sidebar-header {
  padding: 1rem 0.5rem;
  justify-content: center;
}

.sidebar.collapsed .collapse-btn {
  display: none;
}

.sidebar.collapsed .nav-link {
  padding: 0.875rem;
  justify-content: center;
  border-left: none;
  border-bottom: 3px solid transparent;
}

.sidebar.collapsed .nav-link.active {
  background: rgba(59, 130, 246, 0.15);
  border-bottom-color: #3b82f6;
  border-left-color: transparent;
}

/* Адаптив */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 0;
    z-index: 90;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 260px;
  }
  
  .sidebar.collapsed .nav-text {
    display: inline;
  }
  
  .sidebar.collapsed .nav-link {
    padding: 0.875rem 1.25rem;
    border-left: 3px solid transparent;
    border-bottom: none;
    justify-content: flex-start;
  }
  
  .sidebar.collapsed .nav-link.active {
    border-left-color: #3b82f6;
  }
}
</style>