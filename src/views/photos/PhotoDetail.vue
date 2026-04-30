<template>
  <div class="page">
    <div class="page-header">
      <button @click="$router.back()" class="btn btn-back">← Назад к галерее</button>
    </div>

    <!-- Состояния -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка фото...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchPhoto" class="btn">Повторить</button>
    </div>

    <!-- Деталь фото -->
    <div v-else-if="photo && photoUrl" class="detail-container">
      <!-- Изображение -->
      <div class="photo-display">
        <img :src="photoUrl" :alt="photo.originalFilename" @error="handleImageError">
      </div>
      
      <!-- Метаданные -->
      <div class="metadata-card">
        <h2>📋 Информация о фото</h2>
        
        <div class="meta-row">
          <label>Имя файла</label>
          <span class="value">{{ photo.originalFilename }}</span>
        </div>
        
        <div class="meta-row">
          <label>ID фото</label>
          <span class="value">#{{ photo.idPhoto }}</span>
        </div>
        
        <div class="meta-row">
          <label>Сборка</label>
          <span class="value">🔭 #{{ photo.telescopeAssemblyId }}</span>
        </div>
        
        <div class="meta-row">
          <label>Профиль</label>
          <span class="value">👤 #{{ photo.profileId }}</span>
        </div>
        
        <div class="meta-row">
          <label>Тип</label>
          <span class="value">{{ photo.contentTYpe || photo.contentType }}</span>
        </div>
        
        <div class="meta-row">
          <label>Размер</label>
          <span class="value">{{ formatFileSize(photo.fileSize) }}</span>
        </div>
        
        <div class="meta-row">
          <label>Загружено</label>
          <span class="value">{{ formatDate(photo.createdAt) }}</span>
        </div>
        
        <div class="meta-row full">
          <label>S3 Key</label>
          <code class="s3-key">{{ photo.s3ObjectKey }}</code>
        </div>

        <!-- Кнопка удаления -->
        <div class="actions">
          <button @click="handleDelete" class="btn btn-danger">
            🗑️ Удалить фото
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import photosApi from '@/services/photos';

const route = useRoute();
const router = useRouter();

const photo = ref(null);
const photoUrl = ref(null);
const loading = ref(false);
const error = ref(null);

const photoId = ref(parseInt(route.params.id, 10));

// Форматирование
const formatDate = (iso) => new Date(iso).toLocaleString('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
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

const fetchPhoto = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 1. Получаем метаданные
    const photos = await photosApi.getMyPhotos({ page: 0, size: 100 });
    const found = photos.data.content?.find(p => p.idPhoto === photoId.value);
    
    if (!found) {
      throw new Error('Фото не найдено');
    }
    photo.value = found;
    
    // 2. Получаем presigned URL для отображения
    const urlRes = await photosApi.getPhotoUrl(photoId.value);
    photoUrl.value = urlRes.data.url;
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось загрузить фото';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleImageError = () => {
  error.value = 'Не удалось загрузить изображение (возможно, истёк срок действия ссылки)';
};

const handleDelete = async () => {
  if (!confirm(`Удалить фото "${photo.value.originalFilename}"? Это действие необратимо.`)) return;
  
  try {
    await photosApi.deletePhoto(photoId.value);
    alert('✅ Фото удалено');
    router.replace('/photos');
  } catch (err) {
    alert('❌ Ошибка удаления: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(fetchPhoto);
</script>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 2rem; }

.btn-back {
  background: transparent; border: 1px solid rgba(255,255,255,0.2);
  color: #94a3b8; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer;
}
.btn-back:hover { border-color: #60a5fa; color: #fff; }

.detail-container {
  display: grid; grid-template-columns: 1fr 400px; gap: 2rem;
  align-items: start;
}

.photo-display {
  background: #0b1120; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px; padding: 1rem; text-align: center;
}
.photo-display img {
  max-width: 100%; height: auto; border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.metadata-card {
  background: #111827; border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px; padding: 1.5rem;
}
.metadata-card h2 {
  margin: 0 0 1.5rem; font-size: 1.3rem; color: #e0e7ff;
}

.meta-row {
  display: flex; gap: 1rem; padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.meta-row:last-child { border-bottom: none; }
.meta-row.full { flex-direction: column; }

.meta-row label {
  min-width: 100px; color: #94a3b8; font-size: 0.9rem;
}
.meta-row .value { color: #e0e7ff; font-weight: 500; word-break: break-word; }
.meta-row .s3-key {
  font-family: monospace; font-size: 0.8rem; color: #93c5fd;
  background: rgba(59, 130, 246, 0.1); padding: 0.4rem 0.6rem;
  border-radius: 4px; word-break: break-all;
}

.actions {
  margin-top: 1.5rem; padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

/* Адаптив */
@media (max-width: 900px) {
  .detail-container { grid-template-columns: 1fr; }
  .photo-display { order: 1; }
  .metadata-card { order: 2; }
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