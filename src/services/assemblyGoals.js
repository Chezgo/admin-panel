import api from '@/services/api';

const v1 = (path) => `/v1${path}`;

export default {
  getGoals: () => api.get(v1('/assembly-goals')),
  getGoal: (id) => api.get(v1(`/assembly-goals/${id}`)),
  createGoal: (data) => api.post(v1('/assembly-goals'), data),
  updateGoal: (id, data) => api.put(v1(`/assembly-goals/${id}`), data),
  deleteGoal: (id) => api.delete(v1(`/assembly-goals/${id}`)),

  getRequirements: (goalId) => api.get(v1(`/assembly-goals/${goalId}/requirements`)),
  createRequirement: (goalId, data) =>
    api.post(v1(`/assembly-goals/${goalId}/requirements`), data),
  updateRequirement: (goalId, id, data) =>
    api.put(v1(`/assembly-goals/${goalId}/requirements/${id}`), data),
  deleteRequirement: (goalId, id) =>
    api.delete(v1(`/assembly-goals/${goalId}/requirements/${id}`)),

  getCompatibilities: (parentTypeId) => api.get(v1('/assembly-types/compatibilities'), {
    params: parentTypeId ? { parentTypeId } : undefined,
  }),
  createCompatibility: (data) => api.post(v1('/assembly-types/compatibilities'), data),
  updateCompatibility: (id, data) =>
    api.put(v1(`/assembly-types/compatibilities/${id}`), data),
  deleteCompatibility: (id) => api.delete(v1(`/assembly-types/compatibilities/${id}`)),

  getDetailTypes: () => api.get(v1('/type-detail')),
};
