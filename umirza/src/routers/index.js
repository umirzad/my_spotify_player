import { createRouter,createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/Login.vue";


const routes=[
    {
        path:'/',
        name:'home',
        component:HomeView,
        meta:{requiresAuth:true}
    },
    {
        path:'/login',
        name:'login',
        component:Login,
    }
]

const router=createRouter({
    history:createWebHistory(),
    routes
})

router.beforeEach((to,from,next)=>{
    const token=localStorage.getItem('userToken');
    if(to.meta.requiresAuth && !token){
        next('/login');
    }else{
        next()
    }
});

export default router