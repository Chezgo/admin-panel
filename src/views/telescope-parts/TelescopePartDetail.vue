<template>
  <div class="page">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="btn btn-back"><AppIconArrowLeft class="ui-icon" /> Назад</button>
        <h1>{{ part?.name || 'Загрузка...' }}</h1>
      </div>
      <div v-if="part && !isNew" class="actions">
        <button @click="handleEdit" class="btn"><AppIconPencil class="ui-icon" /> Редактировать</button>
        <button @click="handleDelete" class="btn btn-danger"><AppIconTrash class="ui-icon" /> Удалить</button>
      </div>
    </div>

    <!-- Состояния загрузки детали -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка детали...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p class="status-message"><AppIconAlert class="ui-icon" /> {{ error }}</p>
      <button @click="fetchPart" class="btn"><AppIconRefresh class="ui-icon" /> Повторить</button>
    </div>

    <!-- Карточка детали -->
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
        <label>Тип</label>
        <span class="value badge">{{ getTypeName(part.idTypeDetail) }}</span>
      </div>
      
      <div class="detail-row">
        <label>Бренд</label>
        <span class="value badge">{{ getBrandName(part.idBrandDetail) }}</span>
      </div>
      
      <div class="detail-row full">
        <label>Описание</label>
        <p class="description">{{ part.description }}</p>
      </div>
    </div>

    <!-- ===== НОВАЯ СЕКЦИЯ: Значения атрибутов ===== -->
    <div v-if="part && !isNew" class="section">
      <div class="section-header">
        <h2 class="icon-heading"><AppIconSliders class="ui-icon-lg" /> Характеристики</h2>
        <button @click="openAddAttributeModal" class="btn btn-primary"><AppIconPlus class="ui-icon" /> Добавить характеристику</button>
      </div>

      <!-- Состояния для атрибутов -->
      <div v-if="attributesLoading" class="loading-state small">
        <div class="spinner-small"></div>
        <p>Загрузка характеристик...</p>
      </div>
      
      <div v-else-if="attributesError" class="error-state small">
        <p class="status-message"><AppIconAlert class="ui-icon" /> {{ attributesError }}</p>
      </div>

      <!-- Таблица значений атрибутов -->
      <div v-else class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th width="60">ID</th>
              <th>Атрибут</th>
              <th>Значение</th>
              <th>Описание</th>
              <th width="140">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attr in attributeValues" :key="attr.id">
              <td>#{{ attr.id }}</td>
              <td>
  <span class="fw-medium" :title="getAttributeName(attr)">
    {{ getAttributeName(attr) }}
  </span>
</td>
              <td class="value-cell">
                {{ attr.value }}<span v-if="attr.unit"> {{ attr.unit }}</span>
                <small v-if="attr.valueNumeric !== null && attr.valueNumeric !== undefined" class="numeric-value">
                  Числовое значение: {{ attr.valueNumeric }}
                </small>
              </td>
              <td class="text-truncate">{{ attr.description || '—' }}</td>
              <td class="actions">
                <button @click="openEditAttributeModal(attr)" class="btn-icon" title="Редактировать"><AppIconPencil class="ui-icon" /></button>
                <button @click="handleDeleteAttribute(attr.id)" class="btn-icon danger" title="Удалить"><AppIconTrash class="ui-icon" /></button>
              </td>
            </tr>
            <tr v-if="attributeValues.length === 0">
              <td colspan="5" class="empty-state">Нет характеристик для этой детали</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== Модальное окно: Редактирование детали ===== -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Редактировать деталь</h2>
          <button @click="closeEditModal" class="close-btn" title="Закрыть"><AppIconClose class="ui-icon" /></button>
        </div>
        
        <form @submit.prevent="submitEdit" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model.trim="editForm.name" required minlength="3" maxlength="50">
          </div>
          
          <div class="form-row">
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
    <label>Бренд *</label>
    <select v-model.number="editForm.idBrandDetail" required class="form-select">
      <option value="" disabled>Выберите бренд...</option>
      <option v-for="brand in brands" :key="brand.id" :value="brand.id">
        #{{ brand.id }} — {{ brand.name }}
      </option>
    </select>
  </div>
