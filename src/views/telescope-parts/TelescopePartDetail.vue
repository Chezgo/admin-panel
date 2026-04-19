<template>
  <div class="page">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="btn btn-back">← Назад</button>
        <h1>{{ part?.name || 'Загрузка...' }}</h1>
      </div>
      <div v-if="part" class="actions">
        <button @click="handleEdit" class="btn">✏️ Редактировать</button>
        <button @click="handleDelete" class="btn btn-danger">🗑️ Удалить</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка детали...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchPart" class="btn">Повторить</button>
    </div>

    <div v-else-if="part" class="card detail-card">
      <div class="detail-row">
        <label>ID</label>
        <span class="value">#{{ part.id }}</span>
      </div>
      
      <div class="detail-row">
        <label>Название</label>
        <span class="value">{{ part.name }}</span>
      </div>
      
      <div class="detail-row">
        <label>ID типа</label>
        <span class="value badge">{{ part.idTypeDetail }}</span>
      </div>
      
      <div class="detail-row">
        <label>ID бренда</label>
        <span class="value badge">{{ part.idBrandDetail }}</span>
      </div>
      
      <div class="detail-row full">
        <label>Описание</label>
        <p class="description">{{ part.description }}</p>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Редактировать деталь</h2>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitEdit" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="editForm.name" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>ID типа</label>
              <input v-model.number="editForm.idTypeDetail" type="number">
            </div>
            <div class="form-group">
              <label>ID бренда</label>
              <input v-model.number="editForm.idBrandDetail" type="number">
            </div>
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="editForm.description" rows="4"></textarea>
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

    <div v-if="isNew" class="card detail-card">
      <h2>Создать новую деталь</h2>
      <form @submit.prevent="submitCreate" class="form">
        <div class="form-group">
          <label>Название *</label>
          <input v-model="createForm.name" required placeholder="Например: Skyline BASE 100S">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>ID типа</label>
            <input v-model.number="createForm.idTypeDetail" type="number" placeholder="2">
          </div>
          <div class="form-group">
            <label>ID бренда</label>
            <input v-model.number="createForm.idBrandDetail" type="number" placeholder="1">
          </div>
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="createForm.description" rows="4" placeholder="Краткое описание..."></textarea>
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
import telescopePartsApi from '@/services/telescopeParts';

const route = useRoute();
const router = useRouter();

const part = ref(null);
const loading = ref(false);
const error = ref(null);
const showEditModal = ref(false);
const submitting = ref(false);

const editForm = ref({ name: '', idTypeDetail: null, idBrandDetail: null, description: '' });
const createForm = ref({ name: '', idTypeDetail: null, idBrandDetail: null, description: '' });

// Проверка: новая деталь или существующая
const isNew = computed(() => route.params.id === 'new');
const partId = computed(() => isNew.value ? null : parseInt(route.params.id, 10));

const fetchPart = async () => {
  if (isNew.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const res = await telescopePartsApi.getById(partId.value);
    part.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить деталь';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => {
  editForm.value = { ...part.value };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const submitEdit = async () => {
  submitting.value = true;
  try {
    await telescopePartsApi.update(partId.value, editForm.value);
    closeEditModal();
    fetchPart(); // обновить данные
    alert('✅ Деталь обновлена');
  } catch (err) {
    alert('❌ Ошибка: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const submitCreate = async () => {
  submitting.value = true;
  try {
    const res = await telescopePartsApi.create(createForm.value);
    router.replace(`/telescope-parts/${res.data.id}`); // редирект на созданную деталь
  } catch (err) {
    alert('❌ Ошибка создания: ' + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm(`Удалить деталь "${part.value.name}"? Это действие необратимо.`)) return;
  
  try {
    await telescopePartsApi.delete(partId.value);
    router.replace('/telescope-parts');
  } catch (err) {
    alert('❌ Ошибка удаления: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(() => {
  if (!isNew.value) {
    fetchPart();
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

.form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { color: #94a3b8; font-size: 0.9rem; }
.form-group input, .form-group textarea {
  padding: 0.6rem 0.8rem; background: #0b1120; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px; color: #e0e7ff; font-size: 0.95rem;
}
.form-group input:focus, .form-group textarea:focus {
  outline: none; border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

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