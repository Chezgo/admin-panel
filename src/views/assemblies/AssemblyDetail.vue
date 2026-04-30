<template>
  <div class="page">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="btn btn-back">← Назад</button>
        <h1>{{ assembly?.name || 'Загрузка...' }}</h1>
      </div>
      <div v-if="assembly && !isNew" class="actions">
        <button @click="handleEditAssembly" class="btn">✏️ Редактировать сборку</button>
        <button @click="handleDeleteAssembly" class="btn btn-danger">🗑️ Удалить сборку</button>
      </div>
    </div>

    <!-- Состояния загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchAssembly" class="btn">Повторить</button>
    </div>

    <!-- Карточка сборки -->
    <div v-else-if="assembly" class="card detail-card">
      <div class="detail-row">
        <label>ID</label>
        <span class="value">#{{ assembly.id }}</span>
      </div>
      
      <div class="detail-row">
        <label>Название</label>
        <span class="value">{{ assembly.name }}</span>
      </div>
      
      <div class="detail-row">
        <label>Профиль</label>
        <span class="value badge">
          #{{ assembly.idStargazerProfile }} {{ getProfileName(assembly.idStargazerProfile) }}
        </span>
      </div>
      
      <div class="detail-row full">
        <label>Описание</label>
        <p class="description">{{ assembly.description || '—' }}</p>
      </div>
    </div>

    <!-- ===== ВЛОЖЕННЫЙ РАЗДЕЛ: Детали сборки ===== -->
    <div v-if="assembly && !isNew" class="section">
      <div class="section-header">
        <h2>🔧 Детали в сборке</h2>
        <button @click="openAddDetailModal" class="btn btn-primary">+ Добавить деталь</button>
      </div>

      <!-- Состояния для деталей -->
      <div v-if="detailsLoading" class="loading-state">
        <div class="spinner-small"></div>
        <p>Загрузка деталей...</p>
      </div>
      
      <div v-else-if="detailsError" class="error-state">
        <p>⚠️ {{ detailsError }}</p>
      </div>

      <!-- Таблица деталей -->
      <div v-else class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th width="60">ID</th>
              <th>Деталь телескопа</th>
              <th>Описание</th>
              <th width="140">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="detail in assemblyDetails" :key="detail.id">
              <td>#{{ detail.id }}</td>
              <td>
                <span class="fw-medium" :title="getDetailName(detail.idTelescopeDetail)">
                  #{{ detail.idTelescopeDetail }} {{ getDetailShortName(detail.idTelescopeDetail) }}
                </span>
              </td>
              <td class="text-truncate">{{ detail.description || '—' }}</td>
              <td class="actions">
                <button @click="openEditDetailModal(detail)" class="btn-icon" title="Редактировать">✏️</button>
                <button @click="handleDeleteDetail(detail.id)" class="btn-icon danger" title="Удалить">🗑️</button>
              </td>
            </tr>
            <tr v-if="assemblyDetails.length === 0">
              <td colspan="4" class="empty-state">Нет деталей в этой сборке</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== Модальное окно: Редактирование сборки ===== -->
    <div v-if="showEditAssemblyModal" class="modal-overlay" @click.self="closeEditAssemblyModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Редактировать сборку</h2>
          <button @click="closeEditAssemblyModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitEditAssembly" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="editAssemblyForm.name" required>
          </div>

          <div class="form-group">
            <label>Профиль *</label>
            <select v-model.number="editAssemblyForm.idStargazerProfile" required class="form-select">
              <option value="" disabled>Выберите профиль...</option>
              <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
                #{{ profile.id }} — {{ profile.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="editAssemblyForm.description" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeEditAssemblyModal" class="btn">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Модальное окно: Добавление/Редактирование детали в сборке ===== -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingDetailId ? 'Редактировать' : 'Добавить' }} деталь</h2>
          <button @click="closeDetailModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitDetail" class="modal-body">
          <div class="form-group">
            <label>Деталь телескопа *</label>
            <select v-model.number="detailForm.idTelescopeDetail" required class="form-select">
              <option value="" disabled>Выберите деталь...</option>
              <option v-for="part in telescopeDetails" :key="part.id" :value="part.id">
                #{{ part.id }} — {{ part.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="detailForm.description" rows="3" placeholder="Примечание к детали в сборке..."></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeDetailModal" class="btn">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="submittingDetail">
              {{ submittingDetail ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Страница создания сборки ===== -->
    <div v-if="isNew" class="card detail-card">
      <h2>Создать новую сборку</h2>
      <form @submit.prevent="submitCreateAssembly" class="form">
        <div class="form-group">
          <label>Название *</label>
          <input v-model="createAssemblyForm.name" required placeholder="Например: Основная сборка">
        </div>

        <div class="form-group">
          <label>Профиль *</label>
          <select v-model.number="createAssemblyForm.idStargazerProfile" required class="form-select">
            <option value="" disabled>Выберите профиль...</option>
            <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
              #{{ profile.id }} — {{ profile.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="createAssemblyForm.description" rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn">Отмена</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import assembliesApi from '@/services/assemblies';

const route = useRoute();
const router = useRouter();

// ===== Состояния сборки =====
const assembly = ref(null);
const profiles = ref([]);
const loading = ref(false);
const error = ref(null);
const showEditAssemblyModal = ref(false);
const submitting = ref(false);

const editAssemblyForm = ref({ name: '', idStargazerProfile: null, description: '' });
const createAssemblyForm = ref({ name: '', idStargazerProfile: null, description: '' });

// ===== Состояния деталей сборки =====
const assemblyDetails = ref([]);
const telescopeDetails = ref([]);
const detailsLoading = ref(false);
const detailsError = ref(null);
const showDetailModal = ref(false);
const editingDetailId = ref(null);
const submittingDetail = ref(false);

const detailForm = ref({ idTelescopeDetail: null, description: '' });

const isNew = computed(() => route.params.id === 'new');
const assemblyId = computed(() => isNew.value ? null : parseInt(route.params.id, 10));

// ===== Загрузка справочников =====
const loadProfiles = async () => {
  try {
    const res = await assembliesApi.getProfiles();
    profiles.value = Array.isArray(res.data) ? res.data : (res.data.content || []);
  } catch (err) {
    console.error('❌ Failed to load profiles:', err);
  }
};

const loadTelescopeDetails = async () => {
  try {
    const res = await assembliesApi.getTelescopeDetails();
    telescopeDetails.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('❌ Failed to load telescope details:', err);
  }
};

// ===== Хелперы для отображения названий =====
const getProfileName = (id) => {
  const profile = profiles.value.find(p => p.id === id);
  return profile?.name || `Профиль #${id}`;
};

const getDetailName = (id) => {
  const detail = telescopeDetails.value.find(d => d.id === id);
  return detail?.name || `Деталь #${id}`;
};

const getDetailShortName = (id) => {
  const name = getDetailName(id);
  return name.length > 30 ? name.slice(0, 30) + '…' : name;
};

// ===== CRUD сборки =====
const fetchAssembly = async () => {
  if (isNew.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const res = await assembliesApi.getById(assemblyId.value);
    assembly.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить сборку';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchAssemblyDetails = async () => {
  if (isNew.value) return;
  
  detailsLoading.value = true;
  detailsError.value = null;
  try {
    const res = await assembliesApi.getAssemblyDetails(assemblyId.value);
    assemblyDetails.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    detailsError.value = err.response?.data?.message || 'Не удалось загрузить детали сборки';
    console.error(err);
  } finally {
    detailsLoading.value = false;
  }
};

// ===== Модальные окна сборки =====
const handleEditAssembly = () => {
  editAssemblyForm.value = { 
    name: assembly.value.name,
    idStargazerProfile: assembly.value.idStargazerProfile,
    description: assembly.value.description 
  };
  showEditAssemblyModal.value = true;
};

const closeEditAssemblyModal = () => { showEditAssemblyModal.value = false; };

const submitEditAssembly = async () => {
  submitting.value = true;
  try {
    await assembliesApi.update(assemblyId.value, editAssemblyForm.value);
    closeEditAssemblyModal();
    await fetchAssembly();
    alert('✅ Сборка обновлена');
  } catch (err) {
    alert('❌ Ошибка: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const submitCreateAssembly = async () => {
  submitting.value = true;
  try {
    const res = await assembliesApi.create(createAssemblyForm.value);
    router.replace(`/assemblies/${res.data.id}`);
  } catch (err) {
    alert('❌ Ошибка создания: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const handleDeleteAssembly = async () => {
  if (!confirm(`Удалить сборку "${assembly.value.name}"?`)) return;
  
  try {
    await assembliesApi.delete(assemblyId.value);
    router.replace('/assemblies');
  } catch (err) {
    alert('❌ Ошибка удаления: ' + (err.response?.data?.message || err.message));
  }
};

// ===== Модальные окна деталей сборки =====
const openAddDetailModal = () => {
  editingDetailId.value = null;
  detailForm.value = { idTelescopeDetail: null, description: '' };
  showDetailModal.value = true;
};

const openEditDetailModal = (detail) => {
  editingDetailId.value = detail.id;
  detailForm.value = { 
    idTelescopeDetail: detail.idTelescopeDetail,
    description: detail.description 
  };
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  editingDetailId.value = null;
};

const submitDetail = async () => {
  submittingDetail.value = true;
  try {
    const payload = {
      idTelescopeAssembly: assemblyId.value,
      idTelescopeDetail: detailForm.value.idTelescopeDetail,
      description: detailForm.value.description
    };

    if (editingDetailId.value) {
      // Обновление существующей детали
      await assembliesApi.updateAssemblyDetail(editingDetailId.value, payload);
    } else {
      // Добавление новой детали
      await assembliesApi.addDetailToAssembly(payload);
    }
    
    closeDetailModal();
    await fetchAssemblyDetails(); // Перезагружаем список деталей
    alert('✅ Деталь сохранена');
    
  } catch (err) {
    alert('❌ Ошибка: ' + (err.response?.data?.message || err.message));
  } finally {
    submittingDetail.value = false;
  }
};

const handleDeleteDetail = async (detailId) => {
  if (!confirm('Удалить эту деталь из сборки?')) return;
  
  try {
    await assembliesApi.deleteAssemblyDetail(detailId);
    await fetchAssemblyDetails();
  } catch (err) {
    alert('❌ Ошибка удаления: ' + (err.response?.data?.message || err.message));
  }
};

// ===== Инициализация =====
onMounted(async () => {
  // Загружаем справочники параллельно
  await Promise.all([loadProfiles(), loadTelescopeDetails()]);
  
  if (!isNew.value) {
    await Promise.all([fetchAssembly(), fetchAssemblyDetails()]);
  }
});
</script>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
}
.page-header h1 { margin: 0.5rem 0 0; color: #e0e7ff; }

.btn-back {
  background: transparent; border: 1px solid rgba(255,255,255,0.2);
  color: #94a3b8; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer;
}
.btn-back:hover { border-color: #60a5fa; color: #fff; }

.actions { display: flex; gap: 0.5rem; }

.card {
  background: #111827; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px; padding: 1.5rem;
}

.detail-card { margin-bottom: 2rem; }

.detail-row {
  display: flex; gap: 1rem; padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.detail-row:last-child { border-bottom: none; }
.detail-row.full { flex-direction: column; }

.detail-row label {
  min-width: 120px; color: #94a3b8; font-size: 0.9rem; font-weight: 500;
}
.detail-row .value { color: #e0e7ff; font-weight: 500; }
.detail-row .description {
  margin: 0.5rem 0 0; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap;
}

.badge {
  display: inline-block; padding: 0.25rem 0.6rem;
  background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px; font-size: 0.85rem; color: #93c5fd;
}

/* Секция деталей сборки */
.section { margin-top: 2rem; }
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}
.section-header h2 { margin: 0; font-size: 1.3rem; color: #e0e7ff; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: rgba(59, 130, 246, 0.1); padding: 1rem; text-align: left;
  font-weight: 600; color: #93c5fd; border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}
.data-table td {
  padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1;
}

.text-truncate {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions { display: flex; gap: 0.5rem; }
.btn-icon {
  background: transparent; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 0.4rem 0.6rem; cursor: pointer;
  transition: all 0.2s; font-size: 1rem;
}
.btn-icon:hover { background: rgba(255,255,255,0.1); border-color: #60a5fa; }
.btn-icon.danger:hover { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; }

.empty-state { text-align: center; color: #64748b; padding: 2rem !important; }

/* Форма */
.form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { color: #94a3b8; font-size: 0.9rem; }
.form-group input, .form-group textarea, .form-group select {
  padding: 0.6rem 0.8rem; background: #0b1120; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px; color: #e0e7ff; font-size: 0.95rem;
}
.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none; border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}
.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

/* Модальное окно */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(4px);
}
.modal {
  background: #111827; border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 12px; width: 90%; max-width: 500px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}
.modal-header h2 { margin: 0; font-size: 1.2rem; color: #e0e7ff; }
.close-btn {
  background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;
}
.close-btn:hover { color: #fff; }
.modal-body { padding: 1.5rem; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);
}

/* Загрузка */
.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2rem; color: #94a3b8; gap: 1rem;
}
.spinner {
  width: 32px; height: 32px; border: 3px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa; border-radius: 50%; animation: spin 1s linear infinite;
}
.spinner-small {
  width: 24px; height: 24px; border: 2px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa; border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>