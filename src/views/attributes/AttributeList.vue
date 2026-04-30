<template>
  <div class="page">
    <div class="page-header">
      <h1>Характеристики деталей</h1>
      <router-link to="/attributes/new" class="btn btn-primary">
        <span>+</span> Создать характеристику
      </router-link>
    </div>

    <!-- Поиск по ID и названию -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        @keyup.enter="fetchAttributes"
        placeholder="🔍 Поиск по ID или названию" 
        class="search-input"
      >
      <button @click="fetchAttributes" class="btn">Найти</button>
      <button v-if="searchQuery" @click="resetSearch" class="btn btn-danger">Сбросить</button>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchAttributes" class="btn">Повторить</button>
    </div>

    <!-- Таблица -->
    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">ID</th>
            <th>Название</th>
            <th width="180">Тип детали</th>
            <th>Описание</th>
            <th width="120">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="attr in filteredAttributes" 
            :key="attr.id"
            @click="goToDetail(attr.id)"
            class="clickable-row"
          >
            <td>#{{ attr.id }}</td>
            <td class="fw-medium">{{ attr.name }}</td>
            <td>
              <span class="badge" :title="getTypeName(attr.idTypeDetail)">
                #{{ attr.idTypeDetail }} {{ getTypeShortName(attr.idTypeDetail) }}
              </span>
            </td>
            <td class="text-truncate">{{ attr.description }}</td>
            <td @click.stop>
              <router-link :to="`/attributes/${attr.id}`" class="btn-icon" title="Открыть">👁️</router-link>
            </td>
          </tr>
          <tr v-if="filteredAttributes.length === 0">
            <td colspan="5" class="empty-state">
              {{ searchQuery ? 'Ничего не найдено' : 'Нет данных' }}
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
import attributesApi from '@/services/attributes';

const router = useRouter();
const attributes = ref([]);
const typesMap = ref({}); // 🔗 Кэш типов: { id: { name, description } }
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');

// Загрузка типов для отображения названий
const loadTypes = async () => {
  try {
    const res = await attributesApi.getTypes();
    const types = Array.isArray(res.data) ? res.data : (res.data.content || []);
    // Создаём карту для быстрого доступа: id → тип
    typesMap.value = types.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {});
  } catch (err) {
    console.warn('⚠️ Не удалось загрузить типы:', err);
  }
};

// Получение названия типа по ID
const getTypeName = (id) => typesMap.value[id]?.name || `Тип #${id}`;
const getTypeShortName = (id) => {
  const name = typesMap.value[id]?.name || '';
  return name.length > 20 ? name.slice(0, 20) + '…' : name;
};

// Фильтрация локально (по ID или названию)
const filteredAttributes = computed(() => {
  if (!searchQuery.value) return attributes.value;
  const query = searchQuery.value.toLowerCase();
  return attributes.value.filter(a => 
    a.id.toString().includes(query) || 
    a.name.toLowerCase().includes(query)
  );
});

const fetchAttributes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await attributesApi.getAll();
    attributes.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить характеристики';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => { searchQuery.value = ''; };
const goToDetail = (id) => { router.push(`/attributes/${id}`); };

onMounted(async () => {
  await Promise.all([loadTypes(), fetchAttributes()]);
});
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

.badge {
  display: inline-block; padding: 0.25rem 0.6rem;
  background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px; font-size: 0.85rem; color: #93c5fd;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.text-truncate {
  max-width: 300px;
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