import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import ProjectsPage from '../components/ProjectsPage.vue';

const routes = [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
    },
    {
      path: '/projects',
      name: 'Projects',
      component: ProjectsPage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
