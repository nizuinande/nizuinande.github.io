import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Vant from 'vant'
import 'vant/lib/index.css'
import '@/assets/styles/global-theme.scss'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(Vant)
app.mount('#app')
