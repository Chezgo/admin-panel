import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    collapsed: false
  }),
  
  actions: {
    toggle() {
      this.collapsed = !this.collapsed;
    },
    collapse() {
      this.collapsed = true;
    },
    expand() {
      this.collapsed = false;
    }
  }
});