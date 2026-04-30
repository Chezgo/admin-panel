<template>
  <div class="page">
    <div class="page-header">
      <h1>Сборки телескопов</h1>
      <router-link to="/assemblies/new" class="btn btn-primary">
        <span>+</span> Создать сборку
      </router-link>
    </div>

    <!-- Поиск по ID и названию -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        @keyup.enter="fetchAssemblies"
        placeholder="🔍 Поиск по ID или названию" 
        class="search-input"
      >
      <button @click="fetchAssemblies" class="btn">Найти</button>
      <button v-if="searchQuery" @click="resetSearch" class="btn btn-danger">Сбросить</button>
    </div>

    <!-- Пагинация и сортировка -->
    <div class="controls-bar">
      <div class="sort-control">
        <label>Сортировка:</label>
        <select v-model="sortBy" @change="fetchAssemblies">
          <option value="name,asc">Имя (А-Я)</option>
          <option value="name,desc">Имя (Я-А)</option>
          <option value="id,asc">ID (по возрастанию)</option>
          <option value="id,desc">ID (по убыванию)</option>
        </select>
      </div>
      
      <div class="page-control">
        <button @click="prevPage" :disabled="currentPage === 0" class="btn-icon">←</button>
        <span class="page-info">Стр. {{ currentPage + 1 }} из {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="btn-icon">→</button>
      </div>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchAssemblies" class="btn">Повторить</button>
    </div>

    <!-- Таблица -->
    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">ID</th>
            <th>Название сборки</th>
            <th width="180">Профиль</th>
            <th>Описание</th>
            <th width="120">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="assembly in filteredAssemblies" 
            :key="assembly.id"
            @click="goToDetail(assembly.id)"
            class="clickable-row"
          >
            <td>#{{ assembly.id }}</td>
            <td class="fw-medium">{{ assembly.name }}</td>
            <td>
              <span class="badge" :title="getProfileName(assembly.idStargazerProfile)">
                #{{ assembly.idStargazerProfile }} {{ getProfileShortName(assembly.idStargazerProfile) }}
              </span>
            </td>
            <td class="text-truncate">{{ assembly.description || '—' }}</td>
            <td @click.stop>
              <router-link :to="`/assemblies/${assembly.id}`" class="btn-icon" title="Открыть">👁️</router-link>
            </td>
          </tr>
          <tr v-if="filteredAssemblies.length === 0">
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
import assembliesApi from '@/services/assemblies';

const router = useRouter();
const assemblies = ref([]);
const profilesMap = ref({}); // 🔗 Кэш профилей: { id: { name, description } }
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');

// Пагинация
const currentPage = ref(0);
const totalPages = ref(1);
const pageSize = ref(10);
const sortBy = ref('name,asc');

// Загрузка профилей для отображения названий
const loadProfiles = async () => {
  try {
    const res = await assembliesApi.getProfiles();
    const profiles = Array.isArray(res.data) ? res.data : (res.data.content || []);
    profilesMap.value = profiles.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  } catch (err) {
    console.warn('⚠️ Не удалось загрузить профили:', err);
  }
};

const getProfileName = (id) => profilesMap.value[id]?.name || `Профиль #${id}`;
const getProfileShortName = (id) => {
  const name = profilesMap.value[id]?.name || '';
  return name.length > 25 ? name.slice(0, 25) + '…' : name;
};

// Фильтрация локально
const filteredAssemblies = computed(() => {
  if (!searchQuery.value) return assemblies.value;
  const query = searchQuery.value.toLowerCase();
  return assemblies.value.filter(a => 
    a.id.toString().includes(query) || 
    a.name.toLowerCase().includes(query)
  );
});

const fetchAssemblies = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const [sortField, sortDir] = sortBy.value.split(',');
    const res = await assembliesApi.getAll({
      page: currentPage.value,
      size: pageSize.value,
      sortBy: sortField,
      sortDir: sortDir
    });
    
    assemblies.value = res.data.content || [];
    totalPages.value = res.data.totalPages || 1;
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить сборки';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchAssemblies();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchAssemblies();
  }
};

const resetSearch = () => { searchQuery.value = ''; fetchAssemblies(); };
const goToDetail = (id) => { router.push(`/assemblies/${id}`); };

onMounted(async () => {
  await Promise.all([loadProfiles(), fetchAssemblies()]);
});
</script>

<style scoped>
/* Стили идентичны ProfileList.vue */
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
.btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

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