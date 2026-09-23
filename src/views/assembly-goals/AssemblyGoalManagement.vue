<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Управление целями сборок</h1>
        <p class="page-subtitle">Правила оценки пользовательских сборок и доступность типов деталей.</p>
      </div>
      <button class="btn" :disabled="loading" @click="refreshCurrent">
        <RefreshCw class="ui-icon" /> Обновить
      </button>
    </div>

    <div class="tabs" role="tablist" aria-label="Разделы управления сборками">
      <button :class="['tab', { active: activeTab === 'goals' }]" @click="activeTab = 'goals'">
        <Target class="ui-icon" /> Цели и требования
      </button>
      <button :class="['tab', { active: activeTab === 'compatibilities' }]" @click="activeTab = 'compatibilities'">
        <Network class="ui-icon" /> Связи типов
      </button>
    </div>

    <div v-if="notice" :class="['notice', notice.type]">
      <CircleAlert v-if="notice.type === 'error'" class="ui-icon" />
      <CircleCheck v-else class="ui-icon" />
      <span>{{ notice.text }}</span>
      <button type="button" aria-label="Закрыть сообщение" @click="notice = null"><X /></button>
    </div>

    <section v-show="activeTab === 'goals'" class="goals-layout">
      <div class="card goals-list-card">
        <div class="card-header">
          <div>
            <h2>Цели</h2>
            <span class="muted">{{ goals.length }} {{ pluralizeGoal(goals.length) }}</span>
          </div>
          <button class="btn btn-primary compact" @click="startGoalCreate">
            <Plus class="ui-icon" /> Добавить
          </button>
        </div>

        <div v-if="goalsLoading" class="state"><span class="spinner small"></span> Загрузка целей...</div>
        <div v-else-if="!goals.length" class="state">Целей пока нет. Создайте первую цель.</div>
        <div v-else class="goal-list">
          <button
            v-for="goal in goals"
            :key="goal.id"
            :class="['goal-item', { active: selectedGoal?.id === goal.id && !creatingGoal }]"
            @click="selectGoal(goal.id)"
          >
            <span>
              <strong>{{ goal.name }}</strong>
              <small>{{ goal.targetCategory || 'Категория не указана' }}</small>
            </span>
            <ChevronRight />
          </button>
        </div>
      </div>

      <div class="workspace">
        <div v-if="goalLoading" class="card state tall"><span class="spinner"></span> Загрузка цели...</div>
        <div v-else-if="!selectedGoal && !creatingGoal" class="card state tall">
          <Target class="empty-icon" />
          <strong>Выберите цель</strong>
          <span>Здесь можно изменить её данные и правила оценки.</span>
        </div>
        <template v-else>
          <form class="card editor" @submit.prevent="saveGoal">
            <div class="card-header">
              <div>
                <h2>{{ creatingGoal ? 'Новая цель' : 'Основные данные' }}</h2>
                <span v-if="selectedGoal" class="muted">ID {{ selectedGoal.id }}</span>
              </div>
              <div class="actions">
                <button v-if="creatingGoal" type="button" class="btn compact" @click="cancelGoalCreate"><X class="ui-icon" /> Отмена</button>
                <button type="submit" class="btn btn-primary compact" :disabled="goalSaving">
                  <Save class="ui-icon" /> {{ goalSaving ? 'Сохранение...' : 'Сохранить' }}
                </button>
                <button v-if="selectedGoal && !creatingGoal" type="button" class="btn btn-danger icon-only" title="Удалить цель" @click="removeGoal">
                  <Trash2 class="ui-icon" />
                </button>
              </div>
            </div>

            <div class="form-grid">
              <label class="field span-2">
                <span>Название *</span>
                <input v-model.trim="goalForm.name" maxlength="255" required placeholder="Например, Наблюдение планет">
              </label>
              <label class="field span-2">
                <span>Категория *</span>
                <input v-model.trim="goalForm.targetCategory" list="target-categories" maxlength="100" required placeholder="PLANETARY">
                <datalist id="target-categories">
                  <option value="PLANETARY" />
                  <option value="DEEP_SKY" />
                  <option value="ASTROPHOTOGRAPHY" />
                  <option value="UNIVERSAL" />
                </datalist>
                <small>Технический код категории, который получает клиентское приложение.</small>
              </label>
              <label class="field span-2">
                <span>Описание</span>
                <textarea v-model.trim="goalForm.description" rows="3" placeholder="Назначение и особенности этой цели"></textarea>
              </label>
            </div>
          </form>

          <div v-if="selectedGoal && !creatingGoal" class="card requirements-card">
            <div class="card-header">
              <div>
                <h2>Требования</h2>
                <span class="muted">Одно правило на каждый тип детали</span>
              </div>
              <button v-if="!showRequirementForm" class="btn btn-primary compact" @click="startRequirementCreate">
                <Plus class="ui-icon" /> Добавить правило
              </button>
            </div>

            <form v-if="showRequirementForm" class="inline-form" @submit.prevent="saveRequirement">
              <div class="inline-form-title">
                <strong>{{ editingRequirementId ? 'Изменение правила' : 'Новое правило' }}</strong>
                <button type="button" class="plain-icon" title="Закрыть" @click="cancelRequirementEdit"><X /></button>
              </div>
              <div class="form-grid three-columns">
                <label class="field span-2">
                  <span>Тип детали *</span>
                  <select v-model.number="requirementForm.telescopeTypeDetailId" required>
                    <option disabled value="">Выберите тип</option>
                    <option v-for="type in availableRequirementTypes" :key="type.id" :value="type.id">{{ type.name }} (#{{ type.id }})</option>
                  </select>
                </label>
                <label class="field">
                  <span>Важность *</span>
                  <select v-model="requirementForm.requirementType" required>
                    <option value="REQUIRED">Обязательно</option>
                    <option value="RECOMMENDED">Рекомендуется</option>
                    <option value="OPTIONAL">Опционально</option>
                  </select>
                </label>
                <label class="field">
                  <span>Минимум *</span>
                  <input v-model.number="requirementForm.minQuantity" type="number" min="0" step="1" required>
                </label>
                <label class="field">
                  <span>Максимум</span>
                  <input v-model="requirementForm.maxQuantity" type="number" min="0" step="1" placeholder="Без ограничения">
                </label>
                <label class="field span-3">
                  <span>Пояснение</span>
                  <textarea v-model.trim="requirementForm.description" rows="2" placeholder="Подсказка для пользователя"></textarea>
                </label>
              </div>
              <div class="form-actions">
                <button type="button" class="btn compact" @click="cancelRequirementEdit">Отмена</button>
                <button type="submit" class="btn btn-primary compact" :disabled="requirementSaving"><Save class="ui-icon" /> Сохранить правило</button>
              </div>
            </form>

            <div v-if="!selectedGoal.requirements?.length" class="state compact-state">Для цели ещё не настроены правила оценки.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Тип детали</th><th>Важность</th><th>Количество</th><th>Описание</th><th>Действия</th></tr></thead>
                <tbody>
                  <tr v-for="rule in selectedGoal.requirements" :key="rule.id">
                    <td><strong>{{ rule.telescopeTypeDetailName || typeName(rule.telescopeTypeDetailId) }}</strong><small class="id-note">#{{ rule.telescopeTypeDetailId }}</small></td>
                    <td><span :class="['badge', requirementClass(rule.requirementType)]">{{ requirementLabel(rule.requirementType) }}</span></td>
                    <td>{{ quantityLabel(rule) }}</td>
                    <td>{{ rule.description || '—' }}</td>
                    <td><div class="row-actions"><button class="plain-icon" title="Изменить" @click="startRequirementEdit(rule)"><Pencil /></button><button class="plain-icon danger" title="Удалить" @click="removeRequirement(rule)"><Trash2 /></button></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>
    </section>

    <section v-show="activeTab === 'compatibilities'" class="card compatibility-card">
      <div class="card-header">
        <div>
          <h2>Связи доступных типов</h2>
          <span class="muted">Родительский тип открывает дочерний тип для добавления в сборку.</span>
        </div>
        <button v-if="!showCompatibilityForm" class="btn btn-primary compact" @click="startCompatibilityCreate"><Plus class="ui-icon" /> Добавить связь</button>
      </div>

      <form v-if="showCompatibilityForm" class="inline-form" @submit.prevent="saveCompatibility">
        <div class="inline-form-title">
          <strong>{{ editingCompatibilityId ? 'Изменение связи' : 'Новая связь типов' }}</strong>
          <button type="button" class="plain-icon" title="Закрыть" @click="cancelCompatibilityEdit"><X /></button>
        </div>
        <div class="form-grid three-columns">
          <label class="field">
            <span>Родительский тип *</span>
            <select v-model.number="compatibilityForm.parentTypeId" required><option disabled value="">Выберите тип</option><option v-for="type in detailTypes" :key="type.id" :value="type.id">{{ type.name }} (#{{ type.id }})</option></select>
          </label>
          <label class="field">
            <span>Дочерний тип *</span>
            <select v-model.number="compatibilityForm.childTypeId" required><option disabled value="">Выберите тип</option><option v-for="type in detailTypes" :key="type.id" :value="type.id">{{ type.name }} (#{{ type.id }})</option></select>
          </label>
          <label class="field">
            <span>Имя слота *</span>
            <input v-model.trim="compatibilityForm.slotName" required maxlength="100" placeholder="main-ota">
          </label>
          <label class="field span-2">
            <span>Описание</span>
            <textarea v-model.trim="compatibilityForm.description" rows="2" placeholder="Назначение связи"></textarea>
          </label>
          <label class="switch-field"><input v-model="compatibilityForm.isActive" type="checkbox"><span>Связь активна</span></label>
        </div>
        <div class="form-actions"><button type="button" class="btn compact" @click="cancelCompatibilityEdit">Отмена</button><button type="submit" class="btn btn-primary compact" :disabled="compatibilitySaving"><Save class="ui-icon" /> Сохранить связь</button></div>
      </form>

      <div class="filter-bar">
        <label class="field filter-field"><span>Фильтр по родительскому типу</span><select v-model="compatibilityParentFilter" @change="loadCompatibilities"><option value="">Все типы</option><option v-for="type in detailTypes" :key="type.id" :value="type.id">{{ type.name }}</option></select></label>
        <span class="muted">Найдено: {{ compatibilities.length }}</span>
      </div>

      <div v-if="compatibilitiesLoading" class="state"><span class="spinner small"></span> Загрузка связей...</div>
      <div v-else-if="!compatibilities.length" class="state">Связей с выбранным фильтром нет.</div>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Родительский тип</th><th>Дочерний тип</th><th>Слот</th><th>Описание</th><th>Состояние</th><th>Действия</th></tr></thead>
          <tbody>
            <tr v-for="item in compatibilities" :key="item.id">
              <td><strong>{{ item.parentTypeName || typeName(item.parentTypeId) }}</strong><small class="id-note">#{{ item.parentTypeId }}</small></td>
              <td><strong>{{ item.childTypeName || typeName(item.childTypeId) }}</strong><small class="id-note">#{{ item.childTypeId }}</small></td>
              <td><code>{{ item.slotName }}</code></td>
              <td>{{ item.description || '—' }}</td>
              <td><button :class="['status-toggle', { active: item.isActive }]" :disabled="compatibilitySaving" @click="toggleCompatibility(item)">{{ item.isActive ? 'Активна' : 'Отключена' }}</button></td>
              <td><div class="row-actions"><button class="plain-icon" title="Изменить" @click="startCompatibilityEdit(item)"><Pencil /></button><button class="plain-icon danger" title="Удалить физически" @click="removeCompatibility(item)"><Trash2 /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ChevronRight, CircleAlert, CircleCheck, Network, Pencil, Plus, RefreshCw, Save, Target, Trash2, X } from 'lucide-vue-next';
import assemblyGoalsApi from '@/services/assemblyGoals';

const activeTab = ref('goals');
const notice = ref(null);
const goals = ref([]);
const selectedGoal = ref(null);
const goalsLoading = ref(false);
const goalLoading = ref(false);
const goalSaving = ref(false);
const creatingGoal = ref(false);
const detailTypes = ref([]);
const compatibilities = ref([]);
const compatibilitiesLoading = ref(false);
const compatibilityParentFilter = ref('');
const requirementSaving = ref(false);
const showRequirementForm = ref(false);
const editingRequirementId = ref(null);
const compatibilitySaving = ref(false);
const showCompatibilityForm = ref(false);
const editingCompatibilityId = ref(null);

const goalForm = reactive({ name: '', description: '', targetCategory: '' });
const requirementForm = reactive({ telescopeTypeDetailId: '', requirementType: 'REQUIRED', minQuantity: 1, maxQuantity: '', description: '' });
const compatibilityForm = reactive({ parentTypeId: '', childTypeId: '', slotName: '', description: '', isActive: true });

const normalizeList = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const getErrorMessage = (error, fallback) => {
  const body = error.response?.data;
  if (body?.errorMessage && typeof body.errorMessage === 'object') {
    const messages = Object.values(body.errorMessage).filter(Boolean);
    if (messages.length) return messages.join('. ');
  }
  return body?.errorMessage || body?.message || body?.error || fallback;
};

const showNotice = (text, type = 'success') => { notice.value = { text, type }; };
const nullableText = (value) => value?.trim() || null;
const typeName = (id) => detailTypes.value.find((item) => Number(item.id) === Number(id))?.name || `Тип ${id}`;
const pluralizeGoal = (count) => count % 10 === 1 && count % 100 !== 11 ? 'цель' : (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'цели' : 'целей');

const availableRequirementTypes = computed(() => {
  const usedIds = new Set((selectedGoal.value?.requirements || []).filter((item) => item.id !== editingRequirementId.value).map((item) => Number(item.telescopeTypeDetailId)));
  return detailTypes.value.filter((item) => !usedIds.has(Number(item.id)));
});

const loadGoals = async () => {
  goalsLoading.value = true;
  try {
    const response = await assemblyGoalsApi.getGoals();
    goals.value = normalizeList(response.data, 'goals');
  } catch (error) {
    showNotice(getErrorMessage(error, 'Не удалось загрузить цели сборок'), 'error');
  } finally { goalsLoading.value = false; }
};

const loadDetailTypes = async () => {
  try {
    const response = await assemblyGoalsApi.getDetailTypes();
    detailTypes.value = normalizeList(response.data, 'types');
  } catch (error) {
    showNotice(getErrorMessage(error, 'Не удалось загрузить типы деталей'), 'error');
  }
};

const selectGoal = async (id) => {
  creatingGoal.value = false;
  cancelRequirementEdit();
  goalLoading.value = true;
  try {
    const response = await assemblyGoalsApi.getGoal(id);
    selectedGoal.value = response.data;
    Object.assign(goalForm, {
      name: response.data.name || '',
      description: response.data.description || '',
      targetCategory: response.data.targetCategory || '',
    });
  } catch (error) {
    showNotice(getErrorMessage(error, 'Не удалось загрузить цель'), 'error');
  } finally { goalLoading.value = false; }
};

const startGoalCreate = () => {
  creatingGoal.value = true;
  selectedGoal.value = null;
  cancelRequirementEdit();
  Object.assign(goalForm, { name: '', description: '', targetCategory: '' });
};
const cancelGoalCreate = () => {
  creatingGoal.value = false;
  if (goals.value.length) selectGoal(goals.value[0].id);
};

const saveGoal = async () => {
  goalSaving.value = true;
  const payload = { name: goalForm.name.trim(), description: nullableText(goalForm.description), targetCategory: goalForm.targetCategory.trim() };
  try {
    if (creatingGoal.value) {
      const response = await assemblyGoalsApi.createGoal(payload);
      await loadGoals();
      const createdId = response.data?.id || goals.value.find((item) => item.name === payload.name)?.id;
      creatingGoal.value = false;
      if (createdId) await selectGoal(createdId);
      showNotice('Цель создана');
    } else {
      await assemblyGoalsApi.updateGoal(selectedGoal.value.id, payload);
      await Promise.all([loadGoals(), selectGoal(selectedGoal.value.id)]);
      showNotice('Изменения цели сохранены');
    }
  } catch (error) {
    showNotice(getErrorMessage(error, 'Не удалось сохранить цель'), 'error');
  } finally { goalSaving.value = false; }
};

const removeGoal = async () => {
  if (!window.confirm(`Удалить цель «${selectedGoal.value.name}» вместе со всеми требованиями?`)) return;
  try {
    await assemblyGoalsApi.deleteGoal(selectedGoal.value.id);
    selectedGoal.value = null;
    await loadGoals();
    if (goals.value.length) await selectGoal(goals.value[0].id);
    showNotice('Цель и её требования удалены');
  } catch (error) { showNotice(getErrorMessage(error, 'Не удалось удалить цель'), 'error'); }
};

const startRequirementCreate = () => {
  editingRequirementId.value = null;
  Object.assign(requirementForm, { telescopeTypeDetailId: '', requirementType: 'REQUIRED', minQuantity: 1, maxQuantity: '', description: '' });
  showRequirementForm.value = true;
};
const startRequirementEdit = (rule) => {
  editingRequirementId.value = rule.id;
  Object.assign(requirementForm, {
    telescopeTypeDetailId: rule.telescopeTypeDetailId,
    requirementType: rule.requirementType,
    minQuantity: rule.minQuantity,
    maxQuantity: rule.maxQuantity ?? '',
    description: rule.description || '',
  });
  showRequirementForm.value = true;
};
const cancelRequirementEdit = () => { showRequirementForm.value = false; editingRequirementId.value = null; };
const saveRequirement = async () => {
  const min = Number(requirementForm.minQuantity);
  const max = requirementForm.maxQuantity === '' || requirementForm.maxQuantity === null ? null : Number(requirementForm.maxQuantity);
  if (!Number.isInteger(min) || min < 0 || (max !== null && (!Number.isInteger(max) || max < min))) {
    showNotice('Максимальное количество должно быть целым числом не меньше минимального', 'error'); return;
  }
  const payload = { telescopeTypeDetailId: Number(requirementForm.telescopeTypeDetailId), requirementType: requirementForm.requirementType, minQuantity: min, maxQuantity: max, description: nullableText(requirementForm.description) };
  const wasEditing = Boolean(editingRequirementId.value);
  requirementSaving.value = true;
  try {
    if (editingRequirementId.value) await assemblyGoalsApi.updateRequirement(selectedGoal.value.id, editingRequirementId.value, payload);
    else await assemblyGoalsApi.createRequirement(selectedGoal.value.id, payload);
    await selectGoal(selectedGoal.value.id);
    cancelRequirementEdit();
    showNotice(wasEditing ? 'Правило изменено' : 'Правило добавлено');
  } catch (error) { showNotice(getErrorMessage(error, 'Не удалось сохранить правило'), 'error'); }
  finally { requirementSaving.value = false; }
};
const removeRequirement = async (rule) => {
  if (!window.confirm(`Удалить правило для типа «${rule.telescopeTypeDetailName || typeName(rule.telescopeTypeDetailId)}»?`)) return;
  try { await assemblyGoalsApi.deleteRequirement(selectedGoal.value.id, rule.id); await selectGoal(selectedGoal.value.id); showNotice('Правило удалено'); }
  catch (error) { showNotice(getErrorMessage(error, 'Не удалось удалить правило'), 'error'); }
};

const requirementLabel = (type) => ({ REQUIRED: 'Обязательно', RECOMMENDED: 'Рекомендуется', OPTIONAL: 'Опционально' }[type] || type);
const requirementClass = (type) => ({ REQUIRED: 'required', RECOMMENDED: 'recommended', OPTIONAL: 'optional' }[type] || '');
const quantityLabel = (rule) => rule.maxQuantity === null || rule.maxQuantity === undefined ? `от ${rule.minQuantity}` : rule.minQuantity === rule.maxQuantity ? String(rule.minQuantity) : `${rule.minQuantity}–${rule.maxQuantity}`;

const loadCompatibilities = async () => {
  compatibilitiesLoading.value = true;
  try {
    const response = await assemblyGoalsApi.getCompatibilities(compatibilityParentFilter.value ? Number(compatibilityParentFilter.value) : undefined);
    compatibilities.value = normalizeList(response.data, 'compatibilities');
  } catch (error) { showNotice(getErrorMessage(error, 'Не удалось загрузить связи типов'), 'error'); }
  finally { compatibilitiesLoading.value = false; }
};
const startCompatibilityCreate = () => {
  editingCompatibilityId.value = null;
  Object.assign(compatibilityForm, { parentTypeId: '', childTypeId: '', slotName: '', description: '', isActive: true });
  showCompatibilityForm.value = true;
};
const startCompatibilityEdit = (item) => {
  editingCompatibilityId.value = item.id;
  Object.assign(compatibilityForm, { parentTypeId: item.parentTypeId, childTypeId: item.childTypeId, slotName: item.slotName, description: item.description || '', isActive: Boolean(item.isActive) });
  showCompatibilityForm.value = true;
};
const cancelCompatibilityEdit = () => { showCompatibilityForm.value = false; editingCompatibilityId.value = null; };
const compatibilityPayload = (source) => ({ parentTypeId: Number(source.parentTypeId), childTypeId: Number(source.childTypeId), slotName: source.slotName.trim(), description: nullableText(source.description), isActive: Boolean(source.isActive) });
const saveCompatibility = async () => {
  if (Number(compatibilityForm.parentTypeId) === Number(compatibilityForm.childTypeId)) { showNotice('Нельзя связать тип детали с самим собой', 'error'); return; }
  compatibilitySaving.value = true;
  try {
    const payload = compatibilityPayload(compatibilityForm);
    if (editingCompatibilityId.value) await assemblyGoalsApi.updateCompatibility(editingCompatibilityId.value, payload);
    else await assemblyGoalsApi.createCompatibility(payload);
    cancelCompatibilityEdit(); await loadCompatibilities(); showNotice('Связь сохранена');
  } catch (error) { showNotice(getErrorMessage(error, 'Не удалось сохранить связь'), 'error'); }
  finally { compatibilitySaving.value = false; }
};
const toggleCompatibility = async (item) => {
  compatibilitySaving.value = true;
  try { await assemblyGoalsApi.updateCompatibility(item.id, { ...compatibilityPayload(item), isActive: !item.isActive }); await loadCompatibilities(); showNotice(item.isActive ? 'Связь отключена' : 'Связь включена'); }
  catch (error) { showNotice(getErrorMessage(error, 'Не удалось изменить состояние связи'), 'error'); }
  finally { compatibilitySaving.value = false; }
};
const removeCompatibility = async (item) => {
  if (!window.confirm(`Физически удалить связь «${typeName(item.parentTypeId)} → ${typeName(item.childTypeId)}»? Для временного отключения используйте кнопку состояния.`)) return;
  try { await assemblyGoalsApi.deleteCompatibility(item.id); await loadCompatibilities(); showNotice('Связь удалена'); }
  catch (error) { showNotice(getErrorMessage(error, 'Не удалось удалить связь'), 'error'); }
};

const refreshCurrent = async () => {
  notice.value = null;
  if (activeTab.value === 'compatibilities') await Promise.all([loadDetailTypes(), loadCompatibilities()]);
  else { await Promise.all([loadGoals(), loadDetailTypes()]); if (selectedGoal.value) await selectGoal(selectedGoal.value.id); }
};
const loading = computed(() => goalsLoading.value || goalLoading.value || compatibilitiesLoading.value);
watch(activeTab, (tab) => { if (tab === 'compatibilities' && !compatibilities.value.length) loadCompatibilities(); });

onMounted(async () => {
  await Promise.all([loadGoals(), loadDetailTypes()]);
  if (goals.value.length) await selectGoal(goals.value[0].id);
});
</script>

<style scoped>
.page{position:relative;z-index:1;max-width:1440px;margin:0 auto}.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.tabs{display:flex;gap:.4rem;margin-bottom:1.25rem;padding:.3rem;background:#111827;border:1px solid rgba(59,130,246,.25);border-radius:10px;width:max-content;max-width:100%}.tab{display:flex;align-items:center;gap:.45rem;padding:.65rem 1rem;color:#94a3b8;background:transparent;border:0;border-radius:7px;cursor:pointer;font:inherit;font-weight:600}.tab.active{color:#dbeafe;background:rgba(37,99,235,.28)}.notice{display:flex;align-items:center;gap:.6rem;margin-bottom:1rem;padding:.75rem 1rem;border-radius:8px}.notice.success{color:#bbf7d0;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35)}.notice.error{color:#fecaca;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35)}.notice button{display:grid;margin-left:auto;padding:0;color:inherit;background:none;border:0;cursor:pointer}.notice button svg{width:18px}.goals-layout{display:grid;grid-template-columns:minmax(240px,320px) minmax(0,1fr);gap:1.25rem}.goals-list-card{align-self:start}.card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:1.1rem 1.25rem;border-bottom:1px solid rgba(59,130,246,.2)}.card-header h2{margin:0}.muted{display:block;color:#94a3b8;font-size:.85rem}.goal-list{display:grid;padding:.55rem}.goal-item{display:flex;align-items:center;justify-content:space-between;gap:.6rem;width:100%;padding:.8rem .75rem;color:#cbd5e1;text-align:left;background:transparent;border:0;border-radius:8px;cursor:pointer}.goal-item:hover,.goal-item.active{background:rgba(59,130,246,.14)}.goal-item.active{color:#dbeafe;box-shadow:inset 3px 0 #60a5fa}.goal-item span{display:grid;min-width:0}.goal-item strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.goal-item small{color:#64748b}.goal-item>svg{width:18px;flex:none}.workspace{min-width:0}.state{display:flex;align-items:center;justify-content:center;gap:.65rem;min-height:110px;padding:2rem;color:#94a3b8;text-align:center}.state.tall{min-height:320px;flex-direction:column}.state.compact-state{min-height:100px}.empty-icon{width:44px;height:44px;color:#60a5fa}.spinner.small{width:22px;height:22px}.editor,.requirements-card,.compatibility-card{overflow:visible}.actions,.row-actions,.form-actions{display:flex;align-items:center;gap:.55rem}.btn.compact{padding:.5rem .8rem}.icon-only{padding:.55rem}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;padding:1.25rem}.form-grid.three-columns{grid-template-columns:repeat(3,minmax(0,1fr));padding:0}.field{display:grid;align-content:start;gap:.35rem;color:#cbd5e1;font-size:.88rem}.field>span{font-weight:600}.field small{color:#64748b}.field input,.field select,.field textarea{width:100%;padding:.65rem .75rem;color:#e2e8f0;background:#0b1120;border:1px solid rgba(96,165,250,.3);border-radius:7px;font:inherit}.field textarea{resize:vertical}.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:#60a5fa;box-shadow:0 0 0 2px rgba(96,165,250,.15)}.span-2{grid-column:span 2}.span-3{grid-column:span 3}.inline-form{margin:1rem 1.25rem;padding:1rem;background:rgba(15,23,42,.72);border:1px solid rgba(96,165,250,.28);border-radius:9px}.inline-form-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;color:#dbeafe}.form-actions{justify-content:flex-end;margin-top:1rem}.switch-field{display:flex;align-items:center;gap:.6rem;align-self:end;min-height:43px;color:#cbd5e1}.switch-field input{width:18px;height:18px;accent-color:#2563eb}.table-wrap{max-width:100%;overflow-x:auto}.data-table{width:100%;border-collapse:collapse}.data-table th{padding:.8rem 1rem;color:#93c5fd;text-align:left;background:rgba(59,130,246,.09);border-bottom:1px solid rgba(59,130,246,.2);font-size:.85rem}.data-table td{padding:.85rem 1rem;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,.06);vertical-align:middle}.data-table tbody tr:hover{background:rgba(59,130,246,.06)}.id-note{display:block;color:#64748b}.badge{display:inline-block;padding:.2rem .55rem;border-radius:99px;font-size:.78rem;white-space:nowrap}.badge.required{color:#fecaca;background:rgba(239,68,68,.15)}.badge.recommended{color:#fde68a;background:rgba(245,158,11,.15)}.badge.optional{color:#bfdbfe;background:rgba(59,130,246,.15)}.plain-icon{display:grid;place-items:center;padding:.4rem;color:#93c5fd;background:transparent;border:1px solid rgba(148,163,184,.2);border-radius:6px;cursor:pointer}.plain-icon:hover{background:rgba(59,130,246,.15);border-color:#60a5fa}.plain-icon.danger{color:#fca5a5}.plain-icon svg{width:17px;height:17px}.filter-bar{display:flex;align-items:end;gap:1rem;padding:1rem 1.25rem;border-bottom:1px solid rgba(59,130,246,.15)}.filter-field{width:min(360px,100%)}.filter-bar>.muted{margin-bottom:.65rem}.status-toggle{padding:.32rem .65rem;color:#fca5a5;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.35);border-radius:99px;cursor:pointer;white-space:nowrap}.status-toggle.active{color:#86efac;background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.4)}code{color:#c4b5fd}.compatibility-card{margin-bottom:0}
@media(max-width:1050px){.goals-layout{grid-template-columns:1fr}.goals-list-card{max-height:320px;overflow:auto}.form-grid.three-columns{grid-template-columns:repeat(2,minmax(0,1fr))}.span-3{grid-column:span 2}}
@media(max-width:700px){.page-header{align-items:stretch;flex-direction:column}.tabs{width:100%}.tab{flex:1;justify-content:center;font-size:.85rem}.goals-layout{gap:.8rem}.card-header{align-items:stretch;flex-direction:column}.actions{flex-wrap:wrap}.actions .btn{flex:1;justify-content:center}.form-grid,.form-grid.three-columns{grid-template-columns:1fr}.span-2,.span-3{grid-column:span 1}.inline-form{margin:.75rem;padding:.8rem}.filter-bar{align-items:stretch;flex-direction:column}.filter-bar>.muted{margin:0}.compatibility-card .data-table,.requirements-card .data-table{min-width:760px}}
</style>
