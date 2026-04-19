<template>
  <div class="page">
    <div class="page-header">
      <h1>Типы деталей</h1>
      <router-link to="/types/new" class="btn btn-primary">
        <span>+</span> Создать тип
      </router-link>
    </div>

    <div class="search-bar">
      <input 
        v-model="searchId" 
        @keyup.enter="searchById"
        placeholder="🔍 Поиск по ID (нажмите Enter)" 
        class="search-input"
      >
      <button @click="searchById" class="btn">Найти</button>
      <button v-if="searchId" @click="resetSearch" class="btn btn-danger">Сбросить</button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchTypes" class="btn">Повторить</button>
    </div>

    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th width="120">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="type in filteredTypes" 
            :key="type.id"
            @click="goToDetail(type.id)"
            class="clickable-row"
          >
            <td>#{{ type.id }}</td>
            <td class="fw-medium">{{ type.name }}</td>
            <td class="text-truncate">{{ type.description }}</td>
            <td @click.stop>
              <router-link :to="`/types/${type.id}`" class="btn-icon" title="Открыть">👁️</router-link>
            </td>
          </tr>
          <tr v-if="filteredTypes.length === 0">
            <td colspan="4" class="empty-state">
              {{ searchId ? 'Ничего не найдено' : 'Нет данных' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import detailTypesApi from '@/services/detailTypes';

const router = useRouter();
const types = ref([]);
const loading = ref(false);
const error = ref(null);
const searchId = ref('');

const filteredTypes = computed(() => {
  if (!searchId.value) return types.value;
  const id = parseInt(searchId.value, 10);
  return types.value.filter(t => t.id === id);
});

const fetchTypes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await detailTypesApi.getAll();
    types.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить типы';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const searchById = () => {
  const table = document.querySelector('.data-table');
  if (table) table.scrollIntoView({ behavior: 'smooth' });
};

const resetSearch = () => { searchId.value = ''; };
const goToDetail = (id) => { router.push(`/types/${id}`); };

onMounted(fetchTypes);
</script>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; }
.page-header { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
}

.search-bar {
  display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;
}
.search-input {
  flex: 1; min-width: 200px;
  padding: 0.6rem 0.8rem;
  background: #0b1120; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px; color: #e0e7ff; font-size: 0.95rem;
}
.search-input:focus {
  outline: none; border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.card {
  background: #111827; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px; overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: rgba(59, 130, 246, 0.1); padding: 1rem; text-align: left;
  font-weight: 600; color: #93c5fd; border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}
.data-table td {
  padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1;
}

.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover td { background: rgba(59, 130, 246, 0.1); }

.text-truncate {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-icon {
  background: transparent; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 0.4rem 0.6rem; cursor: pointer;
  transition: all 0.2s; font-size: 1rem; text-decoration: none; display: inline-block;
}
.btn-icon:hover { background: rgba(255,255,255,0.1); border-color: #60a5fa; }

.empty-state { text-align: center; color: #64748b; padding: 2rem !important; }

.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; color: #94a3b8; gap: 1rem;
}
.spinner {
  width: 32px; height: 32px; border: 3px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa; border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>