</div>

          <div class="form-group">
            <label>Описание *</label>
            <textarea v-model="editForm.description" required minlength="3" maxlength="255" rows="3"></textarea>
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

    <!-- ===== Модальное окно: Добавление/Редактирование значения атрибута ===== -->
    <div v-if="showAttributeModal" class="modal-overlay" @click.self="closeAttributeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingAttributeId ? 'Редактировать' : 'Добавить' }} характеристику</h2>
          <button @click="closeAttributeModal" class="close-btn" title="Закрыть"><AppIconClose class="ui-icon" /></button>
        </div>
        
        <form @submit.prevent="submitAttribute" class="modal-body">
          <div class="form-group">
            <label>Атрибут *</label>
            <select v-model.number="attributeForm.idDetailAttribute" required class="form-select">
              <option value="" disabled>Выберите атрибут...</option>
              <option v-for="attr in selectableAttributes" :key="attr.id" :value="attr.id">
                #{{ attr.id }} — {{ attr.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Значение *</label>
            <input v-model.trim="attributeForm.value" required maxlength="50" placeholder="Например: 130">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Числовое значение</label>
              <input v-model.number="attributeForm.numericValue" type="number" step="any" placeholder="Например: 130">
            </div>

            <div class="form-group">
              <label>Единица измерения</label>
              <input v-model.trim="attributeForm.unit" maxlength="20" placeholder="Например: мм">
            </div>
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="attributeForm.description" maxlength="255" rows="2" placeholder="Примечание..."></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeAttributeModal" class="btn">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="submittingAttribute">
              {{ submittingAttribute ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Страница создания детали ===== -->
    <div v-if="isNew" class="card detail-card">
      <h2>Создать новую деталь</h2>
      <form @submit.prevent="submitCreate" class="form">
        <div class="form-group">
          <label>Название *</label>
          <input v-model.trim="createForm.name" required minlength="3" maxlength="50" placeholder="Например: Skyline BASE 100S">
        </div>
        
        <div class="form-row">
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
    <label>Бренд *</label>
    <select v-model.number="createForm.idBrandDetail" required class="form-select">
      <option value="" disabled>Выберите бренд...</option>
      <option v-for="brand in brands" :key="brand.id" :value="brand.id">
        #{{ brand.id }} — {{ brand.name }}
      </option>
    </select>
  </div>
</div>

        <div class="form-group">
          <label>Описание *</label>
          <textarea v-model="createForm.description" required minlength="3" maxlength="255" rows="3" placeholder="Краткое описание..."></textarea>
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
import attributeValuesApi from '@/services/attributeValues';
import detailTypesApi from '@/services/detailTypes';  
import brandsApi from '@/services/brands';           

const route = useRoute();
const router = useRouter();

// ===== Состояния детали =====
const part = ref(null);
const loading = ref(false);
const error = ref(null);
const showEditModal = ref(false);
const submitting = ref(false);

// ===== Состояния справочников =====
const types = ref([]);      // Справочник типов деталей
const brands = ref([]);     // Справочник брендов

const editForm = ref({ name: '', idTypeDetail: null, idBrandDetail: null, description: '' });
const createForm = ref({ name: '', idTypeDetail: null, idBrandDetail: null, description: '' });

// ===== Состояния значений атрибутов =====
const attributeValues = ref([]);
const availableAttributes = ref([]);  // Справочник всех атрибутов
const attributesLoading = ref(false);
const attributesError = ref(null);
const showAttributeModal = ref(false);
const editingAttributeId = ref(null);
const submittingAttribute = ref(false);

const attributeForm = ref({ 
  idDetailAttribute: null, 
  value: '', 
  numericValue: null,
  unit: '',
  description: '' 
});

const isNew = computed(() => route.params.id === 'new');
const partId = computed(() => isNew.value ? null : parseInt(route.params.id, 10));
const selectableAttributes = computed(() => {
  const assignedIds = new Set(
    attributeValues.value
      .filter(value => value.id !== editingAttributeId.value)
      .map(value => value.idDetailAttribute)
  );
  return availableAttributes.value.filter(attribute => !assignedIds.has(attribute.id));
});

const getTypeName = (id) => types.value.find(type => type.id === id)?.name || `Тип #${id}`;
const getBrandName = (id) => brands.value.find(brand => brand.id === id)?.name || `Бренд #${id}`;

const getErrorMessage = (err, fallback) => {
  const body = err.response?.data;
  if (body?.errorMessage && typeof body.errorMessage === 'object') {
    const messages = Object.values(body.errorMessage).filter(Boolean);
    if (messages.length) return messages.join('. ');
  }
  return body?.errorMessage || body?.message || body?.error || fallback;
};

// ===== Загрузка справочника атрибутов =====
const loadAvailableAttributes = async () => {
  try {
    const res = await attributeValuesApi.getAttributes();
    availableAttributes.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('❌ Failed to load attributes:', err);
    attributesError.value = 'Не удалось загрузить список атрибутов';
  }
};

const getAttributeName = (attr) => {
  return attr.attributeName
    || availableAttributes.value.find(item => item.id === attr.idDetailAttribute)?.name
    || `Атрибут #${attr.idDetailAttribute}`;
};

// ===== CRUD детали =====
const fetchPart = async () => {
  if (isNew.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    const res = await telescopePartsApi.getById(partId.value);
    part.value = res.data;
  } catch (err) {
    error.value = getErrorMessage(err, 'Не удалось загрузить деталь');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// ===== Загрузка значений атрибутов для детали =====
const fetchAttributeValues = async () => {
  if (isNew.value) return;
  
  attributesLoading.value = true;
  attributesError.value = null;
  try {
    const res = await attributeValuesApi.getByDetailId(partId.value);
    attributeValues.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    attributesError.value = getErrorMessage(err, 'Не удалось загрузить характеристики');
    console.error(err);
  } finally {
    attributesLoading.value = false;
  }
};

// ===== Модальные окна детали =====
const handleEdit = () => {
  editForm.value = { 
    name: part.value.name,
    idTypeDetail: part.value.idTypeDetail,
    idBrandDetail: part.value.idBrandDetail,
    description: part.value.description 
  };
  showEditModal.value = true;
};

const closeEditModal = () => { showEditModal.value = false; };

const submitEdit = async () => {
  submitting.value = true;
  try {
    await telescopePartsApi.update(partId.value, editForm.value);
    closeEditModal();
    await fetchPart();
    alert('Деталь обновлена');
  } catch (err) {
    alert('Ошибка: ' + getErrorMessage(err, err.message));
  } finally {
    submitting.value = false;
  }
};

const submitCreate = async () => {
  submitting.value = true;
  try {
    const res = await telescopePartsApi.create(createForm.value);
    await router.replace(`/telescope-parts/${res.data.id}`);
    await Promise.all([fetchPart(), fetchAttributeValues()]);
  } catch (err) {
    alert('Ошибка создания: ' + getErrorMessage(err, err.message));
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm(`Удалить деталь "${part.value.name}"?`)) return;
  
  try {
    await telescopePartsApi.delete(partId.value);
    router.replace('/telescope-parts');
  } catch (err) {
    alert('Ошибка удаления: ' + getErrorMessage(err, err.message));
  }
};

// ===== Модальные окна значений атрибутов =====
const openAddAttributeModal = async () => {
  if (availableAttributes.value.length === 0) {
    await loadAvailableAttributes();
  }
  editingAttributeId.value = null;
  attributeForm.value = {
    idDetailAttribute: null,
    value: '',
    numericValue: null,
    unit: '',
    description: ''
  };
  showAttributeModal.value = true;
};

const openEditAttributeModal = (attr) => {
  editingAttributeId.value = attr.id;
  attributeForm.value = { 
    idDetailAttribute: attr.idDetailAttribute,  // readOnly в режиме редактирования
    value: attr.value,
    numericValue: attr.valueNumeric ?? null,
    unit: attr.unit || '',
    description: attr.description 
  };
  showAttributeModal.value = true;
};

const closeAttributeModal = () => {
  showAttributeModal.value = false;
  editingAttributeId.value = null;
};

const submitAttribute = async () => {
  submittingAttribute.value = true;
  try {
    const payload = {
      idDetail: partId.value,
      idDetailAttribute: attributeForm.value.idDetailAttribute,
      value: attributeForm.value.value,
      numericValue: attributeForm.value.numericValue === '' ? null : attributeForm.value.numericValue,
      unit: attributeForm.value.unit || null,
      description: attributeForm.value.description
    };

    if (editingAttributeId.value) {
      await attributeValuesApi.update(editingAttributeId.value, payload);
    } else {
      // Создание новой связи
      await attributeValuesApi.create(payload);
    }
    
    closeAttributeModal();
    await fetchAttributeValues(); // Перезагружаем список
    alert('Характеристика сохранена');
    
  } catch (err) {
    alert('Ошибка: ' + getErrorMessage(err, err.message));
  } finally {
    submittingAttribute.value = false;
  }
};

const handleDeleteAttribute = async (attrId) => {
  if (!confirm('Удалить эту характеристику?')) return;
  
  try {
    await attributeValuesApi.delete(attrId);
    await fetchAttributeValues();
  } catch (err) {
    alert('Ошибка удаления: ' + getErrorMessage(err, err.message));
  }
};

// Загрузка справочников
const loadTypes = async () => {
  try {
    const res = await detailTypesApi.getAll();
    types.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('❌ Failed to load types:', err);
  }
};

const loadBrands = async () => {
  try {
    const res = await brandsApi.getAll();
    brands.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('❌ Failed to load brands:', err);
  }
};

// ===== Инициализация =====
onMounted(async () => {
  if (isNew.value) {
    // Для создания загружаем справочники
    await Promise.all([loadTypes(), loadBrands()]);
  } else {
    // Для просмотра/редактирования
    await Promise.all([
      fetchPart(),
      loadTypes(),
      loadBrands(),
      loadAvailableAttributes(),
      fetchAttributeValues()
    ]);
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

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

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

/* Секция характеристик */
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
.data-table .value-cell {
  font-weight: 600; color: #60a5fa; font-family: monospace;
}
.numeric-value {
  display: block; margin-top: 0.25rem; color: #94a3b8; font-family: inherit; font-weight: 400;
}

.text-truncate {
  max-width: 200px;
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
.hint { color: #64748b; font-size: 0.8rem; font-style: italic; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

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
.loading-state.small, .error-state.small {
  padding: 1rem;
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
