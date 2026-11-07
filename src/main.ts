import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import '@phosphor-icons/web/regular'
import '@phosphor-icons/web/bold'
import '@phosphor-icons/web/fill'

const app = createApp(App)

app.use(router)

app.mount('#app')
