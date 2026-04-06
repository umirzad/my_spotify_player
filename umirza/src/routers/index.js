import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true } // Giriş zorunlu
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Koruma Kalkanı (Bekçi)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('userToken');
  
  if (to.meta.requiresAuth && !token) {
    // Eğer gidilecek yer giriş istiyorsa ve token yoksa fırlat
    next('/login');
  } else if (to.path === '/login' && token) {
    // Zaten giriş yapmışsa tekrar login'e girmesine izin verme
    next('/');
  } else {
    next();
  }
});

export default router;