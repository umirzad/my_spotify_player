import { createApp } from 'vue'
import {createPinia} from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import router from './routers'

const app=createApp(App)

const pinia=createPinia()

app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.use(ToastService)
app.use(ConfirmationService)
app.use(router)
app.mount('#app')
