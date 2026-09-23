<template>
  <aside class="sidebar" aria-label="Основная навигация">
    <div class="sidebar-header">
      <Telescope class="sidebar-logo-icon" aria-hidden="true" />
      <span class="sidebar-logo-text">Астрофото Админ</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ active: isActive(item.path) }"
        :aria-current="isActive(item.path) ? 'page' : undefined"
      >
        <component :is="item.icon" class="nav-icon" aria-hidden="true" />
        <span class="nav-text">{{ item.title }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router';
import {
  Camera,
  ListTree,
  SlidersHorizontal,
  Tags,
  Telescope,
  Users,
  Wrench,
} from 'lucide-vue-next';

const route = useRoute();

const menuItems = [
  { path: '/telescope-parts', title: 'Детали телескопа', icon: Wrench },
  { path: '/brands', title: 'Бренды', icon: Tags },
  { path: '/types', title: 'Типы деталей', icon: ListTree },
  { path: '/profiles', title: 'Профили', icon: Users },
  { path: '/attributes', title: 'Характеристики деталей', icon: SlidersHorizontal },
  { path: '/assemblies', title: 'Сборки', icon: Telescope },
  { path: '/photos', title: 'Фото', icon: Camera },
];

const isActive = (path) => route.path.startsWith(path);
</script>

<style scoped>
.sidebar {
  position: relative;
  z-index: 2;
  display: flex;
  width: 260px;
  flex-shrink: 0;
  flex-direction: column;
  background: #111827;
  border-right: 1px solid rgba(59, 130, 246, 0.3);
}

.sidebar-header {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.sidebar-logo-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #60a5fa;
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.5));
}

.sidebar-logo-text {
  min-width: 0;
  overflow: hidden;
  color: #e0e7ff;
  font-size: 1rem;
  font-weight: 600;
  text-overflow: ellipsis;
  text-shadow: 0 0 8px rgba(96, 165, 250, 0.3);
  white-space: nowrap;
}

.sidebar-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.8rem 1.25rem;
  border-left: 3px solid transparent;
  color: #94a3b8;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.nav-link:hover {
  border-left-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.1);
  color: #e0e7ff;
}

.nav-link.active {
  border-left-color: #60a5fa;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  stroke-width: 2;
}

.nav-text {
  min-width: 0;
  overflow: hidden;
  font-size: 0.95rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 500;
    width: auto;
    padding: 0.35rem max(0.35rem, env(safe-area-inset-right)) calc(0.35rem + env(safe-area-inset-bottom)) max(0.35rem, env(safe-area-inset-left));
    border-top: 1px solid rgba(59, 130, 246, 0.35);
    border-right: 0;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.35);
  }

  .sidebar-header {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    gap: 0.2rem;
    padding: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .sidebar-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    min-width: 78px;
    flex: 1 0 78px;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.4rem 0.25rem;
    border: 0;
    border-radius: 8px;
    text-align: center;
  }

  .nav-link:hover,
  .nav-link.active {
    border: 0;
  }

  .nav-icon {
    width: 21px;
    height: 21px;
  }

  .nav-text {
    width: 100%;
    font-size: 0.66rem;
  }
}
</style>
