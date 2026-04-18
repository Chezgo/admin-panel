<template>
  <div class="callback-container">
    <div class="spinner"></div>
    <p>{{ statusMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const statusMessage = ref('Обработка авторизации...');
const errorMessage = ref(null);

onMounted(async () => {
  console.log('📥 Callback mounted');
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) throw new Error(`Auth error: ${error}`);
    if (!code) throw new Error('No code in URL');

    console.log('🔁 Exchanging code...');
    statusMessage.value = 'Обмен кода на токены...';

    await authStore.handleCallback();

    statusMessage.value = 'Успех! Перенаправление...';
    await new Promise(r => setTimeout(r, 300)); // Небольшая задержка для стабильности
    router.replace('/telescope-parts');
  } catch (err) {
    console.error('❌ Callback failed:', err);
    errorMessage.value = err.message;
    statusMessage.value = 'Ошибка авторизации';
    // Не делаем router.replace('/') чтобы избежать цикла, лучше показать ошибку
  }
});
</script>

<style scoped>
.callback-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error { color: #e74c3c; background: #fdedec; padding: 0.75rem; border-radius: 4px; max-width: 90%; word-break: break-word; }
</style>