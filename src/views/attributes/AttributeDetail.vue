<template>
  <div class="page">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="btn btn-back">← Назад</button>
        <h1>{{ attribute?.name || 'Загрузка...' }}</h1>
      </div>
      <div v-if="attribute && !isNew" class="actions">
        <button @click="handleEdit" class="btn">✏️ Редактировать</button>
        <button @click="handleDelete" class="btn btn-danger">🗑️ Удалить</button>
      </div>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchAttribute" class="btn">Повторить</button>
    </div>

    <!-- Карточка характеристики -->
    <div v-else-if="attribute" class="card detail-card">
      <div class="detail-row">
        <label>ID</label>
        <span class="value">#{{ attribute.id }}</span>
      </div>
      
      <div class="detail-row">
        <label>Название</label>
        <span class="value">{{ attribute.name }}</span>
      </div>
      
      <div class="detail-row">
        <label>Тип детали</label>
        <span class="value badge">
          #{{ attribute.idTypeDetail }} {{ getTypeName(attribute.idTypeDetail) }}
        </span>
      </div>
      
      <div class="detail-row full">
        <label>Описание</label>
        <p class="description">{{ attribute.description }}</p>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Редактировать характеристику</h2>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitEdit" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="editForm.name" required placeholder="Например: Апертура, мм">
          </div>

          <div class="form-group">
            <label>Тип детали *</label>
            <select v-model.number="editForm.idTypeDetail" required class="form-select">
              <option value="" disabled>Выберите тип...</option>
              <option v-for="type in types" :key="type.id" :value="type.id">
                #{{ type.id }} — {{ type.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="editForm.description" rows="3" placeholder="Краткое описание..."></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeEditModal" class="btn">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Страница создания (если id = 'new') -->
    <div v-if="isNew" class="card detail-card">
      <h2>Создать новую характеристику</h2>
      <form @submit.prevent="submitCreate" class="form">
        <div class="form-group">
          <label>Название *</label>
          <input v-model="createForm.name" required placeholder="Например: Фокусное расстояние, мм">
        </div>

        <div class="form-group">
          <label>Тип детали *</label>
          <select v-model.number="createForm.idTypeDetail" required class="form-select">
            <option value="" disabled>Выберите тип...</option>
            <option v-for="type in types" :key="type.id" :value="type.id">
              #{{ type.id }} — {{ type.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="createForm.description" rows="3" placeholder="Краткое описание..."></textarea>
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
import attributesApi from '@/services/attributes';

const route = useRoute();
const router = useRouter();

const attribute = ref(null);
const types = ref([]);
const loading = ref(false);
const error = ref(null);
const showEditModal = ref(false);
const submitting = ref(false);

const editForm = ref({ name: '', idTypeDetail: null, description: '' });
const createForm = ref({ name: '', idTypeDetail: null, description: '' });

const isNew = computed(() => route.params.id === 'new');
const attributeId = computed(() => isNew.value ? null : parseInt(route.params.id, 10));

// Загрузка типов для выпадающего списка
const loadTypes = async () => {
  try {
    const res = await attributesApi.getTypes();
    types.value = Array.isArray(res.data) ? res.data : (res.data.content || []);
  } catch (err) {
    console.error('❌ Failed to load types:', err);
    error.value = 'Не удалось загрузить список типов';
  }
};

// Получение названия типа по ID
const getTypeName = (id) => {
  const type = types.value.find(t => t.id === id);
  return type?.name || `Тип #${id}`;
};

const fetchAttribute = async () => {
  if (isNew.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const res = await attributesApi.getById(attributeId.value);
    attribute.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить характеристику';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => {
  editForm.value = { 
    name: attribute.value.name,
    idTypeDetail: attribute.value.idTypeDetail,
    description: attribute.value.description 
  };
  showEditModal.value = true;
};

const closeEditModal = () => { showEditModal.value = false; };

const submitEdit = async () => {
  submitting.value = true;
  try {
    await attributesApi.update(attributeId.value, editForm.value);
    closeEditModal();
    await fetchAttribute();
    alert('✅ Характеристика обновлена');
  } catch (err) {
    alert('❌ Ошибка: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const submitCreate = async () => {
  submitting.value = true;
  try {
    const res = await attributesApi.create(createForm.value);
    router.replace(`/attributes/${res.data.id}`);
  } catch (err) {
    alert('❌ Ошибка создания: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm(`Удалить характеристику "${attribute.value.name}"?`)) return;
  
  try {
    await attributesApi.delete(attributeId.value);
    router.replace('/attributes');
  } catch (err) {
    alert('❌ Ошибка удаления: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(async () => {
  await loadTypes();
  if (!isNew.value) {
    await fetchAttribute();
  }
});
</script>

<style scoped>
.page { max-width: 900px; margin: 0 auto; }

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