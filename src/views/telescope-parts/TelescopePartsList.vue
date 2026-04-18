<template>
  <div class="page">
    <div class="page-header">
      <h1>Панель управления</h1>
      <p class="page-subtitle">Основные показатели и статистика сервиса астрофотографии</p>
    </div>

    <!-- Карточки управления -->
    <div class="dashboard-grid">
      <!-- Детали -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">🔧</div>
          <span class="card-title">Детали</span>
        </div>
        <div class="card-body">
          <p style="color: #94a3b8; margin-bottom: 1rem;">Управление деталями для астрофотографии</p>
          <router-link to="/telescope-parts" class="btn">Перейти к управлению</router-link>
        </div>
      </div>

      <!-- Типы деталей -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">📋</div>
          <span class="card-title">Типы деталей</span>
        </div>
        <div class="card-body">
          <p style="color: #94a3b8; margin-bottom: 1rem;">Управление типами деталей для астрофотографии</p>
          <router-link to="/types" class="btn">Перейти к управлению</router-link>
        </div>
      </div>

      <!-- Бренды -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">🏷️</div>
          <span class="card-title">Бренды деталей</span>
        </div>
        <div class="card-body">
          <p style="color: #94a3b8; margin-bottom: 1rem;">Управление брендами деталей для астрофотографии</p>
          <router-link to="/brands" class="btn">Перейти к управлению</router-link>
        </div>
      </div>

      <!-- Профили -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">👤</div>
          <span class="card-title">Профили пользователей</span>
        </div>
        <div class="card-body">
          <p style="color: #94a3b8; margin-bottom: 1rem;">Управление профилями пользователей сервиса</p>
          <router-link to="/profiles" class="btn">Перейти к управлению</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Логика страницы
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.btn {
  display: block;
  text-align: center;
  text-decoration: none;
}
</style>