<template>
  <div class="page">
    <div class="page-header">
      <h1>📷 Мои фотографии</h1>
      <button @click="openUploadModal" class="btn btn-primary">
        <span>⬆️</span> Загрузить фото
      </button>
    </div>

    <!-- Пагинация -->
    <div class="controls-bar">
      <div class="page-control">
        <button @click="prevPage" :disabled="currentPage === 0" class="btn-icon">←</button>
        <span class="page-info">Стр. {{ currentPage + 1 }} из {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="btn-icon">→</button>
      </div>
      <span class="total-count">Всего: {{ totalElements }}</span>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка фото...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchPhotos" class="btn">Повторить</button>
    </div>

    <!-- Галерея -->
    <div v-else class="gallery-grid">
      <div 
        v-for="photo in photos" 
        :key="photo.idPhoto"
        class="gallery-item"
        @click="goToDetail(photo.idPhoto)"
      >
        <!-- Превью (загружаем URL по клику или лениво) -->
        <div class="photo-preview">
  <!-- Показываем заглушку пока фото не загрузилось -->
  <div v-if="!loadedPhotos.has(photo.idPhoto)" class="photo-loading">
    <div class="loading-spinner"></div>
  </div>
  
  <img 
    v-show="loadedPhotos.has(photo.idPhoto)"
    :src="photo.previewUrl" 
    :alt="photo.originalFilename"
    @error="handleImageError"
    @load="() => handleImageLoad(photo.idPhoto)"
    style="display: none;"
  >
  
  <div class="photo-overlay" v-if="loadedPhotos.has(photo.idPhoto)">
    <span class="photo-name">{{ photo.originalFilename }}</span>
    <span class="photo-meta">{{ formatFileSize(photo.fileSize) }}</span>
  </div>
</div>
        
        <!-- Метаданные под фото -->
        <div class="photo-info">
          <span class="assembly-badge">🔭 Сборка #{{ photo.telescopeAssemblyId }}</span>
          <span class="date">{{ formatDate(photo.createdAt) }}</span>
        </div>
      </div>
      
      <div v-if="photos.length === 0" class="empty-gallery">
        <p>📭 Нет загруженных фотографий</p>
        <button @click="openUploadModal" class="btn btn-primary">Загрузить первое фото</button>
      </div>
    </div>

    <!-- Модальное окно загрузки -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Загрузить фотографию</h2>
          <button @click="closeUploadModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitUpload" class="modal-body">
          <div class="form-group">
            <label>Файл *</label>
            <input 
              type="file" 
              @change="handleFileSelect" 
              accept="image/*"
              class="file-input"
              required
            >
            <small class="hint">Поддерживаются: JPG, PNG, WEBP (макс. 50 МБ)</small>
          </div>

          <div class="form-group">
            <label>Сборка телескопа *</label>
            <select v-model.number="uploadForm.assemblyId" required class="form-select">
              <option value="" disabled>Выберите сборку...</option>
              <option v-for="assembly in assemblies" :key="assembly.id" :value="assembly.id">
                #{{ assembly.id }} — {{ assembly.name }}
              </option>
            </select>
          </div>

          <div v-if="uploadPreview" class="upload-preview">
            <img :src="uploadPreview" alt="Preview">
            <p class="preview-name">{{ selectedFile?.name }}</p>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeUploadModal" class="btn">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="uploading || !selectedFile">
              {{ uploading ? 'Загрузка...' : 'Загрузить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import photosApi from '@/services/photos';

const router = useRouter();
const photos = ref([]);
const assemblies = ref([]);
const loading = ref(false);
const error = ref(null);
const showUploadModal = ref(false);
const uploading = ref(false);

// Пагинация
const currentPage = ref(0);
const totalPages = ref(1);
const totalElements = ref(0);
const pageSize = ref(12);

// Загрузка файла
const selectedFile = ref(null);
const uploadPreview = ref(null);
const uploadForm = ref({ assemblyId: null });

// Отслеживаем загруженные фото
const loadedPhotos = ref(new Set());

const handleImageLoad = (photoId) => {
  loadedPhotos.value.add(photoId);
};

const handleImageError = (event, photo) => {
  // Показываем заглушку при ошибке
  event.target.style.display = 'none';
};

// При загрузке страницы сразу получаем URL для всех фото
onMounted(async () => {
  await fetchPhotos();
  // Лениво загружаем URL для видимых фото
  loadVisiblePhotoUrls();
});

const loadVisiblePhotoUrls = async () => {
  // Загружаем URL только для первых 4-6 фото чтобы не тормозило
  const photosToLoad = photos.value.slice(0, 6);
  for (const photo of photosToLoad) {
    if (!photo.previewUrl) {
      try {
        const res = await photosApi.getPhotoUrl(photo.idPhoto);
        photo.previewUrl = res.data.url;
      } catch (err) {
        console.warn('⚠️ Не удалось получить URL:', err);
      }
    }
  }
};

// Форматирование
const formatDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric'
});

const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
};

