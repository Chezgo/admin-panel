<template>
  <div class="page">
    <div class="page-header">
      <h1>Детали телескопа</h1>
      <router-link to="/telescope-parts/new" class="btn btn-primary">
        <AppIconPlus class="ui-icon" /> Создать деталь
      </router-link>
    </div>

    <!-- Поиск по ID и название -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        @keyup.enter="fetchParts"
        placeholder="Поиск по ID или названию"
        class="search-input"
      >
      <button @click="fetchParts" class="btn"><AppIconSearch class="ui-icon" /> Найти</button>
      <button v-if="searchQuery" @click="resetSearch" class="btn btn-danger"><AppIconReset class="ui-icon" /> Сбросить</button>
    </div>

    <!-- Пагинация и сортировка -->
    <div class="controls-bar">
      <div class="sort-control">
        <label>Сортировка:</label>
        <select v-model="sortBy" @change="fetchParts">
          <option value="name,asc">Название (А-Я)</option>
          <option value="name,desc">Название (Я-А)</option>
          <option value="id,asc">ID (по возрастанию)</option>
          <option value="id,desc">ID (по убыванию)</option>
        </select>
      </div>
      
      <div class="page-control">
        <button @click="prevPage" :disabled="currentPage === 0" class="btn-icon pagination-btn" title="Предыдущая страница"><AppIconChevronLeft class="ui-icon" /></button>
        <span class="page-info">Стр. {{ currentPage + 1 }} из {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="btn-icon pagination-btn" title="Следующая страница"><AppIconChevronRight class="ui-icon" /></button>
      </div>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p class="status-message"><AppIconAlert class="ui-icon" /> {{ error }}</p>
      <button @click="fetchParts" class="btn"><AppIconRefresh class="ui-icon" /> Повторить</button>
    </div>

    <!-- Таблица -->
    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">ID</th>
            <th>Название</th>
            <th width="100">Тип</th>
            <th width="100">Бренд</th>
            <th width="120">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="part in parts" 
            :key="part.id"
            @click="goToDetail(part.id)"
            class="clickable-row"
          >
            <td>#{{ part.id }}</td>
            <td class="fw-medium">{{ part.name }}</td>
            <td><span class="badge">{{ getTypeName(part.idTypeDetail) }}</span></td>
            <td><span class="badge">{{ getBrandName(part.idBrandDetail) }}</span></td>
            <td @click.stop>
              <router-link :to="`/telescope-parts/${part.id}`" class="btn-icon" title="Открыть"><AppIconEye class="ui-icon" /></router-link>
            </td>
          </tr>
          <tr v-if="parts.length === 0">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import telescopePartsApi from '@/services/telescopeParts';
import detailTypesApi from '@/services/detailTypes';
import brandsApi from '@/services/brands';

const router = useRouter();
const parts = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const typesMap = ref({});
const brandsMap = ref({});

// Пагинация
const currentPage = ref(0);
const totalPages = ref(1);
const totalElements = ref(0);
const pageSize = ref(10);

// Сортировка
const sortBy = ref('name,asc');

const toMap = (items) => items.reduce((map, item) => {
  map[item.id] = item.name;
  return map;
}, {});

const getTypeName = (id) => typesMap.value[id] || `Тип #${id}`;
const getBrandName = (id) => brandsMap.value[id] || `Бренд #${id}`;

const loadDictionaries = async () => {
  const [typesRes, brandsRes] = await Promise.all([
    detailTypesApi.getAll(),
    brandsApi.getAll()
  ]);
  typesMap.value = toMap(Array.isArray(typesRes.data) ? typesRes.data : []);
  brandsMap.value = toMap(Array.isArray(brandsRes.data) ? brandsRes.data : []);
};

const fetchParts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const [sortField, sortDir] = sortBy.value.split(',');
    
    // Если есть поиск — можно добавить серверный фильтр (если бэкенд поддерживает)
    // Пока делаем локальную фильтрацию после загрузки
    const res = await telescopePartsApi.getAll({
      page: currentPage.value,
      size: pageSize.value,
      sortBy: sortField,
      sortDir: sortDir
    });
    
    // 🎯 Важно: берём content из пагинированного ответа
    let data = res.data.content || [];
    
    // Локальная фильтрация по поисковому запросу
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      data = data.filter(p => 
        p.id.toString().includes(query) || 
        p.name.toLowerCase().includes(query) ||
        getTypeName(p.idTypeDetail).toLowerCase().includes(query) ||
        getBrandName(p.idBrandDetail).toLowerCase().includes(query)
      );
    }
    
    parts.value = data;
    totalPages.value = res.data.totalPages || 1;
    totalElements.value = res.data.totalElements || 0;
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить детали';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchParts();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchParts();
  }
};

const resetSearch = () => {
  searchQuery.value = '';
  fetchParts();
};

const goToDetail = (id) => {
  router.push(`/telescope-parts/${id}`);
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    await loadDictionaries();
    await fetchParts();
  } catch (err) {
    error.value = err.response?.data?.errorMessage?.message || 'Не удалось загрузить справочники типов и брендов';
    loading.value = false;
    console.error(err);
  }
});
</script>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; }
.page-header { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
}

.search-bar, .controls-bar {
  display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center;
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

.sort-control, .page-control {
  display: flex; align-items: center; gap: 0.5rem;
}
.sort-control label { color: #94a3b8; font-size: 0.9rem; }
.sort-control select {
  padding: 0.4rem 0.6rem;
  background: #0b1120; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px; color: #e0e7ff; cursor: pointer;
}
.page-info { color: #94a3b8; font-size: 0.9rem; }

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
