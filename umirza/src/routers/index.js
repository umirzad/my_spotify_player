import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // Ana sayfanın olduğu dosya (İsmi sende farklı olabilir)
import LoginView from '../views/Login.vue' // Yeni oluşturduğumuz dosya

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router