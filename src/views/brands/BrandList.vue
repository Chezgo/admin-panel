<template>
  <div class="page">
    <h1>{{ title }}</h1>
    <div class="card">
      <p>🏷️ Здесь будет список брендов</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const title = computed(() => route.meta.title || 'Страница');
</script>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; }
h1 { margin-bottom: 1.5rem; color: #2c3e50; }
.card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
</style>