// Загрузка данных
const loadAssemblies = async () => {
  try {
    const res = await photosApi.getAssemblies();
    assemblies.value = Array.isArray(res.data) ? res.data : (res.data.content || []);
  } catch (err) {
    console.warn('⚠️ Не удалось загрузить сборки:', err);
  }
};

const fetchPhotos = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const res = await photosApi.getMyPhotos({
      page: currentPage.value,
      size: pageSize.value
    });
    
    photos.value = res.data.content || [];
    totalPages.value = res.data.totalPages || 1;
    totalElements.value = res.data.totalElements || 0;
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить фотографии';
    console.error(err);
  } finally {
    loading.value = false;
  }
};


// Навигация
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchPhotos();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchPhotos();
  }
};

const goToDetail = (photoId) => {
  router.push(`/photos/${photoId}`);
};

// Модальное окно загрузки
const openUploadModal = async () => {
  if (assemblies.value.length === 0) {
    await loadAssemblies();
  }
  showUploadModal.value = true;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
  selectedFile.value = null;
  uploadPreview.value = null;
  uploadForm.value = { assemblyId: null };
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Валидация
  if (file.size > 50 * 1024 * 1024) {
    alert('Файл слишком большой (макс. 50 МБ)');
    event.target.value = '';
    return;
  }
  
  selectedFile.value = file;
  
  // Превью
  const reader = new FileReader();
  reader.onload = (e) => { uploadPreview.value = e.target.result; };
  reader.readAsDataURL(file);
};

const submitUpload = async () => {
  if (!selectedFile.value || !uploadForm.value.assemblyId) return;
  
  uploading.value = true;
  try {
    await photosApi.uploadPhoto(selectedFile.value, uploadForm.value.assemblyId);
    closeUploadModal();
    fetchPhotos(); // Обновить галерею
    alert('✅ Фото загружено!');
  } catch (err) {
    alert('❌ Ошибка загрузки: ' + (err.response?.data?.message || err.message));
  } finally {
    uploading.value = false;
  }
};

onMounted(() => {
  fetchPhotos();
});
</script>

<style scoped>
.page { max-width: 1400px; margin: 0 auto; }
.page-header { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
}

.photo-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 17, 32, 0.8);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.controls-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem; padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
}
.page-control { display: flex; align-items: center; gap: 0.5rem; }
.page-info { color: #94a3b8; font-size: 0.9rem; }
.total-count { color: #94a3b8; font-size: 0.9rem; }

/* Галерея */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.gallery-item {
  background: #111827; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px; overflow: hidden; cursor: pointer;
  transition: all 0.2s;
}
.gallery-item:hover {
  border-color: #60a5fa; transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.photo-preview {
  position: relative; aspect-ratio: 4/3; background: #0b1120;
  overflow: hidden;
}
.photo-preview img {
  width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;
}
.gallery-item:hover .photo-preview img { transform: scale(1.05); }

.photo-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 0.75rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}
.photo-name {
  display: block; font-size: 0.85rem; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.photo-meta {
  font-size: 0.75rem; color: #94a3b8;
}

.photo-info {
  padding: 0.75rem; display: flex; justify-content: space-between;
  align-items: center; font-size: 0.8rem;
}
.assembly-badge {
  color: #93c5fd; background: rgba(59, 130, 246, 0.15);
  padding: 0.2rem 0.5rem; border-radius: 4px;
}
.date { color: #64748b; }

.empty-gallery {
  grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;
  color: #64748b;
}
.empty-gallery p { margin-bottom: 1rem; }

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

.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; margin-bottom: 0.4rem; color: #94a3b8; font-size: 0.9rem; }
.form-group input, .form-group select {
  width: 100%; padding: 0.6rem 0.8rem;
  background: #0b1120; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px; color: #e0e7ff; font-size: 0.95rem;
}
.form-group input:focus, .form-group select:focus {
  outline: none; border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}
.form-select {
  cursor: pointer; appearance: none;
  background-image: url("image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center; background-repeat: no-repeat;
  background-size: 1.5em 1.5em; padding-right: 2.5rem;
}
.file-input {
  padding: 0.4rem; background: #0b1120; border: 1px dashed rgba(59, 130, 246, 0.5);
  border-radius: 6px; color: #94a3b8; cursor: pointer;
}
.file-input:hover { border-color: #60a5fa; }
.hint { display: block; margin-top: 0.3rem; color: #64748b; font-size: 0.8rem; }

.upload-preview {
  margin: 1rem 0; text-align: center;
}
.upload-preview img {
  max-width: 100%; max-height: 200px; border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.preview-name {
  margin-top: 0.5rem; font-size: 0.85rem; color: #94a3b8;
  word-break: break-all;
}

/* Утилиты */
.btn-icon {
  background: transparent; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 0.4rem 0.6rem; cursor: pointer;
  transition: all 0.2s; font-size: 1rem;
}
.btn-icon:hover { background: rgba(255,255,255,0.1); border-color: #60a5fa; }
.btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

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