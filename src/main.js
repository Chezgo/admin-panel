import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  Image,
  Inbox,
  Info,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Telescope,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from 'lucide-vue-next';
import App from './App.vue';
import router from './router';

const app = createApp(App);

const icons = {
  AppIconArrowLeft: ArrowLeft,
  AppIconChevronLeft: ChevronLeft,
  AppIconChevronRight: ChevronRight,
  AppIconAlert: CircleAlert,
  AppIconEye: Eye,
  AppIconImage: Image,
  AppIconInbox: Inbox,
  AppIconInfo: Info,
  AppIconPencil: Pencil,
  AppIconPlus: Plus,
  AppIconRefresh: RefreshCw,
  AppIconReset: RotateCcw,
  AppIconSearch: Search,
  AppIconSliders: SlidersHorizontal,
  AppIconTelescope: Telescope,
  AppIconTrash: Trash2,
  AppIconUpload: Upload,
  AppIconUser: User,
  AppIconWrench: Wrench,
  AppIconClose: X,
};

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component);
});

app.use(createPinia());
app.use(router);
app.mount('#app');
