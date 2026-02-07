import '@/assets/css/app.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import axios from 'axios';
axios.defaults.baseURL = 'https://github.com/';